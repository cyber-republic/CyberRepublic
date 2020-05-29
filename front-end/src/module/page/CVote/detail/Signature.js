import React, { Component } from 'react'
import styled from 'styled-components'
import { Form, Button, Input, message, Modal, Spin } from 'antd'
import QRCode from 'qrcode.react'
import I18N from '@/I18N'

const { TextArea } = Input
const FormItem = Form.Item

class Signature extends Component {
  constructor(props) {
    super(props)
    this.state = { url: '', messageHash: '' }
    this.timerDid = null
  }

  handleSubmit = (e) => {
    e.stopPropagation() // prevent event bubbling
    e.preventDefault()
    const { isSecretary } = this.props
    {
      isSecretary ? this.reviewApplication() : this.applyPayment()
    }
  }

  applyPayment = () => {
    const { form, applyPayment, proposalId, stage } = this.props
    form.validateFields(async (err, values) => {
      if (!err) {
        const rs = await applyPayment(proposalId, stage, {
          message: values.message.trim()
        })
        if (rs.success && rs.url) {
          this.setState({ url: rs.url, messageHash: rs.messageHash })
          this.pollingSignature()
        }
      }
    })
  }

  reviewApplication = () => {
    const {
      form,
      reviewApplication,
      proposalId,
      stage,
      opinion,
      application
    } = this.props
    form.validateFields(async (err, values) => {
      if (!err) {
        const data = {
          reason: values.message.trim(),
          opinion,
          applicationId: application._id
        }
        const rs = await reviewApplication(proposalId, stage, data)
        if (rs.success && rs.url) {
          this.setState({ url: rs.url, messageHash: rs.messageHash })
          this.pollingSignature()
        }
      }
    })
  }

  pollingSignature = () => {
    const {
      proposalId,
      getPaymentSignature,
      hideModal,
      isSecretary,
      getReviewTxid
    } = this.props
    const { messageHash } = this.state
    this.timerDid = setInterval(async () => {
      let rs
      if (isSecretary) {
        rs = await getReviewTxid({ proposalId, messageHash })
      } else {
        rs = await getPaymentSignature({ proposalId, messageHash })
      }
      if (rs && rs.success) {
        clearInterval(this.timerDid)
        this.timerDid = null
        hideModal()
      }
      if (rs && rs.success === false) {
        clearInterval(this.timerDid)
        this.timerDid = null
        if (rs.message) {
          message.error(rs.message)
        } else {
          message.error(I18N.get('milestone.exception'))
        }
        hideModal()
      }
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timerDid)
  }

  signatureQrCode = () => {
    const { url } = this.state
    return (
      <Content>
        {url ? <QRCode value={url} size={400} /> : <Spin />}
        <Tip>{I18N.get('milestone.sign')}</Tip>
      </Content>
    )
  }

  renderTextare = () => {
    const { getFieldDecorator } = this.props.form
    const { isSecretary, application, isCompletion } = this.props
    return (
      <Form onSubmit={this.handleSubmit}>
        {isSecretary && <Msg>{application.message}</Msg>}
        <Label>
          <span>*</span>
          {isCompletion
            ? I18N.get('milestone.summary')
            : I18N.get('milestone.reason')}
        </Label>
        <FormItem>
          {getFieldDecorator('message', {
            rules: [
              {
                required: true,
                message: I18N.get('milestone.required')
              }
            ]
          })(<TextArea rows={16} style={{ resize: 'none' }} />)}
        </FormItem>
        <Actions>
          <Button className="cr-btn cr-btn-primary" htmlType="submit">
            {I18N.get('milestone.next')}
          </Button>
        </Actions>
      </Form>
    )
  }

  render() {
    const { url } = this.state
    const { stage, isSecretary, hideModal, toggle, opinion } = this.props
    const flag = opinion && opinion.toLowerCase() === 'rejected'
    return (
      <Modal
        maskClosable={false}
        visible={toggle}
        onCancel={hideModal}
        footer={null}
      >
        <Wrapper>
          {isSecretary ? (
            <Title>
              {flag ? 'Reject' : 'Approve'} Payment #{parseInt(stage) + 1}
            </Title>
          ) : (
            <Title>
              {I18N.get('milestone.header')} #{parseInt(stage) + 1}
            </Title>
          )}

          {url ? this.signatureQrCode() : this.renderTextare()}
        </Wrapper>
      </Modal>
    )
  }
}

export default Form.create()(Signature)

const Wrapper = styled.div`
  margin: 0 auto;
`
const Label = styled.div`
  font-size: 17px;
  color: #000;
  display: block;
  margin-bottom: 8px;
  > span {
    color: #ff0000;
  }
`
const Title = styled.div`
  font-size: 30px;
  line-height: 42px;
  color: #000000;
  text-align: center;
  margin-bottom: 42px;
`
const Actions = styled.div`
  display: flex;
  justify-content: center;
  > button {
    margin: 0 8px;
  }
`
const Content = styled.div`
  padding: 16px;
  text-align: center;
`
const Tip = styled.div`
  font-size: 14px;
  color: #000;
  margin-top: 16px;
`
const Msg = styled.div`
  background-color: #ececec;
  border: 1px sold #cccccc;
  padding: 8px;
  margin-bottom: 24px;
`