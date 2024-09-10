import RegisterProfileView from "@/views/register/RegisterProfileView.vue";

const routes = [
    {
        path: '/register/profile',
        name: 'register-profile',
        component: RegisterProfileView,
        meta: {requiresAuth: true},
    },
];

export default routes;
