<script setup>
import BaseInput from "@/components/core/inputs/BaseInput.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import {onMounted, reactive} from "vue";
import BaseTextArea from "@/components/core/inputs/BaseTextArea.vue";
import BaseAvatarEditor from "@/components/core/avatars/BaseAvatarEditor.vue";
import BaseAvatar from "@/components/core/avatars/BaseAvatar.vue";
import baseAvatarImage from "@/assets/images/avatars/avatar_1.jpg";
import ImageUtils from "@/utils/ImageUtils";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";

import {ref} from 'vue';
import {useStore} from "vuex";

const props = defineProps({
  titleText: String,
  titleTextColor: String,
  titleTextBackgroundColor: String,
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

const editAvatar = ref(false);
const avatarImageRef = ref('')

const loadAvatarImage = async () => {
  avatarImageRef.value = await ImageUtils.getImageDataUrl(baseAvatarImage)
}
onMounted(async () => {
  await loadAvatarImage()
})

const formData = reactive({
  education: '',
  isEducationPublic: true,

  jobField: '',
  isJobFieldPublic: true,

  age: null,
  isAgePublic: true,

  description: '',
  isDescriptionPublic: true,

});

const emit = defineEmits(['signupProfileError', 'signupProfileSuccess'])

const handleAvatarClick = () => {
  //if avatar clicked
  //set edit to true
  editAvatar.value = true;
}
const handleEditCompleted = (imageData) => {
  avatarImageRef.value = imageData;
  editAvatar.value = false;
}

const handleSubmit = async () => {
  const {type, base64Data} = ImageUtils.extractTypeAndBase64Data(avatarImageRef.value)
  const userProfileService = UserProfileService.getInstance()
  try {
    const response = await userProfileService.createUserProfile({
      jobField: formData.jobField,
      isJobFieldPublic: formData.isJobFieldPublic,
      education: formData.education,
      isEducationPublic: formData.isEducationPublic,
      description: formData.description,
      isDescriptionPublic: formData.isDescriptionPublic,
      age: formData.age,
      isAgePublic: formData.isAgePublic,
      profilePic: {
        mediaType: {type},
        data: base64Data
      }
    })
    if (response && response.success) {
      emit('signupProfileSuccess')
    } else {
      emit('signupProfileError', response ? response.error : 'No data returned from server!')
    }
  } catch (error) {
    emit('signupProfileError', `Failed to set up profile: ${error.message}`)
  }
}
</script>

<template>
  <div class="flex-box container form-box">
    <div class="row align-items-center">
      <div class="col-12 p-2 form-title"
           :style="{ backgroundColor: props.titleTextBackgroundColor, color: props.titleTextColor }">
        {{ props.titleText }}
      </div>
    </div>

    <!--    PROFILE PIC COMPONENT SECTION-->
    <div class="row align-items-center justify-content-center">
      <div v-if="avatarImageRef" class="col-6">
        <base-avatar-editor v-if="editAvatar" :image="avatarImageRef" id="avatar-editor"
                            @edit-completed="handleEditCompleted" :height="180" :width="180"/>
        <div v-else>
          <base-avatar width="50%" :image="avatarImageRef" @avatar-clicked="handleAvatarClick"/>
        </div>
      </div>
    </div>
    <!--    PROFILE PIC COMPONENT SECTION END-->


    <form class="signup-form" @submit.prevent="handleSubmit">
      <!-- JobField Fields -->
      <div class="row p-2 justify-content-center">
        <div class="col-4 avatar-section">
          <base-input id="profile-job-field"
                      placeholder="Enter your job field"
                      type="text"
                      v-model="formData.jobField">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="profile-job-field">
                  Field of expertise
                </label>
              </div>

            </template>
          </base-input>
        </div>
        <div class="col-auto">

          <div class="row justify-content-start">
            <label class="col d-flex align-content-start" for="profile-job-field-public">
              Viewed By
            </label>
          </div>
          <select
              id="profile-job-field-public"
              class="single-field w-100"
              v-model="formData.isJobFieldPublic">
            <option
                v-for="option in publicOptions"
                :key="option.name"
                :value="option.isPublic">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>


      <!--Education fields-->
      <div class="row p-2 justify-content-center">
        <div class="col-4">
          <base-input id="profile-education"
                      placeholder="Enter your education status"
                      type="text"
                      v-model="formData.education">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="profile-education">
                  Education
                </label>
              </div>

            </template>
          </base-input>
        </div>
        <div class="col-auto">

          <div class="row justify-content-start">
            <label class="col d-flex align-content-start" for="profile-education-public">
              Viewed By
            </label>
          </div>
          <select
              id="profile-education-public"
              class="single-field w-100"
              v-model="formData.isEducationPublic">
            <option
                v-for="option in publicOptions"
                :key="option.name"
                :value="option.isPublic">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>


      <!--age fields-->
      <div class="row p-2 justify-content-center">
        <div class="col-4">
          <base-input id="profile-age"
                      placeholder="Enter your age"
                      type="text"
                      v-model="formData.age">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="profile-age">
                  How old are you?
                </label>
              </div>

            </template>
          </base-input>
        </div>
        <div class="col-auto">

          <div class="row justify-content-start">
            <label class="col d-flex align-content-start" for="profile-age-public">
              Viewed By
            </label>
          </div>
          <select
              id="profile-age-public"
              class="single-field w-100"
              v-model="formData.isAgePublic">
            <option
                v-for="option in publicOptions"
                :key="option.name"
                :value="option.isPublic">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>


      <!--description fields-->
      <div class="row p-2 justify-content-center">
        <div class="col-8">
          <base-text-area id="profile-description"
                          placeholder="Enter a profile description"
                          v-model="formData.description">
            <template #label>
              <div class="row justify-content-start">
                <label class="col d-flex align-content-start" for="profile-description">
                  How you describe yourself?
                </label>
              </div>
            </template>
          </base-text-area>
        </div>
        <div class="col-auto">

          <div class="row justify-content-start">
            <label class="col d-flex align-content-start" for="profile-description-public">
              Viewed By
            </label>
          </div>
          <select
              id="profile-description-public"
              class="single-field w-100"
              v-model="formData.isDescriptionPublic">
            <option
                v-for="option in publicOptions"
                :key="option.name"
                :value="option.isPublic">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>

      <BaseButton color="rgba(255, 69, 0, 1)" bullet-color="black" hover-color="black"
                  text-color="white" hover-text-color="white" text="Create Profile"
                  type="submit"/>
    </form>
  </div>
</template>

<style scoped>

.form-title {
  text-align: center;
  border-radius: 0.2rem;
  border-bottom: 1px solid black;
  font-size: 2rem;
  margin-bottom: 10px;
}

.form-box {
  border: 1px solid black;
  width: 70%;
  margin-top: 0.5rem;
  padding-bottom: 1rem;
}


.single-field {
  width: 100%;
  padding: 4px;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.6s;
}
</style>