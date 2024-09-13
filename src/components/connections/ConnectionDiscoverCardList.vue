<script setup>

import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {onMounted, ref, watch} from "vue";
import ConnectionDiscoverCard from "@/components/connections/ConnectionDiscoverCard.vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

const props = defineProps({
  pageSize: {
    type: Number,
    default: 12
  },
  searchProfile: {
    type: String,
    default: ""
  }
})
const emit = defineEmits(['error', 'success'])
const router = useRouter()
const store = useStore()

const userConnectionService = UserConnectionService.getInstance()
const userProfileService = UserProfileService.getInstance()
const profilesRef = ref(null);
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize

const searchNonConnectedProfileLike = async (page, username) => {
  let profiles = []
  try {
    const response = await userProfileService.searchUserProfilesByUsername(username, page, itemsPerPage);
    if (response && response.success) {
      profiles = response.profiles;

      //check with what profile user is connected
      let userIds = []
      profiles.forEach(profile => {
        userIds.push(profile.id);
      })
      const res = await userConnectionService.checkUserConnectionsExist(userIds)
      profiles.forEach((profile) => {
        profile.isConnected =  (profile.id in res) && res[profile.id] === true;
      })

      profiles = profiles.filter((profile) => {
        return profile.id !== store.getters["authenticationStore/getCurrentLoggedInUser"]?.id
      })

      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        if (!profile.isConnected) {
          const res = await userConnectionService.checkPendingConnectionRequestExists(profile.id);
          if (res && res.success) {
            profile.pendingRequestExists = res.exists;
          }
        }
      }

      //      NEEDS IMPLEMENTATION FROM THE BACK...
      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    } else {
      emit("error", response.error);
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to search user profiles");
  }
  return profiles;
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  let profiles = await searchNonConnectedProfileLike(page, props.searchProfile)
  if (!profiles.length && hasMoreRef.value)
    await handlePageChange(page + 1)

  profilesRef.value = profilesRef.value.concat(profiles);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

const handleAvatarClick = async (userId) => {
  await router.push({path: `/profile/${userId}`})
}

const handleCreateConnection = async (userId) => {
  const profileIndex = profilesRef.value.findIndex(
      (profile) => profile.id === userId
  );

  const profileToConnect = profilesRef.value[profileIndex];

  //first remove from list
  profilesRef.value.splice(profileIndex, 1);
  try {
    // Try to
    const response = await userConnectionService.createUserConnectionRequest(userId)
    if (!response || !response.success) {
      profilesRef.value.splice(profileIndex, 0, profileToConnect);
      emit("error", response.error);
    } else {
      emit("success", "Successfully created connection request");
    }
  } catch (error) {
    // If there's an error, add the request back at the same index
    profilesRef.value.splice(profileIndex, 0, profileToConnect);
    emit("error", "Failed to create connection request");
  }
}

watch(() => props.searchProfile, async (username) => {
  currentPage.value = 0; // Reset to first page on query change
  profilesRef.value = await searchNonConnectedProfileLike(currentPage.value, username);
  if (!profilesRef.value.length && hasMoreRef.value)
    await handleShowMore()
})

onMounted(async () => {
  profilesRef.value = await searchNonConnectedProfileLike(0, props.searchProfile);
  if (!profilesRef.value.length && hasMoreRef.value)
    await handleShowMore()
})

</script>

<template>
  <div v-for="profile in profilesRef" :key="profile.id" class="connection-card">
    <connection-discover-card :profile="profile"
                              @avatar-click="handleAvatarClick"
                              @create-connection="handleCreateConnection"/>
  </div>
  <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
    Show more ▼
  </div>
  <div v-if="profilesRef!==null && !profilesRef.length" class="col align-self-center">
    There are no profiles
  </div>
</template>

<style scoped>
.show-more-text {
  display: block;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: rgba(255, 69, 0, 1);
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.show-more-text:hover {
  color: rgba(220, 49, 0, 1);
  text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.show-more-text:active {
  color: rgba(200, 54, 0, 1);
}


.connection-card {
  flex: 1 1 calc(20% - 1rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 2px;
  max-width: 180px;
}

.connection-card:hover {
  background-color: #f0f0f0;
}

</style>`