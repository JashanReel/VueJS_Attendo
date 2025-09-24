import { defineStore } from 'pinia';
import { supabase } from '../services/authmgr';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    isLoading: true
  }),

  actions: {
    async login() {
      try {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
        })
      } catch (error) {
        console.error('Error during login:', error)
      }
    },

    async logout() {
      try {
        await supabase.auth.signOut()
        this.currentUser = null
        // je fais ça au lieu d'utiliser router.push sinon ça créé une dépendance circulaire et créé un bug
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error during logout:', error)
      }
    },

    async init() {
      // Récupérer la session initiale
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        this.currentUser = data.session.user
      }

      // Écouter les changements d'authentification
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          this.currentUser = session.user
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
      })

      this.isLoading = false
    }
  }
})
