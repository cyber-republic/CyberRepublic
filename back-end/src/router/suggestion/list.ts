import Base from '../Base';
import SuggestionService from '../../service/SuggestionService';
import _ from 'lodash';

export default class extends Base {

  /**
   * For consistency we call the service
   * with the entire query
   *
   * @param param
   * @returns {Promise<["mongoose".Document]>}
   */
  public async action() {
    const service = this.buildService(SuggestionService);
    const param = this.getParam();

    if (param.search) {
      param.name = { $regex: _.trim(param.search), $options: 'i' }
    }

    const list = await service.list(_.omit(param, ['search']))
    const count = await service.getDBModel('Suggestion')
      .count(_.omit(param, ['search', 'page', 'results', 'sortBy', 'sortOrder']))

    return this.result(1, {
      list,
      total: count
    })
  }
}
