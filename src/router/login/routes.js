import LoginView from "@/views/login/LoginView.vue";
import LogoutComponent from "@/components/logout/LogoutComponent.vue";

const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: {requiresAuth: false}
    },
    {
        path: '/logout',
        name: 'logout',
        component: LogoutComponent,
        meta: {requiresAuth: false}
    }
];

export default routes;
