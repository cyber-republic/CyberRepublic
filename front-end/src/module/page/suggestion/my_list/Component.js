import React from 'react';
import _ from 'lodash'
import {
    Tabs,
    List,
    Icon,
    Button
} from 'antd';
import I18N from '@/I18N'
import StandardPage from '../../StandardPage';
import Footer from '@/module/layout/Footer/Container'
import Navigator from '@/module/page/shared/HomeNavigator/Container'
import MySuggestion from '../my_list/Container'

import './style.scss'

const TabPane = Tabs.TabPane

const sortBy = {
    likesNum: 'likesNum',
    views: 'views',
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
        this.refetch()
    }

    componentWillUnmount() {
        this.props.resetAll()
    }

    ord_renderContent() {
        const headerNode = this.renderHeader()
        const filterNode = this.renderFilter()
        const addButtonNode = this.renderAddButton()
        const listNode = this.renderList()
        const mySuggestionNode = this.renderMySuggestion()
        const paginationNode = this.renderPagination()
        return (
            <div className='p-suggestion'>
                {headerNode}
                {filterNode}
                {addButtonNode}
                {listNode}
                {mySuggestionNode}
                {paginationNode}
            </div>
        )
    }
    renderHeader() {
        return <div className='title'>{I18N.get('suggestion.title').toUpperCase()}</div>
    }
    renderFilter() {
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
                <Button onClick={() => this.props.history.push('/suggestion/create/')}>
                    {I18N.get('suggestion.add')}
                </Button>
            </div>
        )
    }
    renderList() {
        const suggestionsList = this.props.all_suggestions;
        const listData = _.map(suggestionsList, data => ({
            href: `/suggestion/detail/${data._id}`,
            title: data.title,
            content: data.desc // TODO: limited length
        }))
        const IconText = ({ type, text }) => (
            <span>
                <Icon type={type} style={{ marginRight: 8 }} />
                {text}
            </span>
        );
        const actions = [
            <IconText type='like-o' text='156' />,
            <IconText type='dislike-o' text='156' />,
            <IconText type='comment' text='2' />
        ]
        return <List
            itemLayout='vertical'
            pagination={{
                onChange: (page) => {
                    console.log(page);
                },
                pageSize: 5
            }}
            dataSource={listData}
            renderItem={item => (
                <List.Item
                    key={item.title}
                    actions={actions}
                >
                    <List.Item.Meta
                        title={<a href={item.href}>{item.title}</a>}
                        // description={item.desc}
                    />
                    {item.content}
                </List.Item>
            )}
        />
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
        this.props.history.push(`/suggestion/detail/${suggestionId}`)
    }
}
