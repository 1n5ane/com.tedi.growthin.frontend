<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import UserService from "@/services/user/user-details/UserService";
import BaseInput from "@/components/core/inputs/BaseInput.vue";

const props = defineProps({
  userId: Number,
})
const emit = defineEmits(['error', 'success'])
const store = useStore()
const currentUserRef = ref(null)
const editDetailsRef = ref(false)


const isDetailsOfCurrentLoggedInUser = computed(() => {
  return props.userId === store.getters['authenticationStore/getCurrentLoggedInUser'].id
})

const fetchUserDetails = async (userId) => {
  const userService = UserService.getInstance()
  try {
    const resp = await userService.getUser({id: userId})
    if (resp && resp.success) {
      currentUserRef.value = resp.user
      return
    }
    let errorMsg = resp ? resp.error : 'Failed to fetch user details'
    emit('error', errorMsg)
  } catch (error) {
    emit('error', error.message)
  }
}
const countries = [
  {name: "United States", iso: "US"},
  {name: "Canada", iso: "CA"},
  {name: "United Kingdom", iso: "GB"},
  {name: "Australia", iso: "AU"},
  {name: "Germany", iso: "DE"},
  {name: "France", iso: "FR"},
  {name: "Japan", iso: "JP"},
  {name: "China", iso: "CN"},
  {name: "India", iso: "IN"},
  {name: "Brazil", iso: "BR"},
  {name: "Greece", iso: "GR"},
  // Add more countries as needed
];


countries.sort((a, b) => a.name.localeCompare(b.name));

const formData = reactive({
  username: '',
  usernameIsValid: true,
  usernameErrorMsg: '',

  password: '',
  passwordIsValid: true,
  passwordErrorMsg: '',

  confirmPassword: '',
  confirmPasswordIsValid: true,
  confirmPasswordErrorMsg: '',

  email: '',
  isEmailPublic: true,
  emailIsValid: true,
  emailErrorMsg: '',

  name: '',
  nameIsValid: true,
  nameNameErrorMsg: '',

  surname: '',
  surnameIsValid: true,
  surnameErrorMsg: '',

  country: '',
  isCountryPublic: true,

  phone: '',
  isPhonePublic: true,

  area: '',
  isAreaPublic: true,
});
const publicOptions = [
  {
    name: "Anyone",
    isPublic: true
  },
  {
    name: "Connections",
    isPublic: false
  }
]
const validators = {
  allValid: () => {
    return formData.nameIsValid &&
        formData.surnameIsValid &&
        formData.emailIsValid &&
        formData.usernameIsValid &&
        formData.passwordIsValid &&
        formData.confirmPasswordIsValid &&
        formData.phoneIsValid
  },
  name: {
    isValid: (input) => {
      // Should only contain lowercase, uppercase, hyphen (-), and underscore (_)
      const regex = /^[a-zA-Z_-]+$/;
      const valid = regex.test(input);
      let msg = ''
      if (!valid) {
        msg = 'First name should only contain letters, - or _'
      }
      return [valid, msg];
    }
  },
  surname: {
    isValid: (input) => {
      // Should only contain lowercase, uppercase, hyphen (-), and underscore (_)
      const regex = /^[a-zA-Z_-]+$/;
      const valid = regex.test(input);
      let msg = ''
      if (!valid) {
        msg = 'Last name should only contain letters - or _'
      }
      return [valid, msg];
    }
  }, // No validation
  email: {
    isValid: (input) => {
      // Should only contain valid email characters
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = regex.test(input);
      let msg = ''
      if (!valid) {
        msg = 'Email is invalid'
      }
      return [valid, msg];
    }
  },
  username: {
    isValid: (input) => {
      // Should only contain lowercase, uppercase, or underscore (_) or numbers (not as first digit)
      const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      const valid = regex.test(input);
      let msg = ''
      if (!valid) {
        msg = 'Username should only contain letters/numbers or _'
      }
      return [valid, msg];
    }
  },
  password: {
    isValid: (input) => {
      const valid = input.length >= 8;
      let msg = ''
      if (!valid)
        msg = 'Password must be at least 8 characters'
      return [valid, msg]
    }
  },
  phone: {
    isValid: (input) => {
      // Should only contain numbers, +, or -
      const regex = /^[0-9+-]+$/;
      const valid = regex.test(input);
      let msg = ''
      if (!valid) {
        msg = 'Phone should only contain numbers, + or -'
      }
      return [valid, msg];
    }
  },
  confirmPassword: {
    isValid: (input, password) => {
      const valid = input === password
      let msg = ''
      if (!valid) {
        msg = "Passwords don't match"
      }
      return [valid, msg]
    }
  },
  country: null, // No validation
  isAdmin: null, // No validation
};

function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

watch(() => formData.name, (newValue) => {
  if (!newValue) {
    formData.nameIsValid = true;
    formData.nameErrorMsg = '';
    return
  }
  [formData.nameIsValid, formData.nameErrorMsg] = validators.name.isValid(newValue);
});

watch(() => formData.surname, (newValue) => {
  if (!newValue) {
    formData.surnameIsValid = true;
    formData.surnameErrorMsg = '';
    return
  }
  [formData.surnameIsValid, formData.surnameErrorMsg] = validators.surname.isValid(newValue);
});

watch(() => formData.email, debounce(async (newValue) => {
  if (!newValue || newValue === currentUserRef.value?.email) {
    formData.emailIsValid = true;
    formData.emailErrorMsg = '';
    return
  }
  [formData.emailIsValid, formData.emailErrorMsg] = validators.email.isValid(newValue);

  if (formData.emailIsValid) {
    try {
      // Call your API to check if the username is available
      const userService = UserService.getInstance();
      const emailExists = (await userService.checkUserExists({email: newValue})).exists;

      if (emailExists) {
        formData.emailIsValid = false;
        formData.emailErrorMsg = 'Email is already taken';
      } else {
        formData.emailErrorMsg = '';
      }
    } catch (error) {
      formData.emailIsValid = false;
      formData.emailErrorMsg = 'Error checking username availability';
    }
  }
},250));

watch(() => formData.username, debounce(async (newValue) => {
  if (!newValue || newValue === currentUserRef.value?.username) {
    formData.usernameIsValid = true;
    formData.usernameErrorMsg = '';
    return
  }
  [formData.usernameIsValid, formData.usernameErrorMsg] = validators.username.isValid(newValue);

  if (formData.usernameIsValid) {
    try {
      // Call your API to check if the username is available
      const userService = UserService.getInstance();
      const usernameExists = (await userService.checkUserExists({username: newValue})).exists;
      if (usernameExists) {
        formData.usernameIsValid = false;
        formData.usernameErrorMsg = 'Username is already taken';
      } else {
        formData.usernameErrorMsg = '';
      }
    } catch (error) {
      formData.usernameIsValid = false;
      formData.usernameErrorMsg = 'Error checking username availability';
    }
  }
}, 250));

watch(() => formData.phone, (newValue) => {
  if (!newValue) {
    formData.phoneIsValid = true;
    formData.phoneErrorMsg = '';
    return
  }
  [formData.phoneIsValid, formData.phoneErrorMsg] = validators.phone.isValid(newValue);
});

watch(() => formData.confirmPassword, (newValue) => {
  if (!newValue) {
    formData.confirmPasswordIsValid = true;
    formData.passwordIsValid = formData.confirmPasswordIsValid
    formData.confirmPasswordErrorMsg = '';
    return
  }
  [formData.confirmPasswordIsValid, formData.confirmPasswordErrorMsg] = validators.confirmPassword.isValid(newValue, formData.password);
  formData.passwordIsValid = formData.confirmPasswordIsValid
});

watch(() => formData.password, (newValue) => {
  if (!newValue) {
    formData.passwordIsValid = true;
    formData.passwordErrorMsg = ''
    return
  }
  [formData.passwordIsValid, formData.passwordErrorMsg] = validators.password.isValid(newValue);
});


const toggleEdit = () => {
  editDetailsRef.value = !editDetailsRef.value
  if (!editDetailsRef.value) {
    setFormDataFromUser()
  }
}

const setFormDataFromUser = () => {
  formData.username = currentUserRef.value.username;
  formData.email = currentUserRef.value.email;
  formData.isEmailPublic = currentUserRef.value.isEmailPublic;
  formData.name = currentUserRef.value.name;
  formData.surname = currentUserRef.value.surname;
  formData.phone = currentUserRef.value.phone;
  formData.isPhonePublic = currentUserRef.value.isPhonePublic;
  formData.country = currentUserRef.value.country;
  formData.isCountryPublic = currentUserRef.value.isCountryPublic;
  formData.area = currentUserRef.value.area;
  formData.isAreaPublic = currentUserRef.value.isAreaPublic;
  formData.password = null
  formData.confirmPassword = null
}

const handleSubmitEditDetails = async () => {
  if (!validators.allValid()) {
    emit('error', 'There are invalid fields. Please check details')
    return
  }

  const userService = UserService.getInstance()
  try {
    formData.id = store.getters['authenticationStore/getCurrentLoggedInUser']?.id
    const resp = await userService.updateUser(formData)
    if(resp && resp.success){
      emit('success', 'Successfully updated user details')
      currentUserRef.value = resp.user
      toggleEdit()
      return
    }
    let errorMsg = resp? resp.error : 'Failed to update user details'
    emit('error', errorMsg);
  } catch (error) {
    emit('error', error.message)
  }
}

onMounted(async () => {
  await fetchUserDetails(props.userId)
  setFormDataFromUser()
})

</script>

<template>
  <form v-if="currentUserRef" class="user-details-form">
    <div v-if="isDetailsOfCurrentLoggedInUser" :class="{'row':true, 'justify-content-end':!editDetailsRef}">

      <div v-if="editDetailsRef" class="col-auto align-self-center">
        <img src="@/assets/icons/check.png"
             class="close-icon"
             alt="Apply edit changes icon"
             @click="handleSubmitEditDetails"/>
      </div>

      <div v-if="editDetailsRef" class="col align-self-center">
        <h5>You are now editing your account details</h5>
      </div>

      <div class="col-auto text-end">
        <img v-if="!editDetailsRef"
             src="@/assets/icons/edit1.png"
             class="edit-icon"
             alt="Edit Details Pic Icon"
             @click="toggleEdit"/>
        <img v-else
             src="@/assets/icons/remove.png"
             class="close-icon"
             alt="Cancel edit icon"
             @click="toggleEdit"/>
      </div>
    </div>


    <!-- username -->
    <div v-if="formData.username || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Username:
      </div>

      <div class="col-9">
        <base-input id="user-username"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    :valid="formData.usernameIsValid"
                    :errorMessage="formData.usernameErrorMsg"
                    placeholder="Enter your username"
                    type="text"
                    required
                    v-model="formData.username"/>
      </div>
    </div>

    <!-- First Name -->
    <div v-if="formData.name || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Name:
      </div>

      <div class="col-9">
        <base-input id="user-name"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    :valid="formData.nameIsValid"
                    :errorMessage="formData.nameErrorMsg"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    placeholder="Enter your first name"
                    type="text"
                    required
                    v-model="formData.name"/>
      </div>
    </div>


    <!-- Last Name -->
    <div v-if="formData.surname || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Surname:
      </div>

      <div class="col-9">
        <base-input id="user-surname"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    :valid="formData.surnameIsValid"
                    :errorMessage="formData.surnameErrorMsg"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    placeholder="Enter your last name"
                    type="text"
                    required
                    v-model="formData.surname"/>
      </div>
    </div>


    <!-- Email -->
    <div v-if="formData.email || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Email:
      </div>

      <div class="col-9">
        <base-input id="user-email"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    :valid="formData.emailIsValid"
                    :errorMessage="formData.emailErrorMsg"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    placeholder="Enter your email address"
                    type="text"
                    required
                    v-model="formData.email"/>
      </div>
    </div>
    <div v-if="isDetailsOfCurrentLoggedInUser && (formData.email || editDetailsRef)" class="row justify-content-center"
         style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="email-visibility"
          class="col-9"
          v-model="formData.isEmailPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Email is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--Phone field-->
    <div v-if="formData.phone || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Phone:
      </div>
      <div class="col-9">
        <base-input id="user-phone"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    :valid="formData.phoneIsValid"
                    :errorMessage="formData.phoneErrorMsg"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    placeholder="Enter your phone"
                    type="text"
                    required
                    v-model="formData.phone"/>
      </div>
    </div>

    <div v-if="isDetailsOfCurrentLoggedInUser && (formData.phone || editDetailsRef)" class="row justify-content-center"
         style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="phone-visibility"
          class="col-9"
          v-model="formData.isPhonePublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Phone is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--country field-->
    <div v-if="formData.country || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':'2px'}">
      <div class="col-2 text-start align-self-center">
        Country:
      </div>
      <select
          id="signup-country"
          :disabled="!editDetailsRef"
          class="col-9"
          v-model="formData.country"
      >
        <option value="">Select your country</option>
        <option
            v-for="country in countries"
            :key="country.iso"
            :value="country.iso"
        >
          {{ country.name }}
        </option>
      </select>
    </div>

    <div v-if="isDetailsOfCurrentLoggedInUser && (formData.country || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="country-visibility"
          class="col-9"
          v-model="formData.isCountryPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Country is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--Area field-->
    <div v-if="formData.area || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Area:
      </div>
      <div class="col-9">
        <base-input id="user-area"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    placeholder="Enter your area"
                    type="text"
                    required
                    v-model="formData.area"/>
      </div>
    </div>

    <div v-if="isDetailsOfCurrentLoggedInUser && (formData.area || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="area-visibility"
          class="col-9"
          v-model="formData.isAreaPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Area is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <div v-if="isDetailsOfCurrentLoggedInUser && editDetailsRef" class="row p-2 justify-content-start">
      <!-- Password Field -->
      <div class="col-6">
        <base-input id="signup-password"
                    placeholder="Enter a password"
                    type="password"
                    :valid="formData.passwordIsValid"
                    :errorMessage="formData.passwordErrorMsg"
                    required
                    v-model="formData.password">
          <template #label>
            <div class="row justify-content-start">
              <label class="col d-flex align-content-start" for="signup-password">
                Change Password
              </label>
            </div>

          </template>
        </base-input>
      </div>

      <!-- confirm password field -->
      <div class="col-6">
        <base-input id="signup-confirm-password"
                    placeholder="Re-enter the changed password"
                    type="password"
                    :valid="formData.confirmPasswordIsValid"
                    :errorMessage="formData.confirmPasswordErrorMsg"
                    required
                    v-model="formData.confirmPassword">
          <template #label>
            <div class="row justify-content-start">
              <label class="col d-flex align-content-start" for="signup-confirm-password">
                Confirm Password
              </label>
            </div>
          </template>
        </base-input>
      </div>
    </div>

  </form>
</template>

<style scoped>

.user-details-form {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border: none;
  background-color: white;
  border-radius: 8px;
  margin: 5px 15px 0 15px;
  padding-bottom: 5px;
}

.edit-icon,
.close-icon {
  background: transparent;
  border-radius: 10px;
  padding: 5px;
  width: auto;
  height: 35px;
  transition: transform 0.3s ease;
  cursor: pointer;
  object-fit: contain;
}

h5 {
  font-size: 1.25rem;
  color: #FF4500;
  font-weight: bold;
  text-align: center;
  cursor: default;
}


.edit-icon:hover,
.close-icon:hover {
  transform: scale(1.1);
}
</style>