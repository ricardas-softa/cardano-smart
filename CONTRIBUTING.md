# Contributing to Cardano Smart

Thank you for your interest in contributing to Cardano Smart! We welcome contributions in many forms—code, documentation, bug reports, and configuration improvements. Your help makes this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Report Issues](#how-to-report-issues)
- [Development Environment Setup](#development-environment-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Conventions and Style Guidelines](#coding-conventions-and-style-guidelines)
- [Testing and Documentation](#testing-and-documentation)
- [Other Contributions](#other-contributions)
- [Getting Help](#getting-help)

## Code of Conduct

All interactions within the Cardano Smart community must follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please review it before participating.

## How to Report Issues

- **Bug Reports:**  
  Before opening a new issue, please search [existing issues](https://github.com/ricardas-softa/cardano-smart/issues) to see if the problem has already been reported. If you encounter a bug, include detailed steps to reproduce the issue, any error messages, and your environment details.

- **Feature Requests:**  
  We welcome suggestions to improve Cardano Smart. When requesting a new feature, please open an issue with a clear description of the proposed functionality and the benefits it would bring.

## Development Environment Setup

Before you start contributing, please set up your local environment:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ricardas-softa/cardano-smart.git
   cd cardano-smart
   ```

2. **Install Dependencies:**  
   Follow the instructions in our [README.md](README.md) for building images via the scripts in the `build_scripts/` directory.

3. **Local Testing:**  
   - For Docker-based setups, refer to the scripts and instructions in the `docker/` directory.
   - For Kubernetes deployments, review the configuration files under the `kubernetes/` directory.

## Pull Request Process

1. **Fork and Branch:**  
   Fork the repository and create a new branch with a descriptive name (e.g., `feature/add-new-language` or `bugfix/fix-deployment-script`).

2. **Commit Messages:**  
   Write clear, concise commit messages that describe your changes. Follow our established style guidelines for commit messages.

3. **Submit a Pull Request:**  
   Open a pull request (PR) with a detailed description of your changes. Link any related issues and ensure your PR meets all the automated checks.

4. **Review Process:**  
   We will review your PR. If changes are requested, please address the feedback promptly. We appreciate your cooperation!

## Coding Conventions and Style Guidelines

- **Code Quality:**  
  Ensure your code is well-organized and documented. Follow the existing code style and conventions found throughout the project.

- **Documentation:**  
  If your changes affect functionality, update the relevant documentation. This may include the README, docs in the `docs/` folder, or inline comments.

- **Formatting:**  
  Use proper indentation and consistent formatting as shown in the project. If you introduce new files or scripts (e.g., Docker, Kubernetes), follow the style already in use.

## Testing and Documentation

- **Adding or Updating Tests:**  
  When making changes, include tests to cover new features or bug fixes. This ensures that future changes do not break your contributions.

- **Improving Documentation:**  
  Contributions to documentation are highly encouraged. If you find outdated or unclear instructions—whether in the README or in our deployment guides—please submit improvements.

## Other Contributions

Contributions aren’t limited to code:
- **Bug Reports & Feature Requests:** Your feedback is valuable.
- **Documentation Improvements:** Help us keep our guides and instructions up to date.
- **Deployment Configurations:** Suggestions or improvements to Docker, Kubernetes, or other deployment scripts are welcome.
- **Ideas and Feedback:** Share your ideas through issues or community channels.

## Getting Help

If you have any questions or need assistance:
- **Open an Issue:** For questions related to contributing.
- **Community Channels:** Join our discussions on GitHub or any other community forum we maintain.
- **Direct Contact:** If you’re unsure where to start, feel free to reach out via the contact information in our README.

---

Thank you for helping make Cardano Smart better for everyone!

*— The Cardano Smart Team*