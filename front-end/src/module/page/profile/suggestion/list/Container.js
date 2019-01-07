import _ from 'lodash'
import { createContainer } from '@/util'
import { SUGGESTION_STATUS } from '@/constant'
import SuggestionService from '@/service/SuggestionService'
import Component from './Component'

const mapState = (state) => {
    const currentUserId = state.user.current_user_id
    // const isAdmin = state.user.role === USER_ROLE.ADMIN

    const suggestionState = {
        ...state.suggestion,
        currentUserId,
        filter: state.suggestion.filter || {}
    }

    return suggestionState
}

const mapDispatch = () => {
    const service = new SuggestionService()

    return {
        async getSuggestions(query) {
            return service.list({
                status: SUGGESTION_STATUS.ACTIVE,
                ...query
            })
        },

        async getMySuggestions(query) {
            return service.myList({
                status: SUGGESTION_STATUS.ACTIVE,
                ...query
            })
        },

        async loadMoreSuggestions(query) {
            return service.loadMore({
                status: SUGGESTION_STATUS.ACTIVE,
                ...query
            })
        },

        resetAll() {
            return service.resetAll()
        }
    }
}

export default createContainer(Component, mapState, mapDispatch)
