<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import BreadcrumbComponent from './BreadcrumbComponent.vue';
import TableComponent from './TableComponent.vue';
import { fetchSessionById, fetchSessionUEs, fetchAllUEs, addUEToSession } from '@/services/sessionDetailsService';

export default {
  components: {
    BreadcrumbComponent,
    TableComponent
  },
  computed: {
    ...mapStores(useAuthStore),
    sessionId() {
      return parseInt(this.$route.params.id);
    },
    breadcrumbItems() {
      return [
        { name: 'Accueil', path: '/' },
        { name: 'Sessions', path: '/sessions' },
        { name: this.sessionNameInBreadcrumb, path: `/sessions/${this.sessionId}` }
      ];
    },
    sessionNameInBreadcrumb() {
      // Retourne le nom de la session si elle est chargée, sinon un texte par défaut
      return this.session ? this.session.label : 'Détail de session';
    },
    availableUEs() {
      if (!this.allUEs || !this.sessionUEs) {
        return [];
      }
      // Créer une liste simple des noms d'UE déjà dans la session
      const existingUENames = this.sessionUEs.map(item => item.ue);
      // Filtrer toutes les UEs pour ne garder que celles qui ne sont pas dans la liste existante
      return this.allUEs.filter(ue => !existingUENames.includes(ue.ue));
    }
  },
  data() {
    return {
      session: null,
      sessionUEs: [],
      allUEs: [],
      selectedUE: '',
      isLoading: false,
      isUELoading: false,
      error: null,
      headers: ['Id', 'UE'],
      attributes: ['id', 'ue']
    };
  },
  methods: {
    async loadSession() {
      this.isLoading = true;
      this.error = null;

      try {
        // Charger les informations de la session
        const sessionData = await fetchSessionById(this.sessionId);
        this.session = sessionData;

        // Charger les UEs de la session
        this.sessionUEs = await fetchSessionUEs(this.sessionId);

        // Charger toutes les UEs disponibles
        this.allUEs = await fetchAllUEs();

      } catch (err) {
        this.error = "Erreur lors du chargement des données";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async handleAddUE() {
      if (!this.selectedUE) {
        return;
      }

      this.isUELoading = true;
      try {
        await addUEToSession(this.sessionId, this.selectedUE);
        // Recharger la liste des UEs de la session après l'ajout
        this.sessionUEs = await fetchSessionUEs(this.sessionId);
        this.selectedUE = ''; // Réinitialiser la sélection
      } catch (err) {
        this.error = "Erreur lors de l'ajout de l'UE";
        console.error(err);
      } finally {
        this.isUELoading = false;
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Enter' && this.selectedUE && !this.isUELoading) {
        event.preventDefault();
        this.handleAddUE();
      }
    }
  },
  mounted() {
    this.loadSession();
  }
}
</script>

<template>
  <div class="py-6 px-4 max-w-4xl mx-auto">
    <BreadcrumbComponent :items="breadcrumbItems" />

    <div v-if="isLoading" class="text-center py-8">
      <p>Chargement des données...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 p-4 rounded-md text-red-800 mb-6">
      {{ error }}
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Session : {{ session?.label }}</h1>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-medium mb-4">Ajouter une UE à cette session</h2>
        <div class="flex w-full gap-2">
          <select v-model="selectedUE" @keydown="handleKeyDown"
            class="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sélectionnez une UE</option>
            <option v-for="ue in availableUEs" :key="ue.ue" :value="ue.ue">
              {{ ue.ue }}
            </option>
          </select>
          <button @click="handleAddUE"
            class="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50 whitespace-nowrap"
            :disabled="isUELoading || !selectedUE">
            {{ isUELoading ? 'Chargement...' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-medium mb-4">UE évaluées dans cette session</h2>

        <div v-if="sessionUEs.length === 0" class="text-center py-4 text-gray-500">
          <p>Aucune UE n'est évaluée dans cette session. Ajoutez-en une première !</p>
        </div>

        <TableComponent v-else :headers="headers" :items="sessionUEs" :attributes="attributes">

          <template #column-id="{ value }">
            <span class="text-black-400">#{{ value }}</span>
          </template>

          <template #column-ue="{ item }">
            <router-link :to="`/sessions/${sessionId}/ue/${item.id}`" class="text-blue-500 hover:underline">
              {{ item.ue }}
            </router-link>
          </template>

        </TableComponent>
      </div>
    </div>
  </div>
</template>