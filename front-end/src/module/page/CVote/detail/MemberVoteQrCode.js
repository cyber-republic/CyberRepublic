import React, { Component } from 'react'
import styled from 'styled-components'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'

class MemberVoteQrCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: ''
    }
  }

  componentDidMount = async () => {
    const rs = await this.props.getMemberVoteUrl(this.props._id)
    if (rs && rs.success) {
      this.setState({ url: rs.url, oldUrl: rs.oldUrl })
    }
  }

  render() {
    return (
      <Content>
        <QRCode value={this.state.url} size={145} />
        <Tip>{I18N.get('profile.member.vote.qrcodeTip')}</Tip>
        <br />
        <QRCode value={this.state.oldUrl} size={145} />
        <Tip>{I18N.get('profile.member.vote.qrcodeOldTip')}</Tip>
      </Content>
    )
  }
}

export default MemberVoteQrCode

const Content = styled.div`
  padding: 16px;
  text-align: center;
`

const Tip = styled.div`
  font-size: 14px;
  color: #000;
  margin-top: 16px;
`
