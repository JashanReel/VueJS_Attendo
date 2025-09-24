<script>
export default {
  props: {
    event: {
      type: Object,
      required: true
    },
    sessionId: {
      type: Number,
      required: true
    },
    sessionCompoId: {
      type: Number,
      required: true
    },
    eventId: {
      type: Number,
      default: null
    },
    isRoom: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    eventUrl() {
      if (this.isRoom && this.eventId) {
        return `/sessions/${this.sessionId}/ue/${this.sessionCompoId}/event/${this.eventId}/room/${this.event.id}`;
      }
      return `/sessions/${this.sessionId}/ue/${this.sessionCompoId}/event/${this.event.id}`;
    }
  }
}
</script>

<template>
  <router-link :to="eventUrl" class="block">
    <span>{{ event.id }}</span>
    <div
      class="group border border-gray-300 rounded-lg shadow-sm p-6 bg-white hover:bg-gray-300 hover:border-blue-400 border-[2px]">
      <h3 class="text-lg font-medium text-center text-gray-800 group-hover:text-blue-600">
        {{ event.label }}
      </h3>
      <slot></slot>
    </div>
  </router-link>
</template>