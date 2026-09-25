# Security boundaries

- Private access requires verified identity plus ownership/role checks in the server operation, not just a layout or hidden button.
- Never use privileged secrets in NEXT_PUBLIC variables. Supabase publishable/anon keys are public; service-role/secret keys are not. The wizard accepts only public keys.
- Mock workspace state lives in the browser, is synthetic and disappears on reload. It renders only in development. It cannot be used to authenticate real users or secure a deployed product.
- Generic DB/auth adapters return configuration errors until implemented. Choosing a DB connector is not the same as implementing authentication.
- Supabase account APIs use session clients, Zod validation, exact-origin checks and persistent per-user limits. Auth endpoint limits come from Supabase and must be configured for the project.
- Private files use a private bucket, owner paths, bounded sizes/types and short-lived signed downloads. MIME checks are not malware scanning. Interrupted uploads can leave orphan objects; design cleanup and account deletion deliberately.
- Public content cache holds published records only. Public/private file pipelines are separate. Never cache session responses publicly.
- Logs must not include passwords, request bodies, tokens, signed URLs or customer documents.

Before accepting real data, review the project's concrete threat model and run its live access tests. A scaffold supplies patterns and checks, not automatic security certification.
