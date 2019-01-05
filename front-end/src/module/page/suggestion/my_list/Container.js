import { createContainer } from '@/util'
import Component from './Component'

const mapState = (state) => {
    const currentUserId = state.user.current_user_id
    const suggestionState = {
        ...state.suggestion,
        currentUserId
    }

    return suggestionState
}

const mapDispatch = () => ({})

export default createContainer(Component, mapState, mapDispatch)
