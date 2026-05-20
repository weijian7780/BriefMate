# BriefMate Tech Context

BriefMate Tech is a daily tech signal briefing app for student developers. Its core value is not generic tech news collection; it reduces the tech information gap by explaining which updates matter to a user's own stack, project, learning path, and deadline.

## Domain Terms

- Primary stack: up to three technologies that should have the strongest effect on relevance and risk.
- Also tracked stack: additional technologies the user follows with a weaker scoring effect.
- Display name: editable personal label shown in the profile header. It is not used for relevance or risk scoring.
- Signal type preference: categories the user wants BriefMate to boost, such as Security, Pricing / Policy, AI / Models, or Web Dev.
- Muted topic: topics the user wants lowered in relevance. Muted signals may still appear if they strongly match the user's stack.
- Project stage: whether the user is learning, prototyping, deployed, or in production. Later stages should raise risk for security, pricing, backend, cloud, and database changes.

## Scoring Boundary

Current relevance and risk are rule-based, transparent, and deterministic. They are not perfect semantic personalization. A future upgrade can add embeddings or an LLM ranking layer, but the app must keep the rule evidence visible so students can understand why a signal was ranked.
