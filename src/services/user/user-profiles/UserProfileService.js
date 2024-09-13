import axiosInstance from "@/services/core/axios/axiosInstance";

export default class UserProfileService {
    APP_CONFIG;
    PROFILES_ENDPOINT;

    static instance;

    constructor(config) {
        this.APP_CONFIG = config;
        this.PROFILES_ENDPOINT = `${config?.apiBaseUrl}/profile`;
    }

    static getInstance(config) {
        if (!UserProfileService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the UserProfileService');
            }
            UserProfileService.instance = new UserProfileService(config);
        }
        return UserProfileService.instance;
    }

    async createUserProfile(userProfile) {
        try {
            const response = await axiosInstance.post(this.PROFILES_ENDPOINT, {
                jobField: userProfile.jobField,
                isJobFieldPublic: userProfile.isJobFieldPublic,
                description: userProfile.description,
                isDescriptionPublic: userProfile.isDescriptionPublic,
                age: userProfile.age,
                isAgePublic: userProfile.isAgePublic,
                education: userProfile.education,
                isEducationPublic: userProfile.isEducationPublic,
                country: userProfile.country,
                isCountryPublic: userProfile.isCountryPublic,
                cvDocument: userProfile.cvDocument,
                isCvDocumentPublic: userProfile.isCvDocumentPublic,
                profilePic: userProfile.profilePic,
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async updateUserProfile(userProfile) {
        try {
            const response = await axiosInstance.put(this.PROFILES_ENDPOINT, {
                jobField: userProfile.jobField,
                isJobFieldPublic: userProfile.isJobFieldPublic,
                description: userProfile.description,
                isDescriptionPublic: userProfile.isDescriptionPublic,
                age: userProfile.age,
                isAgePublic: userProfile.isAgePublic,
                education: userProfile.education,
                isEducationPublic: userProfile.isEducationPublic,
                cvDocument: userProfile.cvDocument,
                isCvDocumentPublic: userProfile.isCvDocumentPublic,
                profilePic: userProfile.profilePic,
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async getUserProfile(param) {
        try {
            let params = {}
            if (param.username) {
                params.username = param.username;
            } else if (param.email) {
                params.email = param.email;
            } else if (param.id != null) {
                params.id = param.id;
            } else {
                throw new Error(`Username, email or id expected to get user profile. Instead provided ${JSON.stringify(param)}`)
            }

            const response = await axiosInstance.get(this.PROFILES_ENDPOINT, {
                params
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async getUserProfilesByIds(idList) {
        try {
            const params = {
                ids: idList.join(','),
            }
            const response = await axiosInstance.get(this.PROFILES_ENDPOINT, {
                params
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllUserProfiles(page = 0,
                              size = 15,
                              sortBy = 'id',
                              order = 'desc') {
        try {
            const response = await axiosInstance.get(`${this.PROFILES_ENDPOINT}/all`, {
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

    async searchUserProfilesByUsername(username,
                                       page = 0,
                                       size = 15,
                                       sortBy = 'username',
                                       order = 'desc') {

        try {
            const response = await axiosInstance.get(`${this.PROFILES_ENDPOINT}/search`, {
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
}