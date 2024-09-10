import axios from 'axios'

//singleton instance
class AuthenticationService {
    APP_CONFIG;
    LOGIN_ENDPOINT;
    REFRESH_ENDPOINT;
    isIssuing;
    isRefreshing;
    issuePromise;
    refreshPromise;
    axiosInstance

    static instance = null;

    constructor(config) {
        //endpoint configuration
        this.APP_CONFIG = config;
        this.LOGIN_ENDPOINT = `${config?.authBaseUrl}/login`;
        this.REFRESH_ENDPOINT = `${config?.authBaseUrl}/refresh_token`;
        this.isIssuing = false;
        this.isRefreshing = false;
        this.issuePromise = null;
        this.refreshPromise = null;
        this.axiosInstance = axios.create({timeout:15000})
    }

    static getInstance(config) {
        if (!AuthenticationService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the AuthenticationService');
            }
            AuthenticationService.instance = new AuthenticationService(config);
        }
        return AuthenticationService.instance;
    }


//async functions to authenticate
//these functions will be called inside actions (of authenticationStore) dispached from VueComponent (actions will mutate the state of store)
    async issueToken(usernameOrEmail, password) {
        // Return the existing promise if a token is already being issued
        if (this.isIssuing) {
            return this.issuePromise;
        }

        try {
            this.isIssuing = true;
            this.issuePromise = this.axiosInstance.post(this.LOGIN_ENDPOINT, {usernameOrEmail, password});
            // Await the resolution and return the result
            const response = await this.issuePromise;
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        } finally {
            // Reset isIssuing once the promise is resolved or rejected
            this.isIssuing = false;
        }
    }

async refresh(refreshToken){
    if (this.isRefreshing) {
        return this.refreshPromise;
    }

    try {
        this.isRefreshing = true;
        this.refreshPromise = this.axiosInstance.post(this.REFRESH_ENDPOINT, {refreshToken});
        // Await the resolution and return the result
        const response = await this.refreshPromise;
        return response.data;
    } catch (e) {
        return Promise.reject(e)
    } finally {
        this.isRefreshing = false;
    }
}

}

export default AuthenticationService;//Export singleton instance
