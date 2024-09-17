import AdminView from "@/views/admin/AdminView.vue";

const routes = [
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: AdminView,
        meta: {requiresAuth: true, requiresAdmin: true},
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: {requiresAuth: true, requiresAdmin: true},
    }
];

export default routes;
