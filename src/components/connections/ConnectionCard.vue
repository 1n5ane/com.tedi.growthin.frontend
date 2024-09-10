<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import DateUtils from "../../utils/DateUtils";

const props = defineProps({
  userConnectionId: Number,
  user: Object,
  createdAt: String,
  enableDelete: {
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits(["avatar-click", "delete-connection"]);

const handleAvatarClick = (userId) => {
  emit("avatar-click", userId)
}

const handleDeleteConnection = (userId) => {
  emit("delete-connection", userId)
}

</script>

<template>

  <div class="row h-100 connection-info justify-content-start">
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
  <div v-if="props.enableDelete" class="row">
    <div class="col-12">
      <base-button color="rgba(255, 69, 0, 1)"
                   type="submit"
                   bullet-color="black"
                   hover-color="black"
                   hover-text-color="white"
                   text="Unconnect"
                   @button-click="handleDeleteConnection(props.user.id)"/>
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