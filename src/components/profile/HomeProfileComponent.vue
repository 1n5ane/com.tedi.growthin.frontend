<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {useStore} from 'vuex'
import {onMounted, reactive, ref} from "vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import {useRouter} from "vue-router";


const store = useStore()
const router = useRouter()

const isAvatarHovered = ref(false);
const userImageRef = reactive({
  base64Data: '',
  mediaType: ''
})

const userJobFieldRef = ref('');
const userConnectionsCountRef = ref(null);

const handleAvatarClicked = () => {
  router.push({path: `/profile/${store.getters['authenticationStore/getCurrentLoggedInUser']?.id}`})
}

const handleAvatarHovered = (isHovered) => {
  isAvatarHovered.value = isHovered;
}

const handleMouseOver = () => {
  isAvatarHovered.value = true;
}

const handleMouseLeave = () => {
  isAvatarHovered.value = false;
}

const handleTotalConnectionsClick = async () => {
  await router.push({name: 'my-network', hash: '#my-connections'})
}

onMounted(async () => {
  const userProfileService = UserProfileService.getInstance()
  const userConnectionService = UserConnectionService.getInstance()

  try {
    const resp = await userProfileService.getUserProfile({id: store.getters['authenticationStore/getCurrentLoggedInUser'].id})
    if (resp && resp.success) {
      const base64Data = resp.profile.profilePic?.data;
      const mediaType = resp.profile.profilePic?.mediaType;
      userImageRef.base64Data = base64Data;
      userImageRef.mediaType = mediaType?.type;
      userJobFieldRef.value = resp.profile.jobField
    } else {
      console.error("Failed to get user profile details")
    }
  } catch (error) {
    console.log(error.message)
    console.error("Failed to get user profile details")
  }

  //count all user connections
  try {
    const resp = await userConnectionService.countAllUserConnectionRequestsByStatus("ACCEPTED")
    if (resp && resp.success) {
      userConnectionsCountRef.value = resp.count
    } else {
      console.error("Failed to count all user connections")
    }
  } catch (error) {
    console.log(error.message)
    console.error("Failed to count all user connections")
  }

})


</script>

<template>
  <div class="home-profile-container p-2">
    <div class="row justify-content-center align-items-center">
      <div class="col-12 align-self-center">
        <user-avatar-component v-if="userImageRef.base64Data"
                               :image-base64-data="userImageRef.base64Data"
                               :image-type="userImageRef.mediaType"
                               size="140px"
                               class="avatar-component"
                               @click="handleAvatarClicked"
                               @avatar-hovered="handleAvatarHovered"/>
      </div>
      <div class="col-auto align-self-center">
        <h4 :class="{ 'underline-effect':  isAvatarHovered }"
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave">
          {{ store.getters['authenticationStore/getCurrentLoggedInUser']?.username }}
        </h4>
      </div>
      <div class="col-12 align-items-center">
        <div v-text="userJobFieldRef" class="job-field"></div>
      </div>

      <div class="col-auto align-items-center">
        <div class="total-connections" @click="handleTotalConnectionsClick">
          {{ userConnectionsCountRef }} total connections
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-profile-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white;
  width: 100%;
  max-width: 300px;
  height: auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-right: 15px;
  margin-left: 5px;
  margin-top: 5px;
}

.avatar-component {
  cursor: pointer !important;
}

.total-connections {
  margin-block: 8px;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;
  user-select: none;
}

.total-connections::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background-color: black;
  transform: scaleX(0);
  transform-origin: right; /* Start from the right when not hovered */
  transition: transform 0.3s ease;
  user-select: none;
}

.total-connections:hover::after {
  transform: scaleX(1);
  transform-origin: left; /* Start from the left when hovered */
  user-select: none;
}

.job-field {
  font-weight: lighter;
}

h4 {
  position: relative;
  font-weight: normal;
  transition: color 0.3s ease;
  cursor: pointer;
}

h4::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background-color: black;
  transform: scaleX(0);
  transform-origin: right; /*start from the right when not hovered*/
  transition: transform 0.3s ease
}

.underline-effect::after {
  transform: scaleX(1);
  transform-origin: left; /*start from the left when hovered*/
  user-select: none;
}

.underline-effect {
  transform: scale(1.02);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  user-select: none;
}


</style>