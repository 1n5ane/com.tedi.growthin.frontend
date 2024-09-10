<script setup lang="js">
import {ref, nextTick} from 'vue';

const props = defineProps({
  text: String,
  type: String,
  textColor: String,
  color: String,
  bulletColor: String,
  hoverColor: String,
  hoverTextColor: String,
});

const emit = defineEmits([
  'button-click'
]);

const isClicked = ref(false);

/** @type {import('vue').Ref<HTMLElement | null>} */
const bulletRef = ref(null);

const handleClick = () => {
  isClicked.value = true;
  //emit click
  emit('button-click');
// Ensure DOM updates are complete before running additional logic
  nextTick(() => {
    const bullet = bulletRef.value;
    if (bullet) {
      bullet.addEventListener('animationend', () => {
        bullet.classList.add('hidden');
        isClicked.value = false; // Hide bullet after animation ends
      }, {once: true});
    }
  });
};
</script>

<template>
  <div class="row mx-auto justify-content-center">
    <div class="button-wrapper col-12" :style="{backgroundColor: props.color}">
      <button :class="['btn', { clicked: isClicked }]"
              :style="{'--button-color': props.color, '--hover-color': props.hoverColor, '--hover-text-color':props.hoverTextColor, '--text-color':props.textColor}"
              :type="props.type"
              @click="handleClick">
        {{ props.text }}
        <div ref="bulletRef" :class="['bullet']" :style="{ backgroundColor: props.bulletColor}"></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes bullet {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(540deg);
  }
}

.button-wrapper {
  position: relative;
  overflow: hidden;
  width: auto;
  padding: 2px;
  border-radius: 8px;
  z-index:0;
}

.btn:hover {
  background-color: var(--hover-color, inherit) !important;
  color: var(--hover-text-color, inherit) !important;
}

.btn {
  position: relative;
  border: 2px solid transparent;
  outline: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  background-color: var(--button-color, inherit);
  color: var(--text-color, black);
}


.btn.clicked .bullet {
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 9px;
  transform-origin: 0 50%;
  animation: bullet 1.5s linear forwards;
  z-index: -1;
}

.bullet.hidden {
  display: none; /* Hide the element */
}
</style>
