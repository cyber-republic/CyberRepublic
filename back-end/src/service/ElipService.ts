import Base from './Base'
import { Document } from 'mongoose'
import * as _ from 'lodash'
import { constant } from '../constant'
import { logger } from '../utility'
import { mail, user as userUtil } from '../utility'

export default class extends Base {
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

    const subject = `New ELIP created: ${elip.title}`
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

    const recVariables = _.zipObject(
      toMails,
      _.map(toUsers, user => {
        return {
          _id: user._id,
          username: userUtil.formatUsername(user)
        }
      })
    )

    const mailObj = {
      to: toMails,
      subject,
      body,
      recVariables
    }

    mail.send(mailObj)
  }
}
