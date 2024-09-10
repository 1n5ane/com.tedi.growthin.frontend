<template>

  <!-- Slot for the label, with fallback to BaseLabel if not provided -->
  <template v-if="$slots.label">
    <slot name="label"></slot>
  </template>
  <base-label v-else-if="label" :style="{ '--label-color': labelColor }" :for="id" :label-text="label"/>

  <div class="input-container">
    <textarea :id="id"
              :required="required"
              :placeholder="placeholder"
              :value="modelValue"
              @input="onInput"
              :readonly="readOnly"
              class="single-field">
      </textarea>
  </div>
</template>

<script setup>
import BaseLabel from "@/components/core/inputs/labels/BaseLabel.vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
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
  required: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  labelColor: {
    type: String,
    default: 'black'
  },
  readOnly:{
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);
const onInput = (event) => {
  let value = event.target.value;
  if (props.type === 'number') {
    value = Number(value);
  }
  emit('update:modelValue', value);
}

</script>

<style scoped>
textarea {
  resize:none;
  overflow-y: scroll;
  height:100%;
  padding: 1rem;

}

.single-field {
  width: 100%;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.6s;
}

.single-field:focus {
  outline: none;
  border: 2px solid black;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4); /* Add a shadow effect */
}

</style>