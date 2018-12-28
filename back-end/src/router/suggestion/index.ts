import Base from '../Base'
import create from './create'
import list from './list'

export default Base.setRouter([
  {
    path: '/list',
    router: list,
    method: 'get',
  },
  {
    path: '/create',
    router: create,
    method: 'post',
  },
])
