
<template>
  <div
    :class="[
      'bg-black flex flex-col items-center justify-end',
      isStandalone ? 'h-32 py-1' : 'h-16 py-1'
      ]"
    >
    <img src="/logo.png" alt="Logo" class="h-16 object-contain mb-2" />
  </div>



  <div class="min-h-screen bg-gray-100 p-4 pb-24">

    <div class="flex gap-2 flex-wrap justify-center mb-4">
      <button
        v-for="filter in predefinedFilters"
        :key="filter.value"
        @click="togglePredefinedFilter(filter.value)"
        :class="[
          'px-3 py-1 rounded-full border text-sm',
          activeFilters.includes(filter.value)
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-gray-100 text-gray-800 border-gray-300'
        ]"
      >
        {{ activeFilters.includes(filter.value) ? `${filter.label} ✖` : filter.label }}
      </button>
    </div>

    <Swiper
      direction="vertical"
      :slides-per-view="1.2"
      :space-between="20"
      class="h-auto"
    >
      <SwiperSlide
        v-for="(item, index) in filteredList"
        :key="index"
        class="!h-auto"
      >
        <EquipmentCard :equipment="item" @updated="fetchEquipment" />
      </SwiperSlide>
    </Swiper>



    <div class="fixed bottom-0 left-0 right-0 bg-black p-4 shadow-md space-y-2 z-40">

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

    <AddEquipmentModal
      :visible="showAddEquipmentModal"          
      @close="showAddEquipmentModal = false"
      @added="fetchEquipment"
    />


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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import EquipmentCard from './components/EquipmentCard.vue';
import AddEquipmentModal from './components/AddEquipmentModal.vue';
import { supabase } from './supabase.js';


onMounted(() => {
  const updateAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  updateAppHeight();
  window.addEventListener('resize', updateAppHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateAppHeight);
});







const equipmentList = ref([]);
const showAddEquipmentModal = ref(false);
const confirmationMessage = ref('');
const searchTerm = ref('');
const activeFilters = ref([]);

const predefinedFilters = [
  { label: 'Alle', value: '' },
  { label: 'Amp', value: 'amp' },
  { label: 'Mikrofon', value: 'mikrofon' },
  { label: 'Instrument', value: 'instrument' },
  { label: 'Kabel', value: 'kabel' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Div', value: 'div' },
];

const isStandalone = ref(false);

onMounted(() => {
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
});

async function fetchEquipment() {
  const { data, error } = await supabase.from('equipment').select('*').order('name');
  if (!error) equipmentList.value = data;
}

onMounted(() => {
  fetchEquipment();
});

function togglePredefinedFilter(value) {
  if (value === '') {
    activeFilters.value = [];
  } else if (activeFilters.value.includes(value)) {
    activeFilters.value = activeFilters.value.filter(f => f !== value);
  } else {
    activeFilters.value.push(value);
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
    const textContent = searchableFields.map(field => (eq[field] || '').toString().toLowerCase()).join(' ');
    return activeFilters.value.every(filter => textContent.includes(filter.toLowerCase()));
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
