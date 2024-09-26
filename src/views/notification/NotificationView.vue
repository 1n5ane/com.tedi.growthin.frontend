<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import NotificationService from "@/services/user/user-notifications/NotificationService";
import ActionNotificationList from "@/components/notifications/ActionNotificationList.vue";

const emit = defineEmits(['update-show-header', 'success', 'error', 'notifications-read'])
const toggleActionNotificationsRef = ref(true)
const unreadActionNotificationsCounterRef = ref(null)

const toggleActionNotifications = () => {
  toggleActionNotificationsRef.value = true
}

const fetchTotalUnreadActionNotifications = async () => {
  const notificationService = NotificationService.getInstance()
  try {
    const resp = await notificationService.countAllUnreadIncomingNotifications(false)
    if (resp && resp.success) {
      unreadActionNotificationsCounterRef.value = resp.count
      return
    }
    let errorMsg = resp ? resp.error : 'Failed to count unread notifications'
    emit('error', errorMsg)
  } catch (error) {
    emit('error', error.message)
  }
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleNotificationRead = (count) => {
  unreadActionNotificationsCounterRef.value -= count
  emit('notifications-read', count)
}

onMounted(async () => {
  await emit('update-show-header', true)
  await fetchTotalUnreadActionNotifications()
})

onUnmounted(() => {
  emit('update-show-header', false)
})

</script>

<template>
  <div class="notification-container">
    <div class="row no-gutter-x notifications-row justify-content-center align-items-center">
      <div class="col" @click="toggleActionNotifications">
        <div :class="['notification-tab-title', 'toggle-button', { selected: toggleActionNotificationsRef }]">
          Notifications
          {{ unreadActionNotificationsCounterRef ? "( " + unreadActionNotificationsCounterRef + " New )" : '' }}
        </div>
      </div>
    </div>

    <div v-show="toggleActionNotificationsRef" class="notification-list-container">
      <action-notification-list :page-size="15"
                                @notifications-read="handleNotificationRead"
                                @error="handleError"/>
    </div>

  </div>
</template>

<style scoped>
.notification-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9f9;
  margin: 0;
  height: 94vh;
  overflow-y: hidden;
}

.notification-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  justify-content: flex-start;
  padding: 1rem;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 86vh;
  overflow-y: auto;
}

.no-gutter-x {
  --bs-gutter-x: 0px;
}

.notifications-row {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2px 10px;
  margin-top: 0.2rem;
}

.notification-tab-title {
  font-size: 1.5rem;
  user-select: none;
}

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
}

.toggle-button.selected:hover {
  background-color: rgba(255, 69, 0, 1);
}

</style>