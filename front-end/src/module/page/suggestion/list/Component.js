import React from 'react';
import _ from 'lodash'
import moment from 'moment/moment'
import {
    List,
    Icon,
    Modal,
    Button,
    Popover,
    Col, Row, Input, Select
} from 'antd';
import I18N from '@/I18N'
import StandardPage from '../../StandardPage';
import Footer from '@/module/layout/Footer/Container'
import MySuggestion from '../my_list/Container'
import SuggestionForm from '@/module/form/SuggestionForm/Container'

import { ReactComponent as LikeIcon } from '@/assets/images/icon-like.svg'
import { ReactComponent as DislikeIcon } from '@/assets/images/icon-dislike.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/icon-comment.svg'
import { ReactComponent as FollowIcon } from '@/assets/images/icon-follow.svg'
import { ReactComponent as FlagIcon } from '@/assets/images/icon-flag.svg'

import MediaQuery from 'react-responsive'
import { MAX_WIDTH_MOBILE, MIN_WIDTH_PC } from '@/config/constant'

import './style.scss'

const SORT_BY = {
    likesNum: 'likesNum',
    viewsNum: 'viewsNum',
    activeness: 'activeness',
    createdAt: 'createdAt'

}

const SORT_BY_TEXT = {
    likesNum: 'Likes',
    viewsNum: 'Views',
    activeness: 'Activeness',
    createdAt: 'Date Added'

}

/**
 * This uses new features such as infinite scroll and pagination, therefore
 * we do some different things such as only loading the data from the server
 */
export default class extends StandardPage {
    constructor(props) {
        super(props)

        // we use the props from the redux store if its retained
        this.state = {
            showForm: false,
            isDropdownActionOpen: false,
            showMobile: false,
            sortBy: SORT_BY.likesNum,
            page: 1,
            results: 10,
            total: 0
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.refetch()
    }

    componentWillUnmount() {
        this.props.resetAll()
    }

    ord_renderContent() {
        const { dataList, total } = this.props;
        console.log(dataList, total)
        const headerNode = this.renderHeader()
        const addButtonNode = this.renderAddButton()
        const actionsNode = this.renderHeaderActions()
        const listNode = this.renderList()
        const mySuggestionNode = this.renderMySuggestion()
        const createForm = this.renderCreateForm()
        return (
            <div>
                <div className='p_SuggestionList'>
                    {headerNode}
                    <Row gutter={24}>
                        <Col span={15}>{actionsNode}</Col>
                        <Col span={9}>{addButtonNode}</Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={15}>{listNode}</Col>
                        <Col span={9}>{mySuggestionNode}</Col>
                    </Row>
                    {createForm}
                </div>
                <Footer />
            </div>
        )
    }
    renderCreateForm() {
        return (
            <Modal
                className="project-detail-nobar"
                visible={this.state.showForm}
                onOk={this.showCreateForm}
                onCancel={this.showCreateForm}
                footer={null}
                width="70%"
            >
                { this.state.showForm &&
                    <SuggestionForm showCreateForm={this.showCreateForm}/>
                }
            </Modal>
        )
    }
    showCreateForm = () => {
        this.setState({
            showForm: !this.state.showForm
        })
    }

    renderHeader() {
        return (
            <h2 className='title komu-a cr-title-with-icon'>{this.props.header || I18N.get('suggestion.title').toUpperCase()}</h2>
        )
    }
    renderHeaderActions() {
        return <div className='header-actions-container'>
            <MediaQuery maxWidth={MAX_WIDTH_MOBILE}>
                <Select
                    name='type'
                    onChange={this.onSortByChanged}
                    value={this.state.sortBy}
                >
                    {_.map(SORT_BY, (filter, key) => {
                        return <Select.Option key={filter} value={filter}>
                            {key}
                        </Select.Option>
                    })}
                </Select>
            </MediaQuery>
            <MediaQuery minWidth={MIN_WIDTH_PC}>
                <Button.Group className='filter-group'>
                    {_.map(SORT_BY, (value, key) => {
                        return (
                            <Button
                                key={value}
                                onClick={() => this.onSortByChanged(value)}
                                className={(this.state.sortBy === value && 'selected') || ''}
                            >
                                {SORT_BY_TEXT[value]}
                            </Button>
                        )
                    })}
                </Button.Group>
            </MediaQuery>
        </div>
    }

    renderAddButton() {
        return (
            <div className="pull-left filter-group btn-create-suggestion">
                <Button onClick={this.showCreateForm}>
                    {I18N.get('suggestion.add')}
                </Button>
            </div>
        )
    }
    renderList() {
        const { dataList, total } = this.props
        const { results } = this.state
        const dataSource = _.map(dataList, data => ({
            href: `/suggestion/${data._id}`,
            title: data.title,
            content: data.desc, // TODO: limited length
            createdAt: data.createdAt,
            author: `${_.get(data, 'createdBy.profile.firstName')} ${_.get(data, 'createdBy.profile.lastName')}`,
            likesNum: data.likesNum,
            dislikesNum: data.dislikesNum,
            commentsNum: data.commentsNum || 0,
            viewsNum: data.viewsNum || 0,
            _id: data._id,
            displayId: data.displayId
        }))
        const IconText = ({ component, text }) => {
            return (
                <span className='cr-icon-group'>
                    <span>{component}</span>
                    <span style={{marginLeft: 8}}>{text}</span>
                </span>
            )
        }
        const getActions = ({ likesNum, dislikesNum, commentsNum, viewsNum, _id }) => {
            const content = (
                <div>
                    <div onClick={() => this.props.subscribe(_id)}>
                        <IconText component={<FollowIcon />} text={I18N.get('suggestion.follow')} />
                    </div>
                    <div onClick={() => this.props.reportAbuse(_id)}>
                        <IconText component={<FlagIcon />} text={I18N.get('suggestion.reportAbuse')} />
                    </div>
                </div>
            )
            const dropdownActions = (
                <Popover content={content} trigger='click'>
                    <Icon type={'ellipsis'} />
                </Popover>
            )
            return ([
                <IconText component={<LikeIcon />} text={likesNum} />,
                <IconText component={<DislikeIcon />} text={dislikesNum} />,
                <IconText component={<CommentIcon />} text={commentsNum} />,
                dropdownActions,
                <span className='pull-right'>{viewsNum} {I18N.get('suggestion.views').toLowerCase()}</span>
            ])
        }
        const renderItem = item => (
            <List.Item
                key={item._id}
                actions={getActions(item)}
            >
                <List.Item.Meta
                    title={<a href={item.href}>{item.title}</a>}
                    description = {
                        `#${item.displayId}  ${I18N.get('suggestion.postedBy')} ${item.author} ${moment(item.createdAt).format('MMM D, YYYY')}`
                    }
                />
                {/* <span dangerouslySetInnerHTML={{__html: item.content}}></span> */}
            </List.Item>
        )
        return <List
            itemLayout='vertical'
            pagination={{
                pageSize: results,
                total: total,
                onChange: this.loadPage
            }}
            dataSource={dataSource}
            renderItem={renderItem}
        />
    }
    showDropdownActions = () => {
        this.setState({
            isDropdownActionOpen: !this.state.isDropdownActionOpen
        })
    }
    renderMySuggestion() {
        return <MySuggestion />
    }

    onSortByChanged = sortBy => this.setState({ sortBy }, this.refetch)

    /**
     * Builds the query from the current state
     */
    getQuery = () => {
        const { page, results } = this.state
        const query = {
            page,
            results
        }
        // TODO
        if (this.state.sortBy) {
            query.sortBy = this.state.sortBy
        }

        return query
    }

    /**
     * Refetch the data based on the current state retrieved from getQuery
     */
    refetch = () => {
        const query = this.getQuery()
        this.props.getList(query)
    }

    loadPage = async(page) => {
        const query = {
            ...this.getQuery(),
            page,
            results: this.state.results
        }

        this.setState({ loadingMore: true })

        try {
            await this.props.loadMore(query)
            this.setState({ page })
        } catch (e) {
            // Do not update page in state if the call fails
        }

        this.setState({ loadingMore: false })
    }

    gotoDetail(id) {
        this.props.history.push(`/suggestion/${id}`)
    }
}
