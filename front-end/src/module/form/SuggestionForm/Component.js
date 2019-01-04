import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import _ from 'lodash'
import {
    Form,
    Icon,
    Input,
    InputNumber,
    Button,
    Checkbox,
    Radio,
    Select,
    message,
    Row,
    Col,
    Upload,
    Cascader,
    Divider,
    TreeSelect,
    Modal
} from 'antd'
import I18N from '@/I18N'
import InputTags from '@/module/shared/InputTags/Component'
import ReactQuill from 'react-quill'
import { TOOLBAR_OPTIONS } from '@/config/constant'
import {TEAM_TASK_DOMAIN, SKILLSET_TYPE} from '@/constant'
import {upload_file} from '@/util'
import sanitizeHtml from 'sanitize-html'
import './style.scss'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class C extends BaseComponent {
    constructor (props) {
        super(props)

        this.state = {
        }
    }

    handleSubmit (e) {
        e.preventDefault()

        const tags = this.props.form.getFieldInstance('tags').getValue()
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                if (_.isEmpty(values.description)) {
                    this.props.form.setFields({
                        description: {
                            errors: [new Error(I18N.get('suggestion.create.error.descriptionRequired'))]
                        }
                    })

                    return
                }
                if (_.isEmpty(values.description)) {
                    this.props.form.setFields({
                        title: {
                            errors: [new Error(I18N.get('suggestion.create.error.titleRequired'))]
                        }
                    })

                    return
                }

                let createParams = {
                    title: values.title,
                    desc: sanitizeHtml(values.description, {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'u', 's' ])
                    })
                }

                try {
                    await this.props.create(createParams)
                } catch (error) {
                    console.log(error)
                }
            }
        })
    }

    getInputProps () {
        const {getFieldDecorator} = this.props.form
        const existingTeam = this.props.existingTeam

        const input_el = (
            <Input size='large'/>
        )

        const textarea_el = (
            <ReactQuill
                modules={{
                    toolbar: TOOLBAR_OPTIONS
                }}
            />
        )

        const title_fn = getFieldDecorator('title', {
            rules: [
                {required: true, message: I18N.get('team.create.error.titleRequired')},
                {min: 4, message: I18N.get('team.create.error.titleTooShort')}
            ]
        })

        const description_fn = getFieldDecorator('description', {
            rules: [
                {required: true, message: I18N.get('team.create.error.descriptionRequired')},
                {min: 4, message: I18N.get('team.create.error.descriptionTooShort')}
            ]
        })

        return {
            title: title_fn(input_el),
            description: description_fn(textarea_el)
        }
    }

    handleCancel() {
        this.setState({ previewVisible: false })
    }

    ord_render () {
        const p = this.getInputProps()

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8}
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 12}
            }
        }

        const formContent = (
            <div>
                <FormItem {...formItemLayout}>
                    {p.title}
                </FormItem>
                <FormItem {...formItemLayout}>
                    {p.description}
                </FormItem>
                <FormItem wrapperCol={{xs: {span: 24, offset: 0}, sm: {span: 12, offset: 8}}}>
                    <Button type='ebp' className='d_btn' onClick={this.props.showCreateForm}>
                        {I18N.get('suggestion.cancel')}
                    </Button>
                    <Button loading={this.props.loading} type='ebp' htmlType='submit' className='d_btn'>
                        {I18N.get('suggestion.submit')}
                    </Button>
                </FormItem>
            </div>
        )

        return (
            <div className='c_SuggestionForm'>
                <Form onSubmit={this.handleSubmit.bind(this)} className='d_SuggestionForm'>
                    {formContent}
                </Form>
            </div>
        )
    }

}
export default Form.create()(C)
