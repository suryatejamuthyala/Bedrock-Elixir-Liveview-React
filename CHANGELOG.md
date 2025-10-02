# Changelog

All notable changes to BedrockFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of BedrockFlow
- Phoenix LiveView backend with Elixir
- React frontend with TypeScript and Vite
- AWS Bedrock integration with Claude models
- AG-UI protocol implementation using `@ag-ui/client`
- Three chat interface implementations:
  - BedrockChatInterface (HttpAgent)
  - AGUIChatInterface (Custom AG-UI)
  - ChatInterface (Legacy SSE)
- Server-Sent Events (SSE) streaming
- WebSocket support
- CORS-enabled API endpoints
- Real-time message streaming
- Comprehensive documentation

### Features
- **Backend**
  - Elixir/Phoenix backend with LiveView
  - AWS Bedrock client with streaming support
  - Chat API endpoints with SSE
  - CORS configuration
  - PostgreSQL database integration via Ecto

- **Frontend**
  - React 18 with TypeScript
  - Vite for fast development and building
  - Three different chat UI implementations
  - BedrockAgent wrapper for HttpAgent
  - Custom AG-UI protocol client
  - Streaming message display with typing indicators
  - Responsive design
  - Abort streaming functionality

- **Integration**
  - AG-UI Client SDK (`@ag-ui/client`)
  - AG-UI Core SDK (`@ag-ui/core`)
  - Event-based architecture
  - Type-safe TypeScript interfaces
  - Error handling and recovery

### Documentation
- Comprehensive README with:
  - Use cases across multiple industries
  - Quick start guide
  - Detailed setup instructions
  - AWS Bedrock configuration
  - API documentation
  - Deployment guides
  - Performance optimization tips
  - Security best practices
  - Troubleshooting guide
- Contributing guidelines
- Pull request template
- Changelog

## [1.0.0] - 2024-XX-XX (Planned)

### Added
- First stable release
- Production-ready deployment configurations
- Authentication and authorization
- Rate limiting
- Conversation history persistence
- User sessions
- Admin dashboard

### Security
- Environment-based configuration
- Secure credential management
- HTTPS enforcement
- Input validation and sanitization

## [0.1.0] - Initial Development

### Added
- Project scaffold
- Basic Phoenix application structure
- React frontend setup
- AWS Bedrock integration proof of concept

---

## Release Notes

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

### Change Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

For more details on any release, see the [GitHub Releases](https://github.com/your-repo/releases) page.
