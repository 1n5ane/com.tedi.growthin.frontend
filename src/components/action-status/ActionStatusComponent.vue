<template>
  <div v-if="isVisible" class="action-status-container">
    <!-- Action Status Modal -->
    <base-modal
        :color="color"
        :isVisible="isVisible"
        :message="message"
        :background-color="backgroundColor"
        @update:isVisible="handleVisibilityChange"
    />
  </div>
</template>

<script setup lang="js">
import BaseModal from "@/components/core/modals/BaseModal.vue";
import {onMounted, ref} from "vue";

const props = defineProps({
  color: String,
  backgroundColor: String,
  disappear: Boolean,
  isVisible: Boolean,
  disappearAfterSeconds: String, //in milliseconds
  actionMessage: String,
});

onMounted(() => {
  message.value = props.actionMessage
  isVisible.value = props.isVisible != null
});

const isVisible = ref(false)
const message = ref('')
const emit = defineEmits(['update:isVisible']);

// Function to show action status modal
const showActionStatus = (actionStatusMessage) => {
  if (actionStatusMessage && actionStatusMessage.length > 0)
    message.value = actionStatusMessage;
  isVisible.value = true
  if (props.disappear) {
    setTimeout(hideActionStatus, props.disappearAfterSeconds * 1000)
  }
};

// Function to hide action status modal
const hideActionStatus = () => {
  isVisible.value = false
  message.value = ''
};


// Function to handle visibility changes from the modal
const handleVisibilityChange = (visibility) => {
  if (!visibility) {
    hideActionStatus();
  }
};


defineExpose({showActionStatus}); //parent using error component can call it
</script>

<style scoped>
.action-status-container {
  width: 100%;
}
</style>