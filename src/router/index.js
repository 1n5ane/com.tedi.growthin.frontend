import {createRouter, createWebHistory} from 'vue-router';
import registerRoutes from './register/routes';
import authenticationRoutes from './login/routes'
import networkRoutes from './network/routes'

const baseRoutes = [
    {
        path: '/home',
        name: 'home',
        component: () => import('@/views/HomeView.vue'), //Home Component
        meta: {requiresAuth: true}
    },
    {
        path: '/',
        name: '',
        component: () => import('@/views/HomeView.vue'), //add Home Component
        meta: {requiresAuth: true}
    },
];

const routes =
    baseRoutes
        .concat(registerRoutes)
        .concat(authenticationRoutes)
        .concat(networkRoutes);
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
            return { top: 0 };
        }
    },
});


router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const isAuthenticated = Boolean(localStorage.getItem('isAuthenticated'));
        if (!isAuthenticated) {
            console.log({name: authenticationRoutes.find(route => (route.name === 'login'))?.name})
            next({name: authenticationRoutes.find(route => (route.name === 'login'))?.name});
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;
