<script setup>

import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {onMounted, reactive, ref} from "vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {useStore} from "vuex";
import ArticleTextArea from "@/components/core/inputs/ArticleTextArea.vue";
import BaseButton from "@/components/core/buttons/BaseButton.vue";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()
const userImageRef = reactive({
  base64Data: '',
  mediaType: ''
})

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['error', 'success'])
/** @type {import("@/components/core/inputs/ArticleTextArea").default} */
const commentBodyRef = ref(null)


const focusOnNewCommentBody = () => {
  if(commentBodyRef.value){
    commentBodyRef.value.focus()
  }
}

const clearFormData = () => {
  formData.commentBody = ''
}
const formData = reactive({
  commentBody: '',
});


const handleAvatarClicked = () => {
  router.push({path: `/profile/${store.getters['authenticationStore/getCurrentLoggedInUser']?.id}`})
}

const handleCreateComment = async () => {
  const articleService = UserArticleService.getInstance()
  try {
    const resp = await articleService.createComment(props.articleId, {comment: formData.commentBody})
    if (resp && resp.success) {
      await emit('success', 'Successfully commented')
      clearFormData()
      return
    }
    const errorMessage = resp ? resp.error : "Failed to comment article. Please try again"
    await emit('error', errorMessage)
  } catch (error) {
    emit('error', 'Failed to comment article. Please try again')
  }
}

onMounted(async () => {
  const userProfileService = UserProfileService.getInstance()
  try {
    const resp = await userProfileService.getUserProfile({id: store.getters['authenticationStore/getCurrentLoggedInUser'].id})
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

defineExpose({focusOnNewCommentBody})

</script>

<template>
  <div class="new-comment-container">
    <div class="row comment-row justify-content-start">
      <div class="col-auto align-self-start">
        <user-avatar-component
            v-if="userImageRef.base64Data"
            :image-base64-data="userImageRef.base64Data"
            :image-type="userImageRef.mediaType"
            size="40px"
            class="avatar-component"
            @click="handleAvatarClicked"/>
      </div>

      <!-- Text Area -->
      <div class="col-10">
        <article-text-area
            ref="commentBodyRef"
            id="comment-body"
            placeholder="Write a comment"
            v-model="formData.commentBody"/>
      </div>

      <div class="col comment-button">
        <base-button color="rgba(255, 69, 0, 1)"
                     type="submit"
                     bullet-color="black"
                     hover-color="black"
                     hover-text-color="white"
                     text=">"
                     @button-click="handleCreateComment"/>
      </div>

    </div>
  </div>
</template>

<style scoped>
.new-comment-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 0;
  margin: 2px 15px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow like the article */
  cursor: text;
}

.comment-row {
  margin-left: 0;
  margin-right: 0;
  --bs-gutter-x: 0;
  justify-content: center;
  align-items: center;
}


.comment-button {
  align-self: end;
}


.avatar-component {
  top: 10px;
  left: 10px;
  cursor: pointer !important;
}
</style>