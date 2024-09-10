<template>
  <!-- Slot for the label, with fallback to BaseLabel if not provided -->
  <template v-if="$slots.label">
    <slot name="label"></slot>
  </template>
  <base-label v-else-if="label" :style="{ '--label-color': labelColor }" :for="id" :label-text="label"/>

  <div class="input-container">
    <input :type="type"
           :id="id"
           :required="required"
           :placeholder="placeholder"
           :value="modelValue"
           @input="onInput"
           @focus="onFocus(true)"
           @blur="onFocus(false)"
           :class="['single-field', { 'input-error': !valid, 'input-valid': valid }]">
    <!-- Tooltip hint -->
    <div v-if="!valid" class="error-hint">
      {{ errorMessage }}
    </div>
  </div>
</template>`

<script setup>
import {defineProps, ref} from 'vue'
import BaseLabel from "@/components/core/inputs/labels/BaseLabel.vue";


const props = defineProps({
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
  },
  valid: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },

  labelColor: {
    type: String,
    default: 'black'
  },

  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'focus-change']);

const onInput = (event) => {
  let value = event.target.value;
  if (props.type === 'number') {
    value = Number(value);
  }
  emit('update:modelValue', value);
}

const onFocus = (isFocused) => {
  emit('focus-change', isFocused);
};


</script>

<style scoped>

.input-container {
  position: relative; /* Create a context for absolute positioning */
  width: 100%;
}

.single-field {
  width: 100%;
  padding: 4px;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.6s;
}

/* Style when the input field is focused and valid */
.input-valid:focus {
  outline: none;
  border: 2px solid black;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4); /* Add a shadow effect */
}

/* Error style */
.input-error {
  border: 2px solid red; /* Red border to indicate an error */
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4); /* Add a shadow effect */
}

.input-error:focus {
  outline: none;
  border: 2px solid red;
  box-shadow: none; /* No shadow effect on focus when invalid */
}

/* Tooltip styling */
.error-hint {
  position: absolute;
  top: 100%; /* Position below the input */
  left: 0;
  background-color: rgba(255, 0, 0, 0.1);
  color: red;
  font-size: 0.85rem;
  padding: 4px;
  border-radius: 4px;
  white-space: nowrap;
  margin-top: 2px;
}


</style>`