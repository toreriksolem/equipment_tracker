<!-- AddStatusHistoryEntryModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
      <h3 class="text-lg font-semibold mb-2">Ny hendelse</h3>
      <div class="space-y-2">
        <input v-model="newEntryTitle" type="text" placeholder="Tittel" class="w-full p-2 border rounded" />
        <textarea v-model="newEntryDescription" placeholder="Beskrivelse" class="w-full p-2 border rounded"></textarea>
        <input v-model="newStatus" type="text" placeholder="Ny status (valgfritt)" class="w-full p-2 border rounded" />
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button @click="submitHistoryEntry" class="px-3 py-1 bg-green-600 text-white rounded">Legg til</button>
        <button @click="$emit('close')" class="px-3 py-1 bg-gray-300 rounded">Avbryt</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  show: Boolean,
  equipmentId: Number
});

const emit = defineEmits(['close', 'entryAdded']);

const newEntryTitle = ref('');
const newEntryDescription = ref('');
const newStatus = ref('');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function submitHistoryEntry() {
  if (!newEntryDescription.value.trim()) return;

  const today = new Date().toISOString();

  const newEntry = {
    date: today,
    title: capitalize(newEntryTitle.value.trim()),
    description: capitalize(newEntryDescription.value.trim()),
    equipment_id: props.equipmentId,
    new_status: newStatus.value.trim() ? capitalize(newStatus.value.trim()) : null
  };

  const { error } = await supabase.from('equipment_history').insert([newEntry]);

  if (error) {
    console.error('❌ Feil ved lagring til Supabase:', error.message);
  } else {
    emit('entryAdded');
    emit('close');
    newEntryTitle.value = '';
    newEntryDescription.value = '';
    newStatus.value = '';
  }
}
</script>
