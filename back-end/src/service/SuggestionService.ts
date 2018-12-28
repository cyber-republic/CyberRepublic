import Base from './Base';

export default class extends Base {
  public async list(param): Promise<Document> {
    const db = this.getDBModel('Suggestion')
    const result = await db.getDBInstance().find()
    return result
  }

  public async create(param): Promise<Document> {
    const db = this.getDBModel('Suggestion');
    // get param
    // validation
    // build document object
    // save the document
    const result = await db.save(param);
    return result;
  }
}