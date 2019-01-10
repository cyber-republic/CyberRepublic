import React from 'react';
import moment from 'moment/moment'
import _ from 'lodash'
import I18N from '@/I18N'

import './style.scss'

export default ({ data, hideAuthor }) => {
    const { displayId, createdAt } = data;
    const author = data.author || `${_.get(data, 'createdBy.profile.firstName')} ${_.get(data, 'createdBy.profile.lastName')}`
    const authorNode = hideAuthor ? '' : <span>{I18N.get('suggestion.postedBy')} {author}</span>

    return (
        <div className='c_SuggestionMeta'>
            <span>{`#${displayId}`}</span>
            {authorNode}
            <span>{moment(createdAt).format('MMM D, YYYY')}</span>
        </div>
    )
}
