<script setup>

import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {useStore} from "vuex";
import {ref} from "vue";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import ReactionButton from "@/components/core/buttons/ReactionButton.vue";
import CommentTextArea from "@/components/core/inputs/CommentTextArea.vue";
import DateUtils from "@/utils/DateUtils";
import AuthorCommentDeleteComponent from "@/components/articles/comments/AuthorCommentDeleteComponent.vue";
import ReactionsCountComponent from "@/components/articles/ReactionsCountComponent.vue";


const props = defineProps({
  comment: Object,
})

const store = useStore();
const emit = defineEmits(['success', 'error', 'refresh-comment','remove-comment']);
const isAvatarHovered = ref(false)
const currentUserIsOwnerRef = ref(props.comment.user.id === store.getters['authenticationStore/getCurrentLoggedInUser']?.id)

const handleAvatarClicked = () => {
  console.log("AVATAR CLICKED")
}

const handleMouseOver = () => {
  isAvatarHovered.value = true;
}

const handleMouseLeave = () => {
  isAvatarHovered.value = false;
}

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}


const handleDeleteSuccess = (successMessage) => {
  emit('remove-comment', props.comment.id)
  emit('success', successMessage)
}

const handleUserCommentReaction = async (alias) => {
  const userArticleService = UserArticleService.getInstance()
  try {
    const resp = await userArticleService.createCommentReaction(props.comment.articleId, props.comment.id, {alias})
    if (resp && resp.success) {
      await emit('refresh-comment', props.comment.articleId, props.comment.id)
      await emit('success', "Successfully reacted to comment")
      return
    }
    const errorMessage = resp && resp.error ? resp.error : "Failed to react to comment";
    emit('error', errorMessage)
  } catch (error) {
    emit('error', error.message)
  }
}

</script>

<template>
  <div class="comment-container">
    <div class="row comment-row justify-content-start">
      <div class="col-auto">
        <user-avatar-component
            :image-base64-data="props.comment.user.profilePic?.data"
            :image-type="props.comment.user.profilePic?.mediaType.type"
            size="40px"
            class="avatar-component"
            @click="handleAvatarClicked"
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave"/>
      </div>
      <div
          :class="{'col-auto':true, 'mt-2':true,'align-self-start':true, 'avatar-username':true, 'underline-effect':  isAvatarHovered }"
          @mouseover="handleMouseOver"
          @mouseleave="handleMouseLeave" @click="handleAvatarClicked">
        {{ props.comment.user.username }}
      </div>

      <div class="col d-flex justify-content-end align-items-center">
        <div class="d-flex flex-column align-items-end" style="margin-top: -12px">

          <div v-if="currentUserIsOwnerRef" class="d-flex flex-column align-items-end" style="margin-top: -1rem">
            <!--            TO USE HERE-->
            <author-comment-delete-component :article-id="props.comment.articleId"
                                             :comment-id="props.comment.id"
                                             @success="handleDeleteSuccess"
                                             @error="handleError"/>
          </div>
          <div class="col-12 small-text text-end">
            {{ DateUtils.formatDate(props.comment.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <div class="row username-comment-body-row">
      <div class="col-12 p-0 comment-body-col">
        <comment-text-area
            id="comment-body"
            read-only
            :model-value="props.comment.comment"/>
      </div>
    </div>

    <!-- total reactions and total comments-->
    <div class="row justify-content-lg-between reaction-row">
      <div class="col-2 reaction-col">
        <reaction-button padding-bottom-up="0" padding-left-right="0" @user-reaction="handleUserCommentReaction"/>
      </div>
      <div class="col-auto reaction-col">
        <reactions-count-component :reactions="props.comment.commentReactions" modal-title="Comment Reactions"/>
      </div>
    </div>
  </div>


</template>

<style scoped>

.small-text {
  font-size: 1rem;
  color: gray;
  margin-bottom: 2px;
}


.comment-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 96%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 0;
  margin: 0 15px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow like the article */
  cursor: text;
}

.username-comment-body-row {
  --bs-gutter-x: 0;
  --bs-gutter-y: 0;
}

.avatar-component {
  cursor: pointer !important;
}

.reaction-row {
  display: flex;
  --bs-gutter-x: 0;
  --bs-gutter-y: 0;
}

.comment-body-col {
  margin-bottom: -8px;
}

.comment-row {
  margin-left: 0;
  margin-right: 0;
  --bs-gutter-x: 0;
  justify-content: center;
}

.reaction-col {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}


.avatar-username {
  font-size: 1.20rem;
  font-weight: 400;
  color: #333;
  position: relative;
  transition: color 0.3s ease;
  cursor: pointer;
}

.reactions-count {
  font-size: 1rem;
  color: gray;
}

.avatar-username::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background-color: black;
  transform: scaleX(0);
  transform-origin: right; /* Start from the right when not hovered */
  transition: transform 0.3s ease;
}

.underline-effect::after {
  transform: scaleX(1); /* Scale the underline to full width */
  transform-origin: left; /* Animate from left to right when hovered */
}

.underline-effect {
  transform: scale(1.01);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  user-select: none;
}


</style>