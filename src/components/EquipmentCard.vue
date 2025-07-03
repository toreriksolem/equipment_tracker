<template>
  <div class="p-4 rounded-2xl shadow bg-white border h-[400px] flex flex-col justify-between">
    <img
      v-if="equipment.imageUrl"
      :src="equipment.imageUrl"
      alt="Equipment image"
      class="w-full h-64 object-cover rounded mb-2"
    />
    <h2 class="text-xl font-bold">{{ equipment.name }}</h2>
    <p class="text-sm text-gray-600">{{ equipment.type }}</p>

    <StatusBadge :status-id="equipment.status" :statusList="statusList" class="mt-1" />

    <p v-if="latestHistoryEntry?.description" class="text-sm text-gray-700 mt-1">
      {{ latestHistoryEntry.description }}
    </p>
    <p v-if="latestHistoryEntry?.date" class="text-xs text-gray-500 mt-2">
      Sist endret: {{ formatDate(latestHistoryEntry.date) }}
    </p>

    <button @click="showHistoryModal = true" class="mt-4 mr-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
      Vis historikk
    </button>

    <button @click="showAddEntryModal = true" class="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
      Endre status
    </button>

    <transition name="fade">
      <StatusHistoryModal
        v-if="showHistoryModal"
        :show="showHistoryModal"
        :equipment-id="equipment.id"
        @close="showHistoryModal = false"
      />
    </transition>

    <transition name="fade">
      <AddEntryModal
        v-if="showAddEntryModal"
        :visible="showAddEntryModal"
        :equipment-id="equipment.id"
        @close="showAddEntryModal = false"
        @entry-added="handleEntryAdded"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase.js';
import StatusBadge from './StatusBadge.vue';
import StatusHistoryModal from './StatusHistoryModal.vue';  // ✅ korrekt navn
import AddEntryModal from './AddEntryModal.vue';

const props = defineProps({
  equipment: Object
});

const latestHistoryEntry = ref(null);
const statusList = ref([]);
const showHistoryModal = ref(false);
const showAddEntryModal = ref(false);

async function fetchLatestHistoryEntry() {
  const { data, error } = await supabase
    .from('equipment_history')
    .select('*')
    .eq('equipment_id', props.equipment.id)
    .order('date', { ascending: false })
    .limit(1);

  if (!error) latestHistoryEntry.value = data[0] || null;
}

onMounted(async () => {
  await fetchLatestHistoryEntry();
  const { data } = await supabase.from('status').select('*');
  if (data) statusList.value = data;
});

function handleEntryAdded(newStatus, newDate) {
  if (newStatus) props.equipment.status = newStatus;
  if (newDate) props.equipment.lastUpdated = newDate;
  fetchLatestHistoryEntry();
}

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
</script>
