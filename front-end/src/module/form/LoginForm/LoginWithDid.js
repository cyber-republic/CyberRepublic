import React, { Component } from 'react'
import styled from 'styled-components'
import { Popover, Spin, Divider, message } from 'antd'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'

class LoginWithDid extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      visible: false,
      oldUrlVisible: false
    }
    this.timerDid = null
    this.oldTimerDid = null
  }

  elaQrCode = () => {
    const { url } = this.state
    return (
      <Content>
        {url ? <QRCode value={url} size={180} /> : <Spin />}
        <Tip>{I18N.get('login.qrcodeTip')}</Tip>
      </Content>
    )
  }

  elaOldQrCode = () => {
    const { oldUrl } = this.state
    return (
      <Content>
        {oldUrl ? <QRCode value={oldUrl} size={180} /> : <Spin />}
        <Tip>{I18N.get('login.qrcodeOldTip')}</Tip>
      </Content>
    )
  }

  polling = async () => {
    if (!this._isMounted) {
      return
    }
    const { url } = this.state
    const rs = await this.props.checkElaAuth(url)
    if (rs && rs.success === true) {
      clearTimeout(this.timerDid)
      this.timerDid = null
      if (rs.did) {
        this.props.changeTab('register', rs.did, rs.newVersion)
        this.setState({ visible: false })
      }
      return
    }
    if (rs && rs.success === false) {
      clearTimeout(this.timerDid)
      this.timerDid = null
      if (rs.message) {
        message.error(rs.message)
      } else {
        message.error('Something went wrong')
      }
      this.setState({ visible: false })
      return
    }
    if (this._isMounted) {
      clearTimeout(this.timerDid)
      this.timerDid = setTimeout(this.polling, 3000)
    }
  }

  pollingWithOldUrl = async () => {
    if (!this._isMounted) {
      return
    }
    const { oldUrl } = this.state
    const rs = await this.props.checkElaAuth(oldUrl)
    if (rs && rs.success === true) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      if (rs.did) {
        this.props.changeTab('register', rs.did, rs.newVersion)
        this.setState({ oldUrlVisible: false })
      }
      return
    }
    if (rs && rs.success === false) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      if (rs.message) {
        message.error(rs.message)
      } else {
        message.error('Something went wrong')
      }
      this.setState({ oldUrlVisible: false })
      return
    }
    if (this._isMounted) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = setTimeout(this.pollingWithOldUrl, 3000)
    }
  }

  handleClick = () => {
    if (this.oldTimerDid) {
      clearTimeout(this.oldTimerDid)
    }
    if (this.timerDid) {
      return
    }
    this.timerDid = setTimeout(this.polling, 3000)
  }

  handleOldUrlClick = () => {
    if (this.timerDid) {
      clearTimeout(this.timerDid)
    }
    if (this.oldTimerDid) {
      return
    }
    this.oldTimerDid = setTimeout(this.pollingWithOldUrl, 3000)
  }

  componentDidMount = async () => {
    this._isMounted = true
    const rs = await this.props.loginElaUrl()
    if (rs && rs.success) {
      this.setState({ url: rs.url, oldUrl: rs.oldUrl })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    clearTimeout(this.timerDid)
    clearTimeout(this.oldTimerDid)
    this.timerDid = null
    this.oldTimerDid = null
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible, oldUrlVisible: false })
  }

  handleOldUrlVisibleChange = (visible) => {
    this.setState({ oldUrlVisible: visible, visible: false })
  }

  render() {
    return (
      <Wrapper>
        <Divider>
          <Text>OR</Text>
        </Divider>
        <Popover
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          content={this.elaQrCode()}
          trigger="click"
          placement="top"
        >
          <Button onClick={this.handleClick}>
            {I18N.get('login.withDid')}
          </Button>
        </Popover>
        <br />
        <Popover
          visible={this.state.oldUrlVisible}
          onVisibleChange={this.handleOldUrlVisibleChange}
          content={this.elaOldQrCode()}
          trigger="click"
          placement="top"
        >
          <Button onClick={this.handleOldUrlClick}>
            {I18N.get('login.withOldWallet')}
          </Button>
        </Popover>
      </Wrapper>
    )
  }
}

export default LoginWithDid

const Wrapper = styled.div`
  margin-top: 32px;
  text-align: center;
`
const Text = styled.div`
  font-size: 14px;
  color: #031e28;
  opacity: 0.5;
`
const Button = styled.span`
  display: inline-block;
  margin-bottom: 16px;
  font-size: 13px;
  border: 1px solid #008d85;
  color: #008d85;
  text-align: center;
  padding: 6px 16px;
  cursor: pointer;
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
