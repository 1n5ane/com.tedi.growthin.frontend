<script setup>
import BaseInput from "@/components/core/inputs/BaseInput.vue";
import {ref, watch} from "vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `search-input-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
  },
  placeholder: {
    type: String,
    default: "Search anything"
  },
  modelValue: {
    type: String,
    default: ''
  },
  searchDebounceDelay: {
    type: Number,
    default: 100
  }
})

function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const emit = defineEmits(['update:modelValue', 'focus-change'])

const searchInputRef = ref(props.modelValue);

const handleUpdateValue = debounce((newValue) => {
  emit('update:modelValue', newValue);
}, props.searchDebounceDelay)


const handleFocusChange = (isFocused) => {
  emit('focus-change', isFocused)
}
</script>

<template>
  <base-input :id="props.id"
              :placeholder="props.placeholder"
              v-model="searchInputRef"
              type="text"
              @focus-change="handleFocusChange"
              @update:modelValue="handleUpdateValue"/>
  <div v-if="$slots.default" class="dropdown-box">
    <slot></slot>
  </div>
</template>

<style scoped>
.dropdown-box {
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: row;
  z-index: 1000; /* ensure it is above other elements */
}
</style>