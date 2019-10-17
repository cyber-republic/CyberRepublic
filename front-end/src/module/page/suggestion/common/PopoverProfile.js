import React from 'react'
import { Popover, Button } from 'antd'
import _ from 'lodash'
import I18N from '@/I18N'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export default ({ data, meta }) => {
  let name = `${_.get(data, 'createdBy.profile.firstName', '')}
    ${_.get(data, 'createdBy.profile.lastName', '')}
  `
  const username = _.get(data, 'createdBy.username')
  if (name === ' ') {
    name = username
  }
  const author = data.author || name
  const userId = _.get(data, 'createdBy._id')
  const email = _.get(data, 'createdBy.email')
  const content = (
    <PopoverContent>
      <div>
        <span className="label email">
          {I18N.get('suggestion.popover.email')}:
        </span>
        <span className="value email">{email}</span>
        <Button type="primary">{I18N.get('suggestion.popover.copy')}</Button>
      </div>
      <div>
        <span className="label">{I18N.get('suggestion.popover.name')}:</span>
        <span className="value">{author}</span>
      </div>
      <Link to={`/member/${userId}`}>
        {I18N.get('suggestion.popover.viewProfile')}
      </Link>
    </PopoverContent>
  )
  return (
    <Popover content={content} trigger="click" placement="top">
      <ItemTextName>{meta ? author : username}</ItemTextName>
    </Popover>
  )
}

const PopoverContent = styled.div`
  padding: 16px 16px 8px;
  > div {
    margin-bottom: 8px;
    .label {
      padding-right: 20px;
    }
    .label.email {
      padding-right: 14px;
    }
    .value {
      color: rgba(0, 0, 0, 0.45);
    }
    .value.email {
      background: #f5f5f5;
      padding: 6px;
    }
  }
  a {
    display: inline-block;
    margin-top: 16px;
  }
`

export const ItemTextName = styled.a`
  font-weight: 200;
`
