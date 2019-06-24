import BaseService from '../model/BaseService'
import { api_request } from '@/util'

export default class extends BaseService {
  constructor() {
    super()
    // this.selfRedux = this.store.getRedux('cvote')
    this.prefixPath = '/api/cvote'
  }

  async createDraft(param) {
    const path = `${this.prefixPath}/create_draft`

    const rs = await api_request({
      path,
      method: 'post',
      data: param,
    })
    return rs
  }

  async updateDraft(param) {
    const path = `${this.prefixPath}/update_draft`

    const rs = await api_request({
      path,
      method: 'post',
      data: param,
    })
    return rs
  }

  async createCVote(param) {
    const path = `${this.prefixPath}/create`

    const rs = await api_request({
      path,
      method: 'post',
      data: param,
    })
    return rs
  }

  async updateCVote(param) {
    const path = `${this.prefixPath}/update`

    const rs = await api_request({
      path,
      method: 'post',
      data: param,
    })
    return rs
  }

  async finishCVote(param) {
    const path = `${this.prefixPath}/finish`

    const rs = await api_request({
      path,
      method: 'get',
      data: param,
    })
    return rs
  }

  async updateNotes(param) {
    const path = `${this.prefixPath}/update_notes`

    const rs = await api_request({
      path,
      method: 'post',
      data: param,
    })
    return rs
  }

  async listData(param, isCouncil) {
    let result

    if (isCouncil) {
      result = await api_request({
        path: `${this.prefixPath}/list`,
        method: 'get',
        data: param,
      })
    } else {
      result = await api_request({
        path: `${this.prefixPath}/list_public`,
        method: 'get',
        data: param,
      })
    }

    return result
  }

}