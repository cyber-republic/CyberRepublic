import {
    createContainer
} from '@/util'
import Component from './Component'
import SuggestionService from '@/service/SuggestionService'
import _ from 'lodash'

const mapState = (state) => {
    const currentUserId = state.user.current_user_id

    const suggestionState = {
        ...state.suggestion,
        currentUserId,
        filter: state.suggestion.filter || {}
    }

    return suggestionState
}

export default createContainer(Component, mapState, () => {

    const suggestionService = new SuggestionService()

    return {
        async getTasks(query) {
            return suggestionService.index({
                type: [TASK_TYPE.TASK, TASK_TYPE.EVENT],
                ...query,
            })
        },

        async loadMoreTasks(query) {
            return suggestionService.loadMore({
                type: [TASK_TYPE.TASK, TASK_TYPE.EVENT],
                ...query,
            })
        },

        resetTasks() {
            return suggestionService.resetAllTasks()
        },

        async setFilter(filter) {
            return suggestionService.saveFilter(filter)
        }

    }
})
