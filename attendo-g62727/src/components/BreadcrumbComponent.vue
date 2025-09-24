<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      // Format attendu: [{ name: 'Accueil', path: '/' }, { name: 'Sessions', path: '/sessions' }]
    }
  }
}
</script>

<template>
  <nav class="flex mb-4">
    <ol class="inline-flex space-x-1">
      <li v-for="(item, index) in items" :key="index" class="inline-flex">
        <template v-if="index === 0">
          <router-link :to="item.path"
            class="inline-flex items-center text-sm font-medium hover:text-blue-600">
            <!-- icone home de heroicons -->
            <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z">
              </path>
            </svg>
            {{ item.name }}
          </router-link>
        </template>
        <template v-else>
          <div class="flex items-center">
            <!-- icone chevron droit de heroicons -->
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"></path>
            </svg>
            <router-link :to="item.path" class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600">
              {{ item.name }}
            </router-link>
          </div>
        </template>
      </li>
    </ol>
  </nav>
</template>