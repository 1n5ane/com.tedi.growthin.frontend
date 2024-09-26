<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import ConnectionRequestCardList from "@/components/connections/ConnectionRequestCardList.vue";
import ConnectionCardList from "@/components/connections/ConnectionCardList.vue";
import {useStore} from "vuex";
import BaseSearchInput from "@/components/core/inputs/BaseSearchInput.vue";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import ConnectionDiscoverCardList from "@/components/connections/ConnectionDiscoverCardList.vue";
import {useRoute, useRouter} from "vue-router";


const emit = defineEmits(['update-show-header', 'error', 'success'])
const store = useStore()
const route = useRoute()
const router = useRouter()
const pendingRequestsCounterRef = ref(null)
const totalConnectionsCounterRef = ref(null)
const searchQueryUsername = ref('')
const searchQueryProfile = ref('')
const toggleConnectionRequestListRef = ref(false)
const toggleConnectionListRef = ref(true)
const toggleDiscoverConnectionListRef = ref(false)
const connectionCardListKeyRef = ref(0) // Key to force re-mount
const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleConnectionRequestSuccess = (successMessage) => {
  pendingRequestsCounterRef.value--;
  emit('success', successMessage)
}

const handleConnectionUnconnectSuccess = (successMessage) => {
  totalConnectionsCounterRef.value--;
  emit('success', successMessage)
}

const handleNewConnectionRequestSuccess = (successMessage) => {
  emit('success', successMessage)
}

const toggleConnectionRequestList = () => {
  toggleConnectionRequestListRef.value = true;
  toggleConnectionListRef.value = false;
  toggleDiscoverConnectionListRef.value = false;
}

const toggleDiscoverConnectionList = () => {
  toggleDiscoverConnectionListRef.value = true;
  toggleConnectionRequestListRef.value = false;
  toggleConnectionListRef.value = false;
}

const toggleConnectionList = () => {
  toggleConnectionListRef.value = true
  toggleDiscoverConnectionListRef.value = false;
  toggleConnectionRequestListRef.value = false;
}

const handleAcceptedConnection = () => {
  totalConnectionsCounterRef.value++;
  //cause onMount of connection-card-list to rerun
  connectionCardListKeyRef.value++;
}

const activateTabFromRouteParam = (tab) => {
  if(tab === 'connection-requests'){
    toggleConnectionRequestList()
  }else if(tab === 'connections'){
    toggleConnectionList()
  }else if(tab === 'connections-discover'){
    toggleDiscoverConnectionList()
  }
}

onMounted(async () => {
  //toggle navbar
  emit('update-show-header', true);

  if(route.query?.tab){
    activateTabFromRouteParam(route.query.tab)
    router.replace({ query: { tab: undefined } });
  }

  //get total connection requests
  const userConnectionService = UserConnectionService.getInstance()
  try {
    let res = await userConnectionService.countAllIncomingUserConnectionRequestsByStatus("PENDING")
    if (res.success) {
      pendingRequestsCounterRef.value = res.count
    }

    if (!res.count) {
      toggleConnectionRequestListRef.value = false
    }

    res = await userConnectionService.countAllUserConnectionRequestsByStatus("ACCEPTED")
    if (res.success) {
      totalConnectionsCounterRef.value = res.count
    }
  } catch (error) {
    handleError(error.message)
    toggleConnectionRequestListRef.value = false
    toggleConnectionListRef.value = false
    toggleDiscoverConnectionList.vaue = false
  }
})

onUnmounted(() => {
  emit('update-show-header', false);
})

</script>

<template>
  <div class="network-container">

    <div class="row no-gutter-x connection-requests-title-row justify-content-start align-items-center">
      <div class="col-4" @click="toggleConnectionRequestList">
        <div :class="['connection-field-title', 'toggle-button', { selected: toggleConnectionRequestListRef }]">
          Connection Requests {{ pendingRequestsCounterRef !== null ? "(" + pendingRequestsCounterRef + ")" : '' }}
        </div>
      </div>

      <div class="col-4" @click="toggleConnectionList">
        <div :class="['connection-field-title', 'toggle-button', { selected: toggleConnectionListRef }]">My network
          {{ totalConnectionsCounterRef !== null ? "(" + totalConnectionsCounterRef + ")" : '' }}
        </div>
      </div>

      <div class="col-4" @click="toggleDiscoverConnectionList">
        <div :class="['connection-field-title', 'toggle-button', { selected: toggleDiscoverConnectionListRef }]">
          Discover
        </div>
      </div>
    </div>


    <!-- If current logged in userId matches with path userId -->
    <!-- -->
    <div v-show="toggleConnectionRequestListRef" class="connection-requests-container">
      <connection-request-card-list @accepted-request="handleAcceptedConnection" @error="handleError"
                                    @success="handleConnectionRequestSuccess" :page-size="15"/>
    </div>


    <div v-show="toggleConnectionListRef" class="col-2 search-input">
      <base-search-input v-model="searchQueryUsername" placeholder="Search my network"/>
    </div>

    <div v-show="toggleConnectionListRef" class="connection-requests-container">
      <connection-card-list :key="connectionCardListKeyRef"
                            :enable-delete="true"
                            :user-id="store.getters['authenticationStore/getCurrentLoggedInUser']?.id"
                            :page-size="15"
                            :search-username="searchQueryUsername"
                            @error="handleError"
                            @success="handleConnectionUnconnectSuccess"/>
    </div>


    <div v-show="toggleDiscoverConnectionListRef" class="col-2 search-input">
      <base-search-input v-model="searchQueryProfile" placeholder="Search profile"/>
    </div>

    <div v-show="toggleDiscoverConnectionListRef" class="connection-requests-container">
      <connection-discover-card-list
          :page-size="15"
          :search-profile="searchQueryProfile"
          @error="handleError"
          @success="handleNewConnectionRequestSuccess"/>
    </div>


  </div>
</template>

<style scoped>
.toggle-button {
  background-color: #f9f9f9;
  color: black;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  border-radius: 1px;
}

.selected {
  background-color: rgba(255, 69, 0, 1);
}

.toggle-button:hover {
  background-color: rgba(255, 69, 0, 0.2);
  cursor: pointer;
}

.toggle-button.selected:hover {
  background-color: rgba(255, 69, 0, 1);
}

.search-input {
  margin-right: 6px;
}

.connection-field-title {
  font-size: 1.5rem;
  user-select: none;
}

.network-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9f9;
  margin: 0;
  height: 94vh;
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
  max-height: 76vh;
  overflow-y: auto;
}

</style>