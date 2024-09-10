<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import DateUtils from "../../utils/DateUtils";

const props = defineProps({
  requestId: Number,
  user: Object,
  createdAt: String,
})
const emit = defineEmits(["avatar-click", "accept-connection", "decline-connection"]);

const handleAvatarClick = (userId) =>{
  emit("avatar-click", userId)
}

const handleAcceptConnection = (requestId) =>{
  emit("accept-connection", requestId)
}

const handleDeclineConnection = (requestId) =>{
  emit("decline-connection", requestId)
}

</script>

<template>

  <div class="row h-100 connection-request-info justify-content-start">
    <div class="col-12">
      <div class="small-text">{{ DateUtils.formatDate(props.createdAt) }}</div>
    </div>
    <div class="col-12">
      <user-avatar-component size="65px"
                             class="avatar-component"
                             :image-base64-data="props.user.profilePic?.data"
                             :image-type="props.user.profilePic?.mediaType.type"
                             @avatar-clicked="handleAvatarClick(props.user.id)"/>
    </div>
    <div class="col-12 h-50">
      <h5 v-text="props.user.username"></h5>
      <p class="jobField" v-text="props.user.jobField"></p>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <base-button color="rgba(0, 128, 0, 1)"
                   type="submit"
                   bullet-color="black"
                   hover-color="black"
                   hover-text-color="white"
                   text="✓"
                   @button-click="handleAcceptConnection(props.requestId)"/>
    </div>
    <div class="col-6">
      <base-button color="rgba(220, 20, 60, 1)"
                   type="submit"
                   bullet-color="black"
                   hover-color="black"
                   hover-text-color="white"
                   text="x"
                   @button-click="handleDeclineConnection(props.requestId)"/>
    </div>
  </div>
</template>

<style scoped>
.connection-request-info {
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