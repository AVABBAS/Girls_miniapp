# Initial Architecture Decision

The repository is intentionally stack-neutral at initialization.

The autonomous agent must choose the concrete stack after inspecting the current ecosystem and the provider/deployment constraints. The decision must be recorded here before significant application implementation.

Required architecture boundaries:
- `frontend/`: Telegram Mini App UI
- `backend/`: server-side API and authorization
- `database/`: migrations/schema or equivalent
- `docs/`: product and operational documentation

Requirements:
- Type-safe boundaries where practical.
- Server-side authorization for protected operations.
- Environment-based configuration.
- Local mocks for Telegram context.
- Automated tests.
- Production build and deployment path.
