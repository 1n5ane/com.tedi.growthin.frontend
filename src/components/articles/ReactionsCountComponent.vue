<script setup>
import {computed, onMounted, ref} from 'vue';
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import {useStore} from "vuex";
import ImageUtils from "@/utils/ImageUtils";

const props = defineProps({
  reactions: Array,
  modalTitle: {
    type: String,
    default: 'Reactions'
  }
});

const isReactionsHovered = ref(false);
const isModalVisible = ref(false);  // Tracks modal visibility
const store = useStore()
const availableReactions = computed(() => store.getters['reactionStore/getAvailableReactions'])

const handleMouseOver = () => {
  isReactionsHovered.value = true;
};

const handleMouseOut = () => {
  isReactionsHovered.value = false;
};

const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value;  // Toggle modal visibility
};


const getImageDataFromAlias = (alias) => {
  const reaction = availableReactions.value.find((reaction) => {
    return reaction.alias === alias;
  });

  return ImageUtils.constructBase64ImageFromTypeAndBase64Data(reaction.image, 'image/png')
}

const handleReactionRowClicked = (userId) => {
  // TODO: redirect to user profile
  //redirect to user profile
}

</script>

<template>
  <span :class="{'reactions-count': true, 'underline-effect': isReactionsHovered}"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
        @click="toggleModal">
    {{ props.reactions.length }} Reactions
  </span>

  <!-- Modal -->
  <div v-if="isModalVisible" class="modal-overlay" @click="toggleModal">
    <div class="modal-content" @click.stop>
      <h4>{{ props.modalTitle }}</h4>
      <ul>
        <li v-for="(reaction, index) in props.reactions" :key="index" @click="handleReactionRowClicked(reaction.user.id)">
          <div class="row p-2 no-gutter-x justify-content-center align-items-center">
            <user-avatar-component :image-base64-data="reaction.user.profilePic?.data"
                                   :image-type="reaction.user.profilePic?.mediaType.type"
                                   class="avatar-component"
                                   size="40px"/>
            <div class="col-8 align-items-center">
              <div v-text="reaction.user.username"></div>
            </div>

            <div class="col-2 text-center">
              <img v-if="reaction.reaction"
                   :src="getImageDataFromAlias(reaction.reaction.alias)"
                   alt="Reaction Image"
                   class="reaction-image"/>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.reactions-count {
  font-size: 1rem;
  color: gray;
  position: relative;
  cursor: pointer;
}

.no-gutter-x {
  --bs-gutter-x: 0px;
}


.avatar-component {
  cursor: pointer !important;
}


.reactions-count::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 2px;
  background-color: gray;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.underline-effect::after {
  transform: scaleX(1);
  transform-origin: left;
}

.underline-effect {
  transform: scale(1.01);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  user-select: none;
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
  align-items: flex-start;
  padding-top: 5rem;
  z-index: 10000

}

.modal-content {
  background: white;
  padding: 2px;
  border-radius: 8px;
  max-width: 300px;
  max-height: 80vh;
  width: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-content ul {
  list-style: none;
  padding: 0;
}

li:hover {
  background-color: #f0f0f0;
  cursor: pointer;
  user-select: none;
}

.reaction-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

</style>