<script>
export default {
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    attributes: {
      type: Array,
      required: true
    },
  }
}
</script>

<template>
  <div>
    <table class="min-w-full border border-gray-200 rounded">
      <thead>
        <tr class="bg-blue-300">
          <th v-for="header in headers" :key="header" class="py-2 px-4 text-left font-medium">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot name="row" v-for="(item, index) in items" :item="item" :index="index">
          <tr :key="item.id" class="border-t border-gray-200 hover:bg-gray-100" :class="[
            $attrs.class,
            { 'present': item.isPresent === true },
            { 'opacity-50 cursor-not-allowed': item.disabled === true }
          ]" @click="$emit('rowClick', item)">
            <td v-for="(attr, attrIndex) in attributes" :key="attrIndex" class="py-2 px-4">
              <slot :name="`column-${attr}`" :item="item" :value="item[attr]">
                {{ item[attr] }}
              </slot>
            </td>
          </tr>
        </slot>
      </tbody>
    </table>
  </div>
</template>