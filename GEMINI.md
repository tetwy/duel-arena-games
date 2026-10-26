# Project & Workspace Engineering Directives

All models, tools, and subagents operating in this workspace follow the 5 Unified Pillars:

1. **Superpowers**:
   - Complex tasks require planning (`brainstorming`, `writing-plans`) before implementation.
   - Run tests and verify before completion (`verification-before-completion`, `test-driven-development`).
   - Systematic diagnosis and debugging (`systematic-debugging`).

2. **Graphify**:
   - Check and query the codebase graph at `graphify-out/` before massive blind greps.
   - Keep the graph updated with `graphify update .`.

3. **Caveman**:
   - Token efficiency: answer directly, no fluff, no conversational pleasantries.
   - Exact code, commands, paths, and numbers.

4. **Ponytail**:
   - Senior developer minimalism: write the minimum amount of code that completely solves the problem.
   - No boilerplate, speculative abstraction layers, or unnecessary helper wrapper bloat.

5. **Karpathy Guidelines**:
   - Think before coding: surface assumptions, tradeoffs, and ask when unclear.
   - Surgical changes: touch only lines necessary for the task, never reformat or touch unrelated code.
