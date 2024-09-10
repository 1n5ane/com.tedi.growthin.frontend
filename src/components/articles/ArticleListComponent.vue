<script setup>
import ArticleComponent from "@/components/articles/ArticleComponent.vue";
import NewArticleComponent from "@/components/articles/NewArticleComponent.vue";
import {onMounted, ref} from "vue";
import {useStore} from "vuex";
import UserArticleService from "@/services/user/user-articles/UserArticleService";

const props = defineProps({
  userId: {
    type: Number,
    default: null
  },
  articlePageSize: {
    type: Number,
    default: 2
  },
  commentPageSize:{
    type: Number,
    default: 2
  }
});

const store = useStore()
const emit = defineEmits(['success', 'error'])
const articlesRef = ref(null)


const userArticleService = UserArticleService.getInstance()
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const itemsPerPage = props.articlePageSize


const listAllArticles = async (page, userId) => {
  let articles = []
  try {
    let response
    if (userId === null) {
      //feth all articles user can see
      response = await userArticleService.listAllArticles(page, itemsPerPage);
    } else {
      response = await userArticleService.listAllArticlesByUserId(userId, page, itemsPerPage);
    }

    if (response && response.success) {
      articles = response.articles;
      totalPages.value = response.totalPages
      hasMoreRef.value = page < response.totalPages - 1
    } else {
      const errorMessage = response && response.error ? response.error : "Failed to load user articles"
      emit("error", errorMessage);
    }
  } catch (error) {
    console.error(error.message)
    emit("error", "Failed to load user articles");
  }
  return articles;
}

const handlePageChange = async (page) => {
  currentPage.value = page;
  const articles = await listAllArticles(page, props.userId)
  articlesRef.value = articlesRef.value.concat(articles);
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

  articlesRef.value = await listAllArticles(0, props.userId)
})

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

//      for the sake of assignment article response contains all reactions (no paging implemented on seperate endpoint in the backend)
//      The same applies for comment reactions
const handleArticleRefresh = async (articleId) => {
  try {
    const response = await userArticleService.findArticleById(articleId);
    if (response && response.success) {
      const updatedArticle = response.article;

      // Find the index of the article in the articlesRef array
      const index = articlesRef.value.findIndex(article => article.id === articleId);

      if (index !== -1) {
        // Replace the old article with the updated one
        articlesRef.value[index] = updatedArticle;
      }
    } else {
      const errorMessage = response && response.error ? response.error : "Failed to refresh article";
      emit("error", errorMessage);
    }
  } catch (error) {
    console.error("Failed to refresh article:", error.message);
    emit('error', "Failed to refresh article");
  }
}

const handleArticleRemove = (articleId) => {
  // Find the index of the article in the articlesRef array
  const index = articlesRef.value.findIndex(article => article.id === articleId);
  if (index !== -1) {
    articlesRef.value.splice(index, 1);
  }
}

const refreshAllArticleList = async (successMessage) => {
  emit('success', successMessage)
  currentPage.value = 0
  articlesRef.value = await listAllArticles(0, props.userId)
}

</script>

<template>
  <div class="article-list-wrapper">
    <div class="article-list">
      <new-article-component @error="handleError" @success="refreshAllArticleList"/>
      <div v-for="article in articlesRef" :key="article.id" class="row article-component justify-content-center">
        <article-component :article="article"
                           :comment-page-size="props.commentPageSize"
                           @success="handleSuccess"
                           @error="handleError"
                           @refresh-article="handleArticleRefresh"
                           @remove-article="handleArticleRemove"/>
      </div>

      <div class="row show-more-row">
        <div v-if="hasMoreRef" class="col-12 show-more-text align-items-center" @click="handleShowMore">
          Show more ▼
        </div>
        <div v-if="articlesRef!==null && !articlesRef.length" class="col align-self-center">
          That's all about it
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.show-more-row {
  margin-top: -3.5rem;
}

.article-list-wrapper {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.article-component {
  width: 100%;
  max-width: 100%;
}

.article-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 90vh;
  width: 100%;
  position: relative;
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

</style>