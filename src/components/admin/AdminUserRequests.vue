<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import AdminUserService from "@/services/admin/users/AdminUserService";
import DateUtils from "@/utils/DateUtils";

const emit = defineEmits(['error', 'success']);
const selectedListRef = ref([]);
const selectAllRef = ref(false);
const adminRequestsRef = ref([])
const sortColumnRef = ref('');
const sortDirectionRef = ref('asc');
const acceptButtonDisableRef = ref(false);
const declineButtonDisableRef = ref(false);
const pendingButtonDisableRef = ref(false);
const requestStatusRef = ref('PENDING')
const requestStatusRadioRef = ref('PENDING')
const searchQueryRef = ref('');

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const sortedAdminRequests = computed(() => {
  const requests = [...adminRequestsRef.value];
  if (sortColumnRef.value) {
    let sortEntity = 'user'
    let sortField = sortColumnRef.value
    if (sortColumnRef.value === 'curatedBy') {
      sortEntity = 'curatedBy'
      sortField = 'username'
    }
    requests.sort((a, b) => {
      const aValue = !a[sortEntity] || a[sortEntity][sortField] === undefined ? '' : a[sortEntity][sortField]
      const bValue = !b[sortEntity] || b[sortEntity][sortField] === undefined ? '' : b[sortEntity][sortField]
      if (sortDirectionRef.value === 'asc') {
        return aValue > bValue ? 1 : (aValue < bValue ? -1 : 0);
      } else {
        return aValue < bValue ? 1 : (aValue > bValue ? -1 : 0);
      }
    });
  }
  return requests;
});


const filteredAdminRequests = computed(() => {
  const query = searchQueryRef.value.toLowerCase();
  if (!query) {
    return sortedAdminRequests.value; // No search query, return all users
  }
  return sortedAdminRequests.value.filter(request => {
    return (
        request.user.username.toLowerCase().startsWith(query)
    );
  });
});

const handleRowClick = (request) => {
  const index = selectedListRef.value.findIndex(r => r.requestId === request.requestId);
  if (index === -1) {
    selectedListRef.value.push(request);
  } else {
    selectedListRef.value.splice(index, 1);
  }
}

const handleSelectAllChange = () => {
  if (selectAllRef.value) {
    selectedListRef.value = [...filteredAdminRequests.value];
  } else {
    selectedListRef.value = [];
  }
}

const fetchAllAdminRequests = async () => {
  const adminUserService = AdminUserService.getInstance()
  let hasNextPage = true
  let currentPage = 0
  try {
    adminRequestsRef.value = []
    while (hasNextPage) {
      const resp = await adminUserService.listAllAdminRequestsByStatus(requestStatusRadioRef.value, currentPage, 25)
      if (resp && resp.success) {
        adminRequestsRef.value = adminRequestsRef.value.concat(resp.requests)
        hasNextPage = resp.hasNextPage
        currentPage++
      } else {
        throw new Error(`Failed to list all admin requests of status ${requestStatusRadioRef.value}. Refresh required`)
      }
    }
  } catch (error) {
    emit('error', error.message)
  }
}

const toggleSort = (column) => {
  if (sortColumnRef.value === column) {
    sortDirectionRef.value = sortDirectionRef.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumnRef.value = column;
    sortDirectionRef.value = 'asc';
  }
};

const isSelected = (request) => {
  return selectedListRef.value.some(r => r.requestId === request.requestId);
}

watch(() => requestStatusRadioRef.value, async () => {
  selectAllRef.value = false
  handleSelectAllChange()
  await fetchAllAdminRequests()
})

const setDisableCorrespondingActionButton = (status,disable) => {
  if (status === 'PENDING') {
    pendingButtonDisableRef.value = disable
  } else if (status === 'ACCEPTED') {
    acceptButtonDisableRef.value = disable
  } else {
    //DECLINED
    declineButtonDisableRef.value = disable
  }
}

const handleUpdateSelected = async (status) => {
  const adminUserService = AdminUserService.getInstance()
  try {
    let requestIds = []
    selectedListRef.value.forEach(r => {
      requestIds.push(r.requestId)
    })

    setDisableCorrespondingActionButton(status, true)
    for(const requestId of requestIds) {
      const resp = await adminUserService.updateAdminRequestStatus(requestId, status)
      if(!resp || !resp.success) {
        let errorMessage = resp? resp.error:`Failed to update request status ${requestId} to ${status}`
        throw new Error(errorMessage)
      }
    }
    handleSuccess("Successfully updated statuses")
    //ALL UPDATES SUCCEEDED -> fetch list again
    selectAllRef.value = false
    handleSelectAllChange()
    await fetchAllAdminRequests()
  }catch(error){
    handleError(error.message)
  }finally {
    setDisableCorrespondingActionButton(status, false)
  }
}

onMounted(async () => {
  await fetchAllAdminRequests()
})

onUnmounted(() => {

})

</script>

<template>
  <div class="table-controls row justify-content-evenly">
    <div class="search-bar col-3">
      <input
          type="text"
          v-model="searchQueryRef"
          placeholder="Search By Username"
          class="form-control"
      />
    </div>
    <label class="select-all-checkbox col-2">
      <input type="checkbox" v-model="selectAllRef" @change="handleSelectAllChange"/>
      Select All
    </label>
    <label class="request-type-radio col-2">
      <input type="radio" v-model="requestStatusRadioRef" value="PENDING"/>
      Pending Requests
    </label>
    <label class="request-type-radio col-2">
      <input type="radio" v-model="requestStatusRadioRef" value="ACCEPTED"/>
      Accepted Requests
    </label>
    <label class="request-type-radio col-2">
      <input type="radio" v-model="requestStatusRadioRef" value="DECLINED"/>
      Declined Requests
    </label>
  </div>
  <div class="table-wrapper">
    <table class="table table-responsive">
      <thead>
      <tr class="no-hover">
        <th @click="toggleSort('id')">
          <span class="header-text">Request ID</span>
          <span v-if="sortColumnRef === 'id'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('username')">
          <span class="header-text">Username</span>
          <span v-if="sortColumnRef === 'username'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('name')">
          <span class="header-text">Name</span>
          <span v-if="sortColumnRef === 'name'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('surname')">
          <span class="header-text">Surname</span>
          <span v-if="sortColumnRef === 'surname'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('email')">
          <span class="header-text">Email</span>
          <span v-if="sortColumnRef === 'email'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th>Phone</th>
        <th @click="toggleSort('createdAt')">
          <span class="header-text">requestedAt</span>
          <span v-if="sortColumnRef === 'createdAt'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('curatedBy')">
          <span class="header-text">curatedBy</span>
          <span v-if="sortColumnRef === 'curatedBy'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('updatedAt')">
          <span class="header-text">curatedAt</span>
          <span v-if="sortColumnRef === 'updatedAt'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="request in filteredAdminRequests"
          :key="request.requestId"
          :id="request.requestId"
          :class="{ selected: isSelected(request) }"
          @click="handleRowClick(request)"
      >
        <td>{{ request.requestId }}</td>
        <td>{{ request.user.username }}</td>
        <td>{{ request.user.name }}</td>
        <td>{{ request.user.surname }}</td>
        <td>{{ request.user.email }}</td>
        <td>{{ request.user.phone }}</td>
        <td>{{ request.createdAt ? DateUtils.formatDate(request.createdAt) : null }}</td>
        <td>{{ request.curatedBy ? request.curatedBy.username : null }}</td>
        <td>{{ request.updatedAt ? DateUtils.formatDate(request.updatedAt) : null }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <div v-if="selectedListRef.length > 0" class="action-buttons row justify-content-evenly">
    <button v-if="requestStatusRadioRef!=='ACCEPTED'"
            type="button"
            @click="handleUpdateSelected('ACCEPTED')"
            :disabled="acceptButtonDisableRef"
            class="accept-button col-3">
      Accept {{ '(' + selectedListRef.length + ')' }}
    </button>
    <button v-if="requestStatusRadioRef!=='DECLINED'" type="button" :disabled="declineButtonDisableRef"
            @click="handleUpdateSelected('DECLINED')"
            class="decline-button col-3">
      Decline {{ '(' + selectedListRef.length + ')' }}
    </button>
    <button v-if="requestStatusRadioRef!=='PENDING'" type="button" :disabled="pendingButtonDisableRef"
            @click="handleUpdateSelected('PENDING')"
            class="pending-button col-3">
      Pending{{ '(' + selectedListRef.length + ')' }}
    </button>
  </div>
</template>

<style scoped>
.table-wrapper {
  max-height: 65vh;
  overflow-y: auto;
  margin-left: 6px
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  align-content: center;
}

thead tr:hover {
  background-color: rgba(70, 130, 180, 0.2);
  cursor: default;
}

thead tr th:hover {
  background-color: rgba(70, 130, 180, 0.2);
  cursor: pointer;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  --bs-table-bg: rgba(255, 69, 0, 0.2);
  cursor: pointer;
}

tr.selected {
  --bs-table-bg: rgba(255, 69, 0, 0.4);
}

.no-hover, .no-hover:hover {
  --bs-table-bg: #f2f2f2;
  color: #333;
  cursor: default;
  user-select: none;
}


.table-controls {
  margin-bottom: 2px;
}

.table-controls label {
  margin-right: 10px;
}

.table-controls {
  margin-top: 2px;
}

.action-buttons {
  margin-top: 14px;
}


.select-all-checkbox {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  user-select: none;
  gap: 10px;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  border: 1px solid #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-all-checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #007BFF;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.select-all-checkbox input[type="checkbox"]:checked {
  background-color: #007BFF;
  border-color: #007BFF;
}

.select-all-checkbox input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.select-all-checkbox input[type="checkbox"]:hover {
  border-color: #0056b3;
}

.select-all-checkbox span {
  margin-left: 5px;
  font-weight: normal;
  color: #007BFF;
  transition: color 0.3s ease;
}

.select-all-checkbox:hover span {
  color: #0056b3;
}

@media (max-width: 768px) {
  table, th, td {
    font-size: 12px;
  }
}

.search-bar .form-control {
  width: 100%;
  padding: 5px;
  font-size: 16px;
  box-shadow: none;
}

.arrow-up::before {
  content: '▲';
  font-size: 12px;
  margin-left: 5px;
}

.arrow-down::before {
  content: '▼';
  font-size: 12px;
  margin-left: 5px;
}

.request-type-radio {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.request-type-radio input[type="radio"] {
  margin-right: 4px;
  cursor: pointer;
}

.decline-button {
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.decline-button:hover {
  background-color: rgba(255, 0, 0, 1);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.accept-button {
  background-color: rgba(0, 255, 0, 0.8);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.accept-button:hover {
  background-color: rgba(0, 255, 0, 1);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.pending-button {
  background-color: rgba(0, 0, 255, 0.8);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.pending-button:hover {
  background-color: rgba(0, 0, 255, 1);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}


</style>