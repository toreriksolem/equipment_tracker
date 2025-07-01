<template>
    <form @submit.prevent="handleSubmit" class="p-4 bg-white rounded-2xl shadow space-y-4">
      <input v-model="form.name" type="text" placeholder="Name" class="input" required />
      <input v-model="form.type" type="text" placeholder="Type (e.g. Amp, Mic)" class="input" required />
      <select v-model="form.status" class="input">
        <option>Mint condition</option>
        <option>Working alright</option>
        <option>Send for fix</option>
        <option>Being fixed</option>
        <option>Fetch</option>
      </select>
      <textarea v-model="form.notes" placeholder="Notes" class="input"></textarea>
      <input type="file" accept="image/*" @change="handleImageUpload" class="input" />
      <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700">Add Equipment</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const form = ref({
    name: '',
    type: '',
    status: 'Working alright',
    notes: '',
    image: null,
  });
  
  function handleImageUpload(event) {
    form.value.image = event.target.files[0];
  }
  
  function handleSubmit() {
    // Emit the form data to parent or send to API/backend
    console.log('Form submitted:', form.value);
    // Reset form
    form.value = { name: '', type: '', status: 'Working alright', notes: '', image: null };
  }
  </script>
  
  <style scoped>
  .input {
    @apply w-full p-2 border rounded-xl;
  }
  </style>