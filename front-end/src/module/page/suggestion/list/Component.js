import React from 'react';
import _ from 'lodash'
import {
    Tabs,
    List,
    Icon,
    Modal,
    Button
} from 'antd';
import I18N from '@/I18N'
import StandardPage from '../../StandardPage';
import Footer from '@/module/layout/Footer/Container'
import Navigator from '@/module/page/shared/HomeNavigator/Container'
import MySuggestion from '../my_list/Container'
import SuggestionForm from '@/module/form/SuggestionForm/Container'

import { ReactComponent as LikeIcon } from '@/assets/images/icon-like.svg'
import { ReactComponent as DislikeIcon } from '@/assets/images/icon-dislike.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/icon-comment.svg'
import { ReactComponent as FollowIcon } from '@/assets/images/icon-follow.svg'
import { ReactComponent as FlagIcon } from '@/assets/images/icon-flag.svg'

import './style.scss'

const TabPane = Tabs.TabPane

const sortBy = {
    likesNum: 'likesNum',
    viewsNum: 'viewsNum',
    activeness: 'activeness',
    createdAt: 'createdAt'

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
            sortBy: sortBy.likesNum,
            page: 1,
            results: 10,
            search: ''
        }

        this.debouncedLoadMore = _.debounce(this.loadMore.bind(this), 300)
        this.debouncedRefetch = _.debounce(this.refetch.bind(this), 300)
    }

    componentDidMount() {
        super.componentDidMount()
        const { currentUserId } = this.props
        this.refetch()
        this.props.getMySuggestions({ createdBy: currentUserId, results: 5 })
    }

    componentWillUnmount() {
        this.props.resetAll()
    }

    ord_renderContent() {
        const { all_suggestions: dataList, all_suggestions_total: total } = this.props;
        console.log(dataList, total)
        const headerNode = this.renderHeader()
        const filterNode = this.renderFilter()
        const addButtonNode = this.renderAddButton()
        const listNode = this.renderList()
        const mySuggestionNode = this.renderMySuggestion()
        const paginationNode = this.renderPagination()
        const createForm = this.renderCreateForm()
        return (
            <div className='p-suggestion'>
                {addButtonNode}
                {headerNode}
                {filterNode}
                {listNode}
                {mySuggestionNode}
                {paginationNode}
                {createForm}
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
        return <div className='title'>{I18N.get('suggestion.title').toUpperCase()}</div>
    }
    renderFilter() {
        // refer to UserEditForm
        return (
            <Tabs defaultActiveKey='1' onChange={this.onSortByChanged.bind(this)}>
                <TabPane tab='likesNum' key='likesNum'>Content of Tab Pane 1</TabPane>
                <TabPane tab='views' key='views'>Content of Tab Pane 2</TabPane>
                <TabPane tab='activeness' key='activeness'>Content of Tab Pane 3</TabPane>
                <TabPane tab='createdAt' key='createdAt'>Content of Tab Pane 3</TabPane>
            </Tabs>
        )
    }
    renderAddButton() {
        // TODO: use modal to create
        return (
            <div className="pull-right filter-group btn-create-suggestion">
                <Button onClick={this.showCreateForm}>
                    {I18N.get('suggestion.add')}
                </Button>
            </div>
        )
    }
    renderList() {
        const suggestionsList = this.props.all_suggestions;
        const listData = _.map(suggestionsList, data => ({
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
        const renderItem = item => (
            <List.Item
                key={item._id}
                actions={getActions(item)}
            >
                <List.Item.Meta
                    title={<a href={item.href}>{item.title}</a>}
                    description = {
                        `#${item.displayId} ${I18N.get('suggestion.postedBy')} ${item.author} ${item.createdAt}`
                    }
                />
                {item.content}
            </List.Item>
        )
        return <List
            itemLayout='vertical'
            pagination={{
                onChange: (page) => {
                    console.log(page)
                    this.loadPage(page)
                },
                pageSize: 5
            }}
            dataSource={listData}
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
    renderPagination() {
        // TODO: loadMore, loadPage
        return <div className='pagination'>Pagination</div>
    }
    // onSortByChanged
    onSortByChanged(sortBy) {
        console.log('sortBy is: ', sortBy)
        this.setState({
            sortBy
        }, this.refetch.bind(this))
    }
    // fetchData
    // fetchDataByPage

    /**
     * Builds the query from the current state
     */
    getQuery() {
        const query = {}

        if (this.state.sortBy) {
            query.sortBy = this.state.sortBy
        }

        query.page = this.state.page || 1
        query.results = this.state.results || 5

        return query
    }

    /**
     * Refetch the data based on the current state retrieved from getQuery
     */
    refetch() {
        const query = this.getQuery()
        this.props.getSuggestions(query)
    }

    async loadMore() {
        const page = this.state.page + 1

        const query = {
            ...this.getQuery(),
            page,
            results: this.state.results
        }

        this.setState({ loadingMore: true })

        try {
            await this.props.loadMoreSuggestions(query)
            this.setState({ page })
        } catch (e) {
            // Do not update page in state if the call fails
        }

        this.setState({ loadingMore: false })
    }

    async loadPage(page) {
        const query = {
            ...this.getQuery(),
            page,
            results: this.state.results
        }

        this.setState({ loadingMore: true })

        try {
            await this.props.loadMoreSuggestions(query)
            this.setState({ page })
        } catch (e) {
            // Do not update page in state if the call fails
        }

        this.setState({ loadingMore: false })
    }

    hasMoreSuggestions() {
        return _.size(this.props.all_suggestions) < this.props.all_suggestions_total
    }

    linkSuggestionDetail(suggestionId) {
        this.props.history.push(`/suggestion/${suggestionId}`)
    }
}
