import { createContainer } from '@/util'
import Component from './Component'
import _ from 'lodash'

const mapState = state => ({
  currentUserId: state.user.current_user_id,
})

const mapDispatch = () => {
}

export default createContainer(Component, mapState, mapDispatch)
