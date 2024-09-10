<template>
  <div>
    <!-- List of small images -->
    <div v-if="articleMediasRef" class="media-list">
      <img v-for="(imageData, index) in articleMediasRef" :key="index"
           :src="imageData"
           :alt="`articleImage${index}`"
           class="media-thumbnail"
           @click="openModal(imageData)"/>
    </div>

    <!-- Modal for enlarged image -->
    <div v-if="isModalVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content">
        <img :src="selectedImage" class="modal-image"/>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import ImageUtils from "@/utils/ImageUtils";

const props = defineProps({
  articleMedias: Array
});
const articleMediasRef = ref(null);

const isModalVisible = ref(false);
const selectedImage = ref('');

const sortedArticleMedias = computed(() => {
  // Create a copy of the array to sort
  const mediaArray = [...props.articleMedias];
  return mediaArray.sort((a, b) => a.order - b.order);
});

// Method to open the modal with a selected image
const openModal = (imageUrl) => {
  selectedImage.value = imageUrl;
  isModalVisible.value = true;
};

// Method to close the modal
const closeModal = () => {
  isModalVisible.value = false;
};

const transformImages = (articleMedias) => {
  //construct image from base64 and type
  let images = []
  articleMedias.forEach((am)=>{
    images.push(ImageUtils.constructBase64ImageFromTypeAndBase64Data(am.media.data, am.media.mediaType.type))
  })
  return images
}

onMounted(() => {
  articleMediasRef.value = transformImages(sortedArticleMedias.value);
})
</script>

<style scoped>
.media-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.media-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index:10000
}

.modal-content {
  background: rgba(255,255,255,0.3);
  padding: 20px;
  border-radius: 8px;
  position: relative;
}

.modal-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 69, 0, 1);
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.modal-close:hover {
  background: black;
  transform: scale(1.02);
}
</style>