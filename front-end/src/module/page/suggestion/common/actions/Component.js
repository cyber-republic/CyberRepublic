import React from 'react';
import moment from 'moment/moment'
import _ from 'lodash'
import { Popover, Icon } from 'antd';
import I18N from '@/I18N'
import BaseComponent from '@/model/BaseComponent'

import { ReactComponent as LikeIcon } from '@/assets/images/icon-like.svg'
import { ReactComponent as DislikeIcon } from '@/assets/images/icon-dislike.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/icon-comment.svg'
import { ReactComponent as FollowIcon } from '@/assets/images/icon-follow.svg'
import { ReactComponent as FlagIcon } from '@/assets/images/icon-flag.svg'

import './style.scss'

const IconText = ({ component, text, onClick }) => {
    return (
        <div className='cr-icon-group' onClick={onClick}>
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
        const { like, dislike } = this.props
        const { data } = this.props
        const dataSource = {
            likesNum: data.likesNum,
            dislikesNum: data.dislikesNum,
            commentsNum: data.commentsNum || 0,
            viewsNum: data.viewsNum || 0,
            _id: data._id
        }
        const popoverActions = this.renderPopover()
        const getActions = ({ likesNum, dislikesNum, commentsNum, viewsNum, _id }) => {
            const likeNode = <IconText component={<LikeIcon />} text={likesNum} onClick={() => this.handleClick(like, _id)} />
            const dislikeNode = <IconText component={<DislikeIcon />} text={dislikesNum} onClick={() => this.handleClick(dislike, _id)} />
            const commentNode = <div className='cr-icon-group'><IconText component={<CommentIcon />} text={commentsNum} /></div>
            const viewsNode = <div className='cr-icon-group self-right'>{viewsNum} {I18N.get('suggestion.views').toLowerCase()}</div>
            return (
                <div className='c_SuggestionActions'>
                    {likeNode}
                    {dislikeNode}
                    {commentNode}
                    <div className='cr-icon-group'>{popoverActions}</div>
                    {viewsNode}
                </div>
            )
        }
        const result = getActions(dataSource)
        return result
    }
    renderPopover() {
        const { subscribe, reportAbuse, data: { _id } } = this.props
        const content = (
            <div className='popover-actions'>
                <IconText
                    component={<FollowIcon />}
                    text={I18N.get('suggestion.follow')}
                    onClick={() => this.handleClick(subscribe, _id)}
                />
                <IconText
                    component={<FlagIcon />}
                    text={I18N.get('suggestion.reportAbuse')}
                    onClick={() => this.handleClick(reportAbuse, _id)}
                />
            </div>
        )
        return (
            <Popover content={content} trigger='click' className=''>
                <Icon type={'ellipsis'} />
            </Popover>
        )
    }
    handleClick = (callback, param) => {
        callback(param)
        this.props.refetch()
    }

    showPopOverActions = () => {
        this.setState({
            isPopOverOpen: !this.state.isPopOverOpen
        })
    }

}
