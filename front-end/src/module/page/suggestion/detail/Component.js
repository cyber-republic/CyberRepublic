import React from 'react';
import _ from 'lodash'
import { Row, Col, Spin } from 'antd'
import StandardPage from '../../StandardPage';
import Comments from '@/module/common/comments/Container'
import ActionsContainer from '../common/actions/Container'
import MetaContainer from '../common/meta/Container'
import MySuggestion from '../my_list/Container'
import Footer from '@/module/layout/Footer/Container'

import MediaQuery from 'react-responsive'
import { LG_WIDTH } from '@/config/constant'

import './style.scss'

export default class extends StandardPage {
  constructor(props) {
    super(props)

    // we use the props from the redux store if its retained
    this.state = {
      isDropdownActionOpen: false,
      showMobile: false,
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this.refetch(true)
  }

  componentWillUnmount() {
    this.props.resetDetail()
  }

  ord_renderContent() {
    if (_.isEmpty(this.props.detail) || this.props.detail.loading) {
      return <div className="center"><Spin size="large" /></div>
    }
    const detailNode = this.renderDetail()
    const translationBtn = this.renderTranslationBtn()
    const actionsNode = this.renderActionsNode()
    const mySuggestionNode = this.renderMySuggestion()
    const commentNode = this.renderCommentNode()
    return (
      <div>
        <div className="p_SuggestionDetail">
          <MediaQuery maxWidth={LG_WIDTH}>
            <Row>
              <Col>
                {detailNode}
              </Col>
            </Row>
            <Row>
              <Col>
                {actionsNode}
              </Col>
            </Row>
            <Row>
              <Col>
                {commentNode}
              </Col>
            </Row>
          </MediaQuery>
          <MediaQuery minWidth={LG_WIDTH+1}>
            <Row gutter={24}>
              <Col span={15}>
                {detailNode}
                {/* {translationBtn} */}
                {actionsNode}
                {commentNode}
              </Col>
              <Col span={9}>{mySuggestionNode}</Col>
            </Row>
          </MediaQuery>
        </div>
        <Footer />
      </div>
    )
  }

  renderMySuggestion() {
    return <MySuggestion />
  }

  renderDetail() {
    const metaNode = this.renderMetaNode()
    const titleNode = this.renderTitleNode()
    const descNode = this.renderDescNode()
    return (
      <div>
        {metaNode}
        {titleNode}
        {descNode}
      </div>
    )
  }

  renderMetaNode() {
    const { detail } = this.props
    return <MetaContainer data={detail} />
  }

  renderActionsNode() {
    const { detail } = this.props
    return <ActionsContainer data={detail} />
  }

  renderTitleNode() {
    const { detail } = this.props
    return (
      <div className="detail-title">{detail.title}</div>
    )
  }

  renderDescNode() {
    const { detail } = this.props
    return (
      <div className="detail-desc" dangerouslySetInnerHTML={{ __html: detail.desc }} />
    )
  }

  // TODO
  renderTranslationBtn() {
    const { detail } = this.props
    return (
      <div>Translate in English</div>
    )
  }

  renderCommentNode() {
    const { detail } = this.props
    return (
      <Comments
        type="suggestion"
        suggestion={detail}
        canPost
        model={detail._id}
        returnUrl={`/suggestion/${detail._id}`}
      />
    )
  }

  showDropdownActions = () => {
    this.setState({
      isDropdownActionOpen: !this.state.isDropdownActionOpen,
    })
  }

  refetch = async (incViewsNum) => {
    const id = _.get(this.props, 'match.params.id')
    await this.props.resetDetail()
    this.props.getDetail({ id, incViewsNum: !!incViewsNum })
  }

  linkSuggestionDetail(suggestionId) {
    this.props.history.push(`/suggestion/${suggestionId}`)
  }
}
