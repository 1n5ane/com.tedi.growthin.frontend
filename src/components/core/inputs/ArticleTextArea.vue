<template>
  <div class="input-container">
    <textarea ref="textareaRef"
              :class="{'text-input':true, 'readonly-cursor': props.readOnly,'text-center': props.textCenter }"
              :id="id"
              :readonly="props.readOnly"
              :required="required"
              :placeholder="placeholder"
              :value="modelValue"
              @input="onInput"
              @change="onInput"
              @focus="adjustHeight"
              @blur="adjustHeight">
    </textarea>
  </div>
</template>

<script setup>

import {nextTick, watch, ref, onMounted, onUnmounted} from "vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  textCenter: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);
const textareaRef = ref(null);

const focus = () => {
  if (textareaRef.value) {
    console.log("OPOO")
    textareaRef.value.focus();
  }
}

const onInput = (event) => {
  let value = event.target.value;
  if (props.type === 'number') {
    value = Number(value);
  }
  emit('update:modelValue', value);
  adjustHeight();
}

watch(() => props.modelValue, async () => {
  await nextTick();
  adjustHeight();
}, {immediate: true});

const adjustHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};


onMounted(() => {
  window.addEventListener('resize', adjustHeight);
  adjustHeight();
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustHeight);
});

defineExpose({focus})

</script>

<style scoped>
.input-container {
  width: 100%;
}

.text-input {
  display: block;
  align-content: center;
  width: 100%;
  border: none;
  outline: none;
  box-sizing: border-box;
  overflow: hidden;
  resize: none;
  line-height: 1.35em;
  min-height: 1.5em;
}

.readonly-cursor {
  cursor: default;
}
</style>