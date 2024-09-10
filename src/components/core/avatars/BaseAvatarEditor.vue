<script setup>
import avatar3 from "@/assets/images/avatars/avatar_3.jpg";
import {VueAvatar} from "vue-avatar-editor-improved";
import {ref} from 'vue';
import BaseButton from "@/components/core/buttons/BaseButton.vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `avatar-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
  },
  image: {
    type: String,
    default: avatar3
  },
  width: {
    type: Number,
    default: 100
  },
  height: {
    type: Number,
    default: 100
  },
  scale: {
    type: Number,
    default: 1.50
  },
  borderRadius: {
    type: Number,
    default: 200
  },
})

const scaleRef = ref(props.scale);
const rotationRef = ref(0);
const imageRef = ref(props.image);

const emit = defineEmits(['edit-completed'])
/**
 * A reference to the avatar container element.
 * @type {import('vue').Ref<HTMLDivElement | null>}
 */
const avatarContainerRef = ref(null);

/** @type {import('vue-avatar-editor-improved').default} */
const vueavatar = ref(null);

const applyChanges = () => {
  if (vueavatar) {
    let imgData = vueavatar.value.getImageScaled().toDataURL()
    emit("edit-completed", imgData)
  }
};

const onImageReady = () => {
  scaleRef.value = props.scale
  rotationRef.value = 0
}

const handleScroll = (event) => {
  // Adjust the scale value based on the scroll delta
  scaleRef.value = Math.min(Math.max(scaleRef.value + event.deltaY * -0.001, 1), 3);
  event.preventDefault();
  event.stopPropagation();
};
</script>

<template>
  <div class="avatar-container" :ref="avatarContainerRef">
    <vue-avatar
        :width="width"
        :height="height"
        :rotation="rotationRef"
        :image = "imageRef"
        :border="10"
        :scale="scaleRef"
        :border-radius="borderRadius"
        ref="vueavatar"
        @wheel="handleScroll"
        @vue-avatar-editor:image-ready="onImageReady">
    </vue-avatar>
    <BaseButton color="rgba(255, 69, 0, 1)" bullet-color="black" hover-color="black"
                text-color="white" hover-text-color="white" text="Apply"
                type="button" @button-click="applyChanges"/>
  </div>

</template>

<style scoped>
.avatar-container {
  display: inline-block;
  overflow: hidden;
}
</style>