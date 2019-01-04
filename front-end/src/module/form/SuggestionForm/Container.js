import { createContainer } from '@/util';
import Component from './Component';
import SuggestionService from '@/service/SuggestionService';

const mapState = (state) => {
    return {
        loading: state.suggestion.loading
    };
}

const mapDispatch = () => {
    const suggestionService = new SuggestionService();
    return {
        async create(param) {
            return suggestionService.create(param)
        }
    };
}

export default createContainer(Component, mapState, mapDispatch);
