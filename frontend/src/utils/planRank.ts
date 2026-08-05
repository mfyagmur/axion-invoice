// Mirrors backend/app/services/subscription_service.py::PLAN_RANK.
// Deliberately a small hardcoded map — a richer "plan tier" field is out of
// scope until final free-tier gating rules are defined.
export const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, business: 2 }
