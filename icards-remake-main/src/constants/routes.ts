const BASE = "/invitation-management";

export const ROUTES = {
  invitationManagement: BASE,
  myEvents: `${BASE}/my-events`,
  newEvent: `${BASE}/my-events/new`,
  manage: {
    root: `${BASE}/manage`,
    events: `${BASE}/manage/events`,
    guests: `${BASE}/manage/guests`,
    planner: `${BASE}/manage/planner`,
    wishes: `${BASE}/manage/wishes`,
  },
} as const;