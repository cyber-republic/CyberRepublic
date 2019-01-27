import { createContainer, api_request } from '@/util'
import Component from './Component'
import I18N from '@/I18N'
import { USER_ROLE, COUNCIL_MEMBER_IDS, COUNCIL_MEMBERS } from '@/constant'


export default createContainer(Component, state => ({
  user: state.user,
  currentUserId: state.user.current_user_id,
  isLogin: state.user.is_login,
  isSecretary: state.user.role === USER_ROLE.SECRETARY || state.user.role === USER_ROLE.ADMIN,
  isCouncil: COUNCIL_MEMBER_IDS.indexOf(state.user.current_user_id) >= 0 || state.user.role === USER_ROLE.COUNCIL,
  static: {
    voter: COUNCIL_MEMBERS,
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
  async getData(id) {
    const d = await api_request({
      path: `/api/cvote/get/${id}`,
    })

    return d;
  },
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
