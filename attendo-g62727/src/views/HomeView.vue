<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import LoginButton from '../components/LoginButton.vue';

export default {
  computed: {
    ...mapStores(useAuthStore)
  },
  components: {
    LoginButton
  }
}
</script>

<template>
  <div class="py-6 px-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">Bienvenue sur Attendo</h1>

    <div v-if="!authStore.currentUser" class="bg-white p-6 rounded-lg shadow-md">
      <p class="mb-4 text-gray-700">Veuillez vous connecter pour accéder à l'application.</p>
      <LoginButton/>
    </div>

    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <p class="mt-4 text-gray-700">Vous êtes connecté avec l'adresse: <span class="font-medium">{{ authStore.currentUser.email }}</span></p>
      <p class="mt-2 mb-4 text-gray-700">Vous pouvez accéder à toutes les fonctionnalités de l'application.</p>

      <router-link
        to="/sessions"
        class="inline-block py-2 px-4 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition-colors"
      >
        Voir les sessions
      </router-link>
    </div>
  </div>
</template>
