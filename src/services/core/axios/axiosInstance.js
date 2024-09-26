import axios from 'axios'
import store from '../../../store'
import router from '../../../router'

// Create an Axios instance
const instance = axios.create({
    timeout: 15000, // Client timeout (15 seconds)
});

let isRefreshing = false;
let failedRequestsQueue = [];

instance.interceptors.request.use(
    async (config) => {
        const token = store.getters['authenticationStore/getToken']
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const {config, response} = error;
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    if (!isRefreshing) {
                        isRefreshing = true;
                        console.log('[AXIOS] Issuing refresh token');
                        try {
                            await store.dispatch("authenticationStore/refreshToken")
                            const newToken = store.getters['authenticationStore/getToken']
                            failedRequestsQueue.forEach((callback) => callback(newToken));
                            failedRequestsQueue = [];

                            // Retry the original request with the new token
                            config.headers['Authorization'] = `Bearer ${newToken}`;
                            console.log("Successfully refreshed token!")
                            return instance(config);
                        } catch (tokenRefreshError) {
                            if (tokenRefreshError.status === 401) {
                                // Handle token refresh error (e.g., redirect to login)
                                console.log("[AXIOS] Redirecting to login. Refresh token is expired too!")
                                await store.dispatch("authenticationStore/logout")
                                await router.push({
                                    name: 'login',
                                    query: {
                                        actionStatuses: JSON.stringify([{
                                            type: "error",
                                            message: "Your session has expired! Please login again"
                                        }])
                                    }
                                })
                            } else {
                                console.log("Failed to issue refreshToken!", tokenRefreshError.message)
                            }
                            return Promise.reject(tokenRefreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        return new Promise((resolve) => {
                            failedRequestsQueue.push((newToken) => {
                                config.headers['Authorization'] = `Bearer ${newToken}`;
                                resolve(instance(config));
                            });
                        });
                    }
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 500:
                    console.error('Server error - try again later');
                    break;
                default:
                    console.error('An error occurred:', error.response.data.message || error.message);
            }
        } else {
            console.error('Network error');
        }
        return Promise.reject(error);
    }
);

export default instance;
