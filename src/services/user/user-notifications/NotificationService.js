import axiosInstance from "@/services/core/axios/axiosInstance";

export default class NotificationService {
    APP_CONFIG;
    NOTIFICATIONS_ENDPOINT;

    static instance;

    constructor(config) {
        this.APP_CONFIG = config;
        this.NOTIFICATIONS_ENDPOINT = `${config?.apiBaseUrl}/notification`;
    }

    static getInstance(config) {
        if (!NotificationService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the NotificationService');
            }
            NotificationService.instance = new NotificationService(config);
        }
        return NotificationService.instance;
    }

    async listAllIncomingNotifications(page = 0,
                                       size = 15,
                                       sortBy = 'createdAt',
                                       order = 'desc') {
        try {
            const response = await axiosInstance.get(this.NOTIFICATIONS_ENDPOINT, {
                params: {
                    page,
                    size,
                    sortBy,
                    order
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllIncomingChatNotifications(page = 0,
                                           size = 15,
                                           sortBy = 'createdAt',
                                           order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.NOTIFICATIONS_ENDPOINT}/chat`, {
                params: {
                    page,
                    size,
                    sortBy,
                    order
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }
}