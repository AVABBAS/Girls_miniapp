# Girls Mini App — Autonomous Engineering Contract

## Mission
Build and continuously improve a production-ready Telegram Mini App for everyday life management, designed primarily for women. The product must be useful, mobile-first, privacy-conscious, accessible, testable, and deployable.

## Autonomous operating loop
For every task:
1. Inspect the current repository and existing implementation.
2. Read this file, `docs/ROADMAP.md`, and `docs/DEFINITION_OF_DONE.md`.
3. Select the highest-priority incomplete task that is not blocked.
4. Write a short implementation plan in the task/progress log.
5. Implement the smallest coherent change.
6. Run formatting, linting, type checks, unit/integration tests, and relevant build checks.
7. Diagnose failures from evidence; fix them and rerun checks.
8. Review security, privacy, accessibility, mobile UX, and error handling for changed areas.
9. Update documentation/progress.
10. Commit only verified work with a descriptive commit message.
11. Continue to the next unblocked task until the time/token budget is exhausted or the Definition of Done is reached.

## Non-negotiable rules
- Never put API keys, bot tokens, database passwords, or other secrets in source control.
- Use environment variables and update `.env.example` when configuration changes.
- Never claim a feature works without actually testing it.
- Do not delete working functionality merely to make tests pass.
- Prefer small, reversible commits.
- Preserve backwards compatibility unless a documented migration is implemented.
- Validate all untrusted input server-side.
- Use Telegram identity data only after proper verification.
- Do not store sensitive personal data unless required by a documented feature.
- Avoid logging personal or authentication data.
- Use UTC internally for timestamps and convert at the UI boundary.
- Make the UI usable on small mobile screens and Telegram WebView.
- Add tests for important business logic and regressions.
- Keep dependencies minimal and maintained.
- When blocked by missing credentials or external services, implement mocks/local adapters and document the exact manual step instead of inventing credentials.

## Token/time discipline
Target maximum runtime: 10 hours per autonomous session.
Target maximum model budget: 100,000,000 tokens.
Prefer progress over verbose explanations. Do not spend tokens repeatedly rediscovering repository structure; maintain concise progress notes.

## Recovery
If the agent crashes or resumes later:
- inspect git status and recent commits;
- read `docs/AGENT_PROGRESS.md`;
- identify the first incomplete task;
- verify existing work before modifying it;
- continue from there.

## Quality gate
A task is complete only when its acceptance criteria are satisfied and relevant automated checks pass. If a check cannot run, document why and do not falsely mark it green.
