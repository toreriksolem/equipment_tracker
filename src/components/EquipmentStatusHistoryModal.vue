<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Historikk</h3>

        <div v-if="historyEntries.length > 0">
          <ul class="text-sm max-h-60 overflow-y-auto">
            <li
              v-for="(entry, index) in historyEntries"
              :key="index"
              class="mb-2 border-b pb-1"
            >
              <strong>{{ formatDate(entry.date) }}</strong>:
              {{ entry.title ? entry.title + ' - ' : '' }}
              {{ entry.description }}
              <span v-if="entry.new_status">
                (Ny status: {{ getStatusLabel(entry.new_status) }})
              </span>
            </li>
          </ul>
        </div>

        <div v-else class="text-sm text-gray-500 italic">Ingen historikk funnet.</div>

        <div class="flex justify-end space-x-2 mt-4">
          <button @click="$emit('close')" class="px-3 py-1 bg-gray-300 rounded text-sm">
            Lukk
          </button>
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
const statusList = ref([]);

watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible && props.equipmentId) {
      try {
        const { data: history, error: historyError } = await supabase
          .from('equipment_history')
          .select('*')
          .eq('equipment_id', props.equipmentId)
          .order('date', { ascending: false });

        if (historyError) throw historyError;
        historyEntries.value = history;

        const { data: statuses, error: statusError } = await supabase
          .from('status')
          .select('*');

        if (statusError) throw statusError;
        statusList.value = statuses;
      } catch (error) {
        console.error('❌ Feil ved lasting:', error.message);
        historyEntries.value = [];
        statusList.value = [];
      }
    }
  }
);

function getStatusLabel(statusId) {
  const match = statusList.value.find((s) => s.id === statusId);
  return match ? `${match.label} ${match.emoji}` : `Status #${statusId}`;
}


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
