import axiosInstance from "@/services/core/axios/axiosInstance";


export default class UserService {
    APP_CONFIG;
    USER_ENDPOINT;

    static instance = null;

    constructor(config) {
        //endpoint configuration
        this.APP_CONFIG = config;
        this.USER_ENDPOINT = `${config?.apiBaseUrl}/user`;
    }

    static getInstance(config) {
        if (!UserService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the UserService');
            }
            UserService.instance = new UserService(config);
        }
        return UserService.instance;
    }


    async getUser(username) {
        try {
            const response = await axiosInstance.get(`${this.USER_ENDPOINT}/${username}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //by username or email
    async checkUserExists(field) {
        try {
            let params = {}
            if (field.username) {
                params.username = field.username;
            } else if (field.email) {
                params.email = field.email;
            } else {
                throw new Error(`Username or email expected to check user existance. Instead provided ${JSON.stringify(field)}`)
            }

            const response = await axiosInstance.get(`${this.USER_ENDPOINT}/exists`, {
                params
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async registerUser(user) {
        try {
            const response = await axiosInstance.post(`${this.USER_ENDPOINT}`, {
                username: user.username,
                password: user.password,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                country: user.country,
                area: user.area,
                isEmailPublic: user.isEmailPublic,
                isPhonePublic: user.isPhonePublic,
                isCountryPublic: user.isCountryPublic,
                isAreaPublic: user.isAreaPublic,
                authorities: user.authorities
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async updateUser(user) {
        try {
            const response = await axiosInstance.put(`${this.USER_ENDPOINT}`, {
                username: user.username,
                password: user.password,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                country: user.country,
                area: user.area,
                isEmailPublic: user.isEmailPublic,
                isPhonePublic: user.isPhonePublic,
                isCountryPublic: user.isCountryPublic,
                isAreaPublic: user.isAreaPublic,
            })
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
            const response = await axiosInstance.get(`${this.USER_ENDPOINT}/${userId}`, {
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