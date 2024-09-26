<script setup>

import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {onMounted, reactive, ref} from "vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {useStore} from "vuex";
import ArticleTextArea from "@/components/core/inputs/ArticleTextArea.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import {VueMultiImageUpload} from '@zakerxa/vue-multiple-image-upload';
import FileUtils from "@/utils/FileUtils";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import ImageUtils from "@/utils/ImageUtils";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()
const userImageRef = reactive({
  base64Data: '',
  mediaType: ''
})

const emit = defineEmits(['error', 'success'])

const publicOptions = [
  {
    name: "Anyone",
    value: "PUBLIC"
  },
  {
    name: "Connections",
    value: "CONNECTED_NETWORK"
  },
  {
    name: "Hidden",
    value: "HIDDEN"
  }
]

const clearFormData = () => {
  formData.articleBody = ''
  formData.articleVisibility = "PUBLIC"
  formData.title = ''
  formData.images = []
  formData.reset.clear = true
}
const formData = reactive({
  articleBody: '',
  articleVisibility: "PUBLIC",

  title: '',

  images: [],
  resetImageData: false,

  reset: {clear: false}
});

const handleImagesData = (images) => {
  formData.images = images
}


const handleAvatarClicked = () => {
  router.push({path: `/profile/${store.getters['authenticationStore/getCurrentLoggedInUser']?.id}`})
}

const handleCreateArticle = async () => {
  const articleService = UserArticleService.getInstance()

  let imagesBase64 = []
  for (const image of formData.images) {
    imagesBase64.push(await FileUtils.readFileAsBase64(image))
  }

  let article = {
    publicStatus: formData.articleVisibility,
    title: formData.title || null,
    body: formData.articleBody,
    articleMedias: []
  }

  imagesBase64.forEach((imageBase64Data, index) => {
    const {type, base64Data} = ImageUtils.extractTypeAndBase64Data(imageBase64Data)
    article.articleMedias.push({
      order: index,
      media: {
        mediaType: {type},
        data: base64Data
      },
    })
  })

  try {
    const response = await articleService.createArticle(article)
    if (response && response.success) {
      emit('success', 'Article was successfully published')
      clearFormData()
      return
    }
    emit('error', response?.error || 'An error encountered. Please try again later')
  } catch (error) {
    console.log(error)
    emit('error', 'An error encountered. Please try again later')
  }
}

onMounted(async () => {
  const userProfileService = UserProfileService.getInstance()
  try {
    const resp = await userProfileService.getUserProfile({id: store.getters['authenticationStore/getCurrentLoggedInUser']?.id})
    if (resp && resp.success) {
      const base64Data = resp.profile.profilePic?.data;
      const mediaType = resp.profile.profilePic?.mediaType;
      userImageRef.base64Data = base64Data;
      userImageRef.mediaType = mediaType?.type;
    }
  } catch (error) {
    console.log(error.message)
    console.error("Failed to get user profile details")
  }
})

</script>

<template>
  <div class="new-article-container">
    <div class="row">
      <div class="col-1">
        <user-avatar-component
            v-if="userImageRef.base64Data"
            :image-base64-data="userImageRef.base64Data"
            :image-type="userImageRef.mediaType"
            size="48px"
            class="avatar-component"
            @click="handleAvatarClicked"
        />
      </div>

      <div class="col-8">
        <article-text-area id="article-title"
                            placeholder="Title"
                            v-model="formData.title"/>
      </div>
      <div class="col-3 align-items-center align-self-start">
        <select
            id="profile-job-field-public"
            class="single-field w-100"
            v-model="formData.articleVisibility">
          <option
              v-for="option in publicOptions"
              :key="option.name"
              :value="option.value">
            {{ option.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="row">
      <!-- Text Area -->
      <div class="col-12">
        <article-text-area
            id="article-body"
            placeholder="Write an article"
            v-model="formData.articleBody"/>
      </div>
    </div>

    <div class="row justify-content-between align-items-end p-2">
      <div class="col-9">
        <vue-multi-image-upload @data-image="handleImagesData"
                                :data-reset="formData.reset"/>
      </div>
      <div class="col-3 publish-button">
        <base-button color="rgba(255, 69, 0, 1)"
                     type="submit"
                     bullet-color="black"
                     hover-color="black"
                     hover-text-color="white"
                     text="Publish"
                     @button-click="handleCreateArticle"/>
      </div>
    </div>

  </div>
</template>

<style scoped>
.new-article-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 5px 15px -24px;

  padding: 10px;
  cursor: text;
}

.publish-button {
  margin-bottom: -3px;
  margin-top: 3px;
}


.avatar-component {
  top: 10px;
  left: 10px;
  cursor: pointer !important;
}
</style>