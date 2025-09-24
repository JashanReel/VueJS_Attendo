<script>
import LoginButton from './components/LoginButton.vue';
import { mapStores } from 'pinia';
import { useAuthStore } from './stores/AuthStore';

export default {
  components: {
    LoginButton
  },
  computed: {
    ...mapStores(useAuthStore)
  },
  created() {
    this.authStore.init();
  }
}
</script>

<template>
  <header class="w-full">
    <div class="bg-black text-white py-6 text-center w-full">
      <h1 class="text-3xl text-purple-400">Attendo</h1>
    </div>

    <div class="flex justify-between items-center p-2.5 bg-gray-100">
      <nav class="flex gap-6">
        <RouterLink
          to="/"
          class="no-underline font-medium transition-colors duration-200"
          :class="$route.path === '/'
            ? 'text-blue-500 font-bold'
            : 'text-gray-800 hover:text-green-600 hover:font-bold'"
        >
          Accueil
        </RouterLink>
        <RouterLink
          to="/sessions"
          class="no-underline font-medium transition-colors duration-200"
          :class="$route.path === '/sessions'
            ? 'text-blue-500 font-bold'
            : 'text-gray-800 hover:text-green-600 hover:font-bold'"
        >
          Sessions
        </RouterLink>
        <RouterLink
          to="/details"
          class="no-underline font-medium transition-colors duration-200"
          :class="$route.path === '/details'
            ? 'text-blue-500 font-bold'
            : 'text-gray-800 hover:text-green-600 hover:font-bold'"
        >
          À propos
        </RouterLink>
      </nav>

      <LoginButton />
    </div>
  </header>

  <main class="p-4">
    <RouterView v-if="!authStore.isLoading" />
    <div v-else class="py-4 text-center">Chargement de la page</div>
  </main>
</template>