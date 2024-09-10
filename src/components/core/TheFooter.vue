<script setup lang="js">
const props = defineProps({
  color: String,
  textColor: String,
});
</script>

<template>
    <footer class="col-12" :style="{backgroundColor: props.color, color: props.textColor}">
      <div class="container text-center">
        <h5 class="mx-auto">&copy; 2024 GrowthIn. All rights reserved.</h5>
      </div>
    </footer>
</template>

<style scoped>

</style>
