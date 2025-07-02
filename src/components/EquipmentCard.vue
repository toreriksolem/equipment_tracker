// EquipmentCard.vue
<template>
  <div class="p-4 rounded-2xl shadow bg-white border">
    <img v-if="equipment.imageUrl" :src="equipment.imageUrl" alt="Equipment image" class="w-full h-48 object-cover rounded mb-2" />
    <h2 class="text-xl font-bold">{{ equipment.name }}</h2>
    <p class="text-sm text-gray-600">{{ equipment.type }}</p>

    <!-- StatusBadge Component -->
    <StatusBadge :status-id="equipment.status" :statusList="statusList" class="mt-1" />

    <p v-if="latestHistoryEntry?.description" class="text-sm text-gray-700 mt-1">
      {{ latestHistoryEntry.description }}
    </p>
    <p v-if="latestHistoryEntry?.date" class="text-xs text-gray-500 mt-2">
      Sist endret: {{ formatDate(latestHistoryEntry.date) }}
    </p>

    <button @click="openModal" class="mt-4 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
      Vis historikk
    </button>

    <button @click="showAddEntryModal = true" class="mt-2 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm">
      Endre status
    </button>

    <EquipmentStatusHistoryModal
      :show="showModal"
      :equipment-id="equipment.id"
      @close="showModal = false"
      @add-entry="showAddEntryModal = true"
    />

    <AddEntryModal
      v-if="showAddEntryModal"
      :equipment-id="equipment.id"
      @close="showAddEntryModal = false"
      @entry-added="handleEntryAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase.js';
import EquipmentStatusHistoryModal from './EquipmentStatusHistoryModal.vue';
import AddEntryModal from './AddEntryModal.vue';
import StatusBadge from './StatusBadge.vue';

const props = defineProps({
  equipment: Object
});

const showModal = ref(false);
const showAddEntryModal = ref(false);

const statusList = ref([]);
supabase.from('status').select('*').then(({ data }) => {
  if (data) statusList.value = data;
});

function openModal() {
  showModal.value = true;
}

function handleEntryAdded(newStatus, newDate) {
  if (newStatus) {
    props.equipment.status = newStatus;
  }
  if (newDate) {
    props.equipment.lastUpdated = newDate;
  }
  fetchLatestHistoryEntry();
}

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

const latestHistoryEntry = ref(null);

async function fetchLatestHistoryEntry() {
  const { data, error } = await supabase
    .from('equipment_history')
    .select('*')
    .eq('equipment_id', props.equipment.id)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && data) {
    latestHistoryEntry.value = data;
  } else {
    latestHistoryEntry.value = null;
  }
}

onMounted(() => {
  fetchLatestHistoryEntry();
});
</script>
