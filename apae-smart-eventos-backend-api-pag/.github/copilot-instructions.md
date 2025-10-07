# Copilot Instructions for APAE Smart Eventos Backend

## Project Overview
- **Node.js Express API** for event management and payment processing.
- Main entry: `app.js` and `bin/www`.
- Modular structure: routes, models, services, db, templates.

## Architecture & Data Flow
- **Routes** (`routes/`): REST endpoints for `auth`, `events`, `payment`, `tickets`, `users`.
- **Models** (`models/`): Data access logic, e.g., `tickets.js`.
- **Services** (`services/`): Business logic, e.g., `generateSignedUrl.js`, `tickets.js`.
- **Database**: MySQL, schema in `db/schema.sql`, seed data in `db/seed.sql`, connection in `db/db.js`.
- **PDF Generation**: `generate-pdf-serverless/` handles ticket PDF creation, includes Dockerfile for serverless deployment.
- **Templates**: HTML templates for tickets in `templates/` and `generate-pdf-serverless/ticket-template.html`.

## Developer Workflows
- **Start server**: `node app.js` or `node bin/www` (check which is used in production).
- **Database setup**: Run SQL files in `db/` to initialize and seed MySQL.
- **Testing**: Manual test script in `test-payment.js`. No automated test framework detected.
- **PDF generation**: Use `generate-pdf-serverless/index.js` for local PDF creation; deploy with Docker if needed.

## Conventions & Patterns
- **Error handling**: Uses custom HTTP status codes from `constants/httpStatusesCodes.js`.
- **Secrets**: Store sensitive data in `secrets/` (not versioned).
- **Public assets**: Served from `public/`.
- **Old code**: Legacy files in `old/` for reference, not active.
- **Environment variables**: Not explicitly documented; check for `.env` usage if adding integrations.

## Integration Points
- **External services**: Payment APIs (see `routes/payment.js`), Google Cloud for PDF (see `generate-pdf-serverless/gcloud-deploy-command.txt`).
- **Cross-component calls**: Routes call services, which call models/db.

## Examples & Key Files
- **Route pattern**: See `routes/tickets.js` for typical endpoint structure.
- **Service usage**: See `services/tickets.js` for business logic separation.
- **Database access**: See `db/db.js` and `models/tickets.js` for query patterns.
- **PDF generation**: See `generate-pdf-serverless/index.js` and `ticket-template.html`.

## How to Extend
- Add new endpoints in `routes/`, corresponding service in `services/`, and model in `models/`.
- Update `db/schema.sql` for schema changes.
- Use existing error/status code patterns.

---

_Review and update this file as project conventions evolve. Feedback on unclear sections is welcome._
