<script setup>

import SignupProfileForm from "@/components/signup/SignupProfileForm.vue";
import {useRouter} from "vue-router";
import {onMounted} from "vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {useStore} from "vuex";
import baseAvatarImage from "@/assets/images/avatars/avatar_1.jpg";

const router = useRouter()
const store = useStore()

const emit = defineEmits(['error', 'success']);

const handleError = (errorMsg) => {
  emit('error', errorMsg)
}

const handleSignupSuccess = () => {
  console.log('Handled signup profile success. Redirecting to home')
  router.push({name: 'home'})
}

onMounted(async () => {
  //check if user has creatted profile
  // if yes -> redirect to home
  const userProfileService = UserProfileService.getInstance()
  try {
    const resp = await userProfileService.getUserProfile({username: store.getters['authenticationStore/getUsername']})
    if(resp.profile !== null){
      //user has already registered a profile -> redirect to home
      console.log("User has already a profile")
      await router.push({name: 'home'})
    }
  } catch (error) {
    console.log(error)
    emit('error',error.message+' Redirecting to login')
    setTimeout(async ()=>{
      await router.push({name: 'login'})
    },5000)
  }

})

</script>

<template>
  <div class="form-wrapper">
    <signup-profile-form @signup-profile-error="handleError"
                         @signup-profile-success="handleSignupSuccess"
                         @error="handleError"
                         title-text="Let's set up you profile" title-text-color="white"
                         title-text-background-color="rgba(255, 69, 0, 0.8)"/>
  </div>
</template>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 100%;
  height: 100vh;
  background: #fefefe;
}
</style>