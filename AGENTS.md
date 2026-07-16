# Coolab Core Service

## Rules

- Critical: never write tests.
- Use `pnpm`, never npm.
- Keep dependency direction downward: handler -> context/application -> repository -> database.
- Application layers can never call application layers.
- Use `@self/*` imports for cross-layer imports.
- Use singleton exports for repositories, contexts, encryptions, and utilities.
- Keep database migrations as raw SQL under `src/database/migrations`.
- Every table type must have matching Zod validation schemas.
- Perform validation in handler layers; never call validation schemas in application layers.
- Define handler schemas inline inside the handler route config; never define handler schemas in variables before the handler.
- Never return method or function call results directly; assign the value to a variable and then return the variable.
- Call memoization memory directly at the layer that owns the cached workflow; do not add service methods that only proxy memoization calls.
- Never log bearer tokens or encrypted token content.

## Cross-Project Discovery

- Never update another project unless the user directly asks for it.
- When asked to inspect another local project, search `~/Repositories` first.
- Prefer an exact directory-name match; if none exists, narrow similarly named candidates before inspecting files.

### After Implementation Checks
Execute the steps below after every implementation.

- Run `pnpm lint:fix`, fix the remaining issues manually if necessary and repeat until all errors are gone.
- Run `pnpm ts`, fix the issues and repeat until all errors are gone.
- Invoke the Rules Reviewer agent and act on the feedback. Ask questions if necessary.

## Naming

- Implementation files use `{operation}.{resource}.{layer}.ts`.
- Folders expose `index.ts` barrel exports.
- Migration files use `NNNN.action-subject.up.sql` and `NNNN.action-subject.down.sql`.

## Mandatory Coding Style

- Apply these mandatory conventions to TypeScript changes unless an existing project rule conflicts.
- Use 2-space indentation, semicolons, single quotes, spaces inside object braces, and trailing commas in multiline structures.
- Do not add a space after control-flow keywords: `if(...)`, `for(...)`, and `switch(...)`. Use at most one blank line between logical blocks.
- Sort imports and object keys. Group multi-item imports across lines, and use `@self/*` for cross-layer imports.
- Break long objects, argument lists, type members, unions, and chained repository calls vertically, with one logical item per line. Put fluent-chain methods on successive indented lines.
- Format multiline ternaries with aligned condition, `?`, and `:` branches.
- Prefer early returns and named intermediate variables. Declare explicit types for non-trivial values, deriving them from existing APIs when possible.
- Preserve meaningful logical grouping with blank lines and avoid broad reformatting outside the code being changed.
