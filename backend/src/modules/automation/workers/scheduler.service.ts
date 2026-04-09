import { getContainer } from "../../../app/container";
import AutomationModel from "../automation.model";

const { automationService } = getContainer();

export const scheduler = async () => {
    const now = new Date();    

    const automations = await AutomationModel.find({
        active: true,
        nextRunAt: { $lte: now }
    }).limit(100);    

    await Promise.all(
        automations.map(automation =>  automationService.runTask(automation))
    )
}
