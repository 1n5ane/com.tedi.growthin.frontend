<script setup>
import {ref, computed, onMounted} from 'vue';
import DateUtils from "../../utils/DateUtils";
import AdminUserService from "@/services/admin/users/AdminUserService";

const selectedListRef = ref([]);
const selectAllRef = ref(false);
const usersRef = ref([])
const sortColumnRef = ref('');
const sortDirectionRef = ref('asc');
const banButtonDisableRef = ref(false);
const unbanButtonDisableRef = ref(false);
const exportDataButtonDisableRef = ref(false);
const searchQueryRef = ref('');
const exportFormatRef = ref('json')
const emit = defineEmits(['error', 'success'])

const sortedUsers = computed(() => {
  const users = [...usersRef.value];
  if (sortColumnRef.value) {
    users.sort((a, b) => {
      const aValue = a[sortColumnRef.value] === undefined ? '' : a[sortColumnRef.value]
      const bValue = b[sortColumnRef.value] === undefined ? '' : b[sortColumnRef.value]
      if (sortDirectionRef.value === 'asc') {
        return aValue > bValue ? 1 : (aValue < bValue ? -1 : 0);
      } else {
        return aValue < bValue ? 1 : (aValue > bValue ? -1 : 0);
      }
    });
  }
  return users;
});


const filteredUsers = computed(() => {
  const query = searchQueryRef.value.toLowerCase();
  if (!query) {
    return sortedUsers.value; // No search query, return all users
  }
  return sortedUsers.value.filter(user => {
    return (
        user.username.toLowerCase().startsWith(query)
    );
  });
});

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleRowClick = (user) => {
  const index = selectedListRef.value.findIndex(u => u.id === user.id);
  if (index === -1) {
    selectedListRef.value.push(user);
  } else {
    selectedListRef.value.splice(index, 1);
  }
}

const handleSelectAllChange = () => {
  if (selectAllRef.value) {
    selectedListRef.value = [...filteredUsers.value];
  } else {
    selectedListRef.value = [];
  }
}

const fetchAllUsers = async () => {
  const adminUserService = AdminUserService.getInstance()
  let hasNextPage = true
  let currentPage = 0
  try {
    while (hasNextPage) {
      const resp = await adminUserService.listAllUsers(currentPage, 25)
      if (resp && resp.success) {
        usersRef.value = usersRef.value.concat(resp.users)
        hasNextPage = resp.hasNextPage
        currentPage++
      } else {
        throw new Error('Failed to list all users. Refresh required')
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

const isAllSelected = computed(() => {
  return selectedListRef.value.length === users.length;
});

const isSelected = (user) => {
  return selectedListRef.value.some(u => u.id === user.id);
}

const allSelectedUnbanned = computed(() => {
  return selectedListRef.value.every(u => u.locked === false)
})

const allSelectedBanned = computed(() => {
  return selectedListRef.value.every(u => u.locked === true)
})

const handleBanSelected = async () => {
  banButtonDisableRef.value = true
  const adminUserService = AdminUserService.getInstance()
  try {
    let userIds = []
    selectedListRef.value.forEach(u => {
      userIds.push(u.id)
    })
    const resp = await adminUserService.banUsers(userIds)
    if (resp && resp.success) {
      emit('success', 'Successfully banned users')
      // Update the locked status of the users in the local state
      userIds.forEach(userId => {
        const user = usersRef.value.find(u => u.id === userId);
        if (user) {
          user.locked = true;
        }
      });
      banButtonDisableRef.value = false
      return
    }
    let errorMessage = resp ? resp.error : 'Failed to ban selected users'
    handleError(errorMessage)
  } catch (error) {
    handleError(error.message)
  }
  banButtonDisableRef.value = false
}


const handleUnbanSelected = async () => {
  unbanButtonDisableRef.value = true
  const adminUserService = AdminUserService.getInstance()
  try {
    let userIds = []
    selectedListRef.value.forEach(u => {
      userIds.push(u.id)
    })
    const resp = await adminUserService.unbanUsers(userIds)
    if (resp && resp.success) {
      emit('success', 'Successfully unbanned users')
      // Update the locked status of the users in the local state
      userIds.forEach(userId => {
        const user = usersRef.value.find(u => u.id === userId);
        if (user) {
          user.locked = false;
        }
      });
      unbanButtonDisableRef.value = false
      return
    }
    let errorMessage = resp ? resp.error : 'Failed to unban selected users'
    handleError(errorMessage)
  } catch (error) {
    handleError(error.message)
  }
  unbanButtonDisableRef.value = false
}

const downloadExportedData = (data, filename, fileType) => {
  const blob = new Blob([data], {type: `application/${fileType}`});
  const url = URL.createObjectURL(blob);

  // Create a temporary link element to trigger downlaod
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${fileType}`;  // Filename
  document.body.appendChild(a);
  a.click();
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const handleExportData = async () => {
  exportDataButtonDisableRef.value = true
  const adminUserService = AdminUserService.getInstance()
  try {
    let userIds = []
    selectedListRef.value.forEach(u => {
      userIds.push(u.id)
    })
    const resp = await adminUserService.exportUserData(userIds, exportFormatRef.value)
    if (resp && resp.success) {
      //save resp.data to file and download in browser
      if (exportFormatRef.value === 'json') {
        downloadExportedData(JSON.stringify(resp.data, null, 2), 'user-data', exportFormatRef.value)
      } else {
        downloadExportedData(resp.data, 'user-data', exportFormatRef.value)
      }
      exportDataButtonDisableRef.value = false
      return
    }
    let errorMessage = resp ? resp.error : 'Failed to export data'
    handleError(errorMessage)
  } catch (error) {
    handleError(error.message)
  }
  exportDataButtonDisableRef.value = false
}

onMounted(async () => {
  await fetchAllUsers()
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
  </div>
  <div class="table-wrapper">
    <table class="table table-responsive">
      <thead>
      <tr class="no-hover">
        <th @click="toggleSort('id')">
          <span class="header-text">ID</span>
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
        <th>Country</th>
        <th @click="toggleSort('authorities')">
          <span class="header-text">Authorities</span>
          <span v-if="sortColumnRef === 'authorities'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('locked')">
          <span class="header-text">Banned</span>
          <span v-if="sortColumnRef === 'locked'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('createdAt')">
          <span class="header-text">createdAt</span>
          <span v-if="sortColumnRef === 'createdAt'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
        <th @click="toggleSort('updatedAt')">
          <span class="header-text">updatedAt</span>
          <span v-if="sortColumnRef === 'updatedAt'" class="sort-arrow">
            <i :class="sortDirectionRef === 'asc' ? 'arrow-up' : 'arrow-down'"></i>
          </span>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="user in filteredUsers"
          :key="user.id"
          :class="{ selected: isSelected(user) }"
          @click="handleRowClick(user)"
      >
        <td>{{ user.id }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.name }}</td>
        <td>{{ user.surname }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.phone }}</td>
        <td>{{ user.country }}</td>
        <td>{{ user.authorities.join(', ') }}</td>
        <td>{{ user.locked ? 'Yes' : 'No' }}</td>
        <td>{{ user.createdAt ? DateUtils.formatDate(user.createdAt) : null }}</td>
        <td>{{ user.updatedAt ? DateUtils.formatDate(user.updatedAt) : null }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <div v-if="selectedListRef.length > 0" class="action-buttons row justify-content-evenly">
    <div class="col-auto align-self-center">
      <label class="export-option-radio">
        <input type="radio" v-model="exportFormatRef" value="json"/>
        Export as JSON
      </label>
      <label class="export-option-radio">
        <input type="radio" v-model="exportFormatRef" value="xml"/>
        Export as XML
      </label>
    </div>
    <button @click="handleExportData" :disabled="exportDataButtonDisableRef" class="export-button col-3">
      Export Data {{ '(' + selectedListRef.length + ')' }}
    </button>
    <button v-if="allSelectedUnbanned" type="button" :disabled="banButtonDisableRef" @click="handleBanSelected"
            class="ban-button col-3">
      Ban{{ '(' + selectedListRef.length + ')' }}
    </button>
    <button v-else-if="allSelectedBanned" :disabled="unbanButtonDisableRef" @click="handleUnbanSelected"
            class="unban-button col-3">
      Unban{{ '(' + selectedListRef.length + ')' }}
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

.export-button {
  background-color: #007BFF;
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

.export-button:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.ban-button {
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

.ban-button:hover {
  background-color: rgba(255, 0, 0, 1);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.unban-button {
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

.unban-button:hover {
  background-color: rgba(0, 255, 0, 1);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
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


.search-bar .form-control {
  width: 100%;
  padding: 5px;
  font-size: 16px;
  box-shadow: none;
}

.export-option-radio {
  margin-right: 20px;
  display: inline-block;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.export-option-radio input[type="radio"] {
  margin-right: 2px;
  cursor: pointer;
}

</style>