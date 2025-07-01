// EquipmentCard.vue
<template>
  <div class="p-4 rounded-2xl shadow bg-white border">
    <img v-if="equipment.imageUrl" :src="equipment.imageUrl" alt="Equipment image" class="w-full h-64 object-cover rounded mb-2" />
    <h2 class="text-xl font-bold">{{ equipment.name }}</h2>
    <p class="text-sm text-gray-600">{{ equipment.type }}</p>
    <p class="text-sm mt-1">Status: <span class="font-semibold">{{ equipment.status }}</span></p>
    <p v-if="equipment.notes" class="text-sm text-gray-700 mt-1">{{ equipment.notes }}</p>
    <p v-if="equipment.lastUpdated" class="text-xs text-gray-500 mt-2">Sist oppdatert: {{ formattedDate }}</p>

    <button @click="openModal" class="mt-4 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
      Vis historikk
    </button>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Historikk</h3>
        <ul class="text-sm max-h-60 overflow-y-auto">
          <li v-for="(entry, index) in historyEntries" :key="index" class="mb-2 border-b pb-1">
            <strong>{{ formatDate(entry.date) }}</strong>: {{ entry.title ? entry.title + ' - ' : '' }}{{ entry.description }}
            <span v-if="entry.new_status"> (Ny status: {{ entry.new_status }})</span>
          </li>
        </ul>

        <button @click="showAddEntryModal = true" class="mt-4 px-3 py-1 bg-green-600 text-white rounded text-sm">
          Legg til hendelse
        </button>

        <button @click="closeModal" class="mt-2 px-3 py-1 bg-gray-300 rounded">Lukk</button>
      </div>
    </div>

    <div v-if="showAddEntryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Ny hendelse</h3>
        <div class="space-y-2">
          <input v-model="newEntryTitle" type="text" placeholder="Tittel" class="w-full p-2 border rounded" />
          <textarea v-model="newEntryDescription" placeholder="Beskrivelse" class="w-full p-2 border rounded"></textarea>
          <input v-model="newStatus" type="text" placeholder="Ny status (valgfritt)" class="w-full p-2 border rounded" />
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button @click="submitHistoryEntry" class="px-3 py-1 bg-green-600 text-white rounded">Legg til</button>
          <button @click="showAddEntryModal = false" class="px-3 py-1 bg-gray-300 rounded">Avbryt</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  equipment: Object
});

const showModal = ref(false);
const showAddEntryModal = ref(false);
const newEntryTitle = ref('');
const newEntryDescription = ref('');
const newStatus = ref('');
const historyEntries = ref([]);

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

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchHistory() {
  const { data, error } = await supabase
    .from('equipment_history')
    .select('*')
    .eq('equipment_id', props.equipment.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Feil ved henting av historikk:', error.message);
  } else {
    historyEntries.value = data;
  }
}

function openModal() {
  showModal.value = true;
  fetchHistory();
}

function closeModal() {
  showModal.value = false;
}

async function submitHistoryEntry() {
  if (!newEntryDescription.value.trim()) return;

  const today = new Date().toISOString();
  const newEntry = {
    date: today,
    title: capitalizeFirstLetter(newEntryTitle.value.trim()),
    description: capitalizeFirstLetter(newEntryDescription.value.trim()),
    equipment_id: props.equipment.id,
    new_status: newStatus.value.trim() ? capitalizeFirstLetter(newStatus.value.trim()) : null
  };

  const { error: insertError } = await supabase.from('equipment_history').insert([newEntry]);

  if (insertError) {
    console.error('❌ Feil ved lagring til Supabase:', insertError.message);
  } else {
    console.log('✅ Hendelse lagret til Supabase');
    fetchHistory();

    if (newEntry.new_status) {
      const { error: updateError } = await supabase
        .from('equipment')
        .update({
          status: newEntry.new_status,
          lastUpdated: today
        })
        .eq('id', props.equipment.id);

      if (updateError) {
        console.error('❌ Feil ved oppdatering av utstyr:', updateError.message);
      } else {
        props.equipment.status = newEntry.new_status;
        props.equipment.lastUpdated = today;
      }
    }
  }

  newEntryTitle.value = '';
  newEntryDescription.value = '';
  newStatus.value = '';
  showAddEntryModal.value = false;
}

const formattedDate = computed(() =>
  props.equipment.lastUpdated ? formatDate(props.equipment.lastUpdated) : ''
);
</script>
