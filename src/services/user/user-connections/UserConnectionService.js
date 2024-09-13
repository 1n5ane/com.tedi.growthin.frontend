import axiosInstance from "@/services/core/axios/axiosInstance";


export default class UserConnectionService {
    APP_CONFIG;
    CONNECTIONS_ENDPOINT;

    static instance = null;

    constructor(config) {
        this.APP_CONFIG = config;
        this.CONNECTIONS_ENDPOINT = `${config?.apiBaseUrl}/connect`;
    }

    static getInstance(config) {
        if (!UserConnectionService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the UserConnectionService');
            }
            UserConnectionService.instance = new UserConnectionService(config);
        }
        return UserConnectionService.instance;
    }

    async createUserConnectionRequest(connectWithUserId) {
        try {
            const response = await axiosInstance.post(`${this.CONNECTIONS_ENDPOINT}/user/${connectWithUserId}`, null)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async updateStatusUserConnectionRequest(connectionRequestId, status) {
        try {
            const response = await axiosInstance.put(`${this.CONNECTIONS_ENDPOINT}/${connectionRequestId}`, {status})
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //unconnect with user
    async deleteUserConnection(userId) {
        try {
            const response = await axiosInstance.delete(`${this.CONNECTIONS_ENDPOINT}/user/${userId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async checkUserConnectionsExist(userIdList) {
        let result = {}
        for (const userId of userIdList) {
            try {
                const res = await this.checkUserConnectionExists(userId);
                result[userId] = res.exists
            }catch(e){
                return Promise.reject(e)
            }
        }
        return result
    }

    async checkUserConnectionExists(userId) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/user/${userId}/exists`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async getConnectionRequest(userId) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/user/${userId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async checkPendingConnectionRequestExists(userId) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/user/${userId}/exists`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }


    async searchAllUserConnectionsByUserId(userId,
                                           username,
                                           page = 0,
                                           size = 15,
                                           sortBy = 'createdAt',
                                           order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/user/${userId}/search`, {
                params: {
                    username,
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

    async listAllUserConnectionsByUserId(userId,
                                         page = 0,
                                         size = 15,
                                         sortBy = 'createdAt',
                                         order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/user/${userId}`, {
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

    //incoming and outgoing (ex. if status is ACCEPTED -> count all user connections)
    async countAllUserConnectionRequestsByStatus(status) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/all/count`, {
                params: {
                    status
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async countAllOutgoingUserConnectionRequestsByStatus(status) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/outgoing/count`, {
                params: {
                    status
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async countAllIncomingUserConnectionRequestsByStatus(status) {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/incoming/count`, {
                params: {
                    status
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllOutgoingUserConnectionRequestsByStatus(status,
                                                        page = 0,
                                                        size = 15,
                                                        sortBy = 'id',
                                                        order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/outgoing`, {
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

    async listAllIncomingUserConnectionRequestsByStatus(status,
                                                        page = 0,
                                                        size = 15,
                                                        sortBy = 'id',
                                                        order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.CONNECTIONS_ENDPOINT}/requests/incoming`, {
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
}