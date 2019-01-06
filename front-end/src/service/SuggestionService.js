import BaseService from '../model/BaseService'
import _ from 'lodash'
import { api_request } from '@/util'

export default class extends BaseService {
    async loadMore(qry) {
        const selfRedux = this.store.getRedux('suggestion')
        const path = '/api/suggestion/list'

        const result = await api_request({
            path,
            method: 'get',
            data: qry
        })

        const oldSuggestions = this.store.getState().suggestion.all_suggestions || []

        this.dispatch(selfRedux.actions.all_suggestions_total_update(result.total))
        this.dispatch(selfRedux.actions.all_suggestions_update(oldSuggestions.concat(_.values(result.list))))

        return result
    }

    async list(qry) {
        const selfRedux = this.store.getRedux('suggestion')

        this.dispatch(selfRedux.actions.loading_update(true))

        const path = '/api/suggestion/list'
        this.abortFetch(path)

        let result
        try {
            result = await api_request({
                path,
                method: 'get',
                data: qry,
                signal: this.getAbortSignal(path)
            })

            this.dispatch(selfRedux.actions.loading_update(false))
            this.dispatch(selfRedux.actions.all_suggestions_reset())
            this.dispatch(selfRedux.actions.all_suggestions_total_update(result.total))
            this.dispatch(selfRedux.actions.all_suggestions_update(_.values(result.list)))
        } catch (e) {
            // Do nothing
        }

        return result
    }
    async myList(qry) {
        const selfRedux = this.store.getRedux('suggestion')

        this.dispatch(selfRedux.actions.loading_update(true))

        const path = '/api/suggestion/list'
        // this.abortFetch(path)

        let result
        try {
            result = await api_request({
                path,
                method: 'get',
                data: qry,
                signal: this.getAbortSignal(path)
            })

            this.dispatch(selfRedux.actions.loading_update(false))
            this.dispatch(selfRedux.actions.my_suggestions_reset())
            this.dispatch(selfRedux.actions.my_suggestions_total_update(result.total))
            this.dispatch(selfRedux.actions.my_suggestions_update(_.values(result.list)))
        } catch (e) {
            // Do nothing
        }

        return result
    }
    resetAll() {
        const selfRedux = this.store.getRedux('suggestion')
        this.dispatch(selfRedux.actions.all_suggestions_reset())
    }
    async create(doc) {
        const selfRedux = this.store.getRedux('suggestion')
        this.dispatch(selfRedux.actions.loading_update(true))

        const res = await api_request({
            path: '/api/suggestion/create',
            method: 'post',
            data: doc
        })

        this.dispatch(selfRedux.actions.loading_update(false))

        return res
    }
    async get(suggestionId) {
        const suggestionRedux = this.store.getRedux('suggestion')
        this.dispatch(suggestionRedux.actions.loading_update(true))

        const result = await api_request({
            path: `/api/suggestion/${suggestionId}`,
            method: 'get'
        })

        this.dispatch(suggestionRedux.actions.loading_update(false))
        this.dispatch(suggestionRedux.actions.detail_update(result))

        return result
    }

    async like(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/like`,
            method: 'post'
        })

        return res
    }
    async dislike(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/dislike`,
            method: 'post'
        })

        return res
    }
    async reportAbuse(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/reportabuse`,
            method: 'post'
        })

        return res
    }
    // ADMIN ONLY
    async abuse(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/abuse`,
            method: 'post'
        })

        return res
    }
    // ADMIN ONLY
    async archive(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/archive`,
            method: 'post'
        })

        return res
    }
    // ADMIN ONLY
    async delete(_id) {
        const res = await api_request({
            path: `/api/suggestion/${_id}/delete`,
            method: 'post'
        })

        return res
    }
}
