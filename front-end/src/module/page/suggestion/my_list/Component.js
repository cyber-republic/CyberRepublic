import React from 'react';
import moment from 'moment/moment'
import _ from 'lodash'
import { List } from 'antd';
import I18N from '@/I18N'
import BaseComponent from '@/model/BaseComponent'

import './style.scss'

export default class extends BaseComponent {
    constructor(props) {
        super(props)

        // we use the props from the redux store if its retained
        this.state = {
            showMobile: false,
            page: 1,
            results: 5,
            total: 0
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
            <div className='p_MySuggestionList'>
                {headerNode}
                {listNode}
            </div>
        )
    }
    renderHeader() {
        return (
            <div className='cr-mysuggestion-header'>
                <h2 className='title komu-a'>{this.props.header || I18N.get('suggestion.mySuggestions').toUpperCase()}</h2>
                <a href='/profile/suggestion' className='view-all-link'>{I18N.get('suggestion.viewAll')}</a>
            </div>
        )
    }
    renderList() {
        const suggestionsList = this.props.my_suggestions;
        const listData = _.map(suggestionsList, data => ({
            href: `/suggestion/${data._id}`,
            title: data.title,
            content: data.desc, // TODO: limited length
            createdAt: data.createdAt,
            _id: data._id,
            displayId: data.displayId
        }))

        return <List
            itemLayout='vertical'
            dataSource={listData}
            renderItem={item => (
                <List.Item
                    key={item._id}
                >
                    <List.Item.Meta
                        title={<a href={item.href}>{item.title}</a>}
                        description = {
                            `#${item.displayId} ${moment(item.createdAt).format('MMM D, YYYY')}`
                        }
                    />
                    {/* <span dangerouslySetInnerHTML={{__html: item.content}}></span> */}
                </List.Item>
            )}
        />
    }

    /**
     * Builds the query from the current state
     */
    getQuery = () => {
        const { page, results } = this.state
        const query = {
            page,
            results
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

    goToProfile = () => {
        this.props.history.push(`/profile/suggestion`)
    }
}
