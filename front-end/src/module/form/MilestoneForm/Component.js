import React from 'react'
import PropTypes from 'prop-types'
import BaseComponent from '@/model/BaseComponent'
import styled from 'styled-components'
import { Form, Input, Button, DatePicker } from 'antd'
import I18N from '@/I18N'

const FormItem = Form.Item

class MilestoneForm extends BaseComponent {
  handleSubmit = e => {
    e.stopPropagation() // prevent event bubbling
    e.preventDefault()
    const { form, onSubmit } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit(values)
      }
    })
  }

  ord_render() {
    const { getFieldDecorator } = this.props.form
    const { item } = this.props
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      },
      colon: false
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          label={I18N.get('suggestion.plan.publishDate')}
          {...formItemLayout}
        >
          {getFieldDecorator('date', {
            rules: [
              {
                required: true,
                message: I18N.get('suggestion.form.error.required')
              }
            ],
            initialValue: item && item.date
          })(<DatePicker />)}
        </FormItem>
        <FormItem
          label={I18N.get('suggestion.plan.version')}
          {...formItemLayout}
        >
          {getFieldDecorator('version', {
            rules: [
              {
                required: true,
                message: I18N.get('suggestion.form.error.required')
              }
            ],
            initialValue: item && item.version
          })(<Input />)}
        </FormItem>
        <Actions>
          <Button type="primary" htmlType="submit" size="default">
            {item
              ? I18N.get('suggestion.plan.update')
              : I18N.get('suggestion.plan.create')}
          </Button>
        </Actions>
      </Form>
    )
  }
}

MilestoneForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  item: PropTypes.object
}

export default Form.create()(MilestoneForm)

const Actions = styled.div`
  display: flex;
  justify-content: center;
  > button {
    margin: 0 8px;
  }
`
