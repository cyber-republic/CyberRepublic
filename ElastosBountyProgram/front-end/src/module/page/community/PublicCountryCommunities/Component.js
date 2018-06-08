import React from 'react'
import { Link } from 'react-router-dom'
import StandardPage from '../../StandardPage';

import { Table, Card, Select, Col, Row, Breadcrumb, Icon, Button, Input } from 'antd'
const Search = Input.Search;

import config from '@/config'
import Footer from '@/module/layout/Footer/Container'
import ListTasks from '../shared/ListTasks/Component'
import ListEvents from '../shared/ListEvents/Component'
import '../style.scss'

export default class extends StandardPage {
    state = {
        communities: [],
    }

    componentWillUnmount () {
        this.props.resetTasks()
    }

    componentDidMount() {
        this.props.getSocialEvents()
        this.loadCommunities();
    }

    loadCommunities() {
        const currentCountry = this.props.match.params['country'];
        if (currentCountry) {
            this.props.getSpecificCountryCommunities(currentCountry).then((communities) => {
                this.convertCommunitiesLeaderIdsToLeaderObjects(communities).then((communities) => {
                    this.setState({
                        communities
                    })
                })
            })
        } else {
            this.props.getAllCountryCommunity().then((communities) => {
                this.convertCommunitiesLeaderIdsToLeaderObjects(communities).then((communities) => {
                    this.setState({
                        communities
                    })
                })
            })
        }
    }

    mockAvatarToUsers(users) {
        users.forEach((user) => {
            user.profile.avatar = config.data.mockAvatarUrl
        })

        return users
    }

    // API only return list leader ids [leaderIds], so we need convert it to array object leader [leaders]
    convertCommunitiesLeaderIdsToLeaderObjects(communities) {
        return new Promise((resolve, reject) => {
            let userIds = []
            communities.forEach((community) => {
                userIds.push(...community.leaderIds)
            })
            userIds = _.uniq(userIds)

            if (!userIds.length) {
                return resolve([])
            }

            this.props.getUserByIds(userIds).then((users) => {
                users = this.mockAvatarToUsers(users) // Mock avatar url
                const mappingIdToUserList = _.keyBy(users, '_id');
                communities.forEach((community) => {
                    community.leaders = community.leaders || [];
                    community.leaderIds.forEach((leaderId) => {
                        if (mappingIdToUserList[leaderId]) {
                            community.leaders.push(mappingIdToUserList[leaderId])
                        }
                    })
                })

                resolve(communities)
            })
        })
    }

    handleChangeCountry(geolocation) {
        if (geolocation) {
            this.props.getSpecificCountryCommunities(geolocation).then((communities) => {
                this.convertCommunitiesLeaderIdsToLeaderObjects(communities).then((communities) => {
                    this.setState({
                        communities
                    })

                    this.props.history.push(`/community/country/${geolocation}`)
                })
            })
        } else {
            this.props.getAllCountryCommunity().then((communities) => {
                this.convertCommunitiesLeaderIdsToLeaderObjects(communities).then((communities) => {
                    this.setState({
                        communities
                    })

                    this.props.history.push('/community')
                })
            })
        }
    }

    renderBreadcrumbCountries() {
        const geolocationKeys = _.keyBy(this.state.communities, 'geolocation');
        const listCountriesEl = Object.keys(geolocationKeys).map((geolocation, index) => {
            return (
                <Select.Option title={config.data.mappingCountryCodeToName[geolocation]} key={index}
                               value={geolocation}>{config.data.mappingCountryCodeToName[geolocation]}</Select.Option>
            )
        })

        return (
            <Select
                allowClear
                value={this.props.match.params['country'] || undefined}
                showSearch
                style={{width: 160}}
                placeholder="Select a country"
                optionFilterProp="children"
                onChange={this.handleChangeCountry.bind(this)}
            >
                {listCountriesEl}
            </Select>
        )
    }

    renderListCommunities() {
        return this.state.communities.map((community, index) => {
            return (
                <div key={index}>
                    {community.leaders.map((leader) => {
                        return (
                            <Col span={3} key={index} className="user-card">
                                <Link to={'/community/' + community._id  + '/country/' + community.geolocation}>
                                    <Card
                                        key={index}
                                        cover={<img src={leader.profile.avatar}/>}
                                    >
                                        <h5>
                                            {community.name}
                                        </h5>
                                        <p>
                                            {leader.profile.firstName + ' ' + leader.profile.lastName}<br/>
                                            <span class="no-info">{leader.profile.username}</span>
                                        </p>
                                    </Card>
                                </Link>
                            </Col>
                        )
                    })}
                </div>
            )
        })
    }

    ord_renderContent () {
        const listCommunitiesEl = this.renderListCommunities()
        const menuCountriesEl = this.renderBreadcrumbCountries()

        return (
            <div className="p_Community">
                <div className="ebp-header-divider"></div>
                <div className="ebp-page">
                    <div className="ebp-page-breadcrumb">
                        <Row>
                            <Col span={24}>
                                <Breadcrumb>
                                    <Breadcrumb.Item href="/">
                                        <Icon type="home"/>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Item>Community</Breadcrumb.Item>
                                    <Breadcrumb.Item>
                                        <Link to="/community">Global</Link>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Item>
                                        {menuCountriesEl}
                                    </Breadcrumb.Item>
                                </Breadcrumb>
                            </Col>
                        </Row>
                    </div>
                    <div className="ebp-page">
                        <div className="ebp-page-content">
                            <Row>
                                <Col span={24}
                                     className="community-left-column">
                                    <div>
                                        <Row>
                                            <Col span={20}>
                                                <h3 className="without-padding">Please Select a Country</h3>
                                            </Col>
                                            <Col span={4}>
                                                {/*
                                                <Search
                                                    placeholder="find member"
                                                    onSearch={value => console.log(value)}
                                                    enterButton
                                                />
                                                */}
                                            </Col>
                                        </Row>
                                        <Row>
                                            {listCommunitiesEl}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
}
