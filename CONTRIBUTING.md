# Contributing to BedrockFlow

Thank you for your interest in contributing to BedrockFlow! This document provides guidelines and information for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/BedrockFlow.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Backend (Phoenix/Elixir)

```bash
# Install dependencies
mix deps.get

# Set up database
mix ecto.create
mix ecto.migrate

# Run tests
mix test

# Start server
mix phx.server
```

### Frontend (React/TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Coding Standards

### Elixir/Phoenix

- Follow the [Elixir Style Guide](https://github.com/christopheradams/elixir_style_guide)
- Format code with `mix format`
- Run `mix credo` for code quality checks
- Add typespecs to public functions
- Write tests for all new functionality

Example:

```elixir
@spec add_numbers(integer(), integer()) :: integer()
def add_numbers(a, b) do
  a + b
end
```

### TypeScript/React

- Follow [React Best Practices](https://react.dev/learn)
- Use TypeScript for type safety
- Format code with Prettier
- Use ESLint for linting
- Write functional components with hooks
- Add JSDoc comments for complex functions

Example:

```typescript
/**
 * Formats a message for display
 * @param message - The message to format
 * @returns Formatted message string
 */
export function formatMessage(message: Message): string {
  return `[${message.role}]: ${message.content}`;
}
```

## Testing

### Backend Tests

```bash
# Run all tests
mix test

# Run specific test file
mix test test/bedrock_app/bedrock_client_test.exs

# Run with coverage
mix test --cover
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test ChatInterface.test.tsx
```

## Pull Request Guidelines

### PR Title Format

Use conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update README`
- `style: Format code`
- `refactor: Refactor function`
- `test: Add tests`
- `chore: Update dependencies`

### PR Description

Include:

1. **Description**: Brief overview of changes
2. **Use Case**: What problem does this solve?
3. **Changes**: List of specific changes
4. **Testing**: How was this tested?
5. **Screenshots**: If UI changes

### Review Process

1. All tests must pass
2. Code must be formatted and linted
3. At least one maintainer approval required
4. Address review comments
5. Keep PR scope focused and manageable

## Areas for Contribution

### High Priority

- [ ] Add authentication (OAuth, JWT)
- [ ] Implement rate limiting
- [ ] Add conversation history persistence
- [ ] Create admin dashboard
- [ ] Add more AI providers (OpenAI, Cohere)

### Features

- [ ] Multi-language support (i18n)
- [ ] Voice input/output
- [ ] File upload support
- [ ] Conversation export (PDF, Markdown)
- [ ] Dark mode
- [ ] Mobile responsiveness improvements

### Documentation

- [ ] API documentation
- [ ] Deployment guides (Docker, Kubernetes)
- [ ] Architecture diagrams
- [ ] Video tutorials
- [ ] Use case examples

### Testing

- [ ] Increase test coverage
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Performance benchmarks

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - OS and version
   - Elixir/Erlang version
   - Node.js version
   - Browser (if frontend issue)
6. **Screenshots**: If applicable
7. **Logs**: Relevant error logs

## Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Description**: Detailed description of the feature
3. **Examples**: Examples of similar features elsewhere
4. **Priority**: How important is this feature?
5. **Alternatives**: Alternative solutions considered

## Questions?

- Open a [GitHub Discussion](https://github.com/your-repo/discussions)
- Check existing [Issues](https://github.com/your-repo/issues)
- Review the [Documentation](https://docs.bedrockflow.io)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BedrockFlow! 🎉
