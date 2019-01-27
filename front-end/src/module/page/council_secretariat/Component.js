import React from 'react'
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container'
import {TEAM_TYPE, TEAM_SUBCATEGORY} from '@/constant'
import I18N from '@/I18N'
import './style.scss'
import { Col, Row, Divider } from 'antd'
import _ from 'lodash'
import numeral from 'numeral'

export default class extends StandardPage {
    ord_props() {
        return {
        }
    }

    componentWillUnmount() {
    }

    linkToRule() {
        this.props.history.push('/constitution')
    }

    ord_renderContent () {
        return (
            <div className="p_cs">
                <div className="ebp-header-divider" />
                <div className="p_admin_index ebp-wrap">
                    <div className="d_box">
                        <div className="p_content">
                            {this.buildContent()}
                        </div>
                    </div>
                    <div className="council-rule">
                        <h3 className="title">{I18N.get('cs.rule.tile')}</h3>
                        <span className="view-rule">{I18N.get('cs.rule.show.click')} <span className="click-here" onClick={this.linkToRule.bind(this)}>{I18N.get('cs.rule.show.here')}</span> {I18N.get('cs.rule.show.view')}</span>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }

    buildIncumbent() {
        return (
            <div className="incumbent">
                <div className="title">
                    {I18N.get('cs.incumbent')}
                    {/*<span className="title_1st"><Divider className="line" type="vertical" />1ST</span>*/}
                </div>
                <Row className="members">
                    <Col lg={8} md={8} sm={24} className="member">
                        <div className="small-rect"></div>
                        <div className="big-rect">
                            <div className="content">
                                <h3 className="name">{I18N.get('cs.kevin.name')}</h3>
                                <span className="self-intro">{I18N.get('cs.kevin.intro')}</span>
                            </div>
                        </div>
                    </Col>
                    <Col lg={8} md={8} sm={24} className="member">
                        <div className="small-rect"></div>
                        <div className="big-rect">
                            <div className="content">
                                <h3 className="name">{I18N.get('cs.yipeng.name')}</h3>
                                <span className="self-intro">{I18N.get('cs.yipeng.intro')}</span>
                            </div>
                        </div>
                    </Col>
                    <Col lg={8} md={8} sm={24} className="member">
                        <div className="small-rect"></div>
                        <div className="big-rect">
                            <div className="content">
                                <h3 className="name">{I18N.get('cs.feng.name')}</h3>
                                <span className="self-intro">{I18N.get('cs.feng.intro')}</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

    buildSecretariat() {
        return (
            <div className="secretariat">
                <div className="title">
                    {I18N.get('cs.secretariat.general')}
                    {/*<span className="title_1st"><Divider className="line" type="vertical" />1ST</span>*/}
                </div>
                <Row className="members">
                    <Col lg={8} md={8} sm={24} className="member">
                        <div className="small-rect"></div>
                        <div className="big-rect">
                            <div className="content">
                                <h3 className="name">{I18N.get('cs.rebecca.name')}</h3>
                                <span className="self-intro">{I18N.get('cs.rebecca.intro')}</span>
                            </div>
                        </div>
                    </Col>
                </Row>
                {/*<div className="title">{I18N.get('cs.secretariat.staff')}<span className="title_1st"><Divider className="line" type="vertical" />1ST</span></div>
                <Row className="members">
                    <Col lg={8} md={8} sm={24} className="member">
                        <div className="small-rect"></div>
                        <div className="big-rect">
                            <div className="content">
                                <h3 className="name">Kevin Zhang</h3>
                                <span className="self-intro">Kevin is a dedicated industry leader, he is a advisor of BTC, Kevin is a dedicated industry leader, he is a advisor of BTC lorem ipsum dolor sit</span>
                            </div>
                        </div>
                    </Col>
                </Row>*/}
            </div>
        )
    }

    buildContent() {
        return (
            <div className="cs-background">
                <div className="circle-container">
                    <img className="circle" src="assets/images/council_circle.png"></img>
                </div>
                <div className="circle-top1">
                    <img className="circle" src="assets/images/council_circle.png"></img>
                </div>
                <div className="circle-top2">
                    <img className="circle" src="assets/images/council_circle.png"></img>
                </div>
                <div className="right-box-container">
                    <div className="small-box"></div>
                    <div className="box"></div>
                    <img src="assets/images/training_green_slashed_box.png"/>
                </div>
                <div className="connector-container">
                    <img src="assets/images/council_connector.png"/>
                </div>
                <div className="container">
                    <div className="rect-container">
                        <div className="rect"></div>
                        <div className="title-council">{I18N.get('cs.council')}</div>
                        {this.buildIncumbent()}
                        <div className="title-secretariat">{I18N.get('cs.secretariat')}</div>
                        {this.buildSecretariat()}
                    </div>
                </div>
            </div>
        )
    }
}
