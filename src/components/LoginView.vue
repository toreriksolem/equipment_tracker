<template>
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div class="bg-white p-6 rounded-2xl shadow-md w-80">
        <h1 class="text-xl font-bold mb-4">Login</h1>
        <form @submit.prevent="login">
          <input v-model="email" type="email" placeholder="Email" class="input mb-2" required />
          <input v-model="password" type="password" placeholder="Password" class="input mb-4" required />
        <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded-xl w-full hover:bg-blue-700">Login</button>
    </form>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');

function login() {
// Call Supabase/Firebase/etc auth function here
console.log('Attempting login with', email.value, password.value);
}
</script>

<style scoped>
.input {
@apply w-full p-2 border rounded-xl;
}
</style>