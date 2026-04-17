export const NOTIF_ITEMS = [
  {
    key: 'onCreateTask',
    i18nKey: 'profileSetting.fields.notify.items.onCreateTask',
  },
  {
    key: 'onUpdateTask',
    i18nKey: 'profileSetting.fields.notify.items.onUpdateTask',
  },
  { key: 'onMention', i18nKey: 'profileSetting.fields.notify.items.onMention' },
  {
    key: 'onAutomationAction',
    i18nKey: 'profileSetting.fields.notify.items.onAutomationAction',
  },
  { key: 'onMessage', i18nKey: 'profileSetting.fields.notify.items.onMessage' },
] as const

export type NotifItemKey = (typeof NOTIF_ITEMS)[number]['key']
