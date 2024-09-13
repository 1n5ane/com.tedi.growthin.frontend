<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import {useStore} from "vuex";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import NewCommentComponent from "@/components/articles/comments/NewCommentComponent.vue";
import CommentComponent from "@/components/articles/comments/CommentComponent.vue";

const props = defineProps({
  userId: {
    type: Number,
    default: null
  },
  pageSize: {
    type: Number,
    default: 1
  },
  articleId: {
    type: Number,
    required: true
  }
});

const store = useStore()
const emit = defineEmits(['error', 'success', 'comment-creation-success'])
const commentsRef = ref(null)

/** @type {import( "@/components/articles/comments/NewCommentComponent").default} */
const newCommentRef = ref(null)

const userArticleService = UserArticleService.getInstance()
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.pageSize


const focusNewComment = () => {
  if (newCommentRef.value) {
    newCommentRef.value.focusOnNewCommentBody();
  }
}

const handleCommentCreationSuccess = async (successMessage) => {
  emit('comment-creation-success', successMessage)
  currentPage.value = 0
  commentsRef.value = await listAllArticleComments(0, props.articleId)
}

const listAllArticleComments = async (page, articleId) => {
  let comments = []
  try {
    const response = await userArticleService.listAllArticleComments(articleId, page, itemsPerPage);


    if (response && response.success) {
      comments = response.articleComments;
      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    } else {
      const errorMessage = response && response.error ? response.error : "Failed to load comments"
      emit("error", errorMessage);
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to load user comment");
  }
  return comments;
}

const handlePageChange = async (page) => {
  currentPage.value = page;
  const articles = await listAllArticleComments(page, props.articleId)
  commentsRef.value = commentsRef.value.concat(articles);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

onMounted(async () => {
  try {
    await store.dispatch('reactionStore/fetchAvailableReactions')
  } catch (error) {
    emit('error', error.message)
  }

  commentsRef.value = await listAllArticleComments(0, props.articleId)
})

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const handleCommentRemove = (commentId) => {
  // Find the index of the article in the articlesRef array
  const index = commentsRef.value.findIndex(comment => comment.id === commentId);
  if (index !== -1) {
    commentsRef.value.splice(index, 1);
  }
}

//      for the sake of assignment comment response contains all reactions
const handleCommentRefresh = async (articleId, commentId) => {
  try {
    const response = await userArticleService.findCommentByArticleIdAndCommentId(articleId, commentId);
    if (response && response.success) {
      const updatedComment = response.comment;

      // Find the index of the comment in the commentsRef array
      const index = commentsRef.value.findIndex(comment => comment.id === commentId);

      if (index !== -1) {
        // Replace the old comment with the updated one
        commentsRef.value[index] = updatedComment;
      }
    } else {
      const errorMessage = response && response.error ? response.error : "Failed to refresh comment";
      emit("error", errorMessage);
    }
  } catch (error) {
    console.error("Failed to refresh comment:", error.message);
    emit('error', "Failed to refresh comment");
  }
}


onUnmounted(() => {
  commentsRef.value = []
  currentPage.value = 0
  hasMoreRef.value = false
  totalPages.value = 1
})


defineExpose({focusNewComment})

</script>

<template>
  <div class="comment-list-wrapper">
    <div class="comment-list" :style="{'min-height': commentsRef && commentsRef.length ? '165px' : '0px'}">
      <div v-for="comment in commentsRef" :key="comment.id" class="row comment-component justify-content-center">
        <comment-component :comment="comment"
                           @success="handleSuccess"
                           @error="handleError"
                           @refresh-comment="handleCommentRefresh"
                           @remove-comment="handleCommentRemove"/>
      </div>

      <div class="row show-more-row">
        <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
          Show more ▼
        </div>
      </div>
    </div>
  </div>
  <div class="comment-list">
    <new-comment-component id="new-comment" ref="newCommentRef" :article-id="props.articleId" @error="handleError"
                           @success="handleCommentCreationSuccess"/>
  </div>
</template>

<style scoped>

.show-more-row {
  margin-top: -10px;
}

.show-more-text {
  display: block;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: rgba(255, 69, 0, 1);
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.show-more-text:hover {
  color: rgba(220, 49, 0, 1);
  text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.show-more-text:active {
  color: rgba(200, 54, 0, 1);
}

.comment-list-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.comment-component {
  width: 100%;
  max-width: 100%;
}

.comment-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 75vh;
  width: 100%;
  position: relative;
}
</style>