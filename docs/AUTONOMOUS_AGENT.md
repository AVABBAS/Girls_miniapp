# Autonomous Agent Setup

## Purpose
This repository is prepared for a long-running coding agent. The agent contract is in `AGENTS.md`; product execution is in `docs/ROADMAP.md`.

## Runtime policy
Default session limits:
- Runtime: 10 hours
- Model-token budget: 100,000,000

The workflow timeout is also capped at 600 minutes. Provider-side limits may be lower.

## Secret handling
Never commit an API key.

Create a GitHub Actions repository secret named:
`ATRIA_API_KEY`

The concrete Atria API endpoint/SDK/CLI must be configured in the workflow runner before enabling unattended writes. Do not guess an endpoint or pretend that a generic OpenAI-compatible endpoint exists unless the provider documentation confirms it.

## Recommended agent capabilities
The selected runner should be able to:
- read/write the checked-out repository;
- execute shell commands;
- run tests and builds;
- inspect git diffs;
- commit changes;
- resume from `docs/AGENT_PROGRESS.md`;
- stop on authentication/budget failures;
- expose model usage so the 100M token ceiling can be enforced.

## Safe operating mode
Start with `workflow_dispatch` and `dry_run=true`. After verifying the runner, enable writes.

Do not expose secrets to model-generated source files. Pass secrets only to the process that needs them.

## Completion
The agent should stop when:
1. all roadmap tasks are complete, or
2. the runtime/token budget is exhausted, or
3. a blocking external dependency requires human action.

Before stopping, update `docs/AGENT_PROGRESS.md` and leave a clean, meaningful commit when possible.
