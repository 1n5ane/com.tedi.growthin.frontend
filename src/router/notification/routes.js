import NotificationView from "@/views/notification/NotificationView.vue";

const routes = [
    {
        path: '/notification',
        name: 'notification',
        component: NotificationView,
        meta: {requiresAuth: true},
    },
];

export default routes;
