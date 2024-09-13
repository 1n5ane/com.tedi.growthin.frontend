import MyProfileView from "@/views/profile/UserProfileView.vue";
import UserProfileView from "@/views/profile/UserProfileView.vue";

const routes = [
    {
        path: '/profile/:profileId',
        name: 'user-profile',
        component: UserProfileView,
        meta:{requiresAuth: true},
    },
];

export default routes;
