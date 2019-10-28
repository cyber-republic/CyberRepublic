import React from 'react'
import { Row, Col, Spin, Button, message, Popconfirm, Anchor } from 'antd'
import { StickyContainer, Sticky } from 'react-sticky'
import styled from 'styled-components'
import MarkdownPreview from '@/module/common/MarkdownPreview'
import Comments from '@/module/common/comments/Container'
import I18N from '@/I18N'
import _ from 'lodash'
import StandardPage from '@/module/page/StandardPage'
import Footer from '@/module/layout/Footer/Container'
import BackLink from '@/module/shared/BackLink/Component'
import Meta from '@/module/common/Meta'
import MetaComponent from '@/module/shared/meta/Container'
import CRPopover from '@/module/shared/Popover/Component'
import { ELIP_STATUS, ELIP_REVIEW_STATUS, ELIP_VOTE_STATUS } from '@/constant'
import { text } from '@/constants/color'
import { logger } from '@/util'
import { breakPoint } from '@/constants/breakPoint'
import moment from 'moment/moment'
import PopoverProfile from '@/module/common/PopoverProfile'
import ReviewHistory from './ReviewHistory'
import VoteHistory from './VoteHistory'

const { Link } = Anchor

class C extends StandardPage {
  constructor(p) {
    super(p)

    this.state = {
      visibleReject: false,
      visibleApprove: false,
      visibleYes: false,
      visibleOppose: false,
    }
  }

  async componentDidMount() {
    await this.refetch()
  }

  componentWillUnmount() {
    this.props.resetData()
  }

  refetch = async () => {
    const { getData, match } = this.props
    try {
      await getData(match.params)
    } catch (err) {
      logger.error(err)
    }
  }

  ord_renderContent() {
    const { data } = this.props
    if (_.isEmpty(data)) {
      return (
        <StyledSpin>
          <Spin />
        </StyledSpin>
      )
    }

    return (
      <Wrapper>
        <Meta
          title={`${data.title} - ELIP Detail - Cyber Republic`}
          url={this.props.location.pathname}
        />
        <Container>
          <BackLink link="/elips" />
          {this.renderAnchors()}
          {this.renderDetail()}
        </Container>
        <Footer />
      </Wrapper>
    )
  }

  isAuthor(elip) {
    const { currentUserId } = this.props
    return elip.createdBy && elip.createdBy._id === currentUserId
  }

  submittedDraft = async () => {
    await this.updateStatus(ELIP_STATUS.SUBMITTED)
  }

  cancelledSubmitted = async () => {
    await this.updateStatus(ELIP_STATUS.CANCELLED)
  }

  updateStatus = async elipStatus => {
    try {
      const { updateStatus, data } = this.props
      const rs = await updateStatus({
        _id: data._id,
        status: elipStatus
      })
      if (rs && rs.ok === 1 && rs.n === 1) {
        message.info(I18N.get('elip.msg.marked'))
        this.refetch()
      }
    } catch (error) {
      logger.error(error)
    }
  }

  updateReviewStatus = async (status, reason) => {
    const { review, data } = this.props
    const param = {
      comment: reason && reason.reason,
      status,
      elipId: data._id
    }
    try {
      await review(param)
      if (ELIP_REVIEW_STATUS.REJECTED === status) {
        message.info(I18N.get('elip.msg.rejected'))
      }
      if (ELIP_REVIEW_STATUS.APPROVED === status) {
        message.info(I18N.get('elip.msg.approved'))
      }
      this.refetch()
    } catch (err) {
      logger.error(err)
    }
  }

  rejectdReview = reason => {
    this.updateReviewStatus(ELIP_REVIEW_STATUS.REJECTED, reason)
  }

  approvedReview = reason => {
    this.updateReviewStatus(ELIP_REVIEW_STATUS.APPROVED, reason)
  }

  updateVoteStatus = async (status, reason) => {
    const { vote, data } = this.props
    const param = {
      comment: reason && reason.reason,
      status,
      elipId: data._id
    }
    try {
      await vote(param)
      message.success(I18N.get('elip.msg.updated'))
      this.refetch()
    } catch (err) {
      logger.error(err)
    }
  }

  yesVote = reason => {
    this.updateVoteStatus(ELIP_VOTE_STATUS.YES, reason)
  }

  opposeVote = reason => {
    this.updateVoteStatus(ELIP_VOTE_STATUS.OPPOSE, reason)
  }

  abstainVote = reason => {
    this.updateVoteStatus(ELIP_VOTE_STATUS.ABSTAIN, reason)
  }

  renderAnchors() {
    const { data, reviews, isSecretary } = this.props
    const reviewLink =
      isSecretary || (this.isAuthor(data) && !_.isEmpty(reviews)) ? (
        <Link href="#review" title={I18N.get('elip.fields.review')} />
      ) : null
    const voteLink =
      ELIP_STATUS.SUBMITTED === data.status ? (
        <Link href="#vote" title={I18N.get('elip.fields.vote')} />
      ) : null
    return (
      <StyledAnchor offsetTop={300}>
        <LinkGroup>
          <Link href="#preamble" title={I18N.get('elip.fields.preamble')} />
          <Link href="#abstract" title={I18N.get('elip.fields.abstract')} />
        </LinkGroup>
        <LinkGroup marginTop={48}>
          <Link
            href="#specifications"
            title={I18N.get('elip.fields.specifications')}
          />
          <Link href="#motivation" title={I18N.get('elip.fields.motivation')} />
          <Link href="#rationale" title={I18N.get('elip.fields.rationale')} />
        </LinkGroup>
        <LinkGroup marginTop={46}>
          <Link
            href="#backwardCompatibility"
            title={I18N.get('elip.fields.backwardCompatibility')}
          />
          <Link
            href="#referenceImplementation"
            title={I18N.get('elip.fields.referenceImplementation')}
          />
          <Link href="#copyright" title={I18N.get('elip.fields.copyright')} />
        </LinkGroup>
        <LinkGroup marginTop={51}>
          {reviewLink}
          {/* {voteLink} */}
        </LinkGroup>
      </StyledAnchor>
    )
  }

  renderDetail() {
    const { data } = this.props
    const sections = [
      'abstract',
      'specifications',
      'motivation',
      'rationale',
      'backwardCompatibility',
      'referenceImplementation',
      'copyright'
    ]

    const stickyHeader = this.renderStickyHeader()
    const preamble = this.renderPreamble()
    const review = this.renderReview()
    const vote = this.renderVote()
    const comment = this.renderComment()

    return (
      <Content>
        <StickyContainer>
          {stickyHeader}
          {preamble}
          {_.map(sections, section => (
            <Part id={section} key={section}>
              <PartTitle>{I18N.get(`elip.fields.${section}`)}</PartTitle>
              <PartContent>
                <MarkdownPreview content={data[section] ? data[section] : ''} />
              </PartContent>
            </Part>
          ))}
          {review}
          {/* {vote} */}
          {comment}
        </StickyContainer>
      </Content>
    )
  }

  renderStickyHeader() {
    const metaNode = this.renderMeta()
    const titleNode = this.renderTitleNode()
    const subTitleNode = this.renderSubTitle()

    return (
      <Sticky>
        {({ style, isSticky, wasSticky }) => {
          const finalStyle = style
            ? {
              ...style,
              zIndex: 2
            }
            : style
          return (
            <div style={finalStyle}>
              <FixedHeader>
                {metaNode}
                {titleNode}
                {subTitleNode}
              </FixedHeader>
            </div>
          )
        }}
      </Sticky>
    )
  }

  renderMeta() {
    const { data, user } = this.props
    data.proposer = data.createdBy
    data.displayId = data.vid
    const postedByText = I18N.get('from.CVoteForm.label.proposedby')
    return <MetaComponent data={data} postedByText={postedByText} user={user}/>
  }

  renderTitleNode() {
    const { data } = this.props
    return <Title>{data.title}</Title>
  }

  renderSubTitle() {
    const status = this.renderStatus()
    const edit = this.renderEditButton()
    const submitted = this.renderSubmittedButton()
    const cancelled = this.renderCancelledButton()
    return (
      <Row type="flex" justify="start" gutter={25.5}>
        {status}
        {edit}
        {submitted}
        {/* {cancelled} */}
      </Row>
    )
  }

  renderPreamble() {
    const { data } = this.props
    const preambles = {
      elip: ![ELIP_STATUS.WAIT_FOR_REVIEW, ELIP_STATUS.REJECTED].includes(data.status) && `#${data.vid}`,
      title: data.title,
      author: data.createdBy && data.createdBy.username,
      discussions: data.discussions,
      status: I18N.get(`elip.status.${data.status}`),
      type: I18N.get(`elip.form.typeTitle.${data.elipType}`),
      created: moment(data.createdAt).format('YYYY-MM-DD'),
      requires: data.requires,
      replaces: data.replaces,
      superseded: data.superseded
    }

    return (
      <Part id="preamble">
        <PartTitle>{I18N.get('elip.fields.preamble')}</PartTitle>
        <PartContent className="preamble">
          {_.map(preambles, (v, k) => !_.isEmpty(v) && this.renderPreambleItem(I18N.get(`elip.fields.preambleItems.${k}`), v, k))}
        </PartContent>
      </Part>
    )
  }

  renderPreambleItem(key, value, item) {
    const { data, user } = this.props
    let text = value
    if (item === 'author') {
      text = <PopoverProfile owner={data.createdBy} curUser={user} />
    }
    return (
      <Item key={key}>
        <Col span={6}>
          <ItemTitle>{key}</ItemTitle>
        </Col>
        <Col span={18}>
          <ItemText className="preamble preamble-value">{text}</ItemText>
        </Col>
      </Item>
    )
  }

  renderReview() {
    const review = this.renderReviewButton()
    const reviewHistory = this.renderReviewHistory()

    return (
      <Part id="review">
        {review}
        {reviewHistory}
      </Part>
    )
  }

  renderVote() {
    const vote = this.renderVoteButton()
    const voteHistory = this.renderVoteHistory()

    return (
      <Part id="vote">
        {vote}
        {voteHistory}
      </Part>
    )
  }

  renderComment() {
    const { data } = this.props
    return [ELIP_STATUS.DRAFT, ELIP_STATUS.SUBMITTED].includes(data.status) && (
      <Row style={{ marginTop: 24 }}>
        <LabelCol span={3} />
        <Col span={17}>
          <Comments
            type="elip"
            elip={data}
            canPost={true}
            model={data._id}
            returnUrl={`/elips/${data._id}`}
          />
        </Col>
      </Row>
    )
  }

  renderStatus() {
    const { data } = this.props

    return (
      <Col>
        <Label>{I18N.get('.status')}</Label>
        <Status status={data.status}>
          {I18N.get(`elip.status.${data.status}`)}
        </Status>
      </Col>
    )
  }

  renderEditButton() {
    const { data } = this.props
    const isEditable =
      this.isAuthor(data) &&
      [ELIP_STATUS.REJECTED, ELIP_STATUS.DRAFT].includes(data.status)

    if (!isEditable) return null

    const btnStyle =
      ELIP_STATUS.DRAFT === data.status ? 'cr-btn-black' : 'cr-btn-primary'
    return (
      <Col>
        <Button
          onClick={() => this.props.history.push(`/elips/${data._id}/edit`)}
          className={`cr-btn ${btnStyle}`}
        >
          {I18N.get('elip.button.edit')}
        </Button>
      </Col>
    )
  }

  renderSubmittedButton() {
    const { data } = this.props
    const isEditable = this.isAuthor(data) && data.status === ELIP_STATUS.DRAFT

    if (!isEditable) return null

    return (
      <Col>
        <Popconfirm
          title={I18N.get('elip.modal.markAsSubmitted')}
          onConfirm={this.submittedDraft}
          okText={I18N.get('.yes')}
          cancelText={I18N.get('.no')}
        >
          <Button className="cr-btn cr-btn-primary">
            {I18N.get('elip.button.markAsSubmitted')}
          </Button>
        </Popconfirm>
      </Col>
    )
  }

  renderCancelledButton() {
    const { data, isCouncil } = this.props
    const canCancel = isCouncil && ELIP_STATUS.SUBMITTED === data.status

    if (!canCancel) return null

    return (
      <Col>
        <Popconfirm
          title={I18N.get('elip.modal.markAsCancelled')}
          onConfirm={this.cancelledSubmitted}
          okText={I18N.get('.yes')}
          cancelText={I18N.get('.no')}
        >
          <Button className="cr-btn cr-btn-black">
            {I18N.get('elip.button.markAsCancelled')}
          </Button>
        </Popconfirm>
      </Col>
    )
  }

  renderReviewButton() {
    const { data, isSecretary } = this.props
    const isVisible = isSecretary && data.status === ELIP_STATUS.WAIT_FOR_REVIEW

    if (!isVisible) return null

    const { visibleReject, visibleApprove } = this.state
    const rejectBtn = (
      <Button
        type="primary"
        className="cr-btn cr-btn-danger"
        onClick={this.showRejectModal}
      >
        {I18N.get('elip.button.reject')}
      </Button>
    )

    const rejectPopover = (
      <CRPopover
        triggeredBy={rejectBtn}
        visible={visibleReject}
        onToggle={this.showRejectModal}
        onSubmit={this.rejectdReview}
        btnType="danger"
        required={true}
        requiredMsg={I18N.get('elip.form.error.required')}
      />
    )

    return (
      <ReviewBtnGroup style={{ marginTop: 30 }}>
        {rejectPopover}
        <Popconfirm
          title={I18N.get('elip.modal.approve')}
          onConfirm={this.approvedReview}
          okText={I18N.get('.yes')}
          cancelText={I18N.get('.no')}
          visible={visibleApprove}
        >
          <Button className="cr-btn cr-btn-primary" style={{ marginLeft: 10 }} onClick={this.showApproveModal}>
            {I18N.get('elip.button.approve')}
          </Button>
        </Popconfirm>
      </ReviewBtnGroup>
    )
  }

  renderReviewHistory() {
    const { data, reviews, isSecretary } = this.props
    if (!this.isAuthor(data) && !isSecretary) return null
    return (
      <Row>
        <LabelCol span={3} />
        <Col span={17} style={{ position: 'relative' }}>
          <ReviewHistory reviews={reviews} />
        </Col>
      </Row>
    )
  }

  renderVoteButton() {
    const { data, isCouncil } = this.props
    const isVisible = isCouncil && data.status === ELIP_STATUS.SUBMITTED

    if (!isVisible) return null

    const { visibleYes, visibleOppose } = this.state
    const yesBtn = (
      <Button
        type="primary"
        icon="check-circle"
        onClick={this.showYesVoteModal}
      >
        {I18N.get('elip.button.yes')}
      </Button>
    )
    const opposeBtn = (
      <Button
        type="danger"
        icon="close-circle"
        onClick={this.showOpposeVoteModal}
      >
        {I18N.get('elip.button.oppose')}
      </Button>
    )

    const yesPopover = (
      <CRPopover
        triggeredBy={yesBtn}
        visible={visibleYes}
        onToggle={this.showYesVoteModal}
        onSubmit={this.yesVote}
        btnType="primary"
      />
    )
    const opposePopover = (
      <CRPopover
        triggeredBy={opposeBtn}
        visible={visibleOppose}
        onToggle={this.showOpposeVoteModal}
        onSubmit={this.opposeVote}
        btnType="danger"
      />
    )

    return (
      <VoteBtnGroup>
        {yesPopover}
        {opposePopover}
        <Popconfirm
          title={I18N.get('elip.modal.abstain')}
          onConfirm={this.abstainVote}
          okText={I18N.get('.yes')}
          cancelText={I18N.get('.no')}
        >
          <Button icon="stop">{I18N.get('elip.button.abstain')}</Button>
        </Popconfirm>
      </VoteBtnGroup>
    )
  }

  renderVoteHistory() {
    const { data } = this.props
    const isVisible = data.status === ELIP_STATUS.SUBMITTED

    if (!isVisible) return null

    const dataList = [
      { name: 'test1', reason: 'hahhhahahha' },
      { name: 'test2', reason: 'hahhhahahha123' }
    ]
    return (
      <VotePanel id="vote">
        <VotePanelTitle>test</VotePanelTitle>
        <VotePanelContent>
          <VoteHistory
            label="Voted Yes"
            type={ELIP_VOTE_STATUS.YES}
            dataList={dataList}
          />
          <VoteHistory
            label="Opposed"
            type={ELIP_VOTE_STATUS.OPPOSE}
            dataList={dataList}
          />
          <VoteHistory
            label="Abstained"
            type={ELIP_VOTE_STATUS.ABSTAIN}
            dataList={dataList}
          />
        </VotePanelContent>
      </VotePanel>
    )
  }

  showRejectModal = () => {
    const { visibleReject, visibleApprove } = this.state
    this.setState({ visibleReject: !visibleReject })
    if (!visibleReject && visibleApprove) this.setState({ visibleApprove: !visibleApprove })
  }

  showApproveModal = () => {
    const { visibleReject, visibleApprove } = this.state
    this.setState({ visibleApprove: !visibleApprove })
    if (!visibleApprove && visibleReject) this.setState({ visibleReject: !visibleReject })
  }

  showYesVoteModal = () => {
    const { visibleYes } = this.state
    this.setState({ visibleYes: !visibleYes })
  }

  showOpposeVoteModal = () => {
    const { visibleOppose } = this.state
    this.setState({ visibleOppose: !visibleOppose })
  }
}

export default C

const StyledSpin = styled.div`
  text-align: center;
  margin-top: 24px;
`

const Wrapper = styled.div`
  position: relative;
`

const Container = styled.div`
  padding: 30px 50px 80px 150px;
  width: 80vw;
  margin: 0 auto;
  background: #ffffff;
  text-align: left;
  .cr-backlink {
    position: fixed;
    left: 27px;
  }
  @media only screen and (max-width: ${breakPoint.mobile}) {
    margin-top: 48px;
    padding: 16px;
    width: 100%;
    .cr-backlink {
      display: none;
    }
  }
  .ant-row .ant-col-17 {
    @media only screen and (max-width: ${breakPoint.mobile}) {
      width: 100%;
    }
  }
`

const Label = styled.div`
  font-size: 11px;
  line-height: 19px;
  color: rgba(3, 30, 40, 0.4);
`

const Status = styled.div`
  font-family: Synthese;
  font-size: 16px;
  line-height: 23px;
  text-transform: uppercase;
  color: ${props => {
    return props.status === ELIP_STATUS.REJECTED ? '#fff' : '#000'
  }};
  background: ${props => {
    switch (props.status) {
      case ELIP_STATUS.REJECTED:
        return '#BE1313'
      default:
        return '#D6D6D6'
    }
  }};
  text-align: center;
  padding: 0 6px;
  display: inline-block;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    font-size: 14px;
  }
`

const LabelCol = styled(Col)`
  min-width: 120px;
  text-align: right;
  font-size: 18px;
  margin-right: 20px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    padding-bottom: 8px;
    text-align: left;
  }
`

const Title = styled.h2`
  font-family: Synthese;
  font-size: 30px;
  line-height: 42px;
  color: #031e28;
`

const Actions = styled.div`
  margin-top: 52px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  button {
    margin: 8px 0;
  }
`

const StyledAnchor = styled(Anchor)`
  position: fixed;
  top: 250px;
  left: 30px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    display: none;
  }
  .ant-anchor-ink:before {
    width: 0;
  }
  .ant-anchor-ink-ball.visible {
    display: none;
  }
  .ant-anchor-link-title {
    display: inline;
  }
  .ant-anchor-link-active > .ant-anchor-link-title {
    color: initial;
    :after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 0.5em;
      border-bottom: 8px solid ${text.green};
      z-index: -1;
    }
  }
`

const LinkGroup = styled.div`
  ${props => props.marginTop && `margin-top: ${props.marginTop}px;`}
`

const Content = styled.article``

const Part = styled.div`
  .preamble {
    font-family: Synthese;
    font-size: 13px;
    line-height: 18px;
    align-items: center;
    color: #000;
  }
`

const PartTitle = styled.h4`
  font-family: Synthese;
  font-size: 20px;
  line-height: 28px;
  color: #000;
`

const PartContent = styled.div``

const Item = styled(Row)`
  margin-top: 10px;
  font-size: 13px;
  font-style: italic;
`
const ItemTitle = styled.div`
  font-weight: 400;
  :after {
    content: ':';
  }
`
const ItemText = styled.div`
  font-weight: 200;
`

const FixedHeader = styled.div`
  background: white;
  padding-bottom: 24px;
`

const VoteBtnGroup = styled.div`
  display: flex;
  margin-top: 30px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    display: block;
    .ant-btn {
      margin-bottom: 10px;
    }
  }
  .ant-btn {
    border-radius: 0 !important;
    margin-right: 15px;
    box-sizing: border-box;
    flex: 210px;
  }
  .ant-btn.ant-btn-primary {
    color: white;
    background-color: #008D85;
    border: none;
  }
  .ant-btn-primary:hover, .ant-btn-primary:focus {
    color: #fff;
    background-color: #008D85;
    border: none;
  }
  .ant-btn.ant-btn-danger {
    color: white;
    background-color: #BE1313;
    border: none;
  }
  .ant-btn-danger:hover, .ant-btn-danger:focus {
    color: #fff;
    background-color: #BE1313;
    border: none;
  }
`

const VotePanel = styled.div`
  background-color: #F2F6FB;
  margin-top: 63px;
`

const VotePanelTitle = styled.div`
  font-family: Synthese;
  font-size: 30px;
  line-height: 42px;
  text-align: center;
  color: #031e28;
  padding-top: 60px;
  padding-bottom: 80px;
`

const VotePanelContent = styled.div`
  padding-bottom: 100px;
`

const ReviewBtnGroup = styled.div`
  display: flex;
  justify-content: center;
`
