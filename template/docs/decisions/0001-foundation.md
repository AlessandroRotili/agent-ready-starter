# 0001 - Independent application source with session-based data access

Status: accepted for starter v0.1.0.

We copy a small Next.js application instead of introducing a custom framework runtime. Each generated application owns its source, dependencies, database and deployment. This keeps debugging direct; upgrades require explicit diff/changelog review.

Use session Supabase clients and RLS for user data. Keep admin membership outside editable profiles. A privileged secret is only needed for the explicit bootstrap command. This reduces runtime privilege and makes SQL access rules testable.

Use plain CSS and native form controls to avoid imposing a UI library on every future project. No email marketing, analytics, organizations, public media CMS or billing module ships until requested by an actual application.

Static public pages and private dynamic routes have different caching needs. Auth refresh excludes public routes. Private files use signed direct transfers and never a public image optimizer.
