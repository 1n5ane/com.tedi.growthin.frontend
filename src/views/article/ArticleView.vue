<script setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import HomeProfileComponent from "@/components/profile/HomeProfileComponent.vue";
import ArticleListComponent from "@/components/articles/ArticleListComponent.vue";
import {useRoute, useRouter} from "vue-router";
import UserArticleService from "@/services/user/user-articles/UserArticleService";

const emit = defineEmits(['update-show-header', 'success', 'error']);
const route = useRoute()
const router = useRouter()
const articlesRef = ref(null)

const routeArticleId = computed(() => route.params.articleId)

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

const fetchArticle = async (articleId) => {
  const articleService = UserArticleService.getInstance()
  const resp = await articleService.findArticleById(articleId)
  if (resp) {
    return resp.article
  }
  return null
}

onMounted(async () => {
  emit('update-show-header', true);
  if (routeArticleId.value === null || routeArticleId.value === undefined || Number.isNaN(Number(routeArticleId.value))) {
    await emit('error', 'Invalid article id')
    await router.replace({name: 'home'})
    return
  }

  try {
    let article = await fetchArticle(routeArticleId.value)
    if (!article) {
      emit('error', 'Article not found')
      await router.replace({name: 'home'})
      return
    }
    articlesRef.value = [article]
  } catch (error) {
    if (error.status === 403) {
      emit('error', 'Access is forbidden')
      await router.replace({name: 'home'})
      return
    } else {
      console.log(error)
      emit('error', 'Failed to load article. Refresh required')
    }
  }
})

onUnmounted(async () => {
  emit('update-show-header', false);
})

</script>

<template>
  <div class="home-container" style="overflow: hidden">
    <div class="row">
      <div class="col-3">
        <home-profile-component/>
      </div>


      <div class="col-6 align-self-center">
        <article-list-component v-if="articlesRef"
                                :comment-page-size="20"
                                :article-list="articlesRef"
                                hide-new-article
                                @success="handleSuccess"
                                @error="handleError"/>
      </div>

      <div class="col-3">
        maybe nothing here
      </div>

    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9f9;
  margin: 0;
  height: 94vh;
}

</style>