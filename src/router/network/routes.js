import UserNetworkView from "@/views/network/UserNetworkView.vue";
import MyNetworkView from "@/views/network/MyNetworkView.vue";

const routes = [
    {
        //if userId equals with currentLOggedINUsers id -> redirect to myNetwork
        path: '/network/:userId',
        name: 'user-network',
        component: UserNetworkView,
        meta:{requiresAuth: true},
    },

    {
        path: '/network',
        name: 'my-network',
        component: MyNetworkView,
        meta:{requiresAuth: true},
    },

];

export default routes;
