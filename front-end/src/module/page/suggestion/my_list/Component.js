import React from 'react';
import _ from 'lodash'
import {
    Tabs,
    List,
    Icon,
    Button
} from 'antd';
import I18N from '@/I18N'
import Footer from '@/module/layout/Footer/Container'
import Navigator from '@/module/page/shared/HomeNavigator/Container'
import BaseComponent from '@/model/BaseComponent'

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
export default class extends BaseComponent {
    constructor(props) {
        super(props)

        // we use the props from the redux store if its retained
        this.state = {
            showMobile: false,
            sortBy: sortBy.createdAt,
            page: 1,
            results: 10
        }
    }

    componentDidMount() {
        this.refetch()
    }

    componentWillUnmount() {
        this.props.resetAll()
    }

    ord_render() {
        if (!this.props.currentUserId) return null
        const headerNode = this.renderHeader()
        const listNode = this.renderList()
        return (
            <div className='p-suggestion'>
                {headerNode}
                {listNode}
            </div>
        )
    }
    renderHeader() {
        return <div className='view-all-link' onClick={this.goToProfile}>{I18N.get('suggestion.viewAll')}</div>
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
    /**
     * Builds the query from the current state
     */
    getQuery() {
        const query = {}

        if (this.state.sortBy) {
            query.sortBy = this.state.sortBy
        }
        
        if (this.props.currentUserId) {
            query.createdBy = this.props.currentUserId
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

    goToProfile = () => {
        this.props.history.push(`/profile/suggestion/list`)
    }
}
