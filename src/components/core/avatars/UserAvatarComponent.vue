<script setup>
import BaseAvatar from "@/components/core/avatars/BaseAvatar.vue";
import baseAvatarImage from "@/assets/images/avatars/avatar_1.jpg";
import {useStore} from "vuex";
import {onMounted, onUnmounted, ref} from "vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import ImageUtils from "@/utils/ImageUtils";


const store = useStore()

const props = defineProps({
  userId: {
    type: Number,
    default: null
  },
  size: {
    type: String,
    default: '150'
  },
  imageBase64Data: {
    type: String,
    default: ''
  },
  imageType: {
    type: String,
    default: ''
  }
})

const userImageRef = ref('');

onMounted(async () => {
  if (props.userId !== null) {
    const userProfileService = UserProfileService.getInstance()
    try {
      const resp = await userProfileService.getUserProfile({id: props.userId})
      if (resp && resp.success) {
        const base64Data = resp.profile.profilePic?.data
        const mediaType = resp.profile.profilePic?.mediaType
        userImageRef.value = ImageUtils.constructBase64ImageFromTypeAndBase64Data(base64Data, mediaType)
      } else {
        console.error("Failed to get user profile picture")
      }
    } catch (error) {
      console.log(error.message)
      console.error("Failed to get user profile picture")
    }
  } else {
    //no id provided, only image
    //if image provided from props -> no need for fetching from backend
    if (!props.imageBase64Data || !props.imageType) {
      userImageRef.value = baseAvatarImage
      return
    }
    const base64Data = props.imageBase64Data
    const mediaType = props.imageType
    userImageRef.value = ImageUtils.constructBase64ImageFromTypeAndBase64Data(base64Data, mediaType)
  }
})

onUnmounted(() => {
  // Clear the userImageRef when the component is unmounted
  userImageRef.value = '';
});


const emit = defineEmits(["avatar-hovered", "avatar-clicked"])

const handleMouseOver = () => {
  emit("avatar-hovered", true);
};

const handleMouseLeave = () => {
  emit("avatar-hovered", false);
};

const handleClick = () => {
  emit("avatar-clicked")
}

</script>

<template>
  <base-avatar v-if="userImageRef"
               :no-hover="true"
               :image="userImageRef"
               :size="props.size"
               @mouseover="handleMouseOver"
               @mouseleave="handleMouseLeave" @click="handleClick"/>

</template>

<style scoped>
</style>