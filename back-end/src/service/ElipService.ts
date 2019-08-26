import Base from './Base'
import { Document } from 'mongoose'
import * as _ from 'lodash'
import { constant } from '../constant'
import { mail, logger } from '../utility'

export default class extends Base {
  public async update(param: any): Promise<Document> {
    try {
      const db_elip = this.getDBModel('Elip')
      const { title, description, _id, status } = param
      const elip = await db_elip
        .getDBInstance()
        .findOne({ _id })
        .populate('createdBy')
      if (!elip) {
        throw 'ElipService.update - invalid elip id'
      }
      if (!elip.createdBy._id.equals(this.currentUser._id)) {
        throw 'ElipService.update - current user is not the author of elip'
      }
      const doc: any = {
        title,
        description,
        status
      }
      const rs = await db_elip.update({ _id }, doc)
      this.notifySecretaries(elip)
      return rs
    } catch (error) {
      logger.error(error)
      return
    }
  }

  public async create(param: any): Promise<Document> {
    try {
      const db_elip = this.getDBModel('Elip')
      const { title, description } = param
      const vid = await this.getNewVid()
      const doc: any = {
        title,
        vid,
        description,
        status: constant.ELIP_STATUS.WAIT_FOR_REVIEW,
        published: false,
        contentType: constant.CONTENT_TYPE.MARKDOWN,
        createdBy: this.currentUser._id
      }
      const elip = await db_elip.save(doc)
      this.notifySecretaries(elip)
      return elip
    } catch (error) {
      logger.error(error)
      return
    }
  }

  public async getNewVid() {
    const db_elip = this.getDBModel('Elip')
    const n = await db_elip.count({})
    return n + 1
  }

  private async notifySecretaries(elip: any) {
    const db_user = this.getDBModel('User')
    const currentUserId = _.get(this.currentUser, '_id')
    const secretaries = await db_user.find({
      role: constant.USER_ROLE.SECRETARY
    })
    const toUsers = _.filter(
      secretaries,
      user => !user._id.equals(currentUserId)
    )
    const toMails = _.map(toUsers, 'email')

    const subject = `New ELIP created`
    const body = `
      <p>This is a new ${elip.title} added and to be reviewed:</p>
      <br />
      <p>Click this link to view more details: <a href="${
        process.env.SERVER_URL
      }/elips/${elip._id}">${process.env.SERVER_URL}/elips/${elip._id}</a></p>
      <br /> <br />
      <p>Cyber Republic Team</p>
      <p>Thanks</p>
    `

    const mailObj = {
      to: toMails,
      subject,
      body
    }

    mail.send(mailObj)
  }

  public async getById(id: string): Promise<any> {
    const db_elip = this.getDBModel('Elip')
    const rs = await db_elip
      .getDBInstance()
      .findOne({ _id: id })
      .populate('createdBy')
    if (!rs) {
      throw 'ElipService.getById - invalid elip id'
    }

    const currentUserId = _.get(this.currentUser, '_id')
    const userRole = _.get(this.currentUser, 'role')

    const isVisible = rs.status === constant.ELIP_STATUS.APPROVED ||
      rs.createdBy._id.equals(currentUserId) ||
      userRole === constant.USER_ROLE.SECRETARY

    return isVisible ? rs : {}
  }

  public async list(param: any): Promise<any> {
    const db_elip = this.getDBModel('Elip')
    const db_user = this.getDBModel('User')
    const currentUserId = _.get(this.currentUser, '_id')
    const userRole = _.get(this.currentUser, 'role')
    const query: any = {}

    if (!this.isLoggedIn()) {
      query.status = constant.ELIP_STATUS.APPROVED
    }

    if (param.filter === constant.ELIP_FILTER.APPROVED) {
      query.status = constant.ELIP_STATUS.APPROVED
    }

    if (param.filter === constant.ELIP_FILTER.SUBMITTED_BY_ME) {
      query.createdBy = currentUserId
    }

    if (param.filter === constant.ELIP_FILTER.WAIT_FOR_REVIEW) {
      query.status = constant.ELIP_STATUS.WAIT_FOR_REVIEW
    }

    if (
      this.isLoggedIn() &&
      userRole !== constant.USER_ROLE.SECRETARY &&
      param.filter === constant.ELIP_FILTER.ALL
    ) {
      query.$or = [
        { createdBy: currentUserId, 
          status: { $in: [constant.ELIP_STATUS.REJECTED, constant.ELIP_STATUS.WAIT_FOR_REVIEW] }
        },
        { status: constant.ELIP_STATUS.APPROVED },
      ]
    }

    if (param.$or && query.$or) {
      query.$and= [
        { $or: query.$or},
        {$or: param.$or}
      ]
    }

    if (param.$or && !query.$or) {
      query.$or = param.$or
    }
    
    const list = await db_elip.list(query, {vid: -1}, 100)
    for (const item of list) {
      if (item.createdBy) {
        const user = await db_user.findOne({ _id: item.createdBy })
        if (!_.isEmpty(user)) item.createdBy = user
      }
    }
    return list
  }
}