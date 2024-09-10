import ReactionService from "@/services/user/user-reactions/ReactionService";

const state = {
    availableReactions: [],
}

const mutations = {

    SET_AVAILABLE_REACTIONS(state, availableReactions) {
        state.availableReactions = availableReactions;
    }

}

const actions = {
    async fetchAvailableReactions({commit}) {
        const res = await ReactionService.getInstance().fetchAvailableReactions()
        if(res && res.success){
            commit('SET_AVAILABLE_REACTIONS', res.reactions)
        }else{
            let errorMessage = res? res.error:'Failed to fetch available reactions'
            throw new Error(errorMessage);
        }
    }
}

const getters = {
    getAvailableReactions: (state) => state.availableReactions,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};