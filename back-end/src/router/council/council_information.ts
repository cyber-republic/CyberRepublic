import Base from '../Base'
import CouncilService from '../../service/CouncilService'

export default class extends Base {
    async action() {
        const param = this.getParam()
        const service = this.buildService(CouncilService)

        const rs = await service.councilInformation(param)
        return this.result(1, rs)
    }
}
