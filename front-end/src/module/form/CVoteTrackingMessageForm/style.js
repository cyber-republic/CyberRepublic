import styled from 'styled-components'
import { Button } from 'antd'

export const Container = styled.div`
  text-align: left;
  .ant-form-item-label {
    text-align: left;
  }
  .ant-form-item-required:before {
    display: none;
  }
  .ant-select-selection,
  .ant-input {
    border-radius: 0;
  }
  .ant-form-item-label label {
    white-space: normal;
    /* line-height: 1.4rem; */
    display: block;
  }
`

export const Btn = styled(Button)`
  width: 100%;
  background: #66bda3;
  color: #fff;
  border-color: #009999;
  border-radius: 0;
`

export const Text = styled.div`
  text-align: center;
`

export const StyledFormItem = styled.div``

export const Note = styled.div`
  margin-bottom: 15px;
`

export const NoteHighlight = styled.span`
  color: red;
`
export const Title = styled.div`
  text-align: center;
  font-size: 20px;
`
