<!-- StatusBadge.vue -->
<template>
  <span
    v-if="statusObj"
    :class="`inline-block text-xs px-2 py-1 rounded-full ${statusObj.color}`"
  >
    {{ statusObj.combined }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  statusId: Number,
  statusList: Array
});

const statusObj = computed(() =>
  props.statusList.find(s => s.id === props.statusId)
);
</script>
