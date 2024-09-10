<script setup>
import {ref} from "vue";
import UserArticleService from "@/services/user/user-articles/UserArticleService";

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  },
  articleVisibility: {
    type: String,
    required: true
  }
})

const showModal = ref(false);
const emit = defineEmits(['error', 'update-visibility-success', 'delete-success'])
const toggleModal = () => {
  showModal.value = !showModal.value;
};


const handleDelete = () => {
  showModal.value = false;
  deleteArticle(props.articleId)
};


const handleHide = async () => {
  showModal.value = false;
  await updateArticleVisibility(props.articleId, "HIDDEN")
};

const handlePublic = async () => {
  showModal.value = false;
  await updateArticleVisibility(props.articleId, "PUBLIC")
}

const handlePrivate = async () => {
  showModal.value = false;
  await updateArticleVisibility(props.articleId, "CONNECTED_NETWORK")
}

const updateArticleVisibility = async (articleId, publicStatus) => {
  const articleService = UserArticleService.getInstance()
  try {
    const resp = await articleService.updateArticle({id: articleId, publicStatus: publicStatus})
    if (resp && resp.success) {
      emit('update-visibility-success', 'Successfully update visibility of article')
      return
    }
    let errorMessage = resp && !resp.success ? resp.error : "Failed to update visibility of article"
    emit('error', errorMessage)
  } catch (err) {
    emit('error', err.message)
  }
}

const deleteArticle = async (articleId) => {
  const articleService = UserArticleService.getInstance()
  try {
    const resp = await articleService.deleteArticle(articleId)
    if (resp && resp.success) {
      emit('delete-success', "Successfully deleted article")
      return
    }
    let errorMessage = resp && !resp.success ? resp.error : "Failed to update visibility of article"
    emit('error', errorMessage)
  } catch (err) {
    emit('error', err.message)
  }
}

</script>

<template>
  <div class="author-article-settings">
    <img
        src="@/assets/icons/setting.png"
        @click="toggleModal"
        class="small-icon"
        alt="Author Article Settings"
    />

    <!-- Tooltip positioned to the left of the icon -->
    <div v-if="showModal" class="tooltip">
      <ul class="tooltip-options">
        <li @click="handleDelete">Delete</li>
        <li v-if="['PUBLIC','CONNECTED_NETWORK'].includes(props.articleVisibility)" @click="handleHide">Make Hidden</li>
        <li v-if="['HIDDEN', 'CONNECTED_NETWORK'].includes(props.articleVisibility)" @click="handlePublic">Make Public
        </li>
        <li v-if="['HIDDEN', 'PUBLIC'].includes(props.articleVisibility)" @click="handlePrivate">Make Private</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.author-article-settings {
  position: relative; /* Ensure tooltip is positioned relative to this container */
  display: inline-block;
}

.small-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.author-article-settings:hover .small-icon {
  transform: scale(1.03) rotate(60deg);
}

.tooltip {
  position: absolute;
  top: 4rem;
  left: -9.4rem;
  transform: translateY(-50%);
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 0.3rem 0;
  z-index: 10;
  width: 150px; /* Adjust the width of the tooltip */
  opacity: 1;
}

.tooltip-options {
  list-style: none;
  margin: 0;
  padding: 0;
}


.tooltip-options li {
  display: block;
  width: 100%;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.tooltip-options li:hover {
  background: rgba(255, 69, 0, 1);
  color: white
}

.tooltip-options li:last-child {
  border-bottom: none;
}
</style>