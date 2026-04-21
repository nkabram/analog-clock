---
type: project
status: paused
priority: medium
urgency: deferred
health: green
autonomy_tier: 3
project_type: software
domain: personal
sensitivity: private
owner: nkabr
created: 2026-03-10
last_updated: 2026-03-10
next_review: 2026-06-10
stale_after_days: 90
tags: [personal, typescript, clock]
governance_migration:
  adr: ADR-012
  status: pending
  flagged: 2026-04-20
  action_required: >
    On next non-trivial touch: apply governance-exclude snippet to
    .gitignore and install pre-push-governance-guard hook. Remove this
    marker after completion. See rule and templates in HQ governance
    repo paths below.
  rule: ${HQ_ROOT}/.config/rules/governance-versioning.md
  pre_push_hook_template: ${HQ_ROOT}/.config/templates/pre-push-governance-guard.sh
---

# analog-clock

React + Vite analog clock focus app.

## Goal

Provide a minimal analog clock UI for focus/time awareness.

## Current State

Paused — registered during D:\dev audit 2026-03-10.
