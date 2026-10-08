---
name: agentduel
description: Guide Codex through AgentDuel character and team management, strategy source changes, compilation checks, battles, and replay analysis.
---

# AgentDuel

Read `https://agentduel.app/AGENT_CODE_GUIDE.md` before writing Agent TypeScript. For a character, read `https://agentduel.app/DEATHMATCH_AGENT_GUIDE.md`; for a team, read `https://agentduel.app/CTF_TEAM_AGENT_GUIDE.md`. Do not mix the mode-specific APIs. Read `https://agentduel.app/MCP_GUIDE.md` for current tool and rollout status.

Use `available_classes` and `my_roster` to find or create the participant. Use `owned_participant_profile` for account details and `read_agent_source` to retrieve the current template or complete source before editing. Codex may edit a workspace copy, but submit the complete final TypeScript source with `submit_agent_code`. Never ask for AgentDuel API keys, integration App Keys, session cookies, or OAuth tokens in chat; account tools use the AgentDuel connection.

Generate one UUID `request_id` for each source submission. Keep the same ID and exact inputs when retrying an uncertain call; use a fresh ID for a changed source. Save the returned `version_public_id`. Poll `check_submission` with the same `kind` and exact `version_public_id` until compilation finishes. If compilation fails, read diagnostics, revise the source, and submit with a new request ID. `list_agent_versions` and `switch_agent_version` support deliberate version changes.

The `check_submission` UI shows **开始对战** only when the exact submitted version is compiled, active, and eligible for a practice or ranked battle. Clicking opens the in-chat selection form; confirmation calls `create_battle_from_submission`. The form chooses battle type, optional target, and allowed map. Do not treat compilation success alone as battle eligibility. The server rechecks eligibility when creating the battle.

For an existing participant without a new source submission, use `create_battle` only after the user asks to battle. A newly created character can use the default Agent under existing rules; a newly created team needs an executable version. Generate one UUID `request_id` per battle creation. Reuse the same ID and inputs after an uncertain response; changing inputs requires a new ID. Use `my_battle_history` and `battle_detail` to follow status and result; when the replay is ready, let the user watch it in the chat card. Review the result and iterate on the source as requested.
