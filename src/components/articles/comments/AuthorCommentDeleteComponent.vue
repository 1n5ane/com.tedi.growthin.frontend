<script setup>
import UserArticleService from "@/services/user/user-articles/UserArticleService";

const props = defineProps({
  articleId: {
    type: Number,
    required: true,
  },
  commentId: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['error', 'success'])
const handleDeleteComment = async () => {
  const articleService = UserArticleService.getInstance()
  try {
    const resp = await articleService.deleteComment(props.articleId, props.commentId)
    if (resp && resp.success) {
      emit('success', "Successfully deleted comment")
      return
    }
    let errorMessage = resp && !resp.success ? resp.error : "Failed to delete comment"
    emit('error', errorMessage)
  } catch (err) {
    emit('error', err.message)
  }
}
</script>

<template>
  <div class="author-comment-delete">
    <img
        src="@/assets/icons/trash.png"
        @click="handleDeleteComment"
        class="small-icon"
        alt="Author Article Settings"
    />
  </div>
</template>

<style scoped>

.author-comment-delete {
  position: relative; /* Ensure tooltip is positioned relative to this container */
  display: inline-block;
}

.small-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.author-comment-delete:hover .small-icon {
  transform: scale(1.03) rotate(35deg);
}

</style>