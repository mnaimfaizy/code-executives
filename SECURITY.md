# Security Policy

## Supported Versions

| Branch         | Supported | Notes                                 |
| -------------- | --------- | ------------------------------------- |
| `main`         | Yes       | Production and public release branch  |
| `develop`      | Yes       | Active pre-release development branch |
| Other branches | No        | Best effort only                      |

## Reporting a Vulnerability

Do not open a public issue or pull request for suspected vulnerabilities.

Use the repository's private vulnerability reporting flow on GitHub when it is enabled. If private reporting is not available, contact the repository owner, `@mnaimfaizy`, through GitHub and keep the details private until triage is complete.

Include the following in the report:

- Affected branch, commit SHA, package name, and version
- A short impact summary and expected blast radius
- Reproduction steps or a minimal proof of concept
- Any indicators of compromise, logs, or relevant dependency diffs
- Whether secrets, CI runners, or developer workstations may have been exposed

## Response Expectations

- Initial acknowledgement target: 3 business days
- Triage target: 7 business days
- Status updates: provided after triage and during coordinated remediation

## Disclosure Guidelines

- Keep reports private until a fix or mitigation is available.
- Rotate exposed secrets immediately if a dependency or CI compromise is suspected.
- Rebuild affected environments from a known-good lockfile after containment.

## Additional Guidance

Repository-specific dependency and CI hardening guidance lives in `docs/SECURITY/Dependency-Supply-Chain-Security-Plan.md`.
