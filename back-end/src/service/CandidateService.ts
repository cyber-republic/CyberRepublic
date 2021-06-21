import Base from './Base'
import { ela } from '../utility'
import { constant } from '../constant'

const { TERM_COUNCIL_STATUS } = constant

export default class extends Base {
  private model: any
  private councilModel: any
  protected init() {
    this.model = this.getDBModel('Candidate')
    this.councilModel = this.getDBModel('Council')
  }

  public async backupCandidateList() {
    const crRelatedStageStatus = await ela.getCrrelatedStage()
    if (!crRelatedStageStatus) return
    // prettier-ignore
    const {
      invoting,
      votingstartheight,
      votingendheight
    } = crRelatedStageStatus
    if (!invoting) return

    const curTerm = await this.councilModel.findOne(
      { status: TERM_COUNCIL_STATUS.VOTING },
      ['index']
    )
    if (!curTerm) return

    const candidatesList = await ela.currentCandidates()
    if (!candidatesList) return

    const fields = {
      term: curTerm.index,
      votingstartheight,
      votingendheight,
      members: candidatesList.crcandidatesinfo
    }
    const doc = await this.model.findOne({ term: curTerm.index })
    if (!doc) {
      await this.model.save(fields)
    }

    await this.model.update(
      { term: curTerm.index },
      { members: candidatesList.crcandidatesinfo }
    )
  }
}
