import React from 'react';
import _ from 'lodash'
import I18N from '@/I18N'
import BaseComponent from '@/model/BaseComponent'
import MetaContainer from '../common/meta/Container'

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
        const { dataList } = this.props
        const result = _.map(dataList, data => this.renderItem(data))
        return <div className='list-container'>{result}</div>
    }

    renderItem = data => {
        const metaNode = this.renderMetaNode(data)
        const href = `/suggestion/${data._id}`
        const title = <a href={href} className='title-link'>{data.title}</a>
        return (
            <div key={data._id} className='item-container'>
                {metaNode}
                {title}
            </div>
        )
    }

    renderMetaNode(data) {
        return <MetaContainer data={data} hideAuthor />
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
