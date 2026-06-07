1.  **Refactor `ClayInput`:** Update the component to automatically handle a show/hide password toggle button when `type="password"`. Ensure proper accessibility roles (like `aria-label`, `aria-pressed`, and clear focus states using `focus-visible`).
2.  **Clean up usages of `ClayInput` with custom toggle logic:** Remove the manual `showPassword` state and toggle buttons in:
    *   `client/src/pages/auth/LoginPage.jsx`
    *   `client/src/pages/auth/SignUpPage.jsx`
    *   `client/src/pages/auth/AdminSignUpPage.jsx`
3.  **Perform pre-commit checks:** Run linter, formatting, and unit tests using `pnpm` inside the `client` directory to verify the change didn't break anything.
4.  **Submit PR:** Describe the UX/A11y enhancement (Centralizing the password toggle and improving accessibility).
