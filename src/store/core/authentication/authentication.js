import AuthenticationService from "@/services/core/authentication/AuthenticationService";
import JwtUtils from "@/utils/JwtUtils";

const state = {
    token: localStorage.getItem('jwt_token'),
    refreshToken: localStorage.getItem('jwt_refresh_token'),
    isAdmin: localStorage.getItem('is_admin'),
    //claims of authenticated user
    claims: JSON.parse(localStorage.getItem('jwt_claims')),
    currentLoggedInUser: JSON.parse(localStorage.getItem('current_user')),
};

const mutations = {
    SET_TOKENS(state, payload) {
        state.token = payload.token;
        state.refreshToken = payload.refreshToken;
    },
    SET_CLAIMS(state, claims) {
        state.claims = claims;
    },
    SET_ISADMIN(state, isAdmin) {
        state.isAdmin = isAdmin;
    },
    SET_CURRENT_LOGGED_IN_USER(state, user) {
        state.currentLoggedInUser = user;
    }
};

const actions = {
    async login({commit, dispatch}, {username, password}) {
        // logic to perform login
        const res = await AuthenticationService.getInstance().issueToken(username, password);
        if (res && res.success) {
            await dispatch('setPrincipleFromResponse', res)
        } else {
            let errorMsg;
            if (!res) {
                errorMsg = "No data returned from auth server!"
            } else {
                errorMsg = res.error
            }
            localStorage.setItem('jwt_token', null);
            localStorage.setItem('jwt_refresh_token', null);
            localStorage.setItem('jwt_claims', null);
            localStorage.setItem('is_admin', null);
            localStorage.setItem("isAuthenticated", 'false')
            throw new Error(errorMsg);
        }
    },
    async logout({commit}) {
        commit('SET_TOKENS', {token: null, refresh_token: null});
        commit('SET_CLAIMS', null);
        commit('SET_ISADMIN', null);
        commit('SET_CURRENT_LOGGED_IN_USER', null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_refresh_token');
        localStorage.removeItem('jwt_claims');
        localStorage.removeItem('is_admin');
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("current_user");
    },
    async refreshToken({commit, dispatch}) {
        //only if refreshToken issue fails set isAuthenticated to false in local storage
        const res = await AuthenticationService.getInstance().refresh(state.refreshToken);
        if (res && res.token) {
            console.log("[AUTHENTICAITON STORE] REFRESHED")
            await dispatch('setPrincipleFromResponse', res)
        } else {
            let errorMsg;
            if (!res) {
                errorMsg = "No data returned from auth server!"
            } else {
                errorMsg = res.error
            }
            console.error("[AUTHENTICATION STORE]", errorMsg)
            await dispatch('logout')
            throw new Error(errorMsg);
        }
    },

    setPrincipleFromResponse({commit}, response) {
        const {token, refresh_token} = response;
        const claims = JwtUtils.extractClaims(token);
        const isAdmin = claims.authorities.includes("ROLE_ADMIN");

        commit('SET_TOKENS', {token, refresh_token});
        commit('SET_CLAIMS', claims);
        commit('SET_ISADMIN', isAdmin);
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('jwt_refresh_token', refresh_token);
        localStorage.setItem('jwt_claims', JSON.stringify(claims));
        localStorage.setItem('is_admin', isAdmin);
        localStorage.setItem("isAuthenticated", 'true')
    },

    setCurrentLoggedInUser({commit}, user){
        commit('SET_CURRENT_LOGGED_IN_USER', user);
        localStorage.setItem('current_user', JSON.stringify(user));
    }
};

const getters = {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => !!state.isAdmin,
    getPrinciple: (state) => state.claims,
    getUsername: (state) => state.claims?.sub,
    getToken: (state) => state.token,
    getRefreshToken: (state) => state.refreshToken,
    getCurrentLoggedInUser: (state) => state.currentLoggedInUser
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
