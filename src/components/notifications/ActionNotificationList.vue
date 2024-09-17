<script setup>
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {onMounted, ref} from "vue";
import NotificationService from "@/services/user/user-notifications/NotificationService";
import ActionNotification from "@/components/notifications/ActionNotification.vue";

const props = defineProps({
  pageSize: {
    type: Number,
    default: 12
  }
})

const emit = defineEmits(['error', 'success', 'notifications-read'])
const router = useRouter()
const store = useStore()
const notificationService = NotificationService.getInstance()

const notificationsRef = ref(null);
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize


const fetchNotifications = async (page) => {
  let notifications = []
  try {
    const response = await notificationService.listAllIncomingNotifications(page, itemsPerPage)
    if (response && response.success) {
      notifications = response.notifications
      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
      return notifications
    }
    let errorMessage = response && response.error ? response.error : "Failed to load notifications"
    emit("error", errorMessage);
  } catch (error) {
    emit("error", error.message)
  }
  return notifications;
}

const handlePageChange = async (page) => {
  currentPage.value = page;
  let notifications = await fetchNotifications(page)
  let unreadNotificationIds = extractUnreadNotificationIds(notifications)
  setTimeout(async () => {
    const success = await setIsReadToNotifications(unreadNotificationIds);
    if (success) {
      emit('notifications-read', unreadNotificationIds.length);
      for (let notification of notificationsRef.value) {
        if (unreadNotificationIds.includes(notification.id)) {
          notification.viewed = true;
        }
      }
    }
  }, 500); // Delay 0.5 second
  notificationsRef.value = notificationsRef.value.concat(notifications);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

const extractUnreadNotificationIds = (notifications) => {
  let unreadIds = []
  for (let notification of notifications) {
    if (!notification.viewed) {
      unreadIds.push(notification.id)
    }
  }

  return unreadIds
}

const setIsReadToNotifications = async (idList) => {
  if (idList) {
    const notificationService = NotificationService.getInstance()
    try {
      const resp = await notificationService.readAllUnreadByIdList(idList)
      return resp && resp.success
    } catch (error) {
      console.error(error.message)
    }
  }
}

onMounted(async () => {
  try {
    await store.dispatch('reactionStore/fetchAvailableReactions')
  } catch (error) {
    emit('error', error.message)
  }
  let notifications = await fetchNotifications(0)
  let unreadNotificationIds = extractUnreadNotificationIds(notifications)
  setTimeout(async () => {
    const success = await setIsReadToNotifications(unreadNotificationIds);
    if (success) {
      emit('notifications-read', unreadNotificationIds.length);
      for (let notification of notificationsRef.value) {
        if (unreadNotificationIds.includes(notification.id)) {
          notification.viewed = true;
        }
      }
    }
  }, 500); // Delay 0.5 second
  notificationsRef.value = notifications
})

</script>

<template>
  <div v-for="notification in notificationsRef" :key="notification.id">
    <action-notification :notification="notification"/>
  </div>
  <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
    Show more ▼
  </div>
  <div v-if="notificationsRef!==null && !notificationsRef.length" class="col align-self-center">
    There are no more notifications
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
</style>