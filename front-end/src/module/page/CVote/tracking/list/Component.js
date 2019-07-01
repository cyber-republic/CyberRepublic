import React from 'react'
import _ from 'lodash'
import moment from 'moment/moment'
import BaseComponent from '@/model/BaseComponent'
import DraftEditor from '@/module/common/DraftEditor'
import CRPopover from '@/module/shared/Popover/Component'
import {
  Table, Row, Col, Button, Input, List, Collapse
} from 'antd'
import I18N from '@/I18N'
import { Link } from 'react-router-dom'
import { CONTENT_TYPE, DATE_FORMAT, CVOTE_TRACKING_STATUS } from '@/constant'
import styled from 'styled-components'
import { breakPoint } from '@/constants/breakPoint'
import { bg } from '@/constants/color'

const { Panel } = Collapse

export default class extends BaseComponent {
  constructor(p) {
    super(p)

    this.state = {
      loading: true,
      publicList: undefined,
      privateList: undefined,
      visibleReject: false,
    }
  }

  async componentDidMount() {
    this.refetch()
  }

  ord_render() {
    const { canManage, isCouncil } = this.props
    const title = this.renderTitle()
    const publicListNode = this.renderPublicList()
    const privateListNode = this.renderPrivateList()
    return (
      <Container>
        {title}
        {publicListNode}
        {privateListNode}
      </Container>
    )
  }

  renderTitle() {
    return <ContentTitle id="tracking">{I18N.get('proposal.fields.tracking')}</ContentTitle>
  }

  renderPublicList() {
    const { publicList } = this.state
    if (!publicList) return null
    return (
      <List
        itemLayout="horizontal"
        grid={{ column: 1 }}
        dataSource={publicList}
        renderItem={item => (
          <StyledItem>
            <Row>
              <Col>
                <DraftEditor
                  content={item.content}
                  contentType={CONTENT_TYPE.MARKDOWN}
                  editorEnabled={false}
                />
                <StyledFooter>{moment(item.createdAt).format(DATE_FORMAT)}</StyledFooter>
              </Col>
            </Row>
          </StyledItem>
        )}
      />
    )
  }

  renderPrivateList() {
    const { privateList } = this.state
    if (!privateList) return null
    const body = (
      <List
        itemLayout="horizontal"
        grid={{ column: 1 }}
        split={false}
        dataSource={privateList}
        renderItem={item => (
          <StyledPrivateItem actions={[]}>
            <StyledRow gutter={16}>
              <LeftCol span={21} status={item.status}>
                <DraftEditor
                  content={item.content}
                  contentType={CONTENT_TYPE.MARKDOWN}
                  editorEnabled={false}
                />
                <StyledFooter>{moment(item.createdAt).format(DATE_FORMAT)}</StyledFooter>
              </LeftCol>
              <RightCol span={3}>
                <Status status={item.status}>{I18N.get(`proposal.status.${item.status}`)}</Status>
              </RightCol>
            </StyledRow>
            {this.renderActions(item)}
          </StyledPrivateItem>
        )}
      />
    )
    return (
      <StyledCollapse defaultActiveKey={['1']} expandIconPosition="right">
        <Panel header={I18N.get('proposal.text.tracking.reviewDetails')} key="1">
          {body}
        </Panel>
      </StyledCollapse>
    )
  }

  showRejectModal = (id) => {
    const { visibleReject } = this.state
    this.setState({ visibleReject: !visibleReject, trackingId: id })
  }

  reject = async ({ reason }) => {
    const { reject } = this.props
    const param = { id: this.state.trackingId, comment: reason }

    this.ord_loading(true)
    try {
      await reject(param)
      this.refetch()
      this.ord_loading(false)
    } catch (e) {
      this.ord_loading(false)
    }
    this.setState({ reason: '' })
  }

  approve = async (id) => {
    const { approve } = this.props
    const param = { id }

    this.ord_loading(true)
    try {
      await approve(param)
      this.refetch()
      this.ord_loading(false)
    } catch (e) {
      this.ord_loading(false)
    }
    this.setState({ reason: '' })
  }

  renderBtns(id) {
    const { visibleReject } = this.state
    const btnReject = (
      <Button
        onClick={this.showRejectModal.bind(this, id)}
      >
        {I18N.get('proposal.btn.tracking.reject')}
      </Button>
    )
    const btnApprove = (
      <Button
        type="primary"
        onClick={this.approve.bind(this, id)}
        style={{ marginRight: -8 }}
      >
        {I18N.get('proposal.btn.tracking.approve')}
      </Button>
    )

    const popOverReject = (
      <CRPopover
        btnType="primary"
        triggeredBy={btnReject}
        visible={visibleReject}
        onToggle={this.showRejectModal.bind(this, id)}
        onSubmit={this.reject}
      />
    )


    return (
      <BtnGroup>
        {popOverReject}
        {btnApprove}
      </BtnGroup>
    )
  }

  renderActions(item) {
    const { isSecretary } = this.props

    let body
    if (isSecretary && item.status === CVOTE_TRACKING_STATUS.REVIEWING) {
      body = (
        <CommentCol span={21} status={item.status}>
          {this.renderBtns(item._id)}
        </CommentCol>
      )
    } else if (item.status === CVOTE_TRACKING_STATUS.REJECT) {
      body = (
        <CommentCol span={21} status={item.status}>
          <CommentContent>
            <div>{item.comment.content}</div>
            <CommentFooter>{moment(item.createdAt).format(DATE_FORMAT)}</CommentFooter>
          </CommentContent>
        </CommentCol>
      )
    }

    return (
      <StyledRow gutter={16}>
        {body}
      </StyledRow>
    )
  }

  getQuery = () => {
    const query = {
      proposalId: _.get(this.props, 'proposal._id')
    }
    return query
  }

  refetch = async () => {
    this.ord_loading(true)
    const { listData, canManage, currentUserId, proposal } = this.props
    const param = this.getQuery()
    const isAuthorized = canManage || currentUserId === _.get(proposal, 'proposer._id')
    try {
      const publicData = await listData(param, false)
      this.setState({ publicList: publicData.list })
      if (isAuthorized) {
        const privateData = await listData(param, isAuthorized)
        this.setState({ privateList: privateData.list })
      }
    } catch (error) {
      // do sth
    }

    this.ord_loading(false)
  }
}


const colorMap = {
  PUBLISHED: {
    dark: '#43AF92',
    light: 'rgba(29, 233, 182, 0.1)',
  },
  REJECT: {
    dark: '#BE1313',
    light: 'rgba(252, 192, 192, 0.2)',
  },
  REVIEWING: {
    dark: '#CCCCCC',
    light: 'rgba(204, 204, 204, 0.2)',
  },
}


export const Container = styled.div`
`
export const StyledCollapse = styled(Collapse)`
  border: none!important;
  margin-top: 30px;
  .ant-collapse-content-box {
    padding: 0!important;
  }
  .ant-collapse-content {
    border: none!important;
  }
  .ant-collapse-header {
    text-align: center;
    padding-left: 0!important;
    color: #008D85!important;
    background-color: white;
    .ant-collapse-arrow {
      right: calc(50% - 70px)!important;
    }
  }
  > .ant-collapse-item {
    border-bottom: none!important;
  }
  /* > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    right: calc(50% - 70px)!important;
  } */
`

export const StyledRow = styled(Row)`
  margin: 0!important;
`

export const StyledItem = styled(List.Item)`
  background: rgba(29, 233, 182, 0.1);
  border: 1px solid rgba(0, 141, 133, 0.2)!important;
  margin: 10px auto;
  padding-left: 20px;
  .md-RichEditor-root {
    background: none;
    padding-left: 20px!important;
  }
`

export const StyledPrivateItem = styled(List.Item)`

`

export const LeftCol = styled(Col)`
  margin: 10px auto;
  padding-left: 20px;
  .md-RichEditor-root {
    background: none;
    padding-left: 20px!important;
  }
  ${props => `
    background: ${colorMap[props.status].light};
    border-left: 4px solid ${colorMap[props.status].dark};
  `}
`
export const RightCol = styled(Col)`
  padding-top: 20px;
`
export const CommentCol = styled(LeftCol)`
  margin-top: -10px;
  background: none;
  border-bottom: 1px solid #ccc;
`

export const CommentContent = styled.div`
  padding: 20px 20px  20px 30px;
`

export const Status = styled.span`
  ${props => `
    background: ${colorMap[props.status].dark};
  `}
  color: white;
  font-size: 8px;
  padding: 1px 5px;
`

export const ContentTitle = styled.h4`
  font-size: 20px;
  padding-bottom: 0;
`

export const BtnGroup = styled.div`
  text-align: right;
  padding: 15px 0;
`

export const StyledFooter = styled.div`
  font-size: 12px;
  color: rgba(3, 30, 40, 0.4);
  padding: 10px 20px;
`

export const CommentFooter = styled(StyledFooter)`
  font-size: 12px;
  color: rgba(3, 30, 40, 0.4);
  padding: 0;
  margin-top: 10px;
`