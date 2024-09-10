<script setup>

const props = defineProps({
  id: String,
  labelText: String,
  labelColor: String,
})

</script>

<template>
  <label :for="props.id" :style="{'--label-color':props.labelColor}">{{ props.labelText }}</label>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  align-items: start;
  font-size: medium;
  font-weight: bold;
  position: relative;
  color: var(--label-color);
}
</style>