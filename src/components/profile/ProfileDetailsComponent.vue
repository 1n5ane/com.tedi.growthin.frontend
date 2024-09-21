<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import BaseInput from "@/components/core/inputs/BaseInput.vue";
import ArticleTextArea from "@/components/core/inputs/ArticleTextArea.vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import FileUtils from "@/utils/FileUtils";

const props = defineProps({
  profileId: Number,
})
const emit = defineEmits(['error', 'success'])
const store = useStore()
const currentProfileRef = ref(null)
const editDetailsRef = ref(false)
const pdfInput = ref('')

const isProfileOfCurrentLoggedInUser = computed(() => {
  return props.profileId === store.getters['authenticationStore/getCurrentLoggedInUser'].id
})

const fetchUserProfile = async (profileId) => {
  const profileService = UserProfileService.getInstance()
  try {
    const resp = await profileService.getUserProfile({id: profileId})
    if (resp && resp.success) {
      currentProfileRef.value = resp.profile
      return
    }
    let errorMsg = resp ? resp.error : 'Failed to fetch user profile details'
    emit('error', errorMsg)
  } catch (error) {
    emit('error', error.message)
  }
}

const formData = reactive({
  education: '',
  isEducationPublic: true,

  jobField: '',
  isJobFieldPublic: true,

  age: null,
  ageIsValid: true,
  ageErrorMsg: '',
  isAgePublic: true,

  description: '',
  isDescriptionPublic: true,

  cvDocument: '',
  isCvDocumentPublic: true,

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

const toggleEdit = () => {
  editDetailsRef.value = !editDetailsRef.value
  if (!editDetailsRef.value) {
    setFormDataFromProfile()
  }
}

const setFormDataFromProfile = () => {
  formData.education = currentProfileRef.value.education;
  formData.isEducationPublic = currentProfileRef.value.isEducationPublic;
  formData.jobField = currentProfileRef.value.jobField;
  formData.isJobFieldPublic = currentProfileRef.value.isJobFieldPublic;
  formData.age = currentProfileRef.value.age;
  formData.ageIsValid = true;
  formData.ageErrorMsg = '';
  formData.isAgePublic = currentProfileRef.value.isAgePublic;
  formData.description = currentProfileRef.value.description;
  formData.isDescriptionPublic = currentProfileRef.value.isDescriptionPublic;
  formData.isCvDocumentPublic = currentProfileRef.value.isCvDocumentPublic;
  formData.cvDocument = null
}

const validators = {
  allValid: () => {
    return formData.ageIsValid
  },
  age: {
    isValid: (input) => {
      // Regex to allow only numeric values
      const regex = /^[0-9]+$/;
      const validNumber = regex.test(input);
      let msg = '';
      let valid = true
      if (!validNumber) {
        msg = 'Age should only contain numbers.';
        valid = false
      } else {
        const ageValue = parseInt(input, 10);
        if (ageValue < 6 || ageValue > 110) {
          msg = 'Age should be between 6 and 110.';
          valid = false
        }
      }

      return [valid, msg];
    }
  },
}


const handleSubmitEditProfile = async () => {
  if (!validators.allValid()) {
    emit('error', 'There are invalid fields. Please check details')
    return
  }

  const userProfileService = UserProfileService.getInstance()
  try {
    const resp = await userProfileService.updateUserProfile(formData)
    if (resp && resp.success) {
      emit('success', 'Successfully updated profile details')
      currentProfileRef.value = resp.profile
      toggleEdit()
      return
    }
    let errorMsg = resp ? resp.error : 'Failed to update profile details'
    emit('error', errorMsg);
  } catch (error) {
    emit('error', error.message)
  }
}

watch(() => formData.age, (newValue) => {
  if (!newValue) {
    formData.ageIsValid = true;
    formData.ageErrorMsg = '';
    return
  }
  [formData.ageIsValid, formData.ageErrorMsg] = validators.age.isValid(newValue);
});

const handlePdfUpload = async (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    formData.cvDocument = {
      mediaType: {type: "application/pdf"},
      data: await FileUtils.fileToBase64(file)
    };
  } else {
    emit('error', 'Please upload a valid pdf file')
    //how to remove invalid file
    pdfInput.value.value = '';
  }
};


onMounted(async () => {
  await fetchUserProfile(props.profileId)
  setFormDataFromProfile()
})

</script>

<template>
  <form v-if="currentProfileRef" class="profile-details-form">

    <div v-if="isProfileOfCurrentLoggedInUser" :class="{'row':true, 'justify-content-end':!editDetailsRef}">

      <div v-if="editDetailsRef" class="col-auto align-self-center">
        <img src="@/assets/icons/check.png"
             class="close-icon"
             alt="Apply edit changes icon"
             @click="handleSubmitEditProfile"/>
      </div>

      <div v-if="editDetailsRef" class="col align-self-center">
        <h5>You are now editing your profile details</h5>
      </div>

      <div class="col-auto text-end">
        <img v-if="!editDetailsRef"
             src="@/assets/icons/edit1.png"
             class="edit-icon"
             alt="Edit Profile Pic Icon"
             @click="toggleEdit"/>
        <img v-else
             src="@/assets/icons/remove.png"
             class="close-icon"
             alt="Cancel edit icon"
             @click="toggleEdit"/>
      </div>
    </div>

    <!--description fields-->
    <div v-if="formData.description || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'5px':0}">
      <div class="col-2 text-start align-self-center">
        Description:
      </div>

      <div class="col-9">
        <article-text-area
            :read-only="!editDetailsRef"
            :enable-border="editDetailsRef"
            placeholder="Enter a profile description"
            id="profile-description"
            v-model="formData.description"/>
      </div>
    </div>

    <div v-if="isProfileOfCurrentLoggedInUser && (formData.description || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="profile-description-visibility"
          class="col-9"
          v-model="formData.isDescriptionPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Description is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!-- JobField Fields -->
    <div v-if="formData.jobField || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Job field:
      </div>

      <div class="col-9">
        <base-input id="profile-jobfield"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    placeholder="Enter your job field"
                    type="text"
                    required
                    v-model="formData.jobField"/>
      </div>
    </div>

    <div v-if="isProfileOfCurrentLoggedInUser && (formData.jobField || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="profile-jobfield-visibility"
          class="col-9"
          v-model="formData.isJobFieldPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Job field is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--Education fields-->
    <div v-if="formData.education || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Education:
      </div>
      <div class="col-9">
        <base-input id="profile-education"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    placeholder="Enter your education"
                    type="text"
                    required
                    v-model="formData.education"/>
      </div>
    </div>

    <div v-if="isProfileOfCurrentLoggedInUser && (formData.education || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="profile-education-visibility"
          class="col-9"
          v-model="formData.isEducationPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Education is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--age field-->
    <div v-if="formData.age || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        Age:
      </div>
      <div class="col-9">
        <base-input id="profile-age"
                    :read-only="!editDetailsRef"
                    :enable-border="editDetailsRef"
                    :disable-shadow="!editDetailsRef"
                    :valid="formData.ageIsValid"
                    :errorMessage="formData.ageErrorMsg"
                    error-hint-background-color="rgba(255,0,0,0.8)"
                    error-hint-message-color="white"
                    placeholder="Enter your age"
                    type="text"
                    required
                    v-model="formData.age"/>
      </div>
    </div>

    <div v-if="isProfileOfCurrentLoggedInUser && (formData.age || editDetailsRef)" class="row justify-content-center"
         style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="profile-age-visibility"
          class="col-9"
          v-model="formData.isAgePublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          Age is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>


    <!--CV DOCUMENT FIELDS-->
    <div v-if="currentProfileRef?.cvDocument || editDetailsRef" class="row justify-content-center"
         :style="{'padding-bottom':editDetailsRef?'10px':0}">
      <div class="col-2 text-start align-self-center">
        CV:
      </div>

      <div class="col-9 text-start align-self-center">
        <input v-if="editDetailsRef"
               ref="pdfInput"
               type="file"
               id="profile-pdf-upload"
               accept="application/pdf"
               @change="handlePdfUpload"/>

        <a v-else
           class="download-link"
           :href="FileUtils.createDownloadLink(currentProfileRef.cvDocument.data,currentProfileRef.cvDocument.mediaType.type)"
           :download="currentProfileRef.username+'CV.pdf'">
          {{ currentProfileRef.username }}CV.pdf
        </a>
      </div>
    </div>

    <div v-if="isProfileOfCurrentLoggedInUser && (currentProfileRef.cvDocument || editDetailsRef)"
         class="row justify-content-center" style="margin-bottom: 10px">
      <div class="col-2 text-start align-self-center">
        Visible to:
      </div>
      <select
          :disabled="!editDetailsRef"
          id="profile-cv-visibility"
          class="col-9"
          v-model="formData.isCvDocumentPublic">
        <option
            v-for="option in publicOptions"
            :key="option.name"
            :value="option.isPublic">
          CV is visible to {{ option.name }} {{ !option.isPublic ? 'only' : null }}
        </option>
      </select>
    </div>

  </form>
</template>

<style scoped>

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

.edit-icon:hover,
.close-icon:hover {
  transform: scale(1.1);
}

h5 {
  font-size: 1.25rem;
  color: #FF4500;
  font-weight: bold;
  text-align: center;
  cursor: default;
}

.profile-details-form {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border: none;
  background-color: white;
  border-radius: 8px;
  padding-bottom: 5px;
  margin: 5px 15px 0 15px;
}

.download-link {
  color: #FF4500;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  position: relative;
}

.download-link:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 2px;
  background-color: #FF4500;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.download-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.download-link:hover {
  color: #e63c00;
}
</style>