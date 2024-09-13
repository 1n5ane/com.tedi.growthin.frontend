<script setup>

import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {useStore} from "vuex";
import ArticleListComponent from "@/components/articles/ArticleListComponent.vue";
import BaseAvatarEditor from "@/components/core/avatars/BaseAvatarEditor.vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import ImageUtils from "@/utils/ImageUtils";
import baseAvatarImage from "@/assets/images/avatars/avatar_1.jpg";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import ProfileDetailsComponent from "@/components/profile/ProfileDetailsComponent.vue";
import {useRoute, useRouter} from "vue-router";
import UserDetailsComponent from "@/components/profile/UserDetailsComponent.vue";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";

const emit = defineEmits(['update-show-header', 'success', 'error']);
const store = useStore();
const route = useRoute();
const router = useRouter();
const editAvatar = ref(false);
const currentProfileRef = ref(null);
const avatarImageRef = ref('');
const articleListKey = ref(0);
const isProfileOfCurrentLoggedInUser = ref(null);

const isConnectedWithUser = ref(null);
const existsPendingConnectionRequest = ref(null);
const connectionRequestRef = ref(null);
const currentLoggedUserMadeTheRequest = computed(()=>{
  if(connectionRequestRef.value == null)
    return null

  return connectionRequestRef.value.userId === store.getters['authenticationStore/getCurrentLoggedInUser']?.id
})

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleUserDetailsUpdate = (success) => {
  router.replace({
    name: 'logout',
    query: {
      actionStatuses: JSON.stringify([{
        type: "success",
        message: "Successfully updated user details. Login required"
      }])
    }
  })
}


const checkIfUsersAreConnected = async (userId) => {
  if (!isProfileOfCurrentLoggedInUser.value) {
    const userConnectionService = UserConnectionService.getInstance()
    try {
      const resp = await userConnectionService.checkUserConnectionExists(userId)
      if (resp && resp.success) {
        isConnectedWithUser.value = resp.exists
        return
      }
      let errorMessage = resp ? resp.error : 'Failed to check if users are connected'
      handleError(errorMessage)
    } catch (error) {
      handleError(error.message)
    }
  }
}

const getConnectionRequest = async (userId) => {
  if (!isProfileOfCurrentLoggedInUser.value) {
    const userConnectionService = UserConnectionService.getInstance()
    try {
      const resp = await userConnectionService.getConnectionRequest(userId)
      if (resp && resp.success) {
        if(resp.userConnectionRequest && resp.userConnectionRequest.status === "PENDING"){
          existsPendingConnectionRequest.value = true
        }else{
          existsPendingConnectionRequest.value = false
        }
        connectionRequestRef.value = resp.userConnectionRequest
        return
      }
      let errorMessage = resp ? resp.error : 'Failed to check if connection request exists'
      handleError(errorMessage)
    } catch (error) {
      handleError(error.message)
    }
  }
}

const toggleEditAvatar = () => {
  editAvatar.value = true
}

const fetchUserProfile = async (profileId) => {
  const profileService = UserProfileService.getInstance()
  try {
    const resp = await profileService.getUserProfile({id: profileId})
    if (resp && resp.success) {
      currentProfileRef.value = resp.profile
      await loadAvatarImage()
      return
    }
    let errorMsg = resp ? resp.error : 'Failed to fetch user profile details'
    emit('error', errorMsg)
  } catch (error) {
    emit('error', error.message)
  }
}

const loadAvatarImage = async () => {
  // return ImageUtils.constructBase64ImageFromTypeAndBase64Data(currentProfileRef.value.profilePic?,)
  if (currentProfileRef.value && currentProfileRef.value.profilePic) {
    avatarImageRef.value = ImageUtils.constructBase64ImageFromTypeAndBase64Data(currentProfileRef.value.profilePic.data, currentProfileRef.value.profilePic.mediaType.type)
  } else {
    avatarImageRef.value = await ImageUtils.getImageDataUrl(baseAvatarImage)
  }
}

const handleEditCompleted = async (imageData) => {
  const {type, base64Data} = ImageUtils.extractTypeAndBase64Data(imageData)
  const userProfileService = UserProfileService.getInstance()
  try {
    const resp = await userProfileService.updateUserProfile({profilePic: {data: base64Data, mediaType: {type}}})
    if (resp && resp.success) {
      currentProfileRef.value = resp.profile
      emit('success', "Successfully updated profile picture")
      editAvatar.value = false
      articleListKey.value++ //cause rerender of articleList
      loadAvatarImage()
      return
    }
    let errorMessage = resp ? resp.error : 'Failed to update profile pic'
    emit('error', errorMessage)
  } catch (error) {
    emit('error', error.message)
  }
}

const discardAvatarChanges = () => {
  editAvatar.value = false
}

watch(
    () => route.params.profileId,
    async (newProfileId, oldProfileId) => {
      if (newProfileId !== oldProfileId) {
        await initializeView()
      }
    }
);

const initializeView = async () => {
  editAvatar.value = false
  currentProfileRef.value = null
  avatarImageRef.value = ''
  articleListKey.value = 0
  isProfileOfCurrentLoggedInUser.value = null
  connectionRequestRef.value = null
  existsPendingConnectionRequest.value = null
  isConnectedWithUser.value = null
  let userIdParam = route.params?.profileId
  if (!userIdParam) {
    userIdParam = store.getters['authenticationStore/getCurrentLoggedInUser']?.id
    isProfileOfCurrentLoggedInUser.value = true
  } else {
    userIdParam = Number(userIdParam)
    isProfileOfCurrentLoggedInUser.value = userIdParam === store.getters['authenticationStore/getCurrentLoggedInUser']?.id
  }

  if (Number.isNaN(userIdParam)) {
    //if invalid userId provided
    await router.replace({
      name: 'my-profile',
      query: {
        actionStatuses: JSON.stringify([{
          type: "error",
          message: "Profile not found"
        }])
      }
    });
    return
  }

  await fetchUserProfile(userIdParam)
  await checkIfUsersAreConnected(userIdParam)
  if (!isConnectedWithUser.value) {
    await getConnectionRequest(userIdParam)
  }
}

onMounted(async () => {
  emit("update-show-header", true);
  await initializeView()
})

const handleViewUserConnections = () => {
  router.push({path: `/network/${currentProfileRef.value.id}`})
}


const handleUnconnect = async () => {
  const userConnectionService = UserConnectionService.getInstance()
  try {
    const resp = await userConnectionService.deleteUserConnection(currentProfileRef.value.id)
    if (resp && resp.success) {
      emit('success', 'Successfully unconnected')
      router.go(0)
    }
  } catch (error) {
    emit('error', error.message)
  }
}

const allProfileDetailsEmpty = computed(() => {
  const profile = currentProfileRef.value;

  if (!profile) return true

  return !profile.education &&
      !profile.jobField &&
      !profile.age &&
      !profile.description
})

const handleAcceptConnectionRequest = async() =>{
  const userConnectionService = UserConnectionService.getInstance()
  try {
    const resp = await userConnectionService.updateStatusUserConnectionRequest(connectionRequestRef.value.id, "ACCEPTED")
    if (resp && resp.success) {
      emit('success', 'Successfully accepted connection request')
      router.go(0) //refresh
    }
  } catch (error) {
    emit('error', error.message)
  }
}

const handleDeclineConnectionRequest = async() =>{
  const userConnectionService = UserConnectionService.getInstance()
  try {
    const resp = await userConnectionService.updateStatusUserConnectionRequest(connectionRequestRef.value.id, "DECLINED")
    if (resp && resp.success) {
      emit('success', 'Successfully declined connection request')
      existsPendingConnectionRequest.value = false
      connectionRequestRef.value = null
    }
  } catch (error) {
    emit('error', error.message)
  }
}

const handleConnect = async () => {
  const userConnectionService = UserConnectionService.getInstance()
  try {
    const resp = await userConnectionService.createUserConnectionRequest(currentProfileRef.value.id)
    if (resp && resp.success) {
      emit('success', 'Successfully requested to connect')
      await getConnectionRequest(currentProfileRef.value.id)
    }
  } catch (error) {
    emit('error', error.message)
  }
}

const handleViewMyConnections = () => {
  router.push({name: 'my-network'})
}


onUnmounted(() => {
  emit('update-show-header', false);
})

</script>

<template>
  <div class="profile-container">
    <div class="cover-photo">
      <img src="@/assets/images/profiles/profile-cover.jpg" alt="Profile Cover Photo" class="cover-photo-img"/>
    </div>

    <div v-if="currentProfileRef" class="profile-picture-wrapper">
      <user-avatar-component v-if="!editAvatar"
                             :image-base64-data="currentProfileRef.profilePic?.data"
                             :image-type="currentProfileRef.profilePic?.mediaType.type"
                             size="180px"
                             class="avatar-component"/>
      <base-avatar-editor v-if="editAvatar"
                          class="editor-component"
                          :image="avatarImageRef"
                          id="avatar-editor"
                          @edit-completed="handleEditCompleted"
                          :height="140"
                          :width="140">
        <template #buttons="{ applyChanges }">
          <div class="row avatar-edit-buttons-row justify-content-around">
            <div class="col" style="padding-left: 0">
              <base-button color="rgba(220, 20, 60, 1)"
                           type="submit"
                           text="x"
                           hover-color="black"
                           hover-text-color="white"
                           @button-click="discardAvatarChanges"/>
            </div>
            <div v-if="isProfileOfCurrentLoggedInUser" class="col" style="padding-right: 0">
              <base-button color="#00C753"
                           type="submit"
                           hover-color="black"
                           hover-text-color="white"
                           text="✓"
                           @button-click="applyChanges"/>
            </div>
          </div>
        </template>
      </base-avatar-editor>

      <img v-if="!editAvatar && isProfileOfCurrentLoggedInUser"
           src="@/assets/icons/edit.png"
           class="edit-avatar-icon"
           alt="Edit Profile Pic Icon"
           @click="toggleEditAvatar"/>

      <div class="username" v-text="currentProfileRef.username"></div>
    </div>

    <div class="row justify-content-end">
      <div class="col-6 align-self-end">
        <div v-if="isConnectedWithUser" class="row mt-1 justify-content-end" style="margin-right: 1px">
          <div class="col-auto">
            <button type="button" @click="handleUnconnect" class="custom-button">Unconnect</button>
          </div>
          <div class="col-auto">
            <button type="button" @click="handleViewUserConnections" class="custom-button">View Connections</button>
          </div>
        </div>

        <div v-else class="row mt-1 justify-content-end" style="margin-right: 1px">
          <div v-if="!isProfileOfCurrentLoggedInUser && existsPendingConnectionRequest===false" class="col-auto">
            <button type="button" @click="handleConnect"
                    class="custom-button">Connect
            </button>
          </div>
          <div v-else-if="!isProfileOfCurrentLoggedInUser && existsPendingConnectionRequest===true" class="col-auto">
            <!-- Pending user connection request exists -> check who made it -->
            <button v-if="currentLoggedUserMadeTheRequest === true" type="button" disabled class="pending-request-button">
              Connection pending approval
            </button>

            <!--Accept or Decline connection request-->
              <button v-if="currentLoggedUserMadeTheRequest === false"
                      type="button" @click="handleAcceptConnectionRequest" class="accept-request-button col-auto">
                Approve Connection
              </button>

              <button v-if="currentLoggedUserMadeTheRequest === false"
                      type="button" @click="handleDeclineConnectionRequest" class="decline-request-button col-auto">
                Decline Connection
              </button>

          </div>
          <div v-else-if="isProfileOfCurrentLoggedInUser" class="col-auto">
            <button type="button" @click="handleViewMyConnections" class="custom-button">My Connections</button>
          </div>
        </div>

      </div>
    </div>

    <div class="row profile-content justify-content-start">
      <div class="col-6 align-self-start">
        <profile-details-component v-if="currentProfileRef && (!allProfileDetailsEmpty || isProfileOfCurrentLoggedInUser)" :profileId="currentProfileRef.id"
                                   @success="handleSuccess"
                                   @error="handleError"/>
        <h5 v-if="currentProfileRef" style="margin-top: 5px">Additional User Details</h5>
        <user-details-component v-if="currentProfileRef" :user-id="currentProfileRef.id"
                                @success="handleUserDetailsUpdate" @error="handleError"/>
      </div>

      <div class="col-6 align-self-start" style="padding-bottom:4rem">
        <article-list-component v-if="currentProfileRef && isProfileOfCurrentLoggedInUser!==null"
                                :hide-new-article="!isProfileOfCurrentLoggedInUser"
                                :key="articleListKey"
                                :user-id="currentProfileRef.id"
                                max-height="100%"
                                :article-page-size="6"
                                :comment-page-size="2"
                                @success="handleSuccess"
                                @error="handleError"/>
      </div>
    </div>


  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 100%;
  height: 96vh;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.avatar-edit-buttons-row {
  position: relative;
  bottom: 1.8rem;
}

.edit-avatar-icon {
  position: absolute;
  top: 8.8rem;
  left: 4.4rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 5px 10px;
  width: 40px;
  height: 40px;
  transition: transform 0.3s ease;
  cursor: pointer;
  object-fit: contain;
}

.edit-avatar-icon:hover {
  transform: scale(1.1);
}

.username {
  position: absolute;
  top: 7rem; /* Adjust the position so it doesn't overlap the avatar */
  left: 10rem;
  font-size: 2.1rem;
  background-color: transparent;
  padding: 5px 10px;
  width: max-content;
}


.cover-photo {
  width: 100%;
  height: 150px;
  padding-right: 1rem;
  padding-left: 1rem;
  position: relative;
  flex-shrink: 0;
}

.cover-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.profile-picture-wrapper {
  position: absolute;
  left: 2.5vw;
  top: 4vh;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-component {
  border-radius: 50%;
  border: 4px solid white;
}

.editor-component {
  border: 4px solid white;
}

.accept-request-button{
  background-color: rgba(0, 128, 0, 0.9);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.2s ease-out;
}

.decline-request-button{
  background-color: rgba(220, 20, 60, 0.9);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.2s ease-out;
}

.decline-request-button:hover {
  background-color: rgba(220, 20, 60, 1);
}

.accept-request-button:hover {
  background-color: rgba(0, 128, 0, 1);
}

.custom-button {
  background-color: rgba(255, 69, 0, 1);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s, color 0.3s;
}

.pending-request-button {
  background-color: rgba(255, 69, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin-right: 10px;
  cursor: default;
}

.custom-button:hover {
  background-color: black;
  color: white;
}

.profile-content {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

</style>