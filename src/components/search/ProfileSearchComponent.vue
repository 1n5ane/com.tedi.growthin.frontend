<script setup>
import BaseSearchInput from "@/components/core/inputs/BaseSearchInput.vue";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import {ref, watch} from "vue";
import UserAvatarComponent from "@/components/core/avatars/UserAvatarComponent.vue";


const props = defineProps({
  id: {
    type: String,
    default: () => `profile-search-input-${Math.random().toString(36).substring(2, 9)}` //random if not provided :p
  },
  placeholder: {
    type: String,
    default: "Search user profiles"
  },
  pageSize: {
    type: Number,
    default: 10
  }

})

const emit = defineEmits(["search-error"])

const userProfileService = UserProfileService.getInstance()
const searchResults = ref([]);
const searchQuery = ref('');
const currentPage = ref(0);
const totalPages = ref(1);
const hasMoreRef = ref(currentPage.value < totalPages.value - 1)
const toggleSearchResultsRef = ref(true)
const itemsPerPage = props.pageSize

const fetchProfiles = async (page) => {
  let profiles
  if (searchQuery.value) {
    try {
      const response = await userProfileService.searchUserProfilesByUsername(searchQuery.value, page, itemsPerPage);
      if (response && response.success) {
        profiles = response.profiles;
        totalPages.value = response.totalPages
        hasMoreRef.value = page < response.totalPages - 1
      } else {
        profiles = [];
      }
    } catch (_) {
      emit("search-error", "Failed to search user profiles");
      profiles = [];
    }
  } else {
    profiles = []
  }
  return profiles;
};

watch(() => searchQuery.value, async (username) => {
  currentPage.value = 0; // Reset to first page on query change
  searchResults.value = await fetchProfiles(currentPage.value);
})

const handlePageChange = async (page) => {
  currentPage.value = page;
  const profiles = await fetchProfiles(page)
  searchResults.value = searchResults.value.concat(profiles);
};

const handleShowMore = async () => {
  if (currentPage.value < totalPages.value) {
    await handlePageChange(currentPage.value + 1);
  }
};

const handleProfileClicked = (profileId) => {
  //redirect to profile
  console.log(profileId);
}

const handleScroll = (event) => {
  const element = event.currentTarget;

  // if the element is scrollable
  if (element.scrollHeight > element.clientHeight) {
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
      event.preventDefault(); // Prevent the default scroll behavior only when scroll is at top and at the bottom
    }
  }
};

const toggleSearchResults = (isVisible) => {
  // toggleSearchResultsRef.value = isVisible
}

</script>

<template>
  <base-search-input :id="props.id"
                     :placeholder="props.placeholder"
                     @focus-change="toggleSearchResults"
                     v-model="searchQuery">
    <div v-if="searchResults.length"
         v-show="toggleSearchResultsRef"
         class="search-results"
         @wheel="handleScroll">
      <div v-for="(profile, index) in searchResults" :key="profile.id"
           :class="['search-result-item col-12', { 'first-item': index === 0 }]"
           @click="handleProfileClicked(profile.id)">
        <div class="row no-gutter-x justify-content-center align-items-center">

          <div class="col-2">
            <user-avatar-component :image-base64-data="profile.profilePic?.data"
                                   :image-type="profile.profilePic?.mediaType.type"
                                   class="avatar-component"
                                   size="40px"/>
          </div>
          <div class="col-10 align-items-center">
            <div class="row no-gutter-x justify-content-center align-items-center">
              <div v-text="profile?.username" class="col-12 align-items-center"></div>
              <div v-text="profile?.jobField" class="col-12 align-items-center"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="hasMoreRef" class="row no-gutter-x justify-content-center">
        <div class="col-12 show-more-text" @click="handleShowMore">
          Show more ▼
        </div>
      </div>
    </div>
    <div v-else-if="searchQuery" class="search-results first-item">
      <div class="no-results search-result-item col-12" style="cursor:default !important;">
        No results
      </div>
    </div>
  </base-search-input>

</template>

<style scoped>
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
  color: rgba(200, 54, 0, 1); /* Even darker shade on active */
}

.avatar-component {
  cursor: pointer !important;
}

.no-gutter-x {
  --bs-gutter-x: 0px;
}

.search-results {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  z-index: 100;
}

.search-result-item {
  padding: 6px;
  cursor: pointer !important;
  border-bottom: 1px solid black;
  border-left: 1px solid black;
  border-right: 1px solid black;
}

.first-item {
  border-top: 1px solid black;
}

.search-result-item:hover {
  background-color: #f0f0f0;
}

.no-results {
  padding: 6px;
  text-align: center;
  color: #888;
}
</style>