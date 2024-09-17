<script setup>
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import {useRouter} from "vue-router";
import ProfileSearchComponent from "@/components/search/ProfileSearchComponent.vue";
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import NotificationService from "@/services/user/user-notifications/NotificationService";

const router = useRouter();
const store = useStore()
const emit = defineEmits(['error'])

const currentUser = computed(() => store.getters['authenticationStore/getCurrentLoggedInUser']);
const unviewedNotifications = ref(null)
const isAdmin = computed(() =>{return store.getters['authenticationStore/isAdmin']})

const handleLogout = async () => {
  await router.push({name: "logout"});
}

const emitError = (errorMessage) => {
  emit('error', errorMessage)
}

const fetchUnviewedNotifications = async () => {
  const notificationService = NotificationService.getInstance()
  try {
    const resp = await notificationService.countAllUnreadIncomingNotifications(false)
    if (resp && resp.success) {
      unviewedNotifications.value = resp.count
    }
  } catch (error) {
    console.error(error.message)
  }
}

onMounted(async () => {
  await fetchUnviewedNotifications()
})

</script>

<template>
  <div class="navbar-container">
    <nav class="navbar row justify-content-between">
      <div class="col-2">
        <div class="navbar-logo">
          <router-link to="/home">
            <img class="application-logo"
                 src="@/assets/images/growthinLogo.png"
                 alt="logo"></router-link>
        </div>
      </div>

      <div class="col-3">
        <profile-search-component @search-error="emitError"
                                  placeholder="Search a user profile"
                                  :page-size="15"/>
      </div>

      <div class="col-5">
        <div class="navbar-menu">
          <router-link to="/home" class="navbar-item">Home</router-link>
          <router-link to="/network" class="navbar-item">Network</router-link>
<!--          <router-link to="/messages" class="navbar-item">Messages</router-link>-->
          <div class="navbar-item notification-container">
            <router-link to="/notification">
              Notifications
              <span v-if="unviewedNotifications > 0" class="notification-badge">{{ unviewedNotifications }}</span>
            </router-link>
          </div>
          <router-link :to="`/profile/${currentUser?.id}`" class="navbar-item">Profile</router-link>
          <router-link v-if="isAdmin" to="/admin/dashboard" class="navbar-item admin-link">Admin</router-link>
        </div>
      </div>

      <div class="col-auto flex-column d-flex">
        <base-button color="rgba(220, 20, 60, 1)"
                     type="button"
                     bullet-color="black"
                     hover-color="black"
                     hover-text-color="white"
                     text="↪"
                     @button-click="handleLogout"/>
      </div>
    </nav>
  </div>
</template>

<style scoped>

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.application-logo {
  width: 6rem;
  height: auto;
  transition: transform 0.4s ease; /* Smooth transition for scaling */
  margin-top: 0.15rem;
  animation: fadeIn 2s ease-in-out, gradientShift 10s ease infinite;
}

.navbar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9f9;
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 20
}

.admin-link {
  color: red !important;
  border: 2px solid black;
  margin-left:5px;
}

.admin-link:hover {
  background-color: red !important;
  color:white !important;
}

.navbar-item.router-link-active {
  font-weight: bold;
  color: white;
  background-color: rgba(255, 69, 0, 0.9);
}

.admin-link.navbar-item.router-link-active {
  font-weight: bold;
  color: white !important;
  background-color: red;
}

.navbar {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  width: 100%;
}

.navbar-logo {
  flex: 1;
}

.navbar-menu {
  display: flex;
}

.navbar-item {
  color: #000000;
  text-decoration: none;
  padding: 0.8rem 15px;
  border-radius: 1px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.navbar-item:hover {
  background-color: rgba(255, 69, 0, 1);
  color: white
}

.navbar-item.router-link-active {
  font-weight: bold;
  color: white;
  background-color: rgba(255, 69, 0, 0.9);
}

.navbar-item a:hover {
  color: white;
}

.navbar-item a {
  text-decoration: none;
  color: inherit;
}


.notification-container {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: red;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-container:hover .notification-badge {
  background-color: #F1F1F1;
  color: red;
}
</style>