<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-4">Legg til nytt utstyr</h3>

        <div class="space-y-2">
          <input v-model="form.name" type="text" placeholder="Navn" class="w-full p-2 border rounded" />

          <select v-model="form.type" class="w-full p-2 border rounded">
            <option value="">Velg type...</option>
            <option v-for="option in predefinedFilters.filter(f => f.value)" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="form.status" class="w-full p-2 border rounded">
            <option value="">Velg status...</option>
            <option v-for="status in statusOptions" :key="status.id" :value="status.id">
              {{ status.combined }}
            </option>
          </select>

          <textarea v-model="form.notes" placeholder="Notater" class="w-full p-2 border rounded"></textarea>

          <input type="file" @change="handleFileUpload" accept="image/*" class="w-full" />
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button @click="submit" class="px-4 py-1 bg-green-600 text-white rounded">Legg til</button>
          <button @click="$emit('close')" class="px-4 py-1 bg-gray-300 rounded">Avbryt</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase.js';

const props = defineProps({
  visible: Boolean  // 🚨 MÅ hete visible slik App.vue bruker det
});

const emits = defineEmits(['close', 'added']);

const form = ref({ name: '', type: '', status: '', notes: '', imageUrl: '' });
const uploadedFile = ref(null);
const statusOptions = ref([]);

const predefinedFilters = [
  { label: 'Alle', value: '' },
  { label: 'Amp', value: 'amp' },
  { label: 'Mikrofon', value: 'mikrofon' },
  { label: 'Instrument', value: 'instrument' },
  { label: 'Kabel', value: 'kabel' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Div', value: 'div' },
];

async function fetchStatusOptions() {
  const { data, error } = await supabase.from('status').select('*').order('label');
  if (!error) statusOptions.value = data;
}

onMounted(fetchStatusOptions);

function handleFileUpload(event) {
  uploadedFile.value = event.target.files[0];
}

async function submit() {
  let imageUrl = '';
  if (uploadedFile.value) {
    const fileName = `equipment/${Date.now()}_${uploadedFile.value.name}`;
    const { error: uploadError } = await supabase.storage.from('equipment-images').upload(fileName, uploadedFile.value);
    if (!uploadError) {
      const { data } = supabase.storage.from('equipment-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }
  }

  const payload = { ...form.value, imageUrl };
  const { error } = await supabase.from('equipment').insert([payload]);

  if (!error) {
    emits('added');
    emits('close');
    form.value = { name: '', type: '', status: '', notes: '', imageUrl: '' };
    uploadedFile.value = null;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
