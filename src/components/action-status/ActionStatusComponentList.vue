<script setup>
import {defineProps, computed} from 'vue'
import {useStore} from "vuex";
import ActionStatusComponent from "@/components/action-status/ActionStatusComponent.vue";

const props = defineProps({
  actionStatusDisappear: Boolean,
  actionStatusDisappearAfterSeconds: String,
  actionStatusErrorOverlayColor: String,
  actionStatusErrorTextColor: String,
  actionStatusSuccessOverlayColor: String,
  actionStatusSuccessTextColor: String,
})

const store = useStore()
const actionStatusQueue = computed(() => store.getters["getActionStatuses"]);

let actionStatusCounter = 0;

const addActionStatus = (actionStatusMessage, type) => {
  //update store error queue
  const id = actionStatusCounter
  if (type === 'error') {
    store.dispatch("pushError", {id, message: actionStatusMessage})
  } else {
    //success
    store.dispatch("pushSuccess", {id, message: actionStatusMessage})
  }

  if (props.actionStatusDisappear) {
    setTimeout(() => {
      removeActionStatus(id)
    }, props.actionStatusDisappearAfterSeconds * 1000)
  }
  actionStatusCounter++;
}

const removeActionStatus = (errorId) => {
  store.dispatch("remove", errorId)
}


defineExpose({addActionStatus});
</script>

<!--TODO: background color must change according to action-status-component type -->
<template>
  <div class="action-status-list-wrapper">
    <div class="action-status-list">
      <action-status-component v-for="(actionStatus) in actionStatusQueue"
                               :key="actionStatus.id"
                               is-visible
                               :action-message="actionStatus.message"
                               :disappear="props.actionStatusDisappear"
                               :disappear-after-seconds="props.actionStatusDisappearAfterSeconds"
                               :color="actionStatus.type === 'error'? props.actionStatusErrorTextColor:props.actionStatusSuccessTextColor"
                               :background-color="actionStatus.type === 'error'? props.actionStatusErrorOverlayColor: props.actionStatusSuccessOverlayColor"

      />
    </div>
  </div>
</template>

<style scoped>

.action-status-list-wrapper {
  width: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  flex-direction: row;
  z-index: 1000000;
}

.action-status-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  overflow-y: auto;
  max-height: 12rem;
  width: 80%;
  position: fixed;
}
</style>