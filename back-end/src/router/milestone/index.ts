import Base from '../Base'
import applyPayment from './apply_payment'
import signatureCallback from './owner_signature_callback'
import checkSignature from './check_signature'
import review from './review'
import checkReviewTxid from './review_txid'
import withdraw from './withdraw'

export default Base.setRouter([
  {
    path: '/:id/milestones/:milestoneKey',
    router: applyPayment,
    method: 'post'
  },
  {
    path: '/milestones/signature-callback',
    router: signatureCallback,
    method: 'post'
  },
  {
    path: '/milestones/signature',
    router: checkSignature,
    method: 'post'
  },
  {
    path: '/:id/milestones/:milestoneKey/review',
    router: review,
    method: 'post'
  },
  {
    path: '/milestones/review/txid',
    router: checkReviewTxid,
    method: 'post'
  },
  {
    path: '/:id/milestones/:milestoneKey/withdraw',
    router: withdraw,
    method: 'get'
  }
])
