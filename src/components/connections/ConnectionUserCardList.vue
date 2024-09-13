<script setup>
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {onMounted, ref, watch} from "vue";
import ConnectionUserCard from "@/components/connections/ConnectionUserCard.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const props = defineProps({
  pageSize: {
    type: Number,
    default: 12
  },
  userId: {
    type: Number
  },
  searchUsername: {
    type: String,
    default: ""
  }
})

const emit = defineEmits(['error', 'success'])
const store = useStore()
const router = useRouter()
const userConnectionService = UserConnectionService.getInstance()
const userProfileService = UserProfileService.getInstance()
const profilesRef = ref(null);
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize


const searchNetworkOfUser = async (page, username) => {
  let connections = []
  try {
    const response = await userConnectionService.searchAllUserConnectionsByUserId(props.userId, username, page, itemsPerPage);
    if (response && response.success) {
      connections = response.connectedWith;
      //also fetch profiles
      //backend returns user info and not user profile info...
      //i need jobField from user profile
      let userIds = []
      connections.forEach(connection => {
        userIds.push(connection.user.id);
      })
      if(userIds.length) {
        let profileRes = await userProfileService.getUserProfilesByIds(userIds)
        if (!profileRes || !profileRes.success) {
          throw new Error("Failed to search user's network")
        }

        let profiles = profileRes.profiles

        //check with what profile user is connected
        //and filter connected
        const res = await userConnectionService.checkUserConnectionsExist(userIds)
        let connectedProfiles = profiles.filter((profile) => {
          return res[profile.id] === true;
        })
        let connectedProfileIds = []
        connectedProfiles.forEach(p => {
          connectedProfileIds.push(p.id);
        })

        //add jobField to users connection list
        connections.forEach(connection => {
          connection['isAlreadyConnected'] = connectedProfileIds.includes(connection.user.id)
          connection['jobField'] = profiles.find(profile => profile.id === connection.user.id)?.jobField
        })
        connections = connections.filter((connection) => {
          return connection.user.id !== store.getters["authenticationStore/getCurrentLoggedInUser"]?.id
        })
      }

      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    } else {
      emit("error", response.error);
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to search user's network");
  }
  return connections;
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  let profiles = await searchNetworkOfUser(page, props.searchUsername)
  profilesRef.value = profilesRef.value.concat(profiles);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
}

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


watch(() => props.searchUsername, async (username) => {
  currentPage.value = 0; // Reset to first page on query change
  profilesRef.value = await searchNetworkOfUser(currentPage.value, username);
})


onMounted(async () => {
  profilesRef.value = await searchNetworkOfUser(0, props.searchUsername);
})

</script>

<template>
  <div v-for="profile in profilesRef" :key="profile.id" class="connection-card">
    <connection-user-card :profile="profile"
                          :enable-connect-button="!profile.isAlreadyConnected"
                          @avatar-click="handleAvatarClick"
                          @create-connection="handleCreateConnection"/>
  </div>
  <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
    Show more ▼
  </div>
  <div v-if="profilesRef!==null && !profilesRef.length" class="col align-self-center">
    There are no results
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
</style>