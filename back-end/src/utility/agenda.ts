import db from '../db'
import { getProposalState } from '../utility'
import CVoteServive from '../service/CVoteService'
import CouncilService from '../service/CouncilService'
import UserService from '../service/UserService'
import ElaTransactionService from '../service/ElaTransactionService'
import CandidateService from '../service/CandidateService'
import { constant } from '../constant'

const Agenda = require('agenda')
const agenda = new Agenda({ db: { address: process.env.DB_URL } })

const JOB_NAME = {
  INTOPROPOSAL: 'new make into proposal',
  CVOTEJOB: 'cvote poll proposal',
  COUNCILJOB: 'council poll change',
  USERJOB: 'user poll did infomation',
  UPDATEMILESTONE: 'update milestone status',
  COUNCILREVIEWJOB: 'new council review',
  TRANSACTIONJOB: 'new append transaction',
  NOTIFICATIONCOUNCILVOTE: 'notification council to vote',
  UPDATECURRENTHEIGHT: 'update current height',
  BACKUP_CANDIDATE_LIST: 'backup candidate list'
}

agenda.define(JOB_NAME.UPDATEMILESTONE, async (job: any, done: any) => {
  console.log('------begin updating milestone status------')
  try {
    const DB = await db.create()
    const cvoteService = new CVoteServive(DB, { user: undefined })
    await cvoteService.updateProposalBudget()
  } catch (err) {
    console.log('update milestone status cron job err...', err)
  } finally {
    done()
  }
})

agenda.define(JOB_NAME.INTOPROPOSAL, async (job: any, done: any) => {
  console.log('------begin polling proposal state------')
  try {
    const DB = await db.create()
    const cvote = await DB.getModel('CVote')
    const cvoteService = new CVoteServive(DB, { user: undefined })

    const suggestions = await DB.getModel('Suggestion').find({
      'proposers.did': { $exists: true },
      proposalHash: { $exists: false }
    })
    console.log('suggestions', suggestions.length)
    if (!suggestions.length) {
      return
    }

    let count = 0
    for (let i = 0; i < suggestions.length; i++) {
      const doc = suggestions[i]
      console.log('doc display id', doc.displayId)

      const rs = await getProposalState({ drafthash: doc.draftHash })
      if (rs && rs.success && rs.status === 'Registered') {
        console.log('registered doc.displayId', doc.displayId)
        const proposal = await cvote.findOne({ draftHash: doc.draftHash })
        if (proposal) {
          console.log('existing proposal vid', proposal.vid)
          continue
        }

        const newProposal = await cvoteService.makeSuggIntoProposal({
          suggestion: doc,
          proposalHash: rs.proposalHash,
          chainDid: rs.proposal.crcouncilmemberdid
        })
        if (newProposal) {
          console.log('newProposal.vid', newProposal.vid)
        }
        count++
      }
    }
    console.log('proposed suggestion count...', count)
  } catch (err) {
    console.log('make into proposal cron job err...', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.CVOTEJOB, async (job: any, done: any) => {
  console.log('------begin cvote poll proposal------')
  try {
    const DB = await db.create()
    const cvoteService = new CVoteServive(DB, { user: undefined })
    await cvoteService.pollProposal()
    console.log(JOB_NAME.CVOTEJOB, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.COUNCILJOB, async (job: any, done: any) => {
  console.log('------begin council poll change------')
  try {
    const DB = await db.create()
    const councilService = new CouncilService(DB, { user: undefined })
    // await councilService.eachSecretariatJob()
    await councilService.eachCouncilJobPlus()
    console.log(JOB_NAME.COUNCILJOB, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.USERJOB, async (job: any, done: any) => {
  console.log('------begin user poll did infomation------')
  try {
    const DB = await db.create()
    const userService = new UserService(DB, { user: undefined })
    await userService.eachJob()
    console.log(JOB_NAME.USERJOB, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.COUNCILREVIEWJOB, async (job: any, done: any) => {
  console.log('------begin new council review------')
  try {
    const DB = await db.create()
    const cvoteService = new CVoteServive(DB, { user: undefined })
    await cvoteService.updateVoteStatusByChain()
    console.log(JOB_NAME.COUNCILREVIEWJOB, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.TRANSACTIONJOB, async (job: any, done: any) => {
  console.log('------begin new append transaction------')
  try {
    const DB = await db.create()
    const elaTransactionService = new ElaTransactionService(DB, {
      user: undefined
    })
    await elaTransactionService.appendAllTransaction()
    console.log(JOB_NAME.TRANSACTIONJOB, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})
agenda.define(JOB_NAME.NOTIFICATIONCOUNCILVOTE, async (job: any, done: any) => {
  console.log('------begin notification council to vote------')
  try {
    const DB = await db.create()
    const cvoteService = new CVoteServive(DB, { user: undefined })
    await cvoteService.notifyCouncilToVote(constant.ONE_DAY)
    await cvoteService.notifyCouncilToVote(constant.THREE_DAY)
    console.log(JOB_NAME.NOTIFICATIONCOUNCILVOTE, 'at working')
  } catch (err) {
    console.log('', err)
  } finally {
    done()
  }
})

agenda.define(JOB_NAME.BACKUP_CANDIDATE_LIST, async (job: any, done: any) => {
  try {
    console.log('------backup candidate list is beginning------')
    const DB = await db.create()
    const candidateService = new CandidateService(DB, { user: undefined })
    await candidateService.backupCandidateList()
  } catch (err) {
    console.log('backup candidate list error...', err)
  } finally {
    done()
  }
})

// exec cron jobs
;(async function () {
  console.log('------cron job starting------')
  await agenda.start()
  await agenda.every('2 minutes', JOB_NAME.INTOPROPOSAL)
  await agenda.every('3.5 minutes', JOB_NAME.CVOTEJOB)
  await agenda.every('2.5 minutes', JOB_NAME.COUNCILJOB)
  await agenda.every('30 minutes', JOB_NAME.USERJOB)
  await agenda.every('4 minutes', JOB_NAME.UPDATEMILESTONE)
  await agenda.every('3 minutes', JOB_NAME.COUNCILREVIEWJOB)
  await agenda.every('1 minutes', JOB_NAME.TRANSACTIONJOB)
  await agenda.every('10 minutes', JOB_NAME.NOTIFICATIONCOUNCILVOTE)
  // await agenda.every('5 minutes', JOB_NAME.BACKUP_CANDIDATE_LIST)
})()
