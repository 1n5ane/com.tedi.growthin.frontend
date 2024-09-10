<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";

const props = defineProps({
  profile: Object,
})
const emit = defineEmits(["avatar-click", "create-connection"]);

const handleAvatarClick = (userId) => {
  emit("avatar-click", userId)
}

const handleCreateConnection = (userId) => {
  emit("create-connection", userId)
}

</script>

<template>

  <div class="row h-100 connection-info justify-content-start">
    <div class="col-12">
      <user-avatar-component size="65px"
                             class="avatar-component"
                             :image-base64-data="props.profile.profilePic?.data"
                             :image-type="props.profile.profilePic?.mediaType.type"
                             @avatar-clicked="handleAvatarClick(props.profile.id)"/>
    </div>
    <div class="col-12 h-50">
      <h5 v-text="props.profile.username"></h5>
      <p class="jobField" v-text="props.profile.jobField"></p>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <base-button color="rgba(255, 69, 0, 1)"
                   type="submit"
                   bullet-color="black"
                   hover-color="black"
                   hover-text-color="white"
                   text="Connect"
                   @button-click="handleCreateConnection(props.profile.id)"/>
    </div>
  </div>
</template>

<style scoped>
.connection-info {
  text-align: center;
  margin-top: 10px;
}

.avatar-component {
  cursor: pointer !important;
}


</style>