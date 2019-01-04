import BaseService from '../model/BaseService'
import _ from 'lodash'
import { api_request } from '@/util'

export default class extends BaseService {
    async loadMore(qry) {
        const suggestioinRedux = this.store.getRedux('suggestioin')
        const path = '/api/suggestioin/list'

        const result = await api_request({
            path,
            method: 'get',
            data: qry
        })

        const oldSuggestioins = this.store.getState().suggestioin.all_suggestioins || []

        this.dispatch(suggestioinRedux.actions.all_suggestioins_total_update(result.total))
        this.dispatch(suggestioinRedux.actions.all_suggestioins_update(oldSuggestioins.concat(_.values(result.list))))

        return result
    }

    async list(qry) {
        const suggestioinRedux = this.store.getRedux('suggestioin')

        this.dispatch(suggestioinRedux.actions.loading_update(true))

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

            this.dispatch(suggestioinRedux.actions.loading_update(false))
            this.dispatch(suggestioinRedux.actions.all_suggestioins_reset())
            this.dispatch(suggestioinRedux.actions.all_suggestioins_total_update(result.total))
            this.dispatch(suggestioinRedux.actions.all_suggestioins_update(_.values(result.list)))
        } catch (e) {
            // Do nothing
        }

        return result
    }
}
