import { AutomationType } from '@/types/automation.type'

export const automationTypeLabels: Record<AutomationType, string> = {
  TASK_REPETITION: 'automations.types.taskRepetition',
  SCHEDULED: 'automations.types.scheduled',
  TRIGGER_BASED: 'automations.types.triggerBased',
}
