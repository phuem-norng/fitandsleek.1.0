# Contributing

Thanks for contributing to FitandSleek Pro.

## Before You Commit

- Do not commit real secret files such as `.env`, `backend/.env`, or `frontend/.env`.
- Commit only template files (`.env.example`, `.env.production.example`).
- Do not commit generated dependencies or build output (`node_modules`, `vendor`, `dist`, `.vite`, `__pycache__`).
- Keep line endings consistent (`LF` by default, `CRLF` for Windows scripts like `.bat`).

## Recommended Local Workflow

1. Sync latest `main`.
2. Install dependencies locally.
3. Run the project and verify your change.
4. Run focused tests/lint for touched areas.
5. Review `git status` and confirm no secrets/generated files are staged.
6. Commit with a clear message and open a pull request.

## Environment Files

Use these templates:

- `backend/.env.example`
- `backend/.env.production.example`
- `frontend/.env.example`
- `frontend/.env.production.example`

Create your local runtime files from those templates, for example:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Pull Request Notes

- Keep changes scoped and minimal.
- Mention any deployment/env changes in your PR description.
- Include screenshots for frontend UI changes when relevant.
