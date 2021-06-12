import Base from './Base'
import { constant } from '../constant'
import { CVOTE_STATUS_TO_WALLET_STATUS } from './CVoteService'
import { ela, getInformationByDid, getDidName } from '../utility'
import * as moment from 'moment'
import { isNumber } from 'lodash'

const _ = require('lodash')

const DID_PREFIX = 'did:elastos:'

let tm = undefined

export default class extends Base {
  private model: any
  private secretariatModel: any
  private userMode: any
  private proposalMode: any
  private configModel: any
  private candidateModel: any

  protected init() {
    this.model = this.getDBModel('Council')
    this.secretariatModel = this.getDBModel('Secretariat')
    this.userMode = this.getDBModel('User')
    this.proposalMode = this.getDBModel('CVote')
    this.configModel = this.getDBModel('Config')
    this.candidateModel = this.getDBModel('Candidate')
  }

  public async term(): Promise<any> {
    const fields = ['index', 'startDate', 'endDate', 'status']

    const result = await this.model.getDBInstance().find({}, fields)

    const currentConfig = await this.configModel.getDBInstance().findOne()
    const crRelatedStageStatus = await ela.getCrrelatedStage()
    // prettier-ignore
    const {
      ondutyendheight,
      invoting,
      votingstartheight,
      votingendheight
    } = crRelatedStageStatus
    const { currentHeight } = currentConfig
    let votingStart
    if (invoting) {
      votingStart = await ela.getTimestampByHeight(votingstartheight)
    }
    let blockMinute = 2 * 60
    // if (process.env.NODE_ENV !== 'production') {
    //   blockMinute = 252 * 60
    // }
    return _.map(result, (o: any) => {
      let dateObj = {}
      if (o.status !== constant.TERM_COUNCIL_STATUS.VOTING) {
        const difference = (ondutyendheight - currentHeight) * blockMinute
        dateObj['startDate'] = o.startDate && moment(o.startDate).unix()
        if (!o.endDate) {
          dateObj['endDate'] = difference + moment().unix()
        }
      }
      if (o.status == constant.TERM_COUNCIL_STATUS.VOTING && invoting) {
        const difference = (votingendheight - currentHeight) * blockMinute
        dateObj['startDate'] = votingStart
        dateObj['endDate'] = difference + moment().unix()
      }
      if (o.status === constant.TERM_COUNCIL_STATUS.HISTORY) {
        dateObj['endDate'] = o.endDate && moment(o.endDate).unix()
      }
      return {
        id: o._id,
        ..._.omit(o._doc, ['_id', 'startDate', 'endDate']),
        ...dateObj
      }
    })
  }

  public async councilList(id: number): Promise<any> {
    const fields = [
      'status',
      'councilMembers.didName',
      'councilMembers.cid',
      'councilMembers.avatar',
      'councilMembers.did',
      'councilMembers.user.did',
      'councilMembers.location',
      'councilMembers.status',
      'councilMembers.impeachmentVotes'
    ]

    const secretariatFields = [
      'did',
      'didName',
      'avatar',
      'user.did',
      'location',
      'startDate',
      'endDate',
      'status'
    ]

    const query = {}

    if (id) {
      query['index'] = id
    } else {
      query['status'] = constant.TERM_COUNCIL_STATUS.CURRENT
    }

    const result = await this.model
      .getDBInstance()
      .findOne(query, fields)
      .populate(
        'councilMembers.user',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )

    const secretariatResult = await this.secretariatModel
      .getDBInstance()
      .find({}, secretariatFields)
      .sort({ startDate: -1 })
      .populate('user', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    if (!result) {
      return {
        code: 400,
        message: 'Invalid request parameters',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }

    let circulatingSupply
    if (result.status === constant.TERM_COUNCIL_STATUS.CURRENT) {
      circulatingSupply = (await ela.currentCirculatingSupply()) * 0.2
    }

    const filterFields = (o: any, status: any) => {
      const fields = ['_id', 'user', 'startDate', 'endDate']
      if (status !== constant.TERM_COUNCIL_STATUS.CURRENT) {
        fields.push('impeachmentVotes')
        return _.omit(o, fields)
      }

      if (
        o.impeachmentVotes >= 0 &&
        circulatingSupply &&
        circulatingSupply > 0
      ) {
        o.rejectRatio =
          o.impeachmentVotes == 0
            ? 0
            : _.toNumber(
                (
                  _.toNumber(o.impeachmentVotes) / _.toNumber(circulatingSupply)
                ).toFixed(8)
              )
      }
      return _.omit(o, fields)
    }

    const councilList =
      result.status === constant.TERM_COUNCIL_STATUS.VOTING
        ? result.councilMembers
        : _.filter(result.councilMembers, (e: any) =>
            [
              constant.COUNCIL_STATUS.ELECTED,
              constant.COUNCIL_STATUS.IMPEACHED,
              constant.COUNCIL_STATUS.TERMINATED
            ].includes(e.status)
          )
    const council = _.map(councilList, (o: any) => ({
      ...filterFields(o._doc, result.status),
      ...this.getUserInformation(o._doc, o.user)
    }))

    const secretariat = _.map(secretariatResult, (o: any) => ({
      ...filterFields(o._doc, null),
      ...this.getUserInformation(o._doc, o.user),
      startDate: moment(o.startDate).unix(),
      endDate: o.endDate && moment(o.endDate).unix()
    }))

    return {
      council,
      secretariat,
      circulatingSupply
    }
  }

  public async councilInformation(param: any): Promise<any> {
    const db_cvote_history = this.getDBModel('CVote_Vote_History')
    let { id, did } = param
    if (!did) {
      throw 'invalid did'
    }

    // query council
    const fields = [
      'height',
      'circulatingSupply',
      'status',
      'councilMembers.didName',
      'councilMembers.avatar',
      'councilMembers.user.did',
      'councilMembers.cid',
      'councilMembers.did',
      'councilMembers.address',
      'councilMembers.introduction',
      'councilMembers.impeachmentVotes',
      'councilMembers.depositAmount',
      'councilMembers.location',
      'councilMembers.status'
    ]
    const query = {
      councilMembers: {
        $elemMatch: {
          did,
          status: {
            $in: [
              constant.COUNCIL_STATUS.ELECTED,
              constant.COUNCIL_STATUS.IMPEACHED,
              constant.COUNCIL_STATUS.INACTIVE
            ]
          }
        }
      }
    }
    if (id) {
      query['index'] = id
    } else {
      query['status'] = constant.TERM_COUNCIL_STATUS.CURRENT
    }
    const councilList = await this.model
      .getDBInstance()
      .findOne(query, fields)
      .populate(
        'councilMembers.user',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )

    // query secretariat
    const secretariatFields = [
      'user.did',
      'did',
      'address',
      'location',
      'birthday',
      'email',
      'introduction',
      'wechat',
      'weibo',
      'facebook',
      'microsoft',
      'startDate',
      'endDate',
      'status'
    ]
    const querySec = { did }
    if (id) {
      querySec['term'] = id
    } else {
      querySec['status'] = constant.SECRETARIAT_STATUS.CURRENT
    }
    const secretariat = await this.secretariatModel
      .getDBInstance()
      .findOne(querySec, secretariatFields)
      .populate('user', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    if (!councilList && !secretariat) {
      const query = {
        term: id,
        members: { $elemMatch: { did } }
      }
      const result = await this.candidateModel.findOne(query)
      if (result) {
        const assets = await ela.depositCoin(did)
        return {
          type: 'UnelectedCouncilMember',
          depositAmount: _.get(assets, 'available')
        }
      }
      return {
        type: 'Other'
      }
    }

    if (councilList) {
      const council =
        councilList &&
        _.filter(councilList.councilMembers, (o: any) => o.did === did)[0]

      let term = []
      let impeachmentObj = {}
      if (councilList.status !== constant.TERM_COUNCIL_STATUS.VOTING) {
        const currentCouncil = await ela.currentCouncil()
        const thisDidInfo = _.find(currentCouncil.crmembersinfo, { did })
        // prettier-ignore
        impeachmentObj['dpospublickey'] = thisDidInfo && thisDidInfo.dpospublickey
        // update impeachment
        const circulatingSupply = councilList.circulatingSupply
          ? councilList.circulatingSupply
          : await ela.circulatingSupply(councilList.height)
        const impeachmentThroughVotes = circulatingSupply * 0.2
        impeachmentObj['impeachmentVotes'] = council.impeachmentVotes
        impeachmentObj['impeachmentThroughVotes'] = _.toNumber(
          impeachmentThroughVotes.toFixed(8)
        )
        impeachmentObj['impeachmentRatio'] = _.toNumber(
          (council.impeachmentVotes / impeachmentThroughVotes).toFixed(4)
        )
        // update term
        if (council && council.user) {
          const proposalFields = [
            'createdBy',
            'createdAt',
            'vid',
            'title',
            'status',
            'voteResult'
          ]
          const proposalList = await this.proposalMode
            .getDBInstance()
            .find(
              {
                $or: [
                  { proposer: council.user._id },
                  { 'voteResult.votedBy': council.user._id }
                ]
              },
              proposalFields
            )
            .sort({ createdAt: -1 })
            .populate(
              'createdBy',
              constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
            )
          const cvoteHistory = await db_cvote_history
            .getDBInstance()
            .find({ votedBy: council.user._id })
            .populate(
              'votedBy',
              constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
            )
          const history = _.keyBy(cvoteHistory, 'votedBy._id')
          term = _.map(proposalList, (o: any) => {
            const didName = _.get(o, 'createdBy.did.didName')
            let voteResult = _.filter(
              o.voteResult,
              (o: any) =>
                council.user._id.equals(o.votedBy) &&
                o.status == constant.CVOTE_CHAIN_STATUS.CHAINED
            )
            if (_.isEmpty(voteResult)) {
              voteResult = _.filter(
                history,
                (e: any) =>
                  e.proposalBy.equals(o._id) &&
                  e.status == constant.CVOTE_CHAIN_STATUS.CHAINED
              )
            }
            const currentVoteResult = _.get(voteResult[0], 'value')
            return {
              id: o.vid,
              title: o.title,
              didName,
              status: CVOTE_STATUS_TO_WALLET_STATUS[o.status],
              voteResult: currentVoteResult,
              createdAt: moment(o.createdAt).unix()
            }
          })
          term = _.filter(term, (o: any) => {
            return (
              o.voteResult && o.voteResult !== constant.CVOTE_RESULT.UNDECIDED
            )
          })
        }
      }
      if (
        councilList.status === constant.TERM_COUNCIL_STATUS.HISTORY &&
        [
          constant.COUNCIL_STATUS.ELECTED,
          constant.COUNCIL_STATUS.INACTIVE
        ].includes(council.status)
      ) {
        council.status = constant.COUNCIL_STATUS.EXPIRED
      }
      const assets = await ela.depositCoin(did)
      if (assets) {
        council.depositAmount = _.get(assets, 'available')
      }
      return {
        ..._.omit(council._doc, ['_id', 'user', 'impeachmentVotes']),
        ...this.getUserInformation(council._doc, council.user),
        ...impeachmentObj,
        term,
        type: 'CouncilMember'
      }
    }

    if (secretariat) {
      return {
        ..._.omit(secretariat._doc, ['_id', 'user', 'startDate', 'endDate']),
        ...this.getUserInformation(secretariat._doc, secretariat.user),
        startDate: moment(secretariat.startDate).unix(),
        endDate: secretariat.endDate && moment(secretariat.endDate).unix(),
        type: 'SecretaryGeneral'
      }
    }
  }

  public async eachSecretariatJob() {
    const result = await ela.getSecretaryGeneral()
    const secretaryPublicKey = _.get(result, 'secretarygeneral')
    if (!secretaryPublicKey) {
      return
    }

    const query = { 'did.compressedPublicKey': secretaryPublicKey }
    const user = await this.userMode.findOne(query, ['_id', 'did'])
    let information: any
    let didName: string
    const did = _.get(user, 'did.id')
    if (user && did) {
      const rs = await Promise.all([getInformationByDid(did), getDidName(did)])
      information = rs[0]
      didName = rs[1]
    }

    const current = await this.secretariatModel.findOne({
      status: constant.SECRETARIAT_STATUS.CURRENT
    })

    const isChanged = current && current.publicKey !== secretaryPublicKey
    if (!current || isChanged) {
      if (isChanged) {
        current.status = constant.SECRETARIAT_STATUS.NON_CURRENT
        await Promise.all([
          current.save(),
          this.userMode.update(
            { 'did.id': DID_PREFIX + current.did },
            { role: constant.USER_ROLE.MEMBER }
          )
        ])
      }
      const doc: any = this.filterNullField({
        ...information,
        user: user && user._id,
        did: did && did.slice(DID_PREFIX.length),
        didName,
        startDate: new Date(),
        status: constant.SECRETARIAT_STATUS.CURRENT,
        publicKey: secretaryPublicKey
      })
      // add secretariat
      await this.secretariatModel.getDBInstance().create(doc)
    } else {
      const doc: any = this.filterNullField({
        ...information,
        user: user && user._id,
        did: did && did.slice(DID_PREFIX.length),
        didName
      })
      // update secretariat
      await this.secretariatModel.update({ publicKey: secretaryPublicKey }, doc)
    }

    if (user && user.did) {
      let fields: any = {}
      if (user.role !== constant.USER_ROLE.SECRETARY) {
        fields.role = constant.USER_ROLE.SECRETARY
      }
      const did = this.filterNullField({
        'did.avatar': _.get(information, 'avatar'),
        'did.didName': didName
      })
      if (!_.isEmpty(did)) {
        const keys = Object.keys(did)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          if (did[key] !== _.get(user, key)) {
            fields[key] = did[key]
          }
        }
      }
      if (!_.isEmpty(fields)) {
        await this.userMode.update({ _id: user._id }, { $set: fields })
      }
    }
  }

  public async cronJob() {
    if (tm) {
      return false
    }
    tm = setInterval(async () => {
      console.log(
        '---------------- start council or secretariat cronJob -------------'
      )
      await this.eachSecretariatJob()
      await this.eachCouncilJobPlus()
    }, 1000 * 60 * 5)
  }

  /**
   * get user information
   * didName avatar
   * @param obj
   * @param user
   */
  private getUserInformation(obj: any, user: any) {
    const { didName, avatar }: any = obj || {}
    const { didName: userDidName, avatar: userAvatar }: any =
      (user && user.did && _.pick(user.did, ['didName', 'avatar'])) || {}
    return this.filterNullField({
      didName: userDidName || didName,
      avatar: userAvatar || avatar
    })
  }

  private filterNullField(obj: object) {
    return _.pickBy(obj, _.identity)
  }

  public async temporaryChangeUpdateStatus() {
    const db_cvote = this.getDBModel('CVote')
    const proposaedList = await db_cvote.find({
      status: constant.CVOTE_STATUS.PROPOSED,
      old: { $ne: true }
    })
    const notificationList = await db_cvote.find({
      status: constant.CVOTE_STATUS.NOTIFICATION,
      old: { $ne: true }
    })
    const idsProposaed = []
    const idsNotification = []

    _.each(proposaedList, (item) => {
      idsProposaed.push(item._id)
      // this.proposalAborted(item.proposalHash)
    })
    _.each(notificationList, (item) => {
      idsNotification.push(item._id)
      // this.proposalAborted(item.proposalHash)
    })
    await db_cvote.update(
      {
        _id: { $in: idsProposaed }
      },
      {
        $set: {
          status: constant.CVOTE_STATUS.REJECT
        }
      },
      {
        multi: true
      }
    )
    await db_cvote.update(
      {
        _id: { $in: idsNotification }
      },
      {
        $set: {
          status: constant.CVOTE_STATUS.VETOED
        }
      },
      {
        multi: true
      }
    )
  }

  public async eachCouncilJobPlus() {
    const listCrs = await ela.currentCouncil()
    const height = await ela.height()
    const circulatingSupply = await ela.currentCirculatingSupply()

    const crRelatedStageStatus = await ela.getCrrelatedStage()

    const { onduty: isOnduty, invoting: isInVoting } = crRelatedStageStatus

    const currentCrs = await this.model
      .getDBInstance()
      .findOne({ status: constant.TERM_COUNCIL_STATUS.CURRENT })
    const votingCds = await this.model
      .getDBInstance()
      .findOne({ status: constant.TERM_COUNCIL_STATUS.VOTING })
    const historyCrs = await this.model
      .getDBInstance()
      .findOne({ status: constant.TERM_COUNCIL_STATUS.HISTORY })

    let index: any
    if (currentCrs) {
      index = currentCrs.index
    } else if (!currentCrs && historyCrs) {
      index = historyCrs.index
    } else {
      index = 0
    }

    const fields = [
      'code',
      'cid',
      'did',
      'location',
      'penalty',
      'votes',
      'index'
    ]

    const dataToCouncil = (data: any) => ({
      ..._.pick(data, fields),
      address: data.url,
      impeachmentVotes: data.impeachmentvotes,
      depositAmount: data.depositamout,
      depositAddress: data.depositaddress,
      status: data.state
    })

    const updateUserInformation = async (councilMembers: any) => {
      const didList = _.map(councilMembers, (o: any) => DID_PREFIX + o.did)
      const userList = await this.userMode
        .getDBInstance()
        .find({ 'did.id': { $in: didList } }, ['_id', 'did.id'])
      const userByDID = _.keyBy(userList, (o: any) =>
        o.did.id.replace(DID_PREFIX, '')
      )

      // add avatar nickname into user's did
      const councilsMember = await Promise.all(
        _.map(councilMembers, async (o: any) => {
          const information: any = await getInformationByDid(o.did)
          const didName = await getDidName(DID_PREFIX + o.did)
          const did = this.filterNullField({
            'did.avatar': _.get(information, 'avatar'),
            'did.didName': didName
          })
          if (!_.isEmpty(did) && userByDID[o.did]) {
            await this.userMode.getDBInstance().update(
              { _id: userByDID[o.did]._id },
              {
                $set: did
              }
            )
          }
          const data = {
            ...o,
            ..._.omit(information, ['did'])
          }
          return {
            ...data,
            didName,
            user: userByDID[o.did]
          }
        })
      )
      return councilsMember
    }

    const updateUserRoleToNewDid = async () => {
      const electedCouncils = _.filter(
        listCrs.crmembersinfo,
        (o: any) => o.state === constant.COUNCIL_STATUS.ELECTED
      )
      const impeachedCouncils = _.filter(
        listCrs.crmembersinfo,
        (o: any) => o.state !== constant.COUNCIL_STATUS.ELECTED
      )

      const electedDidList = _.map(
        electedCouncils,
        (o: any) => DID_PREFIX + o.did
      )
      const impeachedDidList = _.map(
        impeachedCouncils,
        (o: any) => DID_PREFIX + o.did
      )

      await this.userMode.getDBInstance().update(
        { 'did.id': { $in: electedDidList } },
        {
          $set: { role: constant.USER_ROLE.COUNCIL }
        },
        {
          multi: true
        }
      )
      await this.userMode.getDBInstance().update(
        { 'did.id': { $in: impeachedDidList } },
        {
          $set: { role: constant.USER_ROLE.MEMBER }
        },
        {
          multi: true
        }
      )
    }

    const updateUserRole = async (councilMembers: any, role: any) => {
      const didList = _.map(councilMembers, (o: any) => DID_PREFIX + o.did)

      switch (role) {
        case constant.USER_ROLE.COUNCIL:
          await this.userMode.update(
            { 'did.id': { $in: didList } },
            {
              $set: {
                role: constant.USER_ROLE.COUNCIL
              }
            },
            { multi: true }
          )
          break
        case constant.USER_ROLE.MEMBER:
          await this.userMode.update(
            { 'did.id': { $in: didList } },
            {
              $set: {
                role: constant.USER_ROLE.MEMBER
              }
            },
            { multi: true }
          )
          break
      }
    }

    const updateInformation = async (list: any, data: any, status: any) => {
      const newCouncilMembers = _.map(list, (o: any) => dataToCouncil(o))
      const newCouncilsByDID = _.keyBy(newCouncilMembers, 'did')
      const oldCouncilsByDID = _.keyBy(data && data.councilMembers, 'did')

      let councils
      let doc = {
        index,
        height,
        circulatingSupply,
        startDate: null,
        endDate: null,
        status: constant.TERM_COUNCIL_STATUS.VOTING,
        councilMembers: [],
        ..._.omit(data && data._doc, ['_id'])
      }

      const startTime = await ela.getTimestampByHeight(
        crRelatedStageStatus.ondutystartheight
      )
      const endTime = await ela.getTimestampByHeight(
        crRelatedStageStatus.votingstartheight
      )
      if (status) {
        const councilMembers = await updateUserInformation(newCouncilMembers)
        doc['status'] = status
        doc['startDate'] = new Date(startTime * 1000)
        doc['councilMembers'] = councilMembers
      }

      if (_.isEmpty(data)) {
        doc['index'] = index + 1
        await this.model.getDBInstance().create(doc)
        return
      }

      if (status && data.status === constant.TERM_COUNCIL_STATUS.VOTING) {
        doc['status'] = status
        doc['startDate'] = new Date(startTime * 1000)
      }
      if (status && data.status === constant.TERM_COUNCIL_STATUS.CURRENT) {
        doc['status'] = status
        doc['startDate'] = data.startDate
        doc['endDate'] =
          crRelatedStageStatus.ondutystartheight !== 0
            ? new Date(startTime * 1000)
            : new Date(endTime * 1000)
      }

      if (!_.isEmpty(oldCouncilsByDID)) {
        // update IMPEACHED status
        if (data.status === constant.TERM_COUNCIL_STATUS.CURRENT) {
          const result = _.filter(
            oldCouncilsByDID,
            (v: any, k: any) =>
              newCouncilsByDID[k] &&
              // && v.status !== constant.COUNCIL_STATUS.IMPEACHED
              newCouncilsByDID[k].status === constant.COUNCIL_STATUS.IMPEACHED
          )
          await updateUserRole(result, constant.USER_ROLE.MEMBER)
        }
        councils = _.map(oldCouncilsByDID, (v: any, k: any) =>
          _.merge(v._doc, newCouncilsByDID[k])
        )
      } else {
        councils = newCouncilMembers
      }
      const councilMembers = await updateUserInformation(councils)
      doc['councilMembers'] = councilMembers
      doc['height'] = height
      doc['circulatingSupply'] = circulatingSupply
      await this.model.getDBInstance().update({ _id: data._id }, { ...doc })
    }

    if (isOnduty) {
      if (isInVoting) {
        await updateInformation(listCrs.crmembersinfo, currentCrs, null)
        await updateInformation(null, votingCds, null)
      } else {
        if (currentCrs && votingCds) {
          await updateInformation(
            listCrs.crmembersinfo,
            votingCds,
            constant.TERM_COUNCIL_STATUS.CURRENT
          )
          await updateUserRole(
            listCrs.crmembersinfo,
            constant.USER_ROLE.COUNCIL
          )
          await updateInformation(
            null,
            currentCrs,
            constant.TERM_COUNCIL_STATUS.HISTORY
          )
          await updateUserRole(
            currentCrs.councilMembers,
            constant.USER_ROLE.MEMBER
          )
        }
        if (!currentCrs && votingCds) {
          await updateInformation(
            listCrs.crmembersinfo,
            votingCds,
            constant.TERM_COUNCIL_STATUS.CURRENT
          )
          await updateUserRole(
            listCrs.crmembersinfo,
            constant.USER_ROLE.COUNCIL
          )
        }
        if (currentCrs && !votingCds) {
          await updateInformation(listCrs.crmembersinfo, currentCrs, null)
          await updateUserRoleToNewDid()
        }
        if (!currentCrs && !votingCds && !historyCrs) {
          await updateInformation(
            listCrs.crmembersinfo,
            null,
            constant.TERM_COUNCIL_STATUS.CURRENT
          )
          await updateUserRole(
            listCrs.crmembersinfo,
            constant.USER_ROLE.COUNCIL
          )
        }
      }
    }

    if (!isOnduty) {
      if (currentCrs) {
        await updateInformation(
          null,
          currentCrs,
          constant.TERM_COUNCIL_STATUS.HISTORY
        )
        await updateUserRole(
          currentCrs.councilMembers,
          constant.USER_ROLE.MEMBER
        )
        await this.temporaryChangeUpdateStatus()
      }
      if (!votingCds) {
        await updateInformation(null, null, null)
      }
    }
  }

  public async getCouncilSecretariat() {
    const councils = await this.model
      .getDBInstance()
      .findOne({ status: constant.TERM_COUNCIL_STATUS.CURRENT })
    const secretariat = await this.secretariatModel.getDBInstance().findOne()
    return {
      councils: councils && councils._doc,
      secretariat: secretariat && secretariat._doc
    }
  }

  public async invoting() {
    const rs = await ela.getCrrelatedStage()
    if (rs) {
      return { invoting: rs.invoting }
    }
  }
}
