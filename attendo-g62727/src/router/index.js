import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import SessionsView from '@/views/SessionsView.vue'
import SessionDetailView from '@/components/SessionDetailView.vue'
import DetailsView from '@/views/DetailsView.vue'
import UeEventView from '@/components/UeEventView.vue'
import RoomsView from '@/components/RoomsView.vue'
import PresenceView from '@/components/PresenceView.vue'

import { supabase } from '../services/authmgr'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_SUPABASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      name: 'home'
    },
    {
      path: '/sessions',
      component: SessionsView,
      name: 'sessions',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/sessions/:id',
      // ":id" et pas "id" sinon id est considéré comme un littéral et pas une valeur dynamique
      // la page /sessions/*nombre* n'existerait pas et /sessions/id existerait
      // SessionsDetailView afficherait alors "NaN" car elle n'arrive pas à parseInt "id"
      component: SessionDetailView,
      name: 'session-detail',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/details',
      component: DetailsView,
      name: 'details'
    },
    {
      path: "/sessions/:sessionId/ue/:ueSessionExamId",
      component: UeEventView,
      name: 'ueExamination',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/sessions/:sessionId/ue/:sessionCompoId/event/:eventId",
      component: RoomsView,
      name: 'eventPerUeSession',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/sessions/:sessionId/ue/:sessionCompoId/event/:eventId/room/:roomId",
      name: 'studentsPerRoom',
      component: PresenceView,
      meta: {
        requiresAuth: true
      }
    }
  ],
})

router.beforeEach(async(to) => {
  if (to.meta.requiresAuth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return { name: 'home' }
    }
  }
})

export default router
