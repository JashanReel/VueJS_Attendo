<script>
import { useAuthStore } from '../stores/AuthStore.js';
import { mapStores } from 'pinia';

export default {
    computed: {
        ...mapStores(useAuthStore)
    }
};
</script>

<template>
  <div>
    <div v-if="authStore.isLoading" class="text-gray-500">
      Chargement...
    </div>
    <div v-else>
      <button
        v-if="!authStore.currentUser"
        @click="authStore.login"
        class="py-1.5 px-4 bg-blue-500 text-white rounded cursor-pointer border-none hover:bg-blue-600 transition-colors"
      >
        Connexion avec Google
      </button>
      <div v-else class="flex items-center gap-2">
        <span class="text-gray-700">{{ authStore.currentUser.email }}</span>
        <button
          @click="authStore.logout"
          class="py-1 px-3 bg-red-500 text-white rounded cursor-pointer border-none hover:bg-red-600 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

