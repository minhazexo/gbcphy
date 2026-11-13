# Security policy

## Supported deployment

Security issues affecting the current production application and the default branch are in scope.

## Reporting a vulnerability

Please do not publish credentials, exploit details, or unpatched vulnerabilities in a public issue. Use GitHub's private vulnerability reporting feature for this repository, if available, to contact the maintainer privately.

Include:
- A concise description and affected route/component.
- Reproduction steps and expected versus actual behavior.
- Potential impact and any safe proof-of-concept details.

## Security expectations

- Never commit secrets or real user data.
- Never expose Supabase service-role credentials in browser code.
- Enforce authorization through database and Storage Row Level Security policies, not only frontend checks.
- Validate authentication redirects, file uploads, and administrative actions.
