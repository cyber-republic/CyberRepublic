import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from 'antd'
import I18N from '@/I18N'

class PaymentList extends BaseComponent {
  handleDelete = index => {
    this.props.onDelete(index)
  }

  handleEdit = index => {
    this.props.onEdit(index)
  }

  ord_render() {
    const { list, editable } = this.props
    const visible = editable === false ? editable : true
    return (
      <StyledTable>
        <StyledHead>
          <StyledRow>
            <th>{I18N.get('suggestion.budget.payment')}#</th>
            <th>{I18N.get('suggestion.budget.amount')}(ELA)</th>
            <th>{I18N.get('suggestion.budget.reasons')}</th>
            <th>{I18N.get('suggestion.budget.criteria')}</th>
            {visible && (
              <th style={{ width: 120 }}>
                {I18N.get('suggestion.budget.action')}
              </th>
            )}
          </StyledRow>
        </StyledHead>
        <tbody>
          {list.map((item, index) => (
            <StyledRow key={index}>
              <td>{index + 1}</td>
              <td>{item.amount}</td>
              <td>{item.reasons}</td>
              <td>{item.criteria}</td>
              {visible && (
                <td>
                  <Button
                    size="small"
                    type="danger"
                    shape="circle"
                    icon="delete"
                    onClick={this.handleDelete.bind(this, index)}
                  />
                  <Button
                    size="small"
                    type="primary"
                    shape="circle"
                    icon="edit"
                    onClick={this.handleEdit.bind(this, index)}
                  />
                </td>
              )}
            </StyledRow>
          ))}
        </tbody>
      </StyledTable>
    )
  }
}

PaymentList.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  list: PropTypes.array.isRequired,
  editable: PropTypes.bool
}

export default PaymentList

const StyledTable = styled.table`
  margin-top: 16px;
  width: 100%;
  font-size: 13px;
`
const StyledHead = styled.thead`
  > tr {
    background: #0f2631;
  }
  th {
    line-height: 18px;
    padding: 16px;
    color: #fff;
    &:first-child {
      width: 80px;
    }
    &:nth-child(2) {
      width: 120px;
    }
  }
`
const StyledRow = styled.tr`
  width: 100%;
  background: #f2f6fb;
  > td {
    line-height: 18px;
    padding: 16px;
    color: #000;
    > button {
      margin: 0 4px;
    }
  }
`