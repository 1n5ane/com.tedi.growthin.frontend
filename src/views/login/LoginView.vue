<script setup lang="js">
import SigninForm from "@/components/login/SigninForm.vue";
import SignupUserForm from "@/components/signup/SignupUserForm.vue";
import TheFooter from "@/components/core/TheFooter.vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";


// Define the emits options to specify the events this component can emit
const emit = defineEmits(['error', 'success']);
const router = useRouter();
const store = useStore();


const emitError = (errorMsg) => {
  emit('error', errorMsg)
}
const emitSuccess = (successMsg) => {
  emit('success', successMsg)
}

const handleLoginError = (errorMsg) => {
  emitError(errorMsg)
}

const handleLoginSuccess = async () => {
// username of currentLoggedInUser
  const username = store.getters["authenticationStore/getPrinciple"].sub;
  const userProfileService = UserProfileService.getInstance();
  let userProfileExists = false;

  const jwtToken = store.getters["authenticationStore/getToken"]
  try {
    //search if profile exists
    let response = await userProfileService.getUserProfile({username}, jwtToken)
    userProfileExists = response.profile != null
  } catch (e) {
    console.error("Failed to get user profile.")
    emit('error', e.message)
    return
  }
  //if not created a user profile
  //redirect loggedIn user to register profile
  if (userProfileExists)
    await router.push({name: 'home'})
  else
    await router.push({name: 'register-profile'})
}


const handleRegisterError = (errorMsg) => {
  emitError(errorMsg)
}

const handleRegisterSuccess = (user) => {
  emitSuccess(`Hello ${user.username}! You've successfully created an account. Please login to continue`)
}

</script>

<template>
  <div class="row">
    <div class="col-sm-6 d-flex align-items-center">
      <div class="container-lg align-items-center">
        <a href="/">
          <img class="application-logo" src="@/assets/images/growthinLogo.png"
               alt="logo">
        </a>
      </div>
    </div>
    <div
        class="background-texture col-sm-6 d-flex align-items-center justify-content-center">
      <signin-form @validation-error="emitError" @login-success="handleLoginSuccess" @login-error="handleLoginError"/>
    </div>
  </div>
  <div class="row">
    <div
        class="d-flex align-items-center justify-content-center background-texture shadowed-box col-md-6">
      <div class="page-wrapper d-flex flex-column align-items-start">
        <div class="animation-container container-fluid welcome-text">
          <h1>Welcome to GrowthIn</h1>
          <p>
            Grow together, succeed together! Join a vibrant community of like-minded individuals,
            where every connection and collaboration propels you towards your goals.
            Let's achieve greatness together!
          </p>
        </div>
      </div>
    </div>
    <div class="col d-flex align-items-start">
      <signup-user-form title-text="Create an account" title-text-color="white"
                        title-text-background-color="rgba(255, 69, 0, 0.8)" @validation-error="emitError"
                        @signup-success="handleRegisterSuccess" @signup-error="handleRegisterError"/>
    </div>
  </div>

  <the-footer color="black" text-color="white"/>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&display=swap');

.page-wrapper {
  min-height: 100vh;
}


.shadowed-box {
  border: black none 2px;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.5);
}

.col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-row > .col {
  padding-left: calc(0.5 * var(--bs-gutter-x));
  padding-right: calc(0.5 * var(--bs-gutter-x));
}


.application-logo {
  width: 10rem;
  height: auto;
  transition: transform 0.4s ease; /* Smooth transition for scaling */
  margin-bottom: 0.5rem;
  margin-top: 0.3rem;
  z-index: 0;
  animation: fadeIn 2s ease-in-out, gradientShift 10s ease infinite;
}


.application-logo:hover {
  transform: scale(1.2); /* Slight scaling effect on hover */
  z-index: 0;

}

.container-lg {
  position: relative;
  width: 100%;
  padding: 0;
  z-index: 0;
}

.container-lg::before,
.container-lg::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  z-index: -1;
}

/* First circle */
.container-lg::before {
  width: 120%;
  height: 100%;
  border: 5px solid rgba(0, 0, 0, 0.4); /* Border color and width */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8); /* Glow effect around the circle */
  top: 1%;
  left: -10%;
}

/* Second circle (optional for more design elements) */
.container-lg::after {
  width: 120%;
  height: 110%;
  border: 15px solid rgba(255, 69, 0, 0.55); /* Border color and width */
  top: -5%;
  left: -10%;
  box-shadow: 0 0 25px rgba(255, 69, 0, 0.9); /* Glow effect around the second circle */
}


.background-texture {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.5), rgba(255, 69, 0, 0.5)),
  url('https://www.transparenttextures.com/patterns/fresh-snow.png'); /* Adding geometric pattern */
  background-size: cover;
  overflow: hidden;
}

.background-texture::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 69, 0, 0.6); /* Orangered overlay */
  mix-blend-mode: multiply; /* Overlay effect with blending */
  z-index: -1;
}

.welcome-text {
  font-family: 'Poppins', sans-serif;
  color: white;
  position: relative;
  z-index: 0;
}

.animation-container {
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: saturate(180%) blur(12px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37), inset 0 0 15px rgba(255, 255, 255, 0.2);
  text-align: center;
  max-width: 800px;
  width: 95%;
  margin: auto;
  animation: fadeIn 1.5s ease-in-out, gradientShift 10s ease infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.18);
  position: relative;
  overflow: hidden;
  z-index: 0;
}

.animation-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 69, 0, 0.2), rgba(255, 69, 0, 0.4));
  z-index: 0;
  transform: rotate(30deg);
  animation: spinBackground 20s linear infinite;
}

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

@keyframes spinBackground {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animation-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.5), 0 0 15px rgba(255, 255, 255, 0.6);
}

.welcome-text h1 {
  font-weight: 700;
  font-size: 2rem;
  position: relative;
  z-index: 1;
}

.welcome-text p {
  font-weight: 300;
  font-size: 1rem;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.row {
  --bs-gutter-x: 30px;
}

.row {
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  display: flex;
  flex-wrap: wrap;
  margin-top: calc(-1 * var(--bs-gutter-y));
  margin-right: calc(-.5 * var(--bs-gutter-x));
  margin-left: calc(-.5 * var(--bs-gutter-x));
}

*, ::after, ::before {
  box-sizing: border-box;
}
</style>
