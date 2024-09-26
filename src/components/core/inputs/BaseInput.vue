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
           :readonly="props.readOnly"
           @input="onInput"
           @focus="onFocus(true)"
           @blur="onFocus(false)"
           :class="['single-field', { 'input-error': !valid, 'input-valid': valid }]"
           :style="inputStyle">
    <!-- Tooltip hint -->
    <div v-if="!valid" class="error-hint" :style="{ 'background-color': props.errorHintBackgroundColor, 'color':props.errorHintMessageColor}">
      {{ errorMessage }}
    </div>
  </div>
</template>`

<script setup>
import {computed, defineProps, ref} from 'vue'
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
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  enableBorder: {
    type: Boolean,
    default: true
  },
  disableShadow: {
    type: Boolean,
    default: false
  },
  errorHintBackgroundColor: {
    type: String,
    default: 'rgba(255, 0, 0, 0.1)'
  },
  errorHintMessageColor:{
    type: String,
    default: 'red'
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

const inputStyle = computed(() => {
  let style
  if (!props.enableBorder) {
    style = {border: 'none'};
  } else if (!props.valid) {
    style = {border: '2px solid red'};
  } else {
    style = {border: '2px solid black'};
  }

  if(!props.disableShadow){
    style['box-shadow'] = '4px 4px 4px rgba(0, 0, 0, 0.4)'
  }else {
    style['box-shadow'] = 'none'
  }
  return style
});

const onFocus = (isFocused) => {
  emit('focus-change', isFocused);
};


</script>

<style scoped>

.input-container {
  position: relative;
  width: 100%;
}

.single-field {
  width: 100%;
  padding: 4px;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.6s;
}


.input-valid:focus {
  outline: none;
}

.input-error:focus {
  outline: none;
  box-shadow: none;
}

/* Tooltip styling */
.error-hint {
  position: absolute;
  top: 100%; /* Position below the input */
  left: 0;
  font-size: 0.85rem;
  padding: 4px;
  border-radius: 4px;
  white-space: nowrap;
  margin-top: 2px;
  z-index: 1;
}


</style>`