// App.vue
<template>
  <div class="min-h-screen bg-gray-100 p-4 pb-24">
    <h1 class="text-xl font-bold mb-4 text-center">🎛️ Stage Equipment Tracker</h1>

    <Swiper
      :slides-per-view="1"
      :space-between="20"
      class="h-[75vh]"
    >
      <SwiperSlide v-for="(item, index) in filteredList" :key="index">
        <EquipmentCard :equipment="item" />
      </SwiperSlide>
    </Swiper>

    <div class="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md space-y-2">
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
      <form @submit.prevent="addFilter">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Søk etter utstyr..."
          class="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          inputmode="text"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import EquipmentCard from './components/EquipmentCard.vue';
import equipmentData from './data/equipmentData.js';

const equipmentList = ref(equipmentData);
const searchTerm = ref('');
const activeFilters = ref([]);

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
    const baseValues = Object.values(eq).filter(val => typeof val === 'string');
    const problemValues = Array.isArray(eq.problems) ? eq.problems : [];
    const allValues = baseValues.concat(problemValues).map(val => val.toLowerCase());

    return activeFilters.value.every(filter =>
      allValues.some(val => val.includes(filter.toLowerCase()))
    );
  });
});
</script>