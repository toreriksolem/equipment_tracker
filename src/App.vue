// App.vue
<template>
  <!-- Toppbanner med logo og tittel -->
  <div class="bg-black py-4 flex flex-col items-center">
    <img src="/logo.png" alt="Logo" class="h-24 object-contain mb-2" />
    <h1 class="text-xl font-bold">🎛️ Utstyrsbibliotek</h1>
  </div>

  <div class="min-h-screen bg-gray-100 p-4 pb-24">

    <Swiper :slides-per-view="1" :space-between="20" class="h-[75vh]">
      <SwiperSlide v-for="(item, index) in filteredList" :key="index">
        <EquipmentCard :equipment="item" />
      </SwiperSlide>
    </Swiper>

    <!-- Modal for å legge til nytt utstyr -->
    <transition name="fade">
      <div v-if="showAddEquipmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-xl">
          <h3 class="text-lg font-semibold mb-4">Legg til nytt utstyr</h3>
          <div class="space-y-2">
            <input v-model="newEquipment.name" type="text" placeholder="Navn" class="w-full p-2 border rounded" />
            <input v-model="newEquipment.type" type="text" placeholder="Type" class="w-full p-2 border rounded" />
            <input v-model="newEquipment.status" type="text" placeholder="Status" class="w-full p-2 border rounded" />
            <textarea v-model="newEquipment.notes" placeholder="Notater" class="w-full p-2 border rounded"></textarea>
            <input type="file" accept="image/*" @change="handleImageUpload" class="w-full" />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button @click="addNewEquipment" class="px-4 py-1 bg-green-600 text-white rounded">Legg til</button>
            <button @click="showAddEquipmentModal = false" class="px-4 py-1 bg-gray-300 rounded">Avbryt</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bekreftelsesmelding -->
    <transition name="fade">
      <div v-if="showConfirmation" class="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
        ✅ Utstyret ble lagt til
      </div>
    </transition>

    <!-- Søkefelt og +-knapp -->
    <div class="fixed bottom-0 left-0 right-0 bg-black p-4 shadow-md z-40">
      <div v-if="activeFilters.length" class="flex flex-wrap gap-2 justify-center mb-2">
        <button
          v-for="(filter, index) in activeFilters"
          :key="index"
          @click="removeFilter(index)"
          class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2"
        >
          <span>{{ filter }}</span>
          <span class="text-xl leading-none">&times;</span>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <form @submit.prevent="addFilter" class="flex-grow">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Søk etter utstyr..."
            class="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            inputmode="text"
          />
        </form>
        <button
          @click="showAddEquipmentModal = true"
          class="w-12 h-12 bg-purple-600 text-white rounded-full text-2xl shadow-lg flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import EquipmentCard from './components/EquipmentCard.vue';
import equipmentData from './data/equipmentData.js';
import { supabase } from './supabase.js';

const showAddEquipmentModal = ref(false);
const showConfirmation = ref(false);
const uploadedFile = ref(null);

const newEquipment = ref({
  name: '',
  type: '',
  status: '',
  notes: '',
  imageUrl: '',
});

function handleImageUpload(event) {
  uploadedFile.value = event.target.files[0];
}

async function addNewEquipment() {
  let imageUrl = '';

  if (uploadedFile.value) {
    const fileExt = uploadedFile.value.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `equipment/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('equipment-images')
      .upload(filePath, uploadedFile.value);

    if (uploadError) {
      console.error('❌ Feil ved bildeopplasting:', uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const payload = {
    name: newEquipment.value.name.trim(),
    type: newEquipment.value.type.trim(),
    status: newEquipment.value.status.trim(),
    notes: newEquipment.value.notes.trim(),
    imageUrl,
  };

  const { error } = await supabase.from('equipment').insert([payload]);

  if (error) {
    console.error('❌ Feil ved lagring av utstyr:', error.message);
  } else {
    console.log('✅ Utstyr lagt til i Supabase');
    showAddEquipmentModal.value = false;
    showConfirmation.value = true;
    setTimeout(() => (showConfirmation.value = false), 2000);
  }

  newEquipment.value = {
    name: '',
    type: '',
    status: '',
    notes: '',
    imageUrl: '',
  };
  uploadedFile.value = null;
}

const equipmentList = ref([]);

onMounted(async () => {
  const { data, error } = await supabase.from('equipment').select('*').order('lastUpdated', { ascending: false });

  if (error) {
    console.error('❌ Klarte ikke hente utstyr:', error.message);
  } else {
    equipmentList.value = data;
  }
});

const searchTerm = ref('');
const activeFilters = ref([]);

const filteredList = computed(() => {
  if (!activeFilters.value.length) return equipmentList.value;

  return equipmentList.value.filter(eq => {
    const baseValues = Object.values(eq).filter(val => typeof val === 'string');
    const problemValues = Array.isArray(eq.problems) ? eq.problems : [];
    const allValues = baseValues.concat(problemValues).map(val => val.toLowerCase());

    return activeFilters.value.every(filter =>
      allValues.some(val => val.includes(filter.toLowerCase()))
    );
  });
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
