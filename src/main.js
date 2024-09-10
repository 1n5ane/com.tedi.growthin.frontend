import AuthenticationService from "@/services/core/authentication/AuthenticationService";
import UserService from "@/services/user/user-details/UserService"
import UserChatService from "@/services/user/user-chats/UserChatService";
import UserConnectionService from "@/services/user/user-connections/UserConnectionService";
import NotificationService from "@/services/user/user-notifications/NotificationService";
import UserProfileService from "@/services/user/user-profiles/UserProfileService";
import ReactionService from "@/services/user/user-reactions/ReactionService";
import UserArticleService from "@/services/user/user-articles/UserArticleService";
import AdminUserService from "@/services/admin/users/AdminUserService";
import {createApp} from 'vue';
import router from './router';
import store from './store';
import APP_CONFIG_PROMISE from './config/index';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.vue';

const provideServices = (app, config) => {
    app.provide('APP_CONFIG', config);
    app.provide('AuthenticationService', AuthenticationService.getInstance(config));
    app.provide('UserService', UserService.getInstance(config));
    app.provide('UserChatService', UserChatService.getInstance(config));
    app.provide('UserConnectionService', UserConnectionService.getInstance(config));
    app.provide('NotificationService', NotificationService.getInstance(config));
    app.provide('UserProfileService', UserProfileService.getInstance(config));
    app.provide('ReactionService', ReactionService.getInstance(config));
    app.provide('UserArticleService',UserArticleService.getInstance(config));
    app.provide('AdminUserService', AdminUserService.getInstance(config));
}

APP_CONFIG_PROMISE.then((config) => {
    if (!config) {
        let error = 'Application failed to initialize. App config was not found or not provided.';
        console.error(error);
        throw new Error(error);
    }
    try {
        const app = createApp(App);
        provideServices(app,config)
        app.use(store);
        app.use(router);
        app.mount('#app');
    } catch (e) {
        console.error(e.message);
        throw new Error(e);
    }
});
