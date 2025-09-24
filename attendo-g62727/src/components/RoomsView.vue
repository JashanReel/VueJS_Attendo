<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import BreadcrumbComponent from './BreadcrumbComponent.vue';
import EventCard from './EventCard.vue';
import {
  fetchEventById,
  fetchRoomsByEventId,
  fetchAllRooms,
  addRoomToEvent,
  countStudentsByRoomIds
} from '@/services/roomService';

export default {
  components: {
    BreadcrumbComponent,
    EventCard
  },
  computed: {
    ...mapStores(useAuthStore),
    eventId() {
      return parseInt(this.$route.params.eventId);
    },
    sessionId() {
      return parseInt(this.$route.params.sessionId);
    },
    sessionCompoId() {
      return parseInt(this.$route.params.sessionCompoId);
    },
    breadcrumbItems() {
      return [
        { name: 'Accueil', path: '/' },
        { name: 'Sessions', path: '/sessions' },
        { name: this.sessionName || 'Session', path: `/sessions/${this.sessionId}` },
        { name: this.ueCode || 'UE', path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}` },
        { name: this.eventName || 'Épreuve', path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}/event/${this.eventId}` }
      ];
    },
    availableRooms() {
      // Si les données ne sont pas encore chargées, retourne un tableau vide
      if (!this.allRooms || !this.rooms) {
        return [];
      }
      // Crée une liste des identifiants de locaux déjà assignés
      const assignedRoomLabels = this.rooms.map(r => {
        if (r.room?.label) {
          return r.room.label;
        }
      });
      return this.allRooms.filter(room => !assignedRoomLabels.includes(room.label));
    }
  },
  data() {
    return {
      event: null,
      rooms: [],
      studentCounts: {},
      allRooms: [],
      selectedRoom: '',
      isLoading: false,
      isRoomLoading: false,
      error: null,
      sessionName: '',
      ueCode: '',
      eventName: ''
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true;
      try {
        // Charger les détails de l'épreuve
        const eventData = await fetchEventById(this.eventId);
        this.event = eventData;
        this.eventName = eventData.label;
        this.ueCode = eventData.session_compo.ue;
        this.sessionName = eventData.session_compo.session.label;

        // Charger les locaux associés à l'épreuve
        this.rooms = await fetchRoomsByEventId(this.eventId);

        // Si des locaux sont trouvés, récupérer le nombre d'étudiants par local
        if (this.rooms.length > 0) {
          const roomIds = this.rooms.map(room => room.id);
          this.studentCounts = await countStudentsByRoomIds(roomIds);
        }

        // Charger tous les locaux disponibles
        this.allRooms = await fetchAllRooms();
      } catch (err) {
        this.error = "Erreur lors du chargement des données";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async handleAddRoom() {
      if (!this.selectedRoom) return;

      this.isRoomLoading = true;
      try {
        // Ajout du local sans surveillant (pour l'étape 9)
        await addRoomToEvent(
          this.eventId,
          this.selectedRoom,
          null
        );

        // Recharger les locaux après l'ajout
        this.rooms = await fetchRoomsByEventId(this.eventId);

        // Si des locaux sont trouvés, mettre à jour les comptages
        if (this.rooms.length > 0) {
          const roomIds = this.rooms.map(room => room.id);
          this.studentCounts = await countStudentsByRoomIds(roomIds);
        }

        // Réinitialiser la sélection
        this.selectedRoom = '';
      } catch (err) {
        this.error = "Erreur lors de l'ajout du local";
        console.error(err);
      } finally {
        this.isRoomLoading = false;
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Enter' && this.selectedRoom && !this.isRoomLoading) {
        event.preventDefault();
        this.handleAddRoom();
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
        <h1 class="text-2xl font-bold text-gray-800 mb-0">
          Locaux pour {{ eventName }} ({{ sessionName }} : {{ ueCode }})
        </h1>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-medium mb-4">Ajouter un local à cette épreuve</h2>
        <div class="flex w-full gap-2">
          <select v-model="selectedRoom" @keydown="handleKeyDown"
            class="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sélectionnez un local</option>
            <option v-for="room in availableRooms" :key="room.label" :value="room.label">
              {{ room.label }} (capacité: {{ room.capacity }})
            </option>
          </select>
          <button @click="handleAddRoom"
            class="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50 whitespace-nowrap"
            :disabled="isRoomLoading || !selectedRoom">
            {{ isRoomLoading ? 'Chargement...' : 'Ajouter' }}
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-medium mb-4">Liste des locaux pour cette épreuve</h2>

        <div v-if="rooms.length === 0" class="text-center py-4 text-gray-500">
          <p>Aucun local n'est assigné à cette épreuve. Ajoutez-en un premier !</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventCard v-for="room in rooms" :key="room.id" :event="{
            id: room.id,
            label: `Local ${room.room?.label || room.room}`
          }" :sessionId="sessionId" :sessionCompoId="sessionCompoId" :eventId="eventId" :isRoom="true">
            <div class="mt-3 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Étudiants présents :</span>
                <span class="font-medium">{{ studentCounts[room.id] || 0 }} / {{ room.room?.capacity || '?' }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span>Surveillant :</span>
                <span class="font-medium">{{
                  room.supervisor ? (room.supervisor.names || room.supervisor.acro) : "Non défini"
                  }}</span>
              </div>
            </div>
          </EventCard>
        </div>
      </div>
    </div>
  </div>
</template>