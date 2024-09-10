import {createStore} from 'vuex'
import authenticationStore from '@/store/core/authentication/authentication'
import actionStatusStore from '@/store/action-status/actionStatus'
import reactionStore from '@/store/reaction/reaction'

export default createStore({
  strict: process.env.NODE_ENV !== 'production',
  modules:{
    authenticationStore,
    actionStatusStore,
    reactionStore
  }
})
