# Contributing to Feni House Rent

Thank you for your interest in contributing to **Feni House Rent** (ফেনী বাসা ও মেস ভাড়া)! We welcome contributions from developers, designers, and testers.

## Code of Conduct

Please be respectful and constructive in all discussions, issues, and pull requests.

## How to Contribute

### 1. Reporting Bugs
- Check existing issues to see if the bug has already been reported.
- If not, create a new issue detailing:
  - Steps to reproduce
  - Expected behavior
  - Screenshots or console logs if applicable

### 2. Suggesting Enhancements
- Open an issue describing the feature, why it is needed, and how it improves the application for users or property owners in Feni.

### 3. Pull Request Process
1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes and test locally:
   ```bash
   npm run dev
   ```
4. Verify there are no TypeScript or compilation errors:
   ```bash
   npm run lint
   npm run build
   ```
5. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(filters): add rent price slider filter"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Submit a Pull Request targeting the `main` branch.

## Code Style & Conventions
- **TypeScript**: Use strict types; avoid `any` wherever possible.
- **Styling**: Use Tailwind CSS utility classes.
- **Components**: Place reusable UI components in `src/components/`.
- **Backend API**: Keep server routes in `server.ts` or route modules with proper validation.

Thank you for helping make Feni House Rent better!
