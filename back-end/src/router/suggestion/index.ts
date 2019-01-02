import Base from '../Base'
import create from './create'
import list from './list'
import show from './show'
import like from './like'
import dislike from './dislike'
import reportabuse from './reportabuse'
import subscribe from './subscribe'
import comment from './comment'

export default Base.setRouter([
  {
    path: '/create',
    router: create,
    method: 'post',
  },
  {
    path: '/list',
    router: list,
    method: 'get',
  },
  {
    path: '/show',
    router: show,
    method: 'get',
  },
  {
    path: '/like',
    router: like,
    method: 'post',
  },
  {
    path: '/dislike',
    router: dislike,
    method: 'post',
  },
  {
    path: '/reportabuse',
    router: reportabuse,
    method: 'post',
  },
  {
    path: '/subscribe',
    router: subscribe,
    method: 'post',
  },
  {
    path: '/comment',
    router: comment,
    method: 'post',
  },
])
