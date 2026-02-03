# LOXTR Engineering Rules

1.  **Read History First:** Before making any UI or Logic changes, always read `.agent/project_status.md` and the last 10 steps of the conversation.
2.  **Sovereign Aesthetic:** Always adhere to the "Sovereign Enterprise" design system (Navy #0F172A, Yellow #FDE047, Rounded-4xl+, High-Contrast Bold Typography).
3.  **Global First:** Never assume the destination/origin is Turkey unless explicitly stated in the source document. The tool is for a Global Customs officer.
4.  **Professional Terminology:** Use "Digital Customs Audit", "Tariff & Duty Forecast", "Document Integrity". Avoid "Extract", "File", "Turkey", "Marketplace".
5.  **Gated Conversion:** Keep high-value data (line items, specific buyers) behind a login/register wall to drive user acquisition. Redirect auth actions to central `loxtr.com/login` and `loxtr.com/register`.
6.  **No Placeholders:** Never use placeholders. Generate real UI or realistic mock data using AI logic.
7.  **Consistent Logo:** Always use the `LoxLogo` component with the navy/yellow Zap icon.
8.  **Record Milestones:** After every significant feature/fix, update `.agent/project_status.md`.
