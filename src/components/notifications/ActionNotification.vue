<script setup>
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";
import DateUtils from "@/utils/DateUtils";
import ImageUtils from "@/utils/ImageUtils";
import {computed} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const props = defineProps({
  notification: Object
})
const store = useStore()
const router = useRouter()

const availableReactions = computed(() => store.getters['reactionStore/getAvailableReactions'])

const getImageDataFromAlias = (alias) => {
  const reaction = availableReactions.value.find((reaction) => {
    return reaction.alias === alias;
  });
  return ImageUtils.constructBase64ImageFromTypeAndBase64Data(reaction.image, 'image/png')
}

const handleNotificationClick = () => {
  console.log(props.notification)
  if (props.notification.notificationType.type === 'ARTICLE_REACTION') {
    router.push({
      path:`/article/${props.notification.articleReaction.articleId}`
    })
  } else if (props.notification.notificationType.type === 'ARTICLE_COMMENT') {
    router.push({
      path:`/article/${props.notification.articleComment.articleId}`
    })
  } else if (props.notification.notificationType.type === 'ARTICLE_COMMENT_REACTION') {
    router.push({
      path:`/article/${props.notification.articleCommentReaction.articleId}`
    })
  } else {
    // it's a CONNECTION_REQUEST
    if (props.notification.userConnectionRequest.status === 'PENDING') {
      //route to connection request tab of my network
      router.push({
        name: 'my-network',
        query: {
          tab: 'connection-requests'
        }
      })
    } else {
      //if status is accepted route to my network
      router.push({name: 'my-network'})
    }
  }
}

const handleAvatarClicked = () => {
  router.push({path: `/profile/${props.notification.user.id}`})
}

</script>

<template>
  <div class="action-notification-container" @click="handleNotificationClick"
       :style="{'background-color':props.notification.viewed?'rgba(255, 69, 0, 0)':'rgba(255, 69, 0, 0.1)'}">
    <div class="row justify-content-start align-items-center">
      <!-- Avatar Section -->
      <div class="col-auto d-flex align-self-center" style="padding-right: 0.8rem" @click.stop>
        <user-avatar-component size="55px"
                               class="avatar-component"
                               @avatar-clicked="handleAvatarClicked"
                               :image-base64-data="props.notification.user.profilePic?.data"
                               :image-type="props.notification.user.profilePic?.mediaType.type"/>
      </div>

      <div class="col text-start">
        <div class="d-flex justify-content-between">
          <div class="username" v-text="props.notification.user.username"></div>
          <div class="small-text text-end">
            {{ DateUtils.formatDate(props.notification.createdAt) }}
          </div>
        </div>
        <div class="notification-content">
          <!--Article Reaction Notificaiton Content-->
          <div v-if="props.notification.notificationType.type==='ARTICLE_REACTION'">
            <div class="reaction-wrapper">
              <span class="notification-content-text">reacted with</span>
              <img v-if="props.notification.articleReaction"
                   :src="getImageDataFromAlias(props.notification.articleReaction.reaction.alias)"
                   alt="Reaction Image"
                   class="reaction-image "/>
              <span class="notification-content-text">to your article</span>
            </div>
          </div>

          <!--Article Comment Notificaiton Content-->
          <div v-else-if="props.notification.notificationType.type==='ARTICLE_COMMENT'">
            <div class="reaction-wrapper">
              <span class="notification-content-text">commented on your article</span>
            </div>
          </div>

          <!--Article Comment Reaction Notificaiton Content-->
          <div v-else-if="props.notification.notificationType.type==='ARTICLE_COMMENT_REACTION'">
            <div class="reaction-wrapper">
              <span class="notification-content-text">reacted with</span>
              <img v-if="props.notification.articleCommentReaction"
                   :src="getImageDataFromAlias(props.notification.articleCommentReaction.reaction.alias)"
                   alt="Reaction Image"
                   class="reaction-image "/>
              <span class="notification-content-text">to your comment</span>
            </div>
          </div>

          <!--Article Comment Reaction Notificaiton Content-->
          <div v-else-if="props.notification.notificationType.type==='CONNECTION_REQUEST'">
            <div class="reaction-wrapper">
              <span v-if="props.notification.userConnectionRequest.status==='PENDING'"
                    class="notification-content-text">requested to connect with you</span>
              <span v-else class="notification-content-text">accepted your connection request</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-notification-container {
  width: 100%;
  padding-left: 25%;
  padding-right: 25%;
  padding-block: 4px;
  border-left: 4px solid rgba(255, 69, 0, 1);
}

.action-notification-container:hover {
  cursor: pointer;
  background-color: rgba(255, 69, 0, 0.2) !important;
}

.small-text {
  font-size: 1rem;
  color: #ff4500;
  margin-bottom: 2px;
}

.username {
  font-weight: 600;
  font-size: 1.15rem;
  color: #2c3e50;
  letter-spacing: 1px;
}

.avatar-component {
  cursor: pointer !important;
}

.notification-content {
  padding-top: 4px;
}

.reaction-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-left: 8px;
  margin-right: 8px;
}

.reaction-wrapper {
  display: flex;
  align-items: center;
}

.notification-content-text {
  color: #333333;
  font-size: 1.1rem;
  padding: 0 2px;
  background-color: rgba(255, 69, 0, 0.1);
  border-radius: 2px;
}

</style>