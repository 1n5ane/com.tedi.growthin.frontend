import axiosInstance from "@/services/core/axios/axiosInstance";

//this service fetches all available reactions (alias, image (icon of reaction))
export default class ReactionService {
    APP_CONFIG;
    REACTIONS_ENDPOINT;

    static instance;
    isFetching
    reactionsPromise

    constructor(config) {
        this.APP_CONFIG = config;
        this.REACTIONS_ENDPOINT = `${config?.apiBaseUrl}/reaction`;
        this.isFetching = false
        this.reactionsPromise = null
    }

    static getInstance(config) {
        if (!ReactionService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the ReactionService');
            }
            ReactionService.instance = new ReactionService(config);
        }
        return ReactionService.instance;
    }

    async fetchAvailableReactions(){
        if(this.isFetching)
            return this.reactionsPromise

        try {
            this.isFetching = true
            this.reactionsPromise = axiosInstance.get(this.REACTIONS_ENDPOINT)
            const response = await this.reactionsPromise
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        } finally {
            this.isFetching = false
        }
    }

}