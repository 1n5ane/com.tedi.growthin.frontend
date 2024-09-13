`
<script setup xmlns="http://www.w3.org/1999/html">
import {onMounted, onUpdated, ref, watch} from "vue";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import ConnectionCard from "@/components/connections/ConnectionCard.vue";
import {useRouter} from "vue-router";

const props = defineProps({
  pageSize: {
    type: Number,
    default: 12
  },
  enableDelete: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Number,
  },
  searchUsername: {
    type: String,
    default: ""
  }
})


const emit = defineEmits(['error', 'success'])
const router = useRouter()

const userConnectionService = UserConnectionService.getInstance()
const userProfileService = UserProfileService.getInstance()
const connectionsRef = ref(null);
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize

const deleteConnection = async (userId) => {
  let success = false
  try {
    const response = await userConnectionService.deleteUserConnection(userId)
    success = response?.success
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to unconnect");
  }
  return success
}

const searchConnectionsLike = async (page, username, userId) => {
  let connections = []
  try {
    const response = await userConnectionService.searchAllUserConnectionsByUserId(userId, username, page, itemsPerPage);
    if (response && response.success) {
      connections = response.connectedWith;
      //ad jobfield to user as it'not provided by the back... (Fuck)
      let userIds = []
      connections.forEach(c => {
        userIds.push(c.user.id);
      })
      const res = await userProfileService.getUserProfilesByIds(userIds)
      if (res && res.success) {
        const profiles = res.profiles
        connections.forEach(c => {
          const matchingProfile = profiles.find(profile => profile.id === c.user.id);
          if (matchingProfile)
            c.user.jobField = matchingProfile.jobField
        })
      }

      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    } else {
      console.error(error.message)
      emit("error", "Failed to search user connections");
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to search user connections");
  }
  return connections;
};


const handlePageChange = async (page) => {
  currentPage.value = page;
  const connections = await searchConnectionsLike(page, props.searchUsername, props.userId)
  connectionsRef.value = connectionsRef.value.concat(connections);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

const handleAvatarClick = async (userId) => {
  await router.push({path: `/profile/${userId}`})
}

const handleDeleteConnection = async (userId) => {
  const connectionIndex = connectionsRef.value.findIndex(
      (connection) => connection.user.id === userId
  );

  const connectionToDelete = connectionsRef.value[connectionIndex];

  //first remove from list
  connectionsRef.value.splice(connectionIndex, 1);
  try {
    // Try to delete conenction
    const success = await deleteConnection(userId);
    if (!success) {
      connectionsRef.value.splice(connectionIndex, 0, connectionToDelete);
      emit("error", "Failed to unconnect");
    } else {
      emit("success", "Successfully unconnected");
    }
  } catch (error) {
    // If there's an error, add the request back at the same index
    connectionsRef.value.splice(connectionIndex, 0, connectionToDelete);
    emit("error", "Failed to unconnect");
  }
}

watch(() => props.searchUsername, async (username) => {
  currentPage.value = 0; // Reset to first page on query change
  connectionsRef.value = await searchConnectionsLike(currentPage.value, username, props.userId);
})

onMounted(async () => {
  connectionsRef.value = await searchConnectionsLike(0, props.searchUsername, props.userId);
})

</script>

<template>
  <div v-for="connection in connectionsRef" :key="connection.user.id" class="connection-card">
    <connection-card :user-connection-id="connection.userConnectionId"
                     :user="connection.user"
                     :createdAt="connection.createdAt"
                     :enable-delete="props.enableDelete"
                     @avatar-click="handleAvatarClick"
                     @delete-connection="handleDeleteConnection"/>
  </div>
  <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
    Show more ▼
  </div>
  <div v-if="connectionsRef!==null && !connectionsRef.length" class="col align-self-center">
    There are no connections
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
  color: rgba(200, 54, 0, 1)
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