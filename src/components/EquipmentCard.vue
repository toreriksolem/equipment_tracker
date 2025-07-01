// EquipmentCard.vue
<template>
  <div class="p-4 rounded-2xl shadow bg-white border">
    <img v-if="props.equipment.imageUrl" :src="props.equipment.imageUrl" alt="Equipment image" class="w-full h-48 object-cover rounded mb-2" />
    <h2 class="text-xl font-bold">{{ props.equipment.name }}</h2>
    <p class="text-sm text-gray-600">{{ props.equipment.type }}</p>
    <p class="text-sm mt-1">Status: <span class="font-semibold">{{ props.equipment.status }}</span></p>
    <ul v-if="props.equipment.problems?.length" class="text-sm text-red-600 list-disc list-inside mt-1">
      <li v-for="(problem, i) in props.equipment.problems" :key="i">{{ problem }}</li>
    </ul>
    <p v-if="formattedDate" class="text-xs text-gray-500 mt-2">Oppdatert: {{ formattedDate }}</p>
  </div>
</template>


<script setup>
import { computed } from 'vue';

const props = defineProps({
  equipment: Object
});

const formattedDate = computed(() => {
  if (!props.equipment.lastUpdated) return '';
  const date = new Date(props.equipment.lastUpdated);
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
});
</script>

