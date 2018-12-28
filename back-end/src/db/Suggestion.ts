import Base from './Base';
import { Suggestion } from './schema/SuggestionSchema';

export default class extends Base {
  protected getSchema() {
    return Suggestion;
  }
  protected getName() {
    return 'suggestion'
  }
}
