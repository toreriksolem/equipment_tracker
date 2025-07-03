<!-- StatusHistoryModal.vue -->

<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Statushistorikk</h3>

        <ul v-if="historyEntries.length" class="text-sm max-h-60 overflow-y-auto">
          <li v-for="(entry, index) in historyEntries" :key="index" class="mb-2 border-b pb-1">
            <strong>{{ formatDate(entry.date) }}</strong>: <span v-if="entry.status_label"> ({{ entry.status_label }} {{ entry.status_emoji }})</span> <br>
            <strong>{{ entry.title ? entry.title + ' - ' : '' }}</strong>
            {{ entry.description }}            
          </li>
        </ul>

        <div v-else class="text-sm text-gray-500 italic">
          Ingen historikk funnet her.
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button @click="$emit('close')" class="px-3 py-1 bg-gray-300 rounded text-sm">Lukk</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  show: Boolean,
  equipmentId: Number,
});

const historyEntries = ref([]);

watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible && props.equipmentId) {
      const { data, error } = await supabase
        .from('equipment_history_view')  // 👈 Bruk viewet
        .select('*')
        .eq('equipment_id', props.equipmentId)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Feil ved henting:', error.message);
        historyEntries.value = [];
      } else {
        historyEntries.value = data || [];
      }
    }
  },
  { immediate: true }
);

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
