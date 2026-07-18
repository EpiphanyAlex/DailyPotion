## Summary

<!-- Briefly explain what this PR changes and why. -->

## Related issue

<!-- Use "Closes #123" when merging this PR should close an issue. Remove this section if not applicable. -->

## Type

<!-- Check all that apply. -->

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — Code restructuring without a behavior change
- [ ] `docs` — Documentation only
- [ ] `test` — New or updated tests
- [ ] `ci` — CI, build, or release tooling
- [ ] `chore` — Maintenance

## Changes

<!-- List the material changes and the reason for each one. -->

-

## Implementation notes / risks

<!--
For non-trivial or difficult-to-reverse changes, describe the key decisions,
affected components or data, risks, and rollback considerations.
Remove this section if not applicable.
-->

## Project checks

<!-- Check only the items that apply to this PR. -->

- [ ] UI styling is derived from `design.md` tokens; no visual values are hardcoded.
- [ ] User-facing UI copy uses next-intl messages; bilingual entity fields and fallback behavior are preserved.
- [ ] Matching behavior remains in the pure `lib/matching.ts` module and matching changes include focused tests.
- [ ] Database schema changes use `supabase/migrations/`, and new or changed tables include appropriate RLS policies.
- [ ] Product or visual requirement changes update the relevant `docs/prd/` source of truth or `design.md` before implementation.

## Verification

<!-- Check completed verification. Explain any applicable check that was not run. -->

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] UI changes were verified in a browser against the relevant PRD acceptance criteria.

Not run / not applicable:

<!-- Add the check and reason, or write "None". -->

## Screenshots / evidence

<!--
For UI changes, include before/after screenshots.
For non-visual changes, include concise test output or reproduction evidence when useful.
Remove this section if not applicable.
-->
