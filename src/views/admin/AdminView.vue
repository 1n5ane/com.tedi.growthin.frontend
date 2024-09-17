<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import AdminUserTable from "@/components/admin/AdminUserTable.vue";

const emit = defineEmits(['update-show-header', 'success', 'error']);
const toggleAdminUserListRef = ref(true)
const toggleAdminRequestListRef = ref(false)

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const toggleAdminUserList = () => {
  toggleAdminUserListRef.value = true
  toggleAdminRequestListRef.value = false
}

const toggleAdminRequestList = () => {
  toggleAdminUserListRef.value = false
  toggleAdminRequestListRef.value = true
}

onMounted(() => {
  //toggle navbar
  emit('update-show-header', true);
  // emit('error', 'Great power brings great responsibility. Please proceed with care.')
})

onUnmounted(() => {
  emit('update-show-header', false);
})

</script>

<template>
  <div class="admin-container">
    <div class="row no-gutter-x admin-row justify-content-start align-items-center">
      <div class="col" @click="toggleAdminUserList">
        <div :class="['admin-selection', 'toggle-button', { selected: toggleAdminUserListRef }]">
          Manage Users
        </div>
      </div>
      <div class="col" @click="toggleAdminRequestList">
        <div :class="['admin-selection', 'toggle-button', { selected: toggleAdminRequestListRef }]">
          Admin Requests
        </div>
      </div>
    </div>

    <div v-if="toggleAdminUserListRef">
      <admin-user-table @error="handleError" @success="handleSuccess"/>
    </div>



  </div>
</template>

<style scoped>

.admin-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9f9;
  margin: 0;
  height: 94vh;
  overflow-y: hidden;
}

.admin-row {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2px 10px;
  margin-top: 0.2rem;
}

.admin-selection {
  font-size: 1.5rem;
  user-select: none;
}

.no-gutter-x {
  --bs-gutter-x: 0px;
}

.selected {
  background-color: red;
  color: white;
}

.toggle-button:hover {
  background-color: rgba(255, 0, 0, 0.2);
  cursor: pointer;
}

.toggle-button.selected:hover {
  background-color: rgba(255, 0, 0, 1);
}

</style>