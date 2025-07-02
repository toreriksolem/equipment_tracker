<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Ny hendelse</h3>
        <div class="space-y-2">
          <input v-model="title" type="text" placeholder="Tittel" class="w-full p-2 border rounded" />
          <select v-model="selectedStatus" class="w-full p-2 border rounded">
            <option disabled value="">Velg status</option>
            <option v-for="status in statusList" :key="status.id" :value="status.id">
              {{ status.combined }}
            </option>
          </select>
          <textarea v-model="comment" placeholder="Kommentar" class="w-full p-2 border rounded"></textarea>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button @click="submitEntry" class="px-3 py-1 bg-green-600 text-white rounded">Lagre</button>
          <button @click="$emit('close')" class="px-3 py-1 bg-gray-300 rounded">Avbryt</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  equipmentId: Number,
  visible: Boolean
});
const emit = defineEmits(['close', 'entry-added']);

const title = ref('');
const selectedStatus = ref('');
const comment = ref('');
const statusList = ref([]);

onMounted(async () => {
  const { data, error } = await supabase.from('status').select('*');
  if (!error) {
    statusList.value = data;
  }
});

async function submitEntry() {
  if (!selectedStatus.value) return;
  const now = new Date().toISOString();

  // Insert history entry
  const { error: historyError } = await supabase.from('equipment_history').insert([
    {
      date: now,
      title: title.value,
      description: comment.value,
      equipment_id: props.equipmentId,
      new_status: selectedStatus.value
    }
  ]);

  if (historyError) {
    console.error('❌ Feil ved lagring av historikk:', historyError.message);
    return;
  }

  // Update equipment
  const { error: equipmentError } = await supabase.from('equipment')
    .update({ status: selectedStatus.value, lastUpdated: now })
    .eq('id', props.equipmentId);

  if (equipmentError) {
    console.error('❌ Feil ved oppdatering av utstyr:', equipmentError.message);
    return;
  }

  emit('entry-added', selectedStatus.value, now);
  emit('close');
  title.value = '';
  comment.value = '';
  selectedStatus.value = '';
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
