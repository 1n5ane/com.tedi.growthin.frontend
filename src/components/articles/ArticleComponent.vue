<script setup>

import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {useStore} from "vuex";
import {onMounted, ref, watch} from "vue";
import ArticleTextArea from "@/components/core/inputs/ArticleTextArea.vue";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import ReactionButton from "@/components/core/buttons/ReactionButton.vue";
import CommentButton from "@/components/core/buttons/CommentButton.vue";
import CommentListComponent from "@/components/articles/comments/CommentListComponent.vue";
import DateUtils from "../../utils/DateUtils";
import AuthorArticleSettingsComponent from "@/components/articles/AuthorArticleSettingsComponent.vue";
import ArticleMediaComponent from "@/components/articles/ArticleMediaComponent.vue";
import ReactionsCountComponent from "@/components/articles/ReactionsCountComponent.vue";
import {useRouter} from "vue-router";


const props = defineProps({
  article: Object,
  commentPageSize: {
    type: Number,
    default: 2
  }
})

const store = useStore();
const router = useRouter();
const emit = defineEmits(['success', 'error', 'refresh-article', 'remove-article']);
const isAvatarHovered = ref(false);
const totalArticleCommentsRef = ref(null);

/** @type {import('@/components/articles/comments/CommentListComponent').default} */
const commentListRef = ref(null);
const currentUserIsOwnerRef = ref(props.article.user.id === store.getters['authenticationStore/getCurrentLoggedInUser']?.id)

const handleAvatarClicked = () => {
  router.push({path: `/profile/${props.article.user.id}`})
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

const handleCommentSuccess = async (successMessage) => {
  handleSuccess(successMessage)
  await fetchTotalComments()
}

const handleCommentButtonClick = () => {
//   focus on element with id new-comment
  if (commentListRef.value) {
    commentListRef.value.focusNewComment()
  }
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleUpdateVisibilitySuccess = (successMessage) =>{
  //refresh certain article for visibility change to appear (article refresh)
  emit('refresh-article', props.article.id)
  emit('success', successMessage)
}

const handleDeleteSuccess = (successMessage) => {
  emit('remove-article', props.article.id)
  emit('success', successMessage)
}

const handleUserArticleReaction = async (alias) => {
  const userArticleService = UserArticleService.getInstance()
  try {
    const resp = await userArticleService.createArticleReaction(props.article.id, {alias})
    if (resp && resp.success) {
      await emit('refresh-article', props.article.id)
      await emit('success', "Successfully reacted to article")
      return
    }
    const errorMessage = resp && resp.error ? resp.error : "Failed to react to article";
    emit('error', errorMessage)
  } catch (error) {
    emit('error', 'Failed to react to article')
  }
}

const fetchTotalComments = async () => {
  const userArtricleService = UserArticleService.getInstance()
  try {
    const resp = await userArtricleService.countAllArticleComments(props.article.id)
    if (resp && resp.success) {
      totalArticleCommentsRef.value = resp.count
    }
  } catch (error) {
    console.error("Failed to fetch count of total article comments")
  }
}

onMounted(async () => {
  await fetchTotalComments()
})

</script>

<template>
  <div class="article-container">
    <div class="row article-row justify-content-start">
      <div class="col-auto avatar-column">
        <user-avatar-component
            :image-base64-data="props.article.user.profilePic?.data"
            :image-type="props.article.user.profilePic?.mediaType.type"
            size="46px"
            class="article-avatar-component"
            @click="handleAvatarClicked"
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave"/>
      </div>

      <div
          :class="{'col-auto':true,'mt-2':true,'avatar-username':true, 'text-start':true,'underline-effect':  isAvatarHovered }"
          @mouseover="handleMouseOver"
          @mouseleave="handleMouseLeave" @click="handleAvatarClicked">
        {{ props.article.user.username }}
      </div>

      <div class="col d-flex justify-content-end align-items-center">
        <div class="d-flex flex-column align-items-end">
        <!-- If currentLOggedInUser is author of article-->
          <div v-if="currentUserIsOwnerRef" class="d-flex flex-column align-items-end" style="margin-top: -1rem">
            <author-article-settings-component :article-id="props.article.id"
                                               :article-visibility="props.article.publicStatus"
                                               @update-visibility-success="handleUpdateVisibilitySuccess"
                                               @delete-success="handleDeleteSuccess"
                                               @error="handleError"/>
          </div>

          <div class="col-12 small-text text-end">
            {{ DateUtils.formatDate(props.article.createdAt) }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="props.article.title" class="row justify-content-center"
         style="padding:0 25px; ,--bs-gutter-x: 0; --bs-gutter-y: 0;">
      <div class="col-12 text-center">
        <article-text-area id="article-title"
                           class="article-title"
                           read-only
                           text-center
                           :model-value="props.article.title"/>
      </div>
    </div>
    <article-text-area
        id="article-body"
        read-only
        class="article-body-content"
        :model-value="props.article.body"/>


    <article-media-component v-if="props.article.articleMedias" :article-medias="props.article.articleMedias"/>

    <!-- total reactions and total comments-->
    <div class="row mt-2 justify-content-lg-between">
      <div class="col-auto">
        <reactions-count-component :reactions="props.article.articleReactions" modal-title="Article Reactions"/>
      </div>
      <div class="col-auto">
        <span v-if="totalArticleCommentsRef !== null" class="comments-count">
          {{ totalArticleCommentsRef }} Comments</span>
      </div>
    </div>
  </div>

  <div class="row react-comment-article-row">
    <div class="col-6 reaction-col">
      <reaction-button @user-reaction="handleUserArticleReaction"/>
    </div>
    <div class="col-6 comment-col">
      <comment-button @click="handleCommentButtonClick"/>
    </div>
  </div>

  <div class="row react-comment-article-row justify-content-center">
    <div class="col-12 align-self-center">
      <comment-list-component ref="commentListRef"
                              :page-size="props.commentPageSize"
                              :article-id="props.article.id"
                              @success="handleSuccess"
                              @comment-creation-success="handleCommentSuccess"
                              @error="handleError"/>
    </div>
  </div>


</template>

<style scoped>

.article-container {
  background-color: white;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 9px 9px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 14px;
  padding: 14px;
}

.small-text {
  font-size: 1rem;
  color: gray;
  margin-bottom: 2px;
}

.row {
  margin-left: 0;
  margin-right: 0;
}

.reaction-col,
.comment-col {
  padding: 0;
  display: flex;
  justify-content: center;
}

.article-row {
  margin-left: 0;
  margin-right: 0;
  --bs-gutter-x: 0;
}

.react-comment-article-row {
  margin-left: 0;
  margin-right: 0;
  --bs-gutter-x: 0;
}

.article-body-content {
  width: 100%;
  word-wrap: break-word;
}

.avatar-column {
  padding: 0px;
}

.article-title {
  font-size: 1.2rem;
}

.article-avatar-component {
  display: flex;
  flex-direction: row;
  justify-content: start;
  cursor: pointer !important;
}

.avatar-username {
  font-size: 1.4rem;
  font-weight: 400;
  color: #333;
  position: relative;
  transition: color 0.3s ease;
  cursor: pointer;
}

.comments-count {
  font-size: 1rem;
  color: gray;
}

.avatar-username::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0px;
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