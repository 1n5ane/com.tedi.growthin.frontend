import axiosInstance from "@/services/core/axios/axiosInstance";

export default class AdminUserService {
    APP_CONFIG;
    ADMIN_ENDPOINT;

    static instance = null;


    constructor(config) {
        this.APP_CONFIG = config;
        this.ADMIN_ENDPOINT = `${config?.apiBaseUrl}/admin`;
    }


    static getInstance(config) {
        if (!AdminUserService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the AdminUserService');
            }
            AdminUserService.instance = new AdminUserService(config);
        }
        return AdminUserService.instance;
    }

    async exportUserData(userIds, type = 'json') {
        try {
            const response = await axiosInstance.post(`${this.ADMIN_ENDPOINT}/user/export`, {ids:userIds},{
                params:{
                    type
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async findUserById(userId) {
        try {
            const response = await axiosInstance.get(`${this.ADMIN_ENDPOINT}/user/${userId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllUsers(page = 0,
                       size = 15,
                       sortBy = 'id',
                       order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.ADMIN_ENDPOINT}/user`, {
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

    async listAllBannedUsers(page = 0,
                             size = 15,
                             sortBy = 'id',
                             order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.ADMIN_ENDPOINT}/user/banned`, {
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

    async banUserByUserId(userId) {
        try {
            const response = await axiosInstance.post(`${this.ADMIN_ENDPOINT}/user/${userId}/ban`, null)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async banUsers(userIds) {
        try {
            const response = await axiosInstance.post(`${this.ADMIN_ENDPOINT}/user/ban`, {
                ids: userIds
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async unbanUsers(userIds) {
        try {
            const response = await axiosInstance.post(`${this.ADMIN_ENDPOINT}/user/unban`, {
                ids: userIds
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async unbanUserByUserId(userId, token) {
        try {
            const response = await axiosInstance.post(`${this.ADMIN_ENDPOINT}/user/${userId}/unban`, null)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllAdminRequestsByStatus(status,
                                       page = 0,
                                       size = 15,
                                       sortBy = 'id',
                                       order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.ADMIN_ENDPOINT}/user/requests`, {
                params: {
                    status,
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

    async updateAdminRequestStatus(requestId, status) {
        try {
            const response = await axiosInstance.put(`${this.ADMIN_ENDPOINT}/user/requests/${requestId}`, {
                status
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }
}