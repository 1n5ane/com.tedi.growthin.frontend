<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";

const props = defineProps({
  profile: Object,
  enableConnectButton: {
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits(["avatar-click", "create-connection"]);

const handleAvatarClick = (userId) => {
  emit("avatar-click", userId)
}

const handleCreateConnection = (userId) => {
  if(props.enableConnectButton) {
    emit("create-connection", userId)
  }
}

</script>

<template>

  <div class="row h-100 connection-info justify-content-start">
    <div class="col-12">
      <user-avatar-component size="65px"
                             class="avatar-component"
                             :image-base64-data="props.profile.user.profilePic?.data"
                             :image-type="props.profile.user.profilePic?.mediaType.type"
                             @avatar-clicked="handleAvatarClick(props.profile.user.id)"/>
    </div>
    <div class="col-12 h-50">
      <h5 v-text="props.profile.user.username"></h5>
      <p class="jobField" v-text="props.profile.jobField"></p>
    </div>
  </div>
  <div v-if="props.enableConnectButton" class="row">
    <div class="col-12">
      <base-button color="rgba(255, 69, 0, 1)"
                   type="submit"
                   bullet-color="black"
                   hover-color="black"
                   hover-text-color="white"
                   text="Connect"
                   @button-click="handleCreateConnection(props.profile.user.id)"/>
    </div>
  </div>
  <div v-else class="row align-items-center justify-content-center">
    <div class="col-12 align-self-center small-text" style="padding: 8px">
      Already Connected
    </div>
  </div>
</template>

<style scoped>
.connection-info {
  text-align: center;
  margin-top: 10px;
}

.small-text {
  font-size: 1rem;
  color: gray;
  margin-top: -1rem;
  margin-bottom: 2px;
}

.avatar-component {
  cursor: pointer !important;
}


</style>