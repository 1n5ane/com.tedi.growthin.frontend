<script setup>
import baseAvatarImage from "@/assets/images/avatars/avatar_1.jpg";

const props = defineProps({
  image: {
    type: String,
    default: baseAvatarImage
  },
  size: {
    type: String,
    default: "150px" // Set a default size
  },
  noHover:{
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['avatar-clicked']);

const handleClickEvent = () => {
  emit('avatar-clicked');
};
</script>

<template>
  <div @click="handleClickEvent"
       :class="['avatar-container', { 'no-hover': props.noHover }]"
       :style="{ '--width': props.size, '--height': props.size }">
    <img :src="image" class="avatar-image" />
  </div>
</template>

<style scoped>
.avatar-container {
  display: inline-block;
  overflow: hidden;
  border: 1px solid black;
  border-radius: 50%; /* Ensures the container is always a circle */
  width: var(--width); /* These will be equal to ensure a perfect circle */
  height: var(--height);
}

.avatar-container:hover {
  cursor: pointer;
  transform: scale(1.01);
}

/* If noHover is true, remove the hover effect */
.avatar-container.no-hover:hover {
  transform: none;
  cursor: default;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image covers the container while maintaining aspect ratio */
}
</style>