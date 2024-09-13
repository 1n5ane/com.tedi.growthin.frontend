<script setup>
import {onMounted, onUnmounted} from "vue";
import HomeProfileComponent from "@/components/profile/HomeProfileComponent.vue";
import ArticleListComponent from "@/components/articles/ArticleListComponent.vue";

const emit = defineEmits(['update-show-header', 'success', 'error']);

const handleSuccess = (successMessage) => {
  emit('success', successMessage)
}

const handleError = (errorMessage) => {
  emit('error', errorMessage)
}

onMounted(() => {
  //toggle navbar
  emit('update-show-header', true);
})

onUnmounted(() => {
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
        <article-list-component :article-page-size="6"
                                :comment-page-size="2"
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
  height: 99%;
}

</style>