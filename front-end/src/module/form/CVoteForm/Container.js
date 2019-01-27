import _ from 'lodash'
import { createContainer, api_request, checkPermissions, isSecretary } from '@/util'
import Component from './Component'
import I18N from '@/I18N'
import { COUNCIL_MEMBERS, USER_ROLE } from '@/constant'


export default createContainer(Component, state => ({
  user: state.user,
  isLogin: state.user.is_login,
  isSecretary: isSecretary(state.user.role, USER_ROLE.SECRETARY),
  isCouncil: checkPermissions(state.user.role, USER_ROLE.COUNCIL),
  canCreate: checkPermissions(state.user.role, USER_ROLE.SECRETARY),
  static: {
    voter: _.map(COUNCIL_MEMBERS, value => ({ value })),
    // [
    //   { value: 'Yipeng Su' },
    //   { value: 'Fay Li' },
    //   // { value: 'Feng Zhang' },
    //   { value: 'Kevin Zhang' },
    // ],
    select_type: [
      { name: I18N.get('council.voting.type.newMotion'), code: 1 },
      { name: I18N.get('council.voting.type.motionAgainst'), code: 2 },
      { name: I18N.get('council.voting.type.anythingElse'), code: 3 },
    ],
    select_vote: [
      { name: 'Support', value: 'support' },
      { name: 'Reject', value: 'reject' },
      { name: 'Abstention', value: 'abstention' },
    ],
  },
}), () => ({
  async createCVote(param) {
    const rs = await api_request({
      path: '/api/cvote/create',
      method: 'post',
      data: param,
    });
    return rs;
  },
  async updateCVote(param) {
    const rs = await api_request({
      path: '/api/cvote/update',
      method: 'post',
      data: param,
    });
    return rs;
  },
  async finishCVote(param) {
    const rs = await api_request({
      path: '/api/cvote/finish',
      method: 'get',
      data: param,
    });
    return rs;
  },
  async updateNotes(param) {
    const rs = await api_request({
      path: '/api/cvote/update_notes',
      method: 'post',
      data: param,
    });
    return rs;
  },
}))
