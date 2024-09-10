<script setup>
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, onUnmounted, ref} from "vue";
import BaseSearchInput from "@/components/core/inputs/BaseSearchInput.vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import ConnectionUserCardList from "@/components/connections/ConnectionUserCardList.vue";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";

const route = useRoute();
const router = useRouter();
const store = useStore();
const totalConnectionsCounterRef = ref(null);
const userNetworkProfileRef = ref(null);
const searchQueryUsername = ref('');

const emit = defineEmits(['update-show-header', 'error', 'success'])

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleConnectionSuccess = (successMessage) => {
  emit('success', successMessage)
}


onMounted(async () => {
  await emit('update-show-header', true);
  const userProfileService = UserProfileService.getInstance()
  const userConnectionService = UserConnectionService.getInstance()
  let userIdParam = Number(route.params.userId)
  if (Number.isNaN(userIdParam)) {
    //if invalid userId provided
    await router.replace({
      name: 'my-network',
      query: {
        actionStatuses: JSON.stringify([{
          type: "error",
          message: "Not found"
        }])
      }
    });
    return
  }

  if (userIdParam === store.getters['authenticationStore/getCurrentLoggedInUser']?.id) {
    // Redirect to 'my-network' if userId matches the current logged in user
    await router.replace({name: 'my-network'});
    return
  }

  //check if currentlogged in user is connected with the user
  //if not connected he can't browse network
  //this of course is protected by the backend and a forbidden response will be returned
  //redirect to current looged in user network if that's the case
  try{
    const resp = await userConnectionService.checkUserConnectionExists(userIdParam)

    if(resp && !resp.exists){
      await router.replace({
        name: 'my-network',
        query: {
          actionStatuses: JSON.stringify([{
            type: "error",
            message: "Access is forbidden"
          }])
        }
      });
      return
    }

  }catch(error){
    emit('error', `${error.message}. Refresh required`)
    return
  }

  try {
    const resp = await userProfileService.getUserProfile({id: userIdParam})
    if (resp && resp.success) {
      userNetworkProfileRef.value = resp.profile;
    } else {
      emit('error', `${resp.error}. Refresh required`)
    }
  } catch (error) {
    emit('error', 'Failed to get user details. Refresh required')
  }
});

const handleAvatarClicked = () => {
  console.log("AVATAR CLICKED")
}

onUnmounted(() => {
  emit('update-show-header', false);
})

</script>

<template>
  <div class="network-container">

    <div v-if="userNetworkProfileRef"
         class="row no-gutter-x connection-requests-title-row justify-content-center align-items-center">
      <div class="col-12">
        <user-avatar-component :image-base64-data="userNetworkProfileRef.profilePic?.data"
                               :image-type="userNetworkProfileRef.profilePic?.mediaType.type"
                               size="55px"
                               class="avatar-component"
                               @click="handleAvatarClicked"/>
      </div>
      <div class="col-auto align-self-center">
        <div class="connection-field-title">Explore network of {{ userNetworkProfileRef.username }}
          {{ totalConnectionsCounterRef !== null ? "(" + totalConnectionsCounterRef + ")" : '' }}
        </div>
      </div>
    </div>


    <div v-if="userNetworkProfileRef" class="col-3 search-input align-items-center">
      <base-search-input v-model="searchQueryUsername" placeholder="Search network"/>
    </div>

    <div v-if="userNetworkProfileRef" class="connection-requests-container">
      <connection-user-card-list :user-id="userNetworkProfileRef.id"
                                 :page-size="15"
                                 :search-username="searchQueryUsername"
                                 @error="handleError"
                                 @success="handleConnectionSuccess"/>
    </div>

  </div>
</template>

<style scoped>
.search-input {
  margin-right: 6px;
}

.connection-field-title {
  font-size: 1.5rem;
}

.network-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9f9;
  margin: 0;
  height: 100vh;
  overflow-y: hidden;
}


.no-gutter-x {
  --bs-gutter-x: 0px;
}


.connection-requests-title-row {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2px 10px;
  margin-top: 0.2rem;
}

.connection-requests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
  padding: 1rem;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 50vh;
  overflow-y: auto;
}

.avatar-component {
  cursor: pointer !important;
}


</style>