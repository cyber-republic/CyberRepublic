import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import { Popover, Spin, message } from 'antd'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'
import ExternalLinkSvg from './ExternalLinkSvg'

class ProfileDid extends Component {
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
        <Tip>{I18N.get('profile.qrcodeTip')}</Tip>
      </Content>
    )
  }

  elaOldQrCode = () => {
    const { oldUrl } = this.state
    return (
      <Content>
        {oldUrl ? <QRCode value={oldUrl} size={180} /> : <Spin />}
        <Tip>{I18N.get('profile.qrcodeOldTip')}</Tip>
      </Content>
    )
  }

  pollingDid = async () => {
    if (!this._isMounted) {
      return
    }
    const rs = await this.props.getNewActiveDid()
    if (rs && rs.success) {
      clearTimeout(this.timerDid)
      this.timerDid = null
      this.setState({ url: '', visible: false })
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
      this.timerDid = setTimeout(this.pollingDid, 3000)
    }
  }

  pollingDidWithOldUrl = async () => {
    if (!this._isMounted) {
      return
    }
    const rs = await this.props.getNewActiveDid()
    if (rs && rs.success) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      this.setState({ oldUrl: '', oldUrlVisible: false })
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
      this.oldTimerDid = setTimeout(this.pollingDidWithOldUrl, 3000)
    }
  }

  handleAssociate = () => {
    if (this.oldTimerDid) {
      clearTimeout(this.oldTimerDid)
    }
    if (this.timerDid) {
      return
    }
    this.timerDid = setTimeout(this.pollingDid, 3000)
  }

  handleOldAssociate = () => {
    if (this.timerDid) {
      clearTimeout(this.timerDid)
    }
    if (this.oldTimerDid) {
      return
    }
    this.oldTimerDid = setTimeout(this.pollingDidWithOldUrl, 3000)
  }

  componentDidMount = async () => {
    this._isMounted = true
    const rs = await this.props.getElaUrl()
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
    const { did } = this.props
    let domain
    if (process.env.NODE_ENV === 'development') {
      domain = 'blockchain-did-regtest'
    } else {
      domain = 'idchain'
    }
    if (did && did.id) {
      return (
        <Did>
          <span>DID:</span>
          <a
            href={`https://${domain}.elastos.org/address/${did.id.slice(
              'did:elastos:'.length
            )}`}
            target="_blank"
          >
            {did.id} <ExternalLinkSvg />
          </a>
        </Did>
      )
    } else {
      return (
        <Fragment>
          {/* <Popover
            content={this.elaQrCode()}
            trigger="click"
            placement="top"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button onClick={this.handleAssociate}>
              {I18N.get('profile.associateDid')}
            </Button>
          </Popover>
          <br /> */}
          <Popover
            content={this.elaOldQrCode()}
            trigger="click"
            placement="top"
            visible={this.state.oldUrlVisible}
            onVisibleChange={this.handleOldUrlVisibleChange}
          >
            <Button onClick={this.handleOldAssociate}>
              {I18N.get('profile.oldAssociateDid')}
            </Button>
          </Popover>
        </Fragment>
      )
    }
  }
}

export default ProfileDid

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
const Did = styled.div`
  line-height: 32px;
  a {
    color: #008d85;
    font-size: 13px;
    padding-left: 10px;
    &:focus {
      text-decoration: none;
    }
  }
`
