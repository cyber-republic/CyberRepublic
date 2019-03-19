import { breakPoint } from '@/constants/breakPoint'
import { text } from '@/constants/color'
import { gap } from '@/constants/variable'
import styled from 'styled-components'
import { Button } from 'antd'

export const Container = styled.div`
  padding-left: 100px;
  margin: 80px auto 0;

  @media only screen and (max-width: ${breakPoint.lg}) {
    margin-left: 5%;
    margin-right: 5%;
  }
  @media only screen and (max-width: ${breakPoint.mobile}) {
    padding: 0;
    width: 90vw;
  }
`

export const Title = styled.div`
  font-size: 30px;
  color: ${text.primaryDark};
  margin-top: 26px;
  margin-bottom: 18px;
  `

export const Desc = styled.div`
  color: black;
`

export const StyledLink = styled.div`
  color: ${text.lightGray};
  margin-top: ${gap.gap_2};
`

export const BtnGroup = styled.div`
  margin: ${gap.gap_2} 0;
`

export const StyledButton = styled(Button)`
  width: 200px;
`