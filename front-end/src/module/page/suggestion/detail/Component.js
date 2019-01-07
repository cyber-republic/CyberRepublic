import React from 'react';
import _ from 'lodash'
import {
    Icon,
    Modal,
    Button
} from 'antd';
import I18N from '@/I18N'
import StandardPage from '../../StandardPage';

import { ReactComponent as LikeIcon } from '@/assets/images/icon-like.svg'
import { ReactComponent as DislikeIcon } from '@/assets/images/icon-dislike.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/icon-comment.svg'
import { ReactComponent as FollowIcon } from '@/assets/images/icon-follow.svg'
import { ReactComponent as FlagIcon } from '@/assets/images/icon-flag.svg'
import Comments from '@/module/common/comments/Container'

import './style.scss'

export default class extends StandardPage {
    constructor(props) {
        super(props)

        // we use the props from the redux store if its retained
        this.state = {
            isDropdownActionOpen: false,
            showMobile: false
        }
    }

    componentDidMount() {
        const id = _.get(this.props, 'match.params.id')
        super.componentDidMount()
        this.props.getDetail(id)
    }

    componentWillUnmount() {
        this.props.resetDetail()
    }

    ord_renderContent() {
        const { all_suggestions: dataList, all_suggestions_total: total } = this.props;
        console.log(dataList, total)
        const headerNode = this.renderHeader()
        const detailNode = this.renderDetail()
        const commentNode = this.renderCommentNode()
        return (
            <div className='p-suggestion'>
                {headerNode}
                {detailNode}
                {commentNode}
            </div>
        )
    }

    renderCommentNode() {
        const { detail } = this.props
        return (
            <Comments type='suggestion' suggestion={detail} canPost={true} model={detail._id}
                returnUrl={`/suggestion/${detail._id}`}
            />
        )
    }

    renderHeader() {
        return <div className='title'>{I18N.get('suggestion.title').toUpperCase()}</div>
    }

    renderDetail() {
        const metaNode = this.renderMetaNode()
        const titleNode = this.renderTitleNode()
        const descNode = this.renderDescNode()
        const translationBtn = this.renderTranslationBtn()
        const actionsNode = this.renderActionsNode()
        return (
            <div>
                {metaNode}
                {titleNode}
                {descNode}
                {translationBtn}
                {actionsNode}
            </div>
        )
    }
    renderMetaNode() {
        const { detail } = this.props
        const author = `${_.get(detail, 'createdBy.profile.firstName')} ${_.get(detail, 'createdBy.profile.lastName')}`
        return (
            <div>`#${detail.displayId} ${I18N.get('suggestion.postedBy')} ${author} ${detail.createdAt}`</div>
        )
    }
    renderTitleNode() {
        const { detail } = this.props
        return (
            <div>{detail.title}</div>
        )
    }
    renderDescNode() {
        const { detail } = this.props
        return (
            <div>{detail.desc}</div>
        )
    }
    renderTranslationBtn() {
        const { detail } = this.props
        return (
            <div>refer to SuggestionForm.js</div>
        )
    }
    renderActionsNode() {
        const { detail } = this.props
        const IconText = ({ component, type, text }) => {
            return type ? (
                <span>
                    <Icon type={type} style={{marginLeft: 8}} />
                    {text}
                </span>
            ) : (
                <span>
                    {component}
                    {text}
                </span>

            )
        }
        const getActions = ({ likesNum, dislikesNum, commentsNum, viewsNum, _id }) => {
            const dropdownActions = this.state.isDropdownActionOpen && (
                <div>
                    <div onClick={() => this.props.subscribe(_id)}><IconText component={<FollowIcon />} text={I18N.get('suggestion.follow')} /></div>
                    <div onClick={() => this.props.reportAbuse(_id)}><IconText component={<FlagIcon />} text={I18N.get('suggestion.reportAbuse')} /></div>
                </div>
            )
            return ([
                <IconText component={<LikeIcon />} text={likesNum} />,
                <IconText component={<DislikeIcon />} text={dislikesNum} />,
                <IconText component={<CommentIcon />} text={commentsNum} />,
                <Icon type={'ellipsis'} style={{ marginRight: 8 }} onClick={this.showDropdownActions} />,
                dropdownActions,
                <span>{viewsNum} {I18N.get('suggestion.views').toLowerCase()}</span>
            ])
        }
        return getActions(detail)
    }
    showDropdownActions = () => {
        this.setState({
            isDropdownActionOpen: !this.state.isDropdownActionOpen
        })
    }

    linkSuggestionDetail(suggestionId) {
        this.props.history.push(`/suggestion/${suggestionId}`)
    }
}
