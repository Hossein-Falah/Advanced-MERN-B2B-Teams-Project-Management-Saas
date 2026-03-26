import AutomationModel from "../automation.model";
import { AutomationService } from "../services/automation.service";

export const scheduler = async () => {
    const now = new Date();    

    const automations = await AutomationModel.find({
        active: true,
        nextRunAt: { $lte: now }
    }).limit(100);    

    for (const automation of automations) {
        await AutomationService.runTask(automation);
    }
}
