import BaseService from '../model/BaseService'
import _ from 'lodash'
import { api_request } from '@/util'

export default class extends BaseService {
    async loadMore(qry) {
        const suggestionRedux = this.store.getRedux('suggestion')
        const path = '/api/suggestion/list'

        const result = await api_request({
            path,
            method: 'get',
            data: qry
        })

        const oldSuggestions = this.store.getState().suggestion.all_suggestions || []

        this.dispatch(suggestionRedux.actions.all_suggestions_total_update(result.total))
        this.dispatch(suggestionRedux.actions.all_suggestions_update(oldSuggestions.concat(_.values(result.list))))

        return result
    }

    async list(qry) {
        const suggestionRedux = this.store.getRedux('suggestion')

        this.dispatch(suggestionRedux.actions.loading_update(true))

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

            this.dispatch(suggestionRedux.actions.loading_update(false))
            this.dispatch(suggestionRedux.actions.all_suggestions_reset())
            this.dispatch(suggestionRedux.actions.all_suggestions_total_update(result.total))
            this.dispatch(suggestionRedux.actions.all_suggestions_update(_.values(result.list)))
        } catch (e) {
            // Do nothing
        }

        return result
    }
    resetAll() {
        const suggestionRedux = this.store.getRedux('suggestion')
        this.dispatch(suggestionRedux.actions.all_suggestions_reset())
    }
}
