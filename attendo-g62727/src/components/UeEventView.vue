<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import BreadcrumbComponent from './BreadcrumbComponent.vue';
import EventCard from './EventCard.vue';
import { fetchSessionCompoById, fetchEventsBySessionCompoId, addEvent } from '@/services/eventService';

export default {
  components: {
    BreadcrumbComponent,
    EventCard
  },
  computed: {
    ...mapStores(useAuthStore),
    sessionCompoId() {
      return parseInt(this.$route.params.ueSessionExamId);
    },
    sessionId() {
      return parseInt(this.$route.params.sessionId);
    },
    breadcrumbItems() {
      return [
        { name: 'Accueil', path: '/' },
        { name: 'Sessions', path: '/sessions' },
        { name: this.sessionName || 'Session', path: `/sessions/${this.sessionId}` },
        { name: this.ueCode || 'UE', path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}` }
      ];
    }
  },
  data() {
    return {
      sessionCompo: null,
      events: [],
      newEventLabel: '',
      isLoading: false,
      isEventLoading: false,
      error: null,
      sessionName: '',
      ueCode: ''
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true;
      try {
        // Charger les détails de l'UE dans la session
        const sessionCompo = await fetchSessionCompoById(this.sessionCompoId);
        this.sessionCompo = sessionCompo;
        this.ueCode = sessionCompo.ue;
        this.sessionName = sessionCompo.session.label;

        // Charger les épreuves existantes
        this.events = await fetchEventsBySessionCompoId(this.sessionCompoId);
      } catch (err) {
        this.error = "Erreur lors du chargement des données";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async handleAddEvent() {
      if (!this.newEventLabel.trim()) return;

      this.isEventLoading = true;
      try {
        const newEvent = await addEvent(this.sessionCompoId, this.newEventLabel);
        this.events.push(newEvent);
        this.newEventLabel = '';
      } catch (err) {
        this.error = "Erreur lors de l'ajout de l'épreuve";
        console.error(err);
      } finally {
        this.isEventLoading = false;
      }
    }
  },
  mounted() {
    this.loadData();
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
        <h1 class="text-2xl font-bold text-gray-800">
          Épreuves pour {{ ueCode }} (Session : {{ sessionName }})
        </h1>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-medium mb-4">Ajouter une épreuve</h2>
        <form @submit.prevent="handleAddEvent" class="w-full flex gap-2">
          <input v-model="newEventLabel" type="text" placeholder="Nom de l'épreuve (ex: Examen, Bilan, Projet...)"
            class="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50 whitespace-nowrap"
            :disabled="isEventLoading || !newEventLabel.trim()">
            {{ isEventLoading ? 'Chargement...' : 'Ajouter' }}
          </button>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-medium mb-4">Liste des épreuves</h2>

        <div v-if="events.length === 0" class="text-center py-4 text-gray-500">
          <p>Aucune épreuve n'est prévue pour cette UE. Ajoutez-en une première !</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventCard v-for="event in events" :key="event.id" :event="event" :sessionId="sessionId"
            :sessionCompoId="sessionCompoId" />
        </div>
      </div>
    </div>
  </div>
</template>