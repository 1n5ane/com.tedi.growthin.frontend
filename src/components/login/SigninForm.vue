<script setup lang="js">
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import {useStore} from "vuex";
import {ref} from 'vue'
import BaseInput from "@/components/core/inputs/BaseInput.vue";
import BaseLabel from "@/components/core/inputs/labels/BaseLabel.vue";
import UserService from "@/services/user/user-details/UserService";

const emit = defineEmits(['loginSuccess', 'loginError', 'validationError']); // Define events to be emitted


const store = useStore();
const usernameInput = ref('');
const passwordInput = ref('');

const isNullEmptyOrUndefined = (value) => !value?.trim();

const login = async (username, password) => {
  return await store.dispatch('authenticationStore/login', {username, password});
};

const handleSubmit = async () => {

  const usernameOrEmail = usernameInput.value
  const password = passwordInput.value;
  if (isNullEmptyOrUndefined(usernameOrEmail) || isNullEmptyOrUndefined(password)) {
    emit('validationError', "Please provide username/email and password!");
    return;
  }
  // Perform form submission logic (call store action for login)
  try {
    await login(usernameOrEmail, password).then(
        async () => {
          const userService = UserService.getInstance();
          //get currentlogged in user details and update authentication store
          let field
          if (usernameOrEmail.includes('@')) {
            field = {email: usernameOrEmail}
          } else {
            field = {username: usernameOrEmail}
          }

          const response = await userService.getUser(field)
          if (response.user == null) {
            throw new Error("Something went wrong during login! Please try again later")
          }
          //setting currentLoggedInUser
          await store.dispatch('authenticationStore/setCurrentLoggedInUser', response.user)
          emit('loginSuccess');
          console.log(`User ${store.getters["authenticationStore/getCurrentLoggedInUser"].username} logged in successfully.`);
        },
        (error) => {
          if (error.response) {
            emit('loginError', error.response.data.error);
          } else {
            emit('loginError', "Something went wrong! Please try again later");
          }
        }
    );
  } catch (error) {
    emit('loginError', "Something went wrong! Please try again later");
  }
};
</script>

<template>
  <form class="d-flex align-items-center p-0 w-100" @submit.prevent="handleSubmit">
    <div class="row align-items-center w-100">
      <div class="col-4 col-sm">
        <base-input id="usernameInput"
                    type="text"
                    placeholder="Username or Email"
                    v-model="usernameInput">
          <template #label>
            <base-label for="usernameInput"
                        label-color="black"
                        labelText="Username"/>
          </template>
        </base-input>
      </div>
      <div class="col-4 col-sm">
        <base-input id="passwordInput"
                    placeholder="Password"
                    type="password"
                    v-model="passwordInput">
          <template #label>
            <base-label for="passwordInput"
                        label-color="black"
                        labelText="Password"/>
          </template>
        </base-input>
      </div>
      <div class="col-4 col-sm">
        <base-button color="white"
                     type="submit"
                     bullet-color="black"
                     hover-color="black"
                     hover-text-color="white"
                     text="Login"/>
      </div>
    </div>
  </form>
</template>

<style scoped>

</style>
