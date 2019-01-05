import React from 'react';
import _ from 'lodash'
import { List } from 'antd';
import I18N from '@/I18N'
import BaseComponent from '@/model/BaseComponent'

import './style.scss'

export default class extends BaseComponent {
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
                            `#${item.displayId} ${item.createdAt}`
                        }
                    />
                    {item.content}
                </List.Item>
            )}
        />
    }

    goToProfile = () => {
        this.props.history.push(`/profile/suggestion/list`)
    }
}
