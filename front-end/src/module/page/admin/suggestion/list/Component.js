import React from 'react'
import _ from 'lodash'
import MediaQuery from 'react-responsive'
import I18N from '@/I18N';
import ProfilePage from '@/module/page/ProfilePage'
import Footer from '@/module/layout/Footer/Container'
import Navigator from '@/module/page/shared/HomeNavigator/Container'
import { MAX_WIDTH_MOBILE, MIN_WIDTH_PC } from '@/config/constant'
import { SUGGESTION_STATUS } from '@/constant'

import '@/module/page/admin/admin.scss'
import './style.scss'

import { Col, Row, Input, Select, Button, Table } from 'antd'
import moment from 'moment/moment'

const FILTERS = {
    ALL: 'all',
    ARCHIVED: SUGGESTION_STATUS.ARCHIVED
}

export default class extends ProfilePage {
    constructor(props) {
        super(props)

        this.state = {
            showMobile: false,
            filter: FILTERS.ALL,
            search: ''
        }
        this.debouncedLoadMore = _.debounce(this.loadMore.bind(this), 300)
        this.debouncedRefetch = _.debounce(this.refetch.bind(this), 300)
    }

    componentDidMount() {
        super.componentDidMount()

        this.refetch()
        this.props.getSuggestions({ results: 10 })
    }

    componentWillUnmount() {
        this.props.resetAll()
    }

    ord_renderContent () {
        const actionsNode = this.renderActions()
        const listNode = this.renderList()
        return (
            <div className="p_ProfileSuggestions">
                <div className="ebp-header-divider"></div>
                <div className="p_admin_index ebp-wrap">
                    <div className="d_box">
                        <div className="p_admin_content">
                            <Row>
                                <Col sm={24} md={4} className="wrap-box-navigator">
                                    <Navigator selectedItem={'profileSuggestions'}/>
                                </Col>
                                <Col sm={24} md={20} className="c_ProfileContainer admin-right-column wrap-box-user">
                                    {actionsNode}
                                    {listNode}
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
    onSearchChanged = (e) => {
        const search = e.target.value
        this.setState({
            search,
            page: 1
        }, this.debouncedRefetch)
    }

    renderSearch() {
        return <div className="pull-left filter-group search-group">
            <Input defaultValue={this.state.search} onChange={this.onSearchChanged}
                placeholder={I18N.get('developer.search.search.placeholder')}/>
        </div>

    }

    renderColumns() {
        const columns = [
            {
                title: '#',
                dataIndex: 'displayId'
            },
            {
                title: I18N.get('suggestion.subject'),
                dataIndex: 'title',
                // width: '50%',
                className: 'fontWeight500 allow-wrap',
                render: (title, data) => {
                    return <a onClick={this.linkSuggestionDetail} className="tableLink">{title}</a>
                }
            },
            {
                title: I18N.get('suggestion.likes'),
                dataIndex: 'likesNum'
            },
            {
                title: I18N.get('suggestion.dislikes'),
                dataIndex: 'dislikesNum'
            },
            {
                title: I18N.get('suggestion.comments'),
                dataIndex: 'commentsNum'
            },
            {
                title: I18N.get('suggestion.activeness'),
                dataIndex: 'activeness'
            },
            {
                title: I18N.get('suggestion.owner'),
                dataIndex: 'createdBy.profile',
                render: data => `${_.get(data, 'firstName')} ${_.get(data, 'lastName')}`
            },
            {
                title: 'Created',
                dataIndex: 'createdAt',
                className: 'right-align',
                render: createdAt => moment(createdAt).format('MMM D'),
                sorter: (a, b) => {
                    return moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf()
                },
                defaultSortOrder: 'descend'
            }
        ]
        return columns
    }

    renderActions() {
        const searchNode = this.renderSearch()
        return <div>
            {searchNode}
            <MediaQuery maxWidth={MAX_WIDTH_MOBILE}>
                <Select
                    name="type"
                    onChange={this.onFilterChanged}
                    value={this.state.filter}
                >
                    {_.map(FILTERS, (filter, key) => {
                        return <Select.Option key={filter} value={filter}>
                            {key}
                        </Select.Option>
                    })}
                </Select>
            </MediaQuery>
            <MediaQuery minWidth={MIN_WIDTH_PC}>
                <Button.Group className="filter-group">
                    <Button
                        className={(this.state.filter === FILTERS.ALL && 'selected') || ''}
                        onClick={this.clearFilters}>{I18N.get('suggestion.all')}</Button>
                    <Button
                        className={(this.state.filter === FILTERS.ARCHIVED && 'selected') || ''}
                        onClick={this.setArchivedFilter}>{I18N.get('suggestion.archived')}</Button>
                </Button.Group>
            </MediaQuery>
        </div>
    }
    renderList() {
        const dataList = this.props.all_suggestions
        const columns = this.renderColumns()

        return <Table
            columns={columns}
            rowKey={(item) => item._id}
            dataSource={dataList}
            loading={this.props.loading}
        />
    }

    onSortByChanged = (sortBy) => {
        console.log('sortBy is: ', sortBy)
        this.setState({
            sortBy
        }, this.refetch)
    }

    /**
     * Builds the query from the current state
     */
    getQuery = () => {
        const query = {}

        if (this.state.sortBy) {
            query.sortBy = this.state.sortBy
        }

        if (!_.isEmpty(this.state.search)) {
            query.search = this.state.search
        }

        if (this.state.filter === FILTERS.ARCHIVED) {
            query.status = FILTERS.ARCHIVED
        }

        query.page = this.state.page || 1
        query.results = this.state.results || 5

        return query
    }

    /**
     * Refetch the data based on the current state retrieved from getQuery
     */
    refetch = () => {
        const query = this.getQuery()
        this.props.getSuggestions(query)
    }

    loadMore = async() => {
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

    loadPage = async(page) => {
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

    hasMoreSuggestions = () => {
        return _.size(this.props.all_suggestions) < this.props.all_suggestions_total
    }

    onFilterChanged = (value) => {
        switch (value) {
            case FILTERS.ALL:
                this.clearFilters()
                break
            case FILTERS.ARCHIVED:
                this.setArchivedFilter()
                break
            default:
                this.clearFilters()
                break
        }
    }

    clearFilters = () => {
        this.setState({ filter: FILTERS.ALL }, this.refetch)
    }

    setArchivedFilter = () => {
        this.setState({ filter: FILTERS.ARCHIVED }, this.refetch)
    }

    linkSuggestionDetail = (suggestionId) => {
        this.props.history.push(`/suggestion/${suggestionId}`)
    }
}
