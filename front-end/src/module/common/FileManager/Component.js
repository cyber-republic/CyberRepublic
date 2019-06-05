import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import {
  Icon, Upload, Table,
} from 'antd'
import I18N from '@/I18N'
import _ from 'lodash'
import { upload_file, file as fileUtil } from '@/util'
import moment from 'moment/moment'
import { FILESIZE_LIMIT } from '@/constant'

import { Container, DeleteLink } from './style'

export default class extends BaseComponent {
  constructor(props) {
    super(props)

    this.state = {
      fileListExisted: props.fileList || [],
      fileListNew: props.fileListNew || [],
    }
  }

  ord_render() {
    const { hideUploader } = this.props

    return (
      <Container>
        {this.renderFileList()}
        {!hideUploader && this.renderUploader()}
      </Container>
    )
  }

  normFileList (fileList) {
    const result = _.map(fileList, file => {
      const { name, type, size, response } = file
      return {
        name,
        filetype: type,
        size,
        url: response,
      }
    })
    return result
  }

  getFileList (fileList) {
    return this.normFileList(fileList).concat(this.state.fileListExisted)
  }

  onChange = (e) => {
    const { onChange } = this.props
    const fileList = _.get(e, 'fileList')
    console.log('onChange: ', fileList)
    if (!onChange) return
    onChange(this.getFileList(fileList))
  }

  renderUploader() {
    const props = {
      accept: '.pdf',
      valuePropName: 'fileList',
      // getValueFromEvent: e => (Array.isArray(e) ? e : _.get(e, 'fileList')),
      onChange: this.onChange,
      customRequest: ({ file, onSuccess }) => {
        this.setState({
          attachment_loading: true
        })
        if (file.size > FILESIZE_LIMIT) return
        upload_file(file).then((d) => {
          this.setState({
            attachment_loading: false,
          })
          onSuccess(d.url, d)
        })
      }
    }
    const uploader = (
      <Upload.Dragger name="attachments" {...props}>
        {this.state.attachment_loading ? (
          <div>
            <p className="ant-upload-text" />
            <p className="ant-upload-text"><Icon type="loading" /></p>
            <p className="ant-upload-hint" />
          </div>
        ) : (
          <div>
            <p className="ant-upload-text">Drag files here</p>
            <p className="ant-upload-text">- or -</p>
            <p className="ant-upload-hint">Click to upload</p>
          </div>
        )}
      </Upload.Dragger>
    )

    return uploader
  }

  renderFileList () {
    const dataSource = this.state.fileListExisted
    const { canManage } = this.props
    const columns = [
      // {
      //   title: I18N.get('from.CVoteForm.fileList.number'),
      //   render: (vid, item, index) => (
      //   ),
      // },
      {
        title: I18N.get('from.CVoteForm.fileList.files'),
        dataIndex: 'name',
        render: (value, item) => (
          <a href={item.url} className="tableLink">
            {value}
          </a>
        ),
      },
      {
        title: I18N.get('from.CVoteForm.fileList.size'),
        dataIndex: 'size',
        render: (value, item) => fileUtil.humanFileSize(value),
      },
      {
        title: I18N.get('from.CVoteForm.fileList.time'),
        dataIndex: 'createdAt',
        render: (value, item) => moment(value).format('MMM D, YYYY'),
      },
    ]
    const removeCol = {
      title: I18N.get('from.CVoteForm.fileList.actions'),
      dataIndex: '_id',
      render: (value, item) => {
        return <DeleteLink onClick={this.removeFile.bind(this, value)}>{I18N.get('from.CVoteForm.fileList.delete')}</DeleteLink>
      },
    }

    if (canManage) columns.push(removeCol)

    const result = (
      <Table
        columns={columns}
        // loading={this.state.loading}
        dataSource={dataSource}
        rowKey={record => record._id}
        pagination={false}
      />
    )
    return result
  }

  removeFile = fileId => {
    // remove from fileList
    const newList = _.filter(this.state.fileListExisted, file => file._id !== fileId)
    this.setState({ fileListExisted: newList }, this.onChange)
  }
}
