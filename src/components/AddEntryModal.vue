<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-xl">
      <h3 class="text-lg font-semibold mb-4">Ny hendelse</h3>
      <div class="space-y-2">
        <input v-model="title" type="text" placeholder="Tittel" class="w-full p-2 border rounded" />

        <select v-model="selectedStatusId" class="w-full p-2 border rounded">
          <option disabled value="">Velg status</option>
          <option v-for="status in statusList" :key="status.id" :value="status.id">
            {{ status.combined }}
          </option>
        </select>

        <textarea v-model="comment" placeholder="Kommentar" class="w-full p-2 border rounded"></textarea>
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button @click="submitEntry" class="px-4 py-1 bg-green-600 text-white rounded">Lagre</button>
        <button @click="$emit('close')" class="px-4 py-1 bg-gray-300 rounded">Avbryt</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  equipmentId: Number
});

const emit = defineEmits(['close', 'entry-added']);

const title = ref('');
const comment = ref('');
const selectedStatusId = ref('');
const statusList = ref([]);

onMounted(async () => {
  const { data, error } = await supabase.from('status').select('*');
  if (!error) {
    statusList.value = data;
  } else {
    console.error('Feil ved henting av statuser:', error.message);
  }
});

async function submitEntry() {
  if (!selectedStatusId.value) return;

  const today = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('equipment')
    .update({
      status: selectedStatusId.value,
      lastUpdated: today
    })
    .eq('id', props.equipmentId);

  if (updateError) {
    console.error('❌ Feil ved oppdatering av utstyr:', updateError.message);
    return;
  }

  const { error: insertError } = await supabase.from('equipment_history').insert([
    {
      date: today,
      title: title.value.trim(),
      description: comment.value.trim(),
      equipment_id: props.equipmentId,
      new_status: selectedStatusId.value
    }
  ]);

  if (insertError) {
    console.error('❌ Feil ved lagring av historikk:', insertError.message);
    return;
  }

  emit('entry-added', selectedStatusId.value, today);
  emit('close');

  title.value = '';
  comment.value = '';
  selectedStatusId.value = '';
}
</script>
