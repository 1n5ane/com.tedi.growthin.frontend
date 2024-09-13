`
<script setup xmlns="http://www.w3.org/1999/html">
import {onMounted, ref} from "vue";
import ConnectionRequestCard from "@/components/connections/ConnectionRequestCard.vue";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {useRouter} from "vue-router";

const props = defineProps({
  pageSize: {
    type: Number,
    default: 12
  }
})


const emit = defineEmits(['error', 'success','accepted-request'])
const router = useRouter()

const userConnectionService = UserConnectionService.getInstance()
const userProfileService = UserProfileService.getInstance()
const connectionRequestsRef = ref(null);
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize

const updateConnectionRequest = async (status, requestId) => {
  let success = false
  try {
    const response = await userConnectionService.updateStatusUserConnectionRequest(requestId, status)
    if (response && response.success) {
      success = true
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to get update connection request");
  }
  return success
}

const fetchConnectionRequests = async (page) => {
  let connectionRequests = []
  try {
    const response = await userConnectionService.listAllIncomingUserConnectionRequestsByStatus("PENDING", page, itemsPerPage);
    if (response && response.success) {
      connectionRequests = response.requestedBy;
      //ad jobfield to user as it'not provided by the back... (Fuck)
      let userIds = []
      connectionRequests.forEach(request => {
        userIds.push(request.user.id);
      })
      const res = await userProfileService.getUserProfilesByIds(userIds)
      if (res && res.success) {
        const profiles = res.profiles
        connectionRequests.forEach(request => {
          const matchingProfile = profiles.find(profile => profile.id === request.user.id);
          if (matchingProfile)
            request.user.jobField = matchingProfile.jobField
        })
      }

      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to get pending connection requests");
  }
  return connectionRequests;
};


const handlePageChange = async (page) => {
  currentPage.value = page;
  const connectionRequests = await fetchConnectionRequests(page)
  connectionRequestsRef.value = connectionRequestsRef.value.concat(connectionRequests);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

const handleAvatarClick = async (userId) => {
  await router.push({path: `/profile/${userId}`})
}


const handleAcceptConnection = async (requestId) => {
  await handleUpdateConnectionRequest(requestId, "ACCEPTED")
  await emit('accepted-request')
}


const handleDeclineConnection = async (requestId) => {
  await handleUpdateConnectionRequest(requestId, "DECLINED")
}

const handleUpdateConnectionRequest = async (requestId, status) => {
  const requestIndex = connectionRequestsRef.value.findIndex(
      (request) => request.requestId === requestId
  );

  // Store the request temporarily in case of failure
  const requestToAccept = connectionRequestsRef.value[requestIndex];

  //first remove from list
  connectionRequestsRef.value.splice(requestIndex, 1);
  try {
    // Try to update the connection request status
    const success = await updateConnectionRequest(status, requestId);
    if (!success) {
      connectionRequestsRef.value.splice(requestIndex, 0, requestToAccept);
      emit("error", "Failed to update connection request");
    } else {
      emit("success", "Successfully udpated connection request");
    }
  } catch (error) {
    // If there's an error, add the request back at the same index
    connectionRequestsRef.value.splice(requestIndex, 0, requestToAccept);
    emit("error", "Failed to accept connection request");
  }
}

onMounted(async () => {
  connectionRequestsRef.value = await fetchConnectionRequests(0);
})

</script>

<template>
  <div v-for="request in connectionRequestsRef" :key="request.requestId" class="connection-request-card">
    <connection-request-card :requestId="request.requestId"
                             :user="request.user"
                             :createdAt="request.createdAt"
                             @avatar-click="handleAvatarClick"
                             @accept-connection="handleAcceptConnection"
                             @decline-connection="handleDeclineConnection"/>
  </div>
  <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
    Show more ▼
  </div>
  <div v-if="connectionRequestsRef!==null && !connectionRequestsRef.length" class="col align-self-center">
    There are no pending connection requests
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


.connection-request-card {
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

.connection-request-card:hover {
  background-color: #f0f0f0;
}

</style>`