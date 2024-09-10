<script setup>
const emit = defineEmits(['click'])
const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div class="comment-button-container">
    <!-- Main React Button -->
    <button @click="handleClick" class="comment-btn">
      Comment
    </button>
  </div>
</template>

<style scoped>
.comment-button-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.comment-btn {
  width: 100%;
  background-color: white;
  color: black;
  padding: 10px 15px;
  border: 1px solid black;
  cursor: pointer;
  font-size: 1rem;
  outline: none;
  transition: background-color 0.3s ease-out, color 0.3s ease-out;
  border-radius: 0 3px 0 0;
}

.comment-btn:hover{
  background-color: rgba(255, 69, 0, 1);
  color:white;
}

</style>