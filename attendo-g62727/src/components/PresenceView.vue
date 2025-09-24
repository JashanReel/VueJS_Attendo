<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/AuthStore';
import BreadcrumbComponent from './BreadcrumbComponent.vue';
import TableComponent from './TableComponent.vue';
import {
  fetchExaminationRoomById,
  fetchStudentsByUE,
  fetchPresencesByRoom,
  markStudentPresent,
  markStudentAbsent,
  updateSupervisor,
  fetchAllTeachers
} from '@/services/presenceService';

export default {
  components: {
    BreadcrumbComponent,
    TableComponent
  },
  computed: {
    ...mapStores(useAuthStore),
    roomId() {
      return parseInt(this.$route.params.roomId);
    },
    eventId() {
      return parseInt(this.$route.params.eventId);
    },
    sessionCompoId() {
      return parseInt(this.$route.params.sessionCompoId);
    },
    sessionId() {
      return parseInt(this.$route.params.sessionId);
    },
    breadcrumbItems() {
      return [
        { name: 'Accueil', path: '/' },
        { name: 'Sessions', path: '/sessions' },
        { name: this.sessionName || 'Session', path: `/sessions/${this.sessionId}` },
        { name: this.ueCode || 'UE', path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}` },
        { name: this.eventName || 'Épreuve', path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}/event/${this.eventId}` },
        { name: `Local ${this.roomLabel || ''}`, path: `/sessions/${this.sessionId}/ue/${this.sessionCompoId}/event/${this.eventId}/room/${this.roomId}` }
      ];
    },
    // Préparer les données pour le tableau
    studentItems() {
      if (!this.students || !this.presences) return [];

      // S'assurer que nous avons toutes les données avant de calculer
      const roomCapacity = this.room?.room?.capacity || 0;
      const isRoomFull = this.presences.length >= roomCapacity;

      return this.students.map(student => {
        const studentData = student.student || {};

        // Vérifier si l'étudiant est présent
        const presence = this.presences.find(p => p.student === studentData.student_id);
        const isPresent = !!presence;

        return {
          id: studentData.student_id,
          matricule: studentData.student_id,
          nom: studentData.lastname,
          prenom: studentData.firstname,
          groupe: student.group || '',
          isPresent: isPresent,
          examinationId: presence ? presence.id : null,
          disabled: isRoomFull && !isPresent // Désactiver les étudiants absents si le local est plein
        };
      });
    },
    isRoomFull() {
      const roomCapacity = this.room?.room?.capacity || 0;
      return this.presences?.length >= roomCapacity;
    },
    roomCapacityClass() {
      if (!this.room?.room?.capacity) return 'text-gray-600';
      return this.isRoomFull ? 'text-red-600 font-medium' : 'text-green-600';
    },
    roomCapacity() {
      return this.room?.room?.capacity || '?';
    }
  },
  data() {
    return {
      room: null,
      students: [],
      presences: [],
      teachers: [],
      selectedSupervisor: '',
      roomLabel: '',
      ueCode: '',
      sessionName: '',
      eventName: '',
      isLoading: false,
      isSupervisorLoading: false,
      error: null,
      headers: ['Matricule', 'Nom', 'Prénom', 'Groupe', 'Présence'],
      attributes: ['matricule', 'nom', 'prenom', 'groupe', 'isPresent']
    };
  },
  methods: {
    handleKeyDown(event) {
      if (event.key === 'Enter' && this.selectedSupervisor && !this.isSupervisorLoading) {
        event.preventDefault();
        this.handleUpdateSupervisor();
      }
    },
    async loadData() {
      this.isLoading = true;
      try {
        // Charger les détails du local d'examen
        const roomData = await fetchExaminationRoomById(this.roomId);
        this.room = roomData;
        this.roomLabel = roomData?.room?.label || roomData?.room || '';
        this.selectedSupervisor = roomData?.supervisor?.acro || '';

        // Extraire les informations pour le fil d'Ariane
        const event = roomData?.event || {};
        this.eventName = event.label || '';
        const sessionCompo = event.session_compo || {};
        this.ueCode = sessionCompo.ue || '';
        const session = sessionCompo.session || {};
        this.sessionName = session.label || '';

        // Charger les étudiants inscrits à l'UE
        this.students = await fetchStudentsByUE(this.ueCode);

        // Charger les présences actuelles
        this.presences = await fetchPresencesByRoom(this.roomId);

        // Charger tous les enseignants pour le sélecteur
        this.teachers = await fetchAllTeachers();

      } catch (err) {
        this.error = "Erreur lors du chargement des données";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    async togglePresence(student) {
      if (student.disabled) {
        // Ne rien faire si l'étudiant est désactivé (local plein)
        return;
      }

      if (student.isPresent) {
        // L'étudiant est présent, le marquer comme absent
        await markStudentAbsent(student.examinationId);
      } else {
        // Vérifier si le local est plein
        if (this.isRoomFull) {
          this.error = `Le local ${this.roomLabel} a atteint sa capacité maximale de ${this.room?.room?.capacity || 0} étudiants.`;
          return;
        }

        // L'étudiant est absent, le marquer comme présent
        await markStudentPresent(this.roomId, student.id);
      }

      // Recharger les présences pour mettre à jour l'interface
      this.presences = await fetchPresencesByRoom(this.roomId);
      // Effacer le message d'erreur après un changement réussi
      this.error = null;
    },

    async handleUpdateSupervisor() {
      if (!this.selectedSupervisor) return;

      this.isSupervisorLoading = true;
      try {
        await updateSupervisor(this.roomId, this.selectedSupervisor);
        // Recharger les données du local pour refléter le changement
        const roomData = await fetchExaminationRoomById(this.roomId);
        this.room = roomData;
      } catch (err) {
        this.error = "Erreur lors de la mise à jour du surveillant";
        console.error(err);
      } finally {
        this.isSupervisorLoading = false;
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
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
          Prise de présence du local {{ roomLabel }}
        </h1>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-medium mb-4">Informations sur l'épreuve</h2>
        <p><strong>UE :</strong> {{ ueCode }}</p>
        <p><strong>Session :</strong> {{ sessionName }}</p>
        <p><strong>Épreuve :</strong> {{ eventName }}</p>
        <p><strong>Local :</strong> {{ roomLabel }}</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-medium mb-4">Surveillant</h2>
        <div class="flex w-full gap-2">
          <select v-model="selectedSupervisor" @keydown="handleKeyDown"
            class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Aucun surveillant</option>
            <option v-for="teacher in teachers" :key="teacher.acro" :value="teacher.acro">
              {{ teacher.names }} ({{ teacher.acro }})
            </option>
          </select>
          <button @click="handleUpdateSupervisor"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50"
            :disabled="isSupervisorLoading">
            {{ isSupervisorLoading ? 'Chargement...' : 'Mettre à jour' }}
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Liste des étudiants</h2>
          <div :class="roomCapacityClass" class="font-medium">
            {{ presences ? presences.length : 0 }} / {{ roomCapacity }} places occupées
            <span v-if="isRoomFull" class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">COMPLET</span>
          </div>
        </div>
        <p class="text-sm text-gray-500 mb-4">Cliquez sur un étudiant pour marquer/démarquer sa présence.</p>

        <div v-if="!studentItems.length" class="text-center py-4 text-gray-500">
          <p>Aucun étudiant inscrit à cette UE.</p>
        </div>

        <TableComponent v-else :headers="headers" :items="studentItems" :attributes="attributes" class="cursor-pointer"
          :class="{ 'student-presence-table': true }" @rowClick="togglePresence">

          <!-- Affichage de la présence -->
          <template #column-isPresent="{ value }">
            <span v-if="value" class="px-2 py-1 bg-green-100 text-green-800 rounded">Présent</span>
            <span v-else class="px-2 py-1 bg-gray-100 text-gray-800 rounded">Absent</span>
          </template>
        </TableComponent>

      </div>
    </div>
  </div>
</template>

<style>
.student-presence-table tr.present {
  background-color: rgba(59, 130, 246, 0.1);
}

.student-presence-table tr.present:hover {
  background-color: rgba(59, 130, 246, 0.2);
}
</style>