<template>
  <div class="app-container">
    <action-status-list ref="actionStatusComponentListRef"
                        :action-status-disappear="true"
                        action-status-disappear-after-seconds="5"
                        action-status-error-overlay-color="#FF003B"
                        action-status-error-text-color="white"
                        action-status-success-overlay-color="#00C753"
                        action-status-success-text-color="white"/>
    <the-header @error="pushError" v-if="showHeaderRef"></the-header>
    <router-view @update-show-header="updateShowHeader" @error="pushError" @success="pushSuccess"/>
  </div>
</template>

<script setup lang="js">
import ActionStatusList from "@/components/action-status/ActionStatusComponentList.vue";
import {ref, watch} from 'vue'
import {useRoute, useRouter} from "vue-router";
import TheHeader from "@/components/core/TheHeader.vue";

const actionStatusComponentListRef = ref(null);

const route = useRoute();
const router = useRouter();
const showHeaderRef = ref(false);
const updateShowHeader = (value) => {
  showHeaderRef.value = value;
};
// Watch for changes in the route
//display errors passed from redirect
//ex. Session expired!
watch(
    () => route.query.actionStatuses,
    (newStatuses) => {
      if (newStatuses) {
        const statusList = JSON.parse(newStatuses);
        statusList.forEach(({type, message}) => {
          if(type==='error'){
            pushError(message)
          }else if(type==='success'){
            pushSuccess(message)
          }else {
            console.warn(`Action status type '${type}' not implemented`)
          }
        });
        // Remove the query parameters from the URL
        router.replace({ query: { ...route.query, actionStatuses: undefined } });
      }
    },
    { immediate: true } // Run immediately on component mount
);
const pushError = (errorMsg) => {
  if (actionStatusComponentListRef.value) {
    /** @type {import('@/components/action-status/ActionStatusComponentList.vue').default} */
    const actionStatusComponentList = actionStatusComponentListRef.value;
    actionStatusComponentList.addActionStatus(errorMsg, 'error');
  }
};

const pushSuccess = (successMsg) => {
  if (actionStatusComponentListRef.value) {
    /** @type {import('@/components/action-status/ActionStatusComponentList.vue').default} */
    const actionStatusComponentList = actionStatusComponentListRef.value;
    actionStatusComponentList.addActionStatus(successMsg, 'success');
  }
};

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>