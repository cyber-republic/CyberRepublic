import BaseRedux from '@/model/BaseRedux'

export const FETCH_SUGGESTION_BEGIN = 'FETCH_SUGGESTION_BEGIN'
export const FETCH_SUGGESTION_SUCCESS = 'FETCH_SUGGESTION_SUCCESS'
export const FETCH_SUGGESTION_FAILURE = 'FETCH_SUGGESTION_FAILURE'

class SuggestioinRedux extends BaseRedux {

    defineTypes () {
        return ['suggestioin']
    }

    defineDefaultState() {
        return {
            active_suggestioin: null,

            loading: false,

            create_form: {
            },

            all_suggestioins: [],
            all_suggestioins_total: 0,

            // if we select a detail
            detail: {},

            filter: {}
        };
    }
}

export default new SuggestioinRedux()
