const state = {
    actionStatusQueue: [],
};

const mutations = {
    ADD_ERROR(state, payload) {
        if (payload && payload.id !== null && payload.id !== undefined && payload.message) {
            state.actionStatusQueue.push({
                id: payload.id,
                type: "error",
                message: payload.message,
            });
        } else {
            console.error("Error payload must contain both id and message");
        }
    },

    ADD_SUCCESS(state, payload) {
        if (payload && payload.id !== null && payload.id !== undefined && payload.message) {
            state.actionStatusQueue.push({
                id: payload.id,
                type: "success",
                message: payload.message,
            });
        } else {
            console.error("Success payload must contain both id and message");
        }
    },

    REMOVE_ACTION_STATUS(state, id) {
        state.actionStatusQueue = state.actionStatusQueue.filter((actionStatus) => actionStatus.id !== id);
    }
};

const actions = {
    pushError({commit}, {id, message}) {
        let errorMessageExists = false;
        // errorMessageExists = state.actionStatusQueue.some(actionStatus => actionStatus.message === message);
        // if (errorMessageExists) {
        //     return
        // }
        if (id !== null && id !== undefined && message) {
            commit('ADD_ERROR', {id, message});
        }
    },

    pushSuccess({commit}, {id, message}) {
        let successMessageExists = false;
        // successMessageExists = state.actionStatusQueue.some(actionStatus => actionStatus.message === message);
        // if (successMessageExists) {
        //     return
        // }

        if (id !== null && id !== undefined && message) {
            commit('ADD_SUCCESS', {id, message});
        }
    },

    remove({commit}, id) {
        if (id !== undefined && id !== null) {
            commit('REMOVE_ACTION_STATUS', id);
        } else {
            console.error(`Provided invalid id: ${id}`)
        }
    }
};
const getters = {
    getActionStatuses: (state) => state.actionStatusQueue,
};

export default {
    namespace: true,
    state,
    mutations,
    actions,
    getters,
};
