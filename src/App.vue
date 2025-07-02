// App.vue
<template>
  <div class="bg-black py-4 flex flex-col items-center">
    <img src="/logo.png" alt="Logo" class="h-24 object-contain" />
    <h1 class="text-3xl font-bold text-[#706f6f] mt-2">🎛️ Teknikk 🎛️</h1>
  </div>

  <div class="min-h-screen bg-gray-100 p-4 pb-24">
    <Swiper :slides-per-view="1" :space-between="20" class="h-[75vh]">
      <SwiperSlide v-for="(item, index) in filteredList" :key="index">
        <EquipmentCard :equipment="item" @updated="fetchEquipment" />
      </SwiperSlide>
    </Swiper>

    <div class="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md space-y-2 z-40">
      <div v-if="activeFilters.length" class="flex flex-wrap gap-2 justify-center">
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

    <!-- Modal for å legge til nytt utstyr -->
    <Transition name="fade">
      <div
        v-if="showAddEquipmentModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-xl">
          <h3 class="text-lg font-semibold mb-4">Legg til nytt utstyr</h3>
          <div class="space-y-2">
            <input v-model="newEquipment.name" type="text" placeholder="Navn" class="w-full p-2 border rounded" />
            <input v-model="newEquipment.type" type="text" placeholder="Type" class="w-full p-2 border rounded" />
            <input v-model="newEquipment.status" type="text" placeholder="Status" class="w-full p-2 border rounded" />
            <textarea v-model="newEquipment.notes" placeholder="Notater" class="w-full p-2 border rounded"></textarea>
            <input type="file" @change="handleFileUpload" accept="image/*" class="w-full" />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button @click="addNewEquipment" class="px-4 py-1 bg-green-600 text-white rounded">Legg til</button>
            <button @click="showAddEquipmentModal = false" class="px-4 py-1 bg-gray-300 rounded">Avbryt</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="confirmationMessage"
        class="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow z-50"
      >
        {{ confirmationMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import EquipmentCard from './components/EquipmentCard.vue';
import { supabase } from './supabase.js';

const equipmentList = ref([]);
const showAddEquipmentModal = ref(false);
const confirmationMessage = ref('');
const newEquipment = ref({
  name: '',
  type: '',
  status: '',
  notes: '',
  imageUrl: '',
});
const uploadedFile = ref(null);
const searchTerm = ref('');
const activeFilters = ref([]);

async function fetchEquipment() {
  const { data, error } = await supabase.from('equipment').select('*').order('name');
  if (!error) equipmentList.value = data;
}

onMounted(fetchEquipment);

function handleFileUpload(event) {
  uploadedFile.value = event.target.files[0];
}

async function addNewEquipment() {
  let imageUrl = '';
  if (uploadedFile.value) {
    const fileName = `equipment/${Date.now()}_${uploadedFile.value.name}`;
    const { error: uploadError } = await supabase.storage
      .from('equipment-images')
      .upload(fileName, uploadedFile.value);
    if (!uploadError) {
      const { data } = supabase.storage.from('equipment-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }
  }

  const payload = {
    ...newEquipment.value,
    imageUrl,
  };

  const { error } = await supabase.from('equipment').insert([payload]);
  if (!error) {
    confirmationMessage.value = '✅ Utstyr lagt til';
    setTimeout(() => (confirmationMessage.value = ''), 2000);
    showAddEquipmentModal.value = false;
    fetchEquipment();
    newEquipment.value = { name: '', type: '', status: '', notes: '', imageUrl: '' };
    uploadedFile.value = null;
  }
}

function addFilter() {
  const term = searchTerm.value.trim();
  if (term && !activeFilters.value.includes(term)) {
    activeFilters.value.push(term);
  }
  searchTerm.value = '';
}

function removeFilter(index) {
  activeFilters.value.splice(index, 1);
}

const filteredList = computed(() => {
  if (!activeFilters.value.length) return equipmentList.value;
  return equipmentList.value.filter(eq => {
    const searchableFields = ['name', 'type', 'status', 'notes'];
    const textContent = searchableFields
      .map(field => (eq[field] || '').toString().toLowerCase())
      .join(' ');
    return activeFilters.value.every(filter =>
      textContent.includes(filter.toLowerCase())
    );
  });
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
