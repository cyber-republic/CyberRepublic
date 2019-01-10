import React from 'react';
import moment from 'moment/moment'
import _ from 'lodash'
import { Popover, Icon } from 'antd';
import I18N from '@/I18N'
import { SUGGESTION_ABUSED_STATUS } from '@/constant'
import BaseComponent from '@/model/BaseComponent'

import { ReactComponent as LikeIcon } from '@/assets/images/icon-like.svg'
import { ReactComponent as DislikeIcon } from '@/assets/images/icon-dislike.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/icon-comment.svg'
import { ReactComponent as FollowIcon } from '@/assets/images/icon-follow.svg'
import { ReactComponent as FlagIcon } from '@/assets/images/icon-flag.svg'

import './style.scss'

const IconText = ({ component, text, onClick, className = '' }) => {
    return (
        <div className={`cr-icon-group ${className}`} onClick={onClick}>
            <span>{component}</span>
            <span style={{marginLeft: 16}}>{text}</span>
        </div>
    )
}

export default class extends BaseComponent {
    constructor(props) {
        super(props)

        // we use the props from the redux store if its retained
        this.state = {
        }
    }

    ord_render() {
        const { data, like, dislike, currentUserId } = this.props
        const popoverActions = this.renderPopover()
        const { likesNum, dislikesNum, commentsNum, viewsNum, _id, likes, dislikes } = data
        const isLiked = _.includes(likes, currentUserId)
        const isDisliked = _.includes(dislikes, currentUserId)
        const likeClass = isLiked ? 'selected' : ''
        const dislikeClass = isDisliked ? 'selected' : ''
        const likeNode = (
            <IconText
                component={<LikeIcon />}
                text={likesNum}
                onClick={() => this.handleClick(like, _id)}
                className={likeClass}
            />
        )

        const dislikeNode = (
            <IconText
                component={<DislikeIcon />}
                text={dislikesNum}
                onClick={() => this.handleClick(dislike, _id)}
                className={dislikeClass}
            />
        )

        const commentNode = (
            <div className='cr-icon-group'>
                <IconText component={<CommentIcon />} text={commentsNum} />
            </div>
        )

        const viewsNode = (
            <div className='cr-icon-group self-right'>
                {viewsNum} {I18N.get('suggestion.views').toLowerCase()}
            </div>
        )

        const result = (
            <div className='c_SuggestionActions'>
                {likeNode}
                {dislikeNode}
                {commentNode}
                <div className='cr-icon-group'>{popoverActions}</div>
                {viewsNode}
            </div>
        )
        return result
    }
    renderPopover() {
        const { subscribe, reportAbuse, data: { _id, subscribers, abusedStatus }, currentUserId } = this.props
        const isSubscribed = _.findIndex(subscribers, subscriber => subscriber.user === currentUserId) !== -1
        const isAbused = abusedStatus === SUGGESTION_ABUSED_STATUS.REPORTED
        const content = (
            <div className='popover-actions'>
                <IconText
                    component={<FollowIcon />}
                    text={I18N.get('suggestion.follow')}
                    onClick={() => this.handleClick(subscribe, _id)}
                    className={`follow-icon ${isSubscribed ? 'selected' : ''}`}
                />
                <IconText
                    component={<FlagIcon />}
                    text={I18N.get('suggestion.reportAbuse')}
                    onClick={() => this.handleClick(reportAbuse, _id)}
                    className={`abuse-icon ${isAbused ? 'selected' : ''}`}
                />
            </div>
        )
        return (
            <Popover content={content} trigger='click'>
                <Icon type={'ellipsis'} />
            </Popover>
        )
    }
    handleClick = async(callback, param) => {
        await callback(param)
        this.props.refetch()
    }

    showPopOverActions = () => {
        this.setState({
            isPopOverOpen: !this.state.isPopOverOpen
        })
    }

}
