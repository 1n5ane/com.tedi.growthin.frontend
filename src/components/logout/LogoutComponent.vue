<script setup>

import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

const router = useRouter()
const store = useStore()
const emit = defineEmits(['update-show-header'])


onMounted(async () => {
  await emit('update-show-header', false)
  await store.dispatch('authenticationStore/logout')
  await router.push({
    name: 'login',
    query: {
      actionStatuses: JSON.stringify([{
        type: "success",
        message: "Successfully logged out!"
      }])
    }
  });
})

</script>

<template>
</template>

<style scoped>
</style>