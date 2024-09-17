import {createRouter, createWebHistory} from 'vue-router';
import authenticationRoutes from './login/routes'
import registerRoutes from './register/routes';
import networkRoutes from './network/routes'
import profileRoutes from './profile/routes'
import notificationRoutes from './notification/routes'
import articleRoutes from './article/routes'
import adminRoutes from './admin/routes'

const baseRoutes = [
    {
        path: '/home',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/',
        name: '',
        component: () => import('@/views/HomeView.vue'),
        meta: {requiresAuth: true}
    },
];

const routes =
    baseRoutes
        .concat(registerRoutes)
        .concat(authenticationRoutes)
        .concat(articleRoutes)
        .concat(networkRoutes)
        .concat(profileRoutes)
        .concat(notificationRoutes)
        .concat(adminRoutes);
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            // Scroll to the element with the ID matching the hash
            return {
                el: to.hash,
                behavior: 'smooth',
            };
        } else if (savedPosition) {
            return savedPosition;
        } else {
            return {top: 0};
        }
    },
});


router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const isAuthenticated = Boolean(localStorage.getItem('isAuthenticated') === 'true');
        if (!isAuthenticated) {
            console.log({name: authenticationRoutes.find(route => (route.name === 'login'))?.name})
            next({name: authenticationRoutes.find(route => (route.name === 'login'))?.name});
        } else {
            if (to.meta.requiresAdmin) {
                const isAdmin = Boolean(localStorage.getItem('is_admin') === 'true');
                if (!isAdmin) {
                    //forbidden to access admin route -> redirect to home with forbidden error message
                    next({
                        name: authenticationRoutes.find(route => (route.name === 'home'))?.name,
                        query: {
                            actionStatuses: JSON.stringify([{
                                type: "error",
                                message: "Forbidden"
                            }])
                        }
                    })
                    return
                }
            }
            next();
        }
    } else {
        next();
    }
});


export default router;
