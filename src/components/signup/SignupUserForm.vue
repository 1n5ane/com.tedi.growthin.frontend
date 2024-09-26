<script setup lang="js">
import {ref, reactive, watch} from 'vue';
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import BaseInput from "@/components/core/inputs/BaseInput.vue";
import UserService from "@/services/user/user-details/UserService";
import User from "@/models/user/User"

const props = defineProps({
  titleText: String,
  titleTextColor: String,
  titleTextBackgroundColor: String,
});

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

// Sort the countries array alphabetically by country name
countries.sort((a, b) => a.name.localeCompare(b.name));

const validators = {
  allValid: () => {
    return formData.firstNameIsValid &&
        formData.lastNameIsValid &&
        formData.emailIsValid &&
        formData.usernameIsValid &&
        formData.passwordIsValid &&
        formData.confirmPasswordIsValid &&
        formData.phoneIsValid
  },
  firstName: {
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
  lastName: {
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

const clearFormData = () => {
  formData.firstName = ''
  formData.firstNameIsValid = true;
  formData.firstNameErrorMsg = '';
  formData.lastName = '';
  formData.lastNameIsValid = true;
  formData.lastNameErrorMsg = '';
  formData.email = '';
  formData.emailIsValid = true;
  formData.emailErrorMsg = '';

  formData.username = '';
  formData.usernameIsValid = true;
  formData.usernameErrorMsg = '';

  formData.password = '';
  formData.passwordIsValid = true;
  formData.passwordErrorMsg = '';

  formData.phone = '';
  formData.phoneIsValid = true;
  formData.phoneErrorMsg = '';

  formData.confirmPassword = '';
  formData.confirmPasswordIsValid = true;
  formData.confirmPasswordErrorMsg = '';

  formData.country = '';
  formData.isAdmin = false;
}
const formData = reactive({
  firstName: '',
  firstNameIsValid: true,
  firstNameErrorMsg: '',

  lastName: '',
  lastNameIsValid: true,
  lastNameErrorMsg: '',

  email: '',
  emailIsValid: true,
  emailErrorMsg: '',

  username: '',
  usernameIsValid: true,
  usernameErrorMsg: '',

  password: '',
  passwordIsValid: true,
  passwordErrorMsg: '',

  phone: '',
  phoneIsValid: true,
  phoneErrorMsg: '',

  confirmPassword: '',
  confirmPasswordIsValid: true,
  confirmPasswordErrorMsg: '',

  country: '',
  isAdmin: false
});

function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

watch(() => formData.firstName, (newValue) => {
  if (!newValue) {
    formData.firstNameIsValid = true;
    formData.firstNameErrorMsg = '';
    return
  }
  [formData.firstNameIsValid, formData.firstNameErrorMsg] = validators.firstName.isValid(newValue);
});

watch(() => formData.lastName, (newValue) => {
  if (!newValue) {
    formData.lastNameIsValid = true;
    formData.lastNameErrorMsg = '';
    return
  }
  [formData.lastNameIsValid, formData.lastNameErrorMsg] = validators.lastName.isValid(newValue);
});

watch(() => formData.email, debounce(async (newValue) => {
  if (!newValue) {
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
      formData.emailErrorMsg = 'Error checking email availability';
    }
  }
},250));

watch(() => formData.username, debounce(async (newValue) => {
  if (!newValue) {
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


const emit = defineEmits(['signupSuccess', 'signupError', 'validationError']);

const handleSubmit = async () => {
  if (!validators.allValid()) {
    emit('validationError', 'There are invalid fields. Please provide valid account details to continue.')
    return
  }

  //call register action -> all valid
  const userService = UserService.getInstance()

  const user = new User({
    username: formData.username,
    password: formData.password,
    name: formData.firstName,
    surname: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    country: formData.country,
    area: null,
    authorities: (formData.isAdmin) ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER'],
    isEmailPublic: false, //default
    isAreaPublic: false,
    isPhonePublic: false,
    isCountryPublic: false
  })

  try {
    const res = await userService.registerUser(user)
    if (res && res.success) {
      clearFormData()
      emit('signupSuccess', res.user)
    } else {
      let errorMsg;
      if (!res) {
        errorMsg = "Failed to register. Please try again later";
      } else {
        errorMsg = res.error
      }
      emit('signupError', errorMsg)
    }
  } catch (e) {
    emit('signupError', `Failed to register: ${e.message}`);
  }
}


</script>

<template>
  <div class="signup-container shadowed-box">
    <div class="row shadowed-top-box align-items-center">
      <div
          class="col-12 register-form-title"
          :style="{ backgroundColor: props.titleTextBackgroundColor, color: props.titleTextColor }"
      >
        {{ props.titleText }}
      </div>
    </div>

    <!-- Note indicating required fields -->
    <p class="required-fields-note">
      Fields marked with <span class="required-asterisk">*</span> are required.
    </p>

    <form class="signup-form" @submit.prevent="handleSubmit">
      <!-- Name Fields -->
      <div class="row p-2 justify-content-start">
        <div class="col-6">
          <base-input id="signup-name"
                      placeholder="Enter your first name"
                      type="text"
                      :valid="formData.firstNameIsValid"
                      :errorMessage="formData.firstNameErrorMsg"
                      required
                      v-model="formData.firstName">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-name">
                  Name<span class="required-asterisk">*</span>
                </label>
              </div>

            </template>
          </base-input>
        </div>

        <div class="col-6">
          <base-input id="signup-surname"
                      placeholder="Enter your last name"
                      type="text"
                      :valid="formData.lastNameIsValid"
                      :errorMessage="formData.lastNameErrorMsg"
                      required
                      v-model="formData.lastName">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-surname">
                  Surname<span class="required-asterisk">*</span>
                </label>
              </div>

            </template>
          </base-input>
        </div>
      </div>

      <div class="row p-2 justify-content-start">
        <!-- Email Field -->
        <div class="col-6">
          <base-input id="signup-email"
                      placeholder="Enter your email"
                      :valid="formData.emailIsValid"
                      :errorMessage="formData.emailErrorMsg"
                      type="text"
                      required
                      v-model="formData.email">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-email">
                  Email<span class="required-asterisk">*</span>
                </label>
              </div>

            </template>
          </base-input>
        </div>

        <!-- username field -->
        <div class="col-6">
          <base-input id="signup-username"
                      placeholder="Enter your username"
                      :valid="formData.usernameIsValid"
                      :errorMessage="formData.usernameErrorMsg"
                      type="text"
                      required
                      v-model="formData.username">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-username">
                  Username<span class="required-asterisk">*</span>
                </label>
              </div>

            </template>
          </base-input>
        </div>
      </div>

      <div class="row p-2 justify-content-start">
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
                  Password<span class="required-asterisk">*</span>
                </label>
              </div>

            </template>
          </base-input>
        </div>

        <!-- confirm password field -->
        <div class="col-6">
          <base-input id="signup-confirm-password"
                      placeholder="Re-enter your password"
                      type="password"
                      :valid="formData.confirmPasswordIsValid"
                      :errorMessage="formData.confirmPasswordErrorMsg"
                      required
                      v-model="formData.confirmPassword">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-confirm-password">
                  Confirm Password<span class="required-asterisk">*</span>
                </label>
              </div>
            </template>
          </base-input>
        </div>
      </div>

      <!-- Phone and Country Fields -->
      <div class="row p-2 justify-content-start">
        <div class="col-6">
          <base-input id="signup-phone"
                      placeholder="Enter your phone"
                      :valid="formData.phoneIsValid"
                      :errorMessage="formData.phoneErrorMsg"
                      type="text"
                      v-model="formData.phone">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="signup-phone">
                  Phone
                </label>
              </div>

            </template>
          </base-input>
        </div>

        <div class="col-6">
          <div class="row justify-content-start">
            <label class="col d-flex align-content-start" for="signup-country">
              Country:
            </label>
          </div>
          <select
              id="signup-country"
              class="single-field w-100 country-selector"
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
      </div>


      <div class="row p-0 justify-content-start">
        <!-- Moderator Access Checkbox -->
        <div class="col-6 d-flex align-items-center">
          <div class="row p-2 justify-content-start">
            <label class="col-auto align-self-center" for="moderator-access">
              Moderator Access:
            </label>
            <div class="col-auto align-self-center">
              <input
                  class="single-field"
                  id="moderator-access"
                  type="checkbox"
                  v-model="formData.isAdmin"
              />
            </div>
          </div>
        </div>
        <div class="col-6 d-flex align-items-center">
          <BaseButton color="rgba(255, 69, 0, 1)" bullet-color="black" hover-color="black"
                      text-color="white" hover-text-color="white" text="Register"
                      type="submit"/>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

label {
  font-size: 15px;
  color: gray;
  font-weight: bold;
}

.country-selector {
  height: 37px;
}

.signup-container {
  height: auto;
  padding: 0 10px;
  max-width: 800px;
  width: 100%;
  margin: 10px auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  text-align: center;
  position: relative;
}

.register-form-title {
  font-size: 2rem;
  padding: 0.7rem;
}

.required-fields-note {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #333;
}

.signup-form {
  padding-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.single-field {
  padding: 4px;
  border-radius: 8px;
  transition: border-color 0.6s;
}

.single-field:focus {
  outline: none;
  border: 2px solid black;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4);
}

.shadowed-box {
  border: none;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.5);
}

.required-asterisk {
  color: red;
  margin-left: 3px;
}


</style>
