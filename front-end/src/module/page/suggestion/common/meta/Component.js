import React from 'react';
import moment from 'moment/moment'
import I18N from '@/I18N'

import './style.scss'

export default ({ data }) => {
    const { displayId, author, createdAt } = data;
    return (
        <div className='c_SuggestionMeta'>
            <span>{`#${displayId}`}</span>
            <span>{I18N.get('suggestion.postedBy')} {author}</span>
            <span>{moment(createdAt).format('MMM D, YYYY')}</span>
        </div>
    )
}
