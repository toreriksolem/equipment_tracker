// EquipmentStatusHistoryModal.vue
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
      <h3 class="text-lg font-semibold mb-2">Historikk</h3>
      <ul class="text-sm max-h-60 overflow-y-auto">
        <li v-for="(entry, index) in historyEntries" :key="index" class="mb-2 border-b pb-1">
          <strong>{{ formatDate(entry.date) }}</strong>: 
          {{ entry.title ? entry.title + ' - ' : '' }}
          {{ entry.description }}
          <span v-if="entry.new_status"> (Ny status: {{ entry.new_status }})</span>
        </li>
      </ul>

      <div class="flex justify-end space-x-2 mt-4">
        <button @click="$emit('add-entry')" class="px-3 py-1 bg-green-600 text-white rounded text-sm">
          Endre status
        </button>
        <button @click="$emit('close')" class="px-3 py-1 bg-gray-300 rounded text-sm">
          Lukk
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  show: Boolean,
  equipmentId: Number,
});

const historyEntries = ref([]);

watch(() => props.equipmentId, async (id) => {
  if (id && props.show) {
    const { data, error } = await supabase
      .from('equipment_history')
      .select('*')
      .eq('equipment_id', id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('❌ Feil ved henting av historikk:', error.message);
    } else {
      historyEntries.value = data;
    }
  }
});

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}
</script>
