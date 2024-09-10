import axiosInstance from "@/services/core/axios/axiosInstance";

export default class UserChatService {
    APP_CONFIG;
    CHATS_ENDPOINT;

    static instance;

    constructor(config) {
        this.APP_CONFIG = config;
        this.CHATS_ENDPOINT = `${config?.apiBaseUrl}/chat`;
    }

    static getInstance(config) {
        if (!UserChatService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the UserChatService');
            }
            UserChatService.instance = new UserChatService(config);
        }
        return UserChatService.instance;
    }


    //create chatroom between currentLoggedInUser and userId
    async createChatRoom(userId) {
        try {
            const response = await axiosInstance.post(`${this.CHATS_ENDPOINT}/${userId}`, null)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //if chatroom nbot created -> it is handled by the backend
    async sendMessage(userId, chatMessage, token) {
        try {
            const response = await axiosInstance.post(`${this.CHATS_ENDPOINT}/${userId}/messages`, {
                "message": chatMessage.message,
                "media": chatMessage.media,
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //read or unread
    async setIsReadToMessagesWithUserId(userId, messageIds, isRead) {
        try {
            const response = await axiosInstance.post(`${this.CHATS_ENDPOINT}/${userId}/messages/read`, {
                messageIds,
                isRead
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async readAllUnreadMessages(userId) {
        try {
            const response = await axiosInstance.post(`${this.CHATS_ENDPOINT}/${userId}/messages/read=all-unread`, null)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllChatRooms(page = 0,
                           size = 15,
                           sortBy = 'createdAt',
                           order = 'desc') {

        try {
            const response = await axiosInstance.get(`${this.CHATS_ENDPOINT}`, {
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

    //list all chatroom messages between currentLoggedInUser and userId
    async listAllChatRoomMessages(userId,
                                  page = 0,
                                  size = 15,
                                  sortBy = 'createdAt',
                                  order = 'desc') {

        try {
            const response = await axiosInstance.get(`${this.CHATS_ENDPOINT}/${userId}/messages`, {
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

    //mesageId by userId
    async findChatRoomMessageById(userId, messageId) {
        try {
            const response = await axiosInstance.get(`${this.CHATS_ENDPOINT}/${userId}/messages/${messageId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //sent to currentLoggedInUser
    async countAllChatRoomsWithUnreadMessages() {
        try {
            const response = await axiosInstance.get(`${this.CHATS_ENDPOINT}/count-unread`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async countAllUnreadMessagesFromUserId(userId){
        try {
            const response = await axiosInstance.get(`${this.CHATS_ENDPOINT}/${userId}/messages/count-unread`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }


}