<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import { fetchSessions, addSession } from '@/services/listSessionService';
import TableComponent from '../components/TableComponent.vue';
import BreadcrumbComponent from '../components/BreadcrumbComponent.vue';

export default {
  computed: {
    ...mapStores(useAuthStore)
  },
  components: {
    TableComponent,
    BreadcrumbComponent,
  },
  data() {
    return {
      sessions: [],
      newSessionName: '',
      isLoading: false,
      error: null,
      headers: ['Id', 'Nom'],
      attributes: ['id', 'label'],
      breadcrumbItems: [
        { name: 'Accueil', path: '/' },
        { name: 'Sessions', path: '/sessions' }
      ]
    }
  },
  methods: {
    async loadSessions() {
      this.isLoading = true;
      try {
        this.sessions = await fetchSessions();
      } catch (err) {
        this.error = "Erreur lors du chargement des sessions";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async handleAddSession() {
      if (!this.newSessionName.trim()) return;

      this.isLoading = true;
      try {
        const newSession = await addSession(this.newSessionName);
        this.sessions.push(newSession);
        this.newSessionName = '';
      } catch (err) {
        this.error = "Erreur lors de l'ajout de la session";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.loadSessions();
  }
}
</script>

<template>
  <div class="py-6 px-4 max-w-4xl mx-auto">

    <!-- Breadcrumb -->
    <BreadcrumbComponent :items="breadcrumbItems" />

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Sessions</h1>

      <div v-if="authStore.currentUser" class="text-sm text-black-500">
        Connecté en tant que: {{ authStore.currentUser.email }}
      </div>
    </div>

    <!-- Formulaire d'ajout de session -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-lg font-medium mb-4">Ajouter une session</h2>
      <form @submit.prevent="handleAddSession" class="w-full flex gap-2">
        <input v-model="newSessionName" type="text" placeholder="Nom de la session (ex: Janvier, Juin, ...)"
          class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50"
          :disabled="isLoading || !newSessionName.trim()">
          {{ isLoading ? 'Chargement...' : 'Ajouter' }}
        </button>
      </form>

      <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
    </div>

    <!-- Table des sessions -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-lg font-medium mb-4">Liste des sessions</h2>

      <div v-if="isLoading && sessions.length === 0" class="text-center py-4">
        <p>Chargement des sessions...</p>
      </div>

      <div v-else-if="sessions.length === 0" class="text-center py-4 text-gray-500">
        <p>Aucune session trouvée. Ajoutez-en une première !</p>
      </div>

      <TableComponent v-else :headers="headers" :items="sessions" :attributes="attributes">

        <template #column-id="{ value }">
          <span class="text-black-400">#{{ value }}</span>
        </template>

        <template #column-label="{ item }">
          <router-link :to="`/sessions/${item.id}`" class="text-blue-500 hover:underline">
            {{ item.label }}
          </router-link>
        </template>

      </TableComponent>
    </div>

  </div>
</template>
