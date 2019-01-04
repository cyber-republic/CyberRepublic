import _ from 'lodash'
import { createContainer } from '@/util'
import { USER_ROLE, SUGGESTION_STATUS } from '@/constant'
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
    const suggestionService = new SuggestionService()

    return {
        async getSuggestions(query) {
            return suggestionService.list({
                status: SUGGESTION_STATUS.ACTIVE,
                ...query
            })
        },

        async loadMoreSuggestions(query) {
            return suggestionService.loadMore({
                status: SUGGESTION_STATUS.ACTIVE,
                ...query
            })
        },

        resetSuggestions() {
            return suggestionService.resetAllSuggestions()
        }
    }
}

export default createContainer(Component, mapState, mapDispatch)
