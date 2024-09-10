<script setup>
import {computed, onMounted, ref} from "vue";
import ImageUtils from "@/utils/ImageUtils";
import {useStore} from "vuex";

const props = defineProps({
  paddingLeftRight: {
    type: String,
    default: "15px"
  },
  paddingBottomUp: {
    type: String,
    default: "10px"
  }
})

const isReactionsVisible = ref(false);
const emit = defineEmits(['user-reaction'])
const store = useStore()
let openTimeout = null
let closeTimeout = null;
// Available reactions
const reactions = computed(() => store.getters['reactionStore/getAvailableReactions'])


//emit selected reaction to parent
const handleSelectReaction = async (alias) => {
  isReactionsVisible.value = false;
  emit('user-reaction', alias)
};

const closeReactions = () => {
  if (openTimeout) {
    clearTimeout(openTimeout);
  }

  closeTimeout = setTimeout(() => {
    isReactionsVisible.value = false;
  }, 200);
};


const openReactions = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
  }

  openTimeout = setTimeout(() => {
    isReactionsVisible.value = true;
  }, 300); // 300ms delay before opening
};

const toggleReactions = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
  }
  if (openTimeout) {
    clearTimeout(openTimeout);
  }
  isReactionsVisible.value = !isReactionsVisible.value;
}

onMounted(() => {

})

</script>

<template>
  <div class="reaction-button-container" @click.self="closeReactions">
    <!-- Main React Button -->
    <button :class="['react-btn', { 'react-btn-selected': isReactionsVisible }]"
            @mouseover="openReactions"
            @mouseout="closeReactions"
            @click="toggleReactions"
            :style="{ padding: `${props.paddingBottomUp} ${props.paddingLeftRight}` }">
      React
    </button>

    <!-- Reactions Toolbox -->
    <div v-if="isReactionsVisible" @mouseover="openReactions" @mouseout="closeReactions"
         class="reactions-toolbox">
      <button
          v-for="({id, alias, image}) in reactions"
          :key="id"
          class="reaction"
          @click="handleSelectReaction(alias)">
        <img class="reaction-image"
             :alt="`Reaction ${alias}`"
             :src="ImageUtils.constructBase64ImageFromTypeAndBase64Data(image,'image/png')"/>
      </button>
    </div>
  </div>
</template>

<style scoped>
.reaction-button-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.react-btn {
  width: 100%;
  background-color: white;
  color: black;
  border: 1px solid black;
  cursor: pointer;
  font-size: 1rem;
  outline: none;
  transition: background-color 0.3s ease-out, color 0.3s ease-out;
  border-radius: 3px 0 0 0;
}

.react-btn-selected {
  background-color: rgba(255, 69, 0, 1);
  color: white;
}

.react-btn:hover {
  background-color: rgba(255, 69, 0, 1);
  color: white;
}


.reactions-toolbox {
  display: flex;
  position: absolute;
  bottom: 110%; /* Positioning above the button */
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.reaction {
  background: transparent;
  border: none;
  padding: 5px;
  margin: 0 0 0 5px;
  cursor: pointer;
}

.reaction-image {
  width: 35px;
  height: 35px;
}


.reaction:hover {
  transform: scale(1.1);
}
</style>