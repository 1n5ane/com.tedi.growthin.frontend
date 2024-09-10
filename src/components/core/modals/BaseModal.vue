<template>
  <div v-if="isVisible" class="modal-overlay"
       :style="{color : props.color, backgroundColor : props.backgroundColor}" @click="closeModal">
    <button class="modal-close" @click="closeModal"><b :style="{color:props.color}">X</b></button>
    <div class="modal-content" @click.stop>
      <b v-text="props.message"></b>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  isVisible: Boolean,
  color: String,
  backgroundColor: String,
  message: String,
});

const emit = defineEmits(['update:isVisible']);

const closeModal = () => {
  emit('update:isVisible', false);
};

</script>

<style scoped>

.modal-overlay {
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4); /* Add a shadow effect */
  width: 100%;
  height: inherit;
  position: relative;
  border: solid black 1px;
  border-radius: 3px;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.4s ease, opacity 0.4s ease;
  opacity: 0.95;
  visibility: visible;
  padding: 1rem;
}


.modal-overlay:hover {
  opacity: 1.05;
  cursor: pointer;
}

.modal-content {
  display: flex;
  background: var(backgroundColor);
  border-radius: 8px;
  text-align: center;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width:auto;
}


.modal-close {
  position: absolute;
  top: 2px;
  right: 2px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 1;
}

.modal-close:hover {
  transform: scale(1.1);
}

</style>