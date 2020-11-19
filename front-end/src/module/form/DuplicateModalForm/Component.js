import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Modal, Select, Icon, Radio, Row, Col, Form } from 'antd'
import I18N from '@/I18N'

class DuplicateModal extends Component {
  constructor(props) {
    super(props)
    this.fetchProposal = _.debounce(this.fetchProposal.bind(this), 800)
    this.fetchRadioSuggestion()
    this.state = {
      visible: false,
      data: [],
      radioData: [],
      value: '',
      relevances: props.initialValue ? props.initialValue : []
    }
  }

  componentDidMount() {

  }

  setData = value => {
    this.setState({ data: value })
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  showModal = () => {
    this.setState({ visible: true, index: -1 })
  }

  changeValue = value => {
    const { onChange, callback } = this.props
    const { relevances } = this.state
    this.setState(
      { values: [...relevances, value.relevances] }, () => {
        onChange(this.state.relevances)
        callback('relevances')
      })
  }

  handleDelete = index => {
  }

  handleEdit = index => {
    this.setState({ index, visible: true })
  }

  handleSubmit = values => {
    const { relevances, index } = this.state
    if (index >= 0) {
      const rs = relevances.map((item, key) => {
        if (index === key) {
          return values
        }
        return item
      })
      this.setState({ relevances: rs, visible: false }, () => {
        this.changeValue({ relevances: this.state.relevances })
      })
      return
    }
    this.setState(
      {
        relevances: [...relevances, values],
        visible: false
      },
      () => {
        this.changeValue({ relevances: this.state.relevances })
      }
    )
  }

  fetchProposal = async (value) => {
    if (_.isEmpty(value)) return

    this.setState({ data: [] })
    const { getSuggestion } = this.props
    const rs = await getSuggestion({ id: value, type: 'byNumber' })
    if (rs) {
      this.setState({ data: rs[0] })
    }
  }

  fetchRadioSuggestion = async () => {
    const { getSuggestion } = this.props
    const rs = await getSuggestion({ id: null, type: 'lastSuggestion' })
    if (rs) {
      this.setState({ radioData: rs })
    }
  }

  handleChange = param => {
    if (typeof param === 'string') {
      this.setState({ value: param })
    }
    if (typeof param === 'object') {
      this.setState({ value: param.target.value})
    }
  }

  handleSave = () => {
    const { setFieldsValue, getFieldsValue, setFields } = this.props.form
    const { value, data, radioData } = this.state
    const radio = _.find(radioData, { '_id': value })
    if (data._id === value) {
      setFieldsValue({...data})
      setFields({'newSecretaryDID': data.newSecretaryDID})
      setFieldsValue({'newSecretaryDID': data.newSecretaryDID})
      this.props.changeData(true)
      this.hideModal()
    }
    if (radio) {
      setFieldsValue({...radio})
      this.props.changeData(true)
      this.hideModal()
    }
  }

  render() {
    const { data, radioData } = this.state
    let selectItem
    let radioItem
    if (!_.isEmpty(data)) {
      selectItem = (<Select.Option key={data._id}>{data.title}</Select.Option>)
    }
    if (!_.isEmpty(radioData)) {
      radioItem = _.map(radioData, (obj) => {
        return <Radio style={radioStyle} key={obj._id} value={obj._id}>{obj.title}</Radio>
      })
    }
    return (
      <div>
        <Button
          icon="plus-circle"
          className="cr-duplicate-btn"
          onClick={this.showModal}
        >
          {I18N.get('suggestion.form.fields.duplicate.button')}
        </Button>
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          onCancel={this.hideModal}
          footer={null}
          width={670}
        >
          <div>
            <TitleDiv>{I18N.get("suggestion.form.fields.duplicate")}</TitleDiv>
            <div>
              <Row>
                <Col span={6} style={{ lineHeight: '40px' }}>
                  {I18N.get("suggestion.form.fields.duplicate.number")}
                </Col>
                <Col span={18}>
                  <Select
                    showSearch
                    showArrow={true}
                    size="large"
                    filterOption={false}
                    onSearch={this.fetchProposal}
                    onChange={this.handleChange}
                    suffixIcon={<Icon type="search" spin={false} style={{ height: '100px !improtant' }} />}
                    defaultActiveFirstOption={false}
                    notFoundContent={null}
                    defaultOpen={false}
                    style={{ width: '100%' }}
                  >
                    {selectItem}
                  </Select>
                </Col>
              </Row>
            </div>
            <RadioItem>
              <Radio.Group onChange={this.handleChange}>
                {radioItem}
              </Radio.Group>
            </RadioItem>
            <FooterButton>
              <Button
                style={cancelButton}
                onClick={this.hideModal}
              >
                {I18N.get('suggestion.cancel')}
              </Button>
              <Button
                style={saveButton}
                onClick={this.handleSave}
              >
                {I18N.get('profile.save')}
              </Button>
            </FooterButton>
          </div>
        </Modal>
      </div>
    )
  }
}

DuplicateModal.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func,
  initialValue: PropTypes.array
}

export default DuplicateModal

const TitleDiv = styled.div`
  font-size: 24px;
  line-height: 34px;
  align-content: center;
  text-align: center;
  margin-bottom: 40px;
`
const RadioItem = styled.div`
  margin: 30px 0px;
`
const FooterButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
  margin: '10px 0px'
}
const cancelButton = {
  backgroundColor: '#FFF',
  width: '80px',
  color: '#000',
  border: '1px solid #000',
  margin: '0 20px'
}
const saveButton = {
  backgroundColor: '#008D85',
  width: '80px',
  color: '#FFF',
  border: '1px solid #008D85',
  margin: '0 20px'
}