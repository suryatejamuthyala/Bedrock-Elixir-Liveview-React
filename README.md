# BedrockFlow

**A production-ready full-stack conversational AI platform powered by AWS Bedrock, Phoenix LiveView, and React**

BedrockFlow is a modern, scalable chat application that seamlessly integrates AWS Bedrock's Claude models with Phoenix LiveView and React, implementing the AG-UI protocol for standardized agent communication.

## 🎯 Use Cases

### Enterprise & Business Applications
- **Customer Support Assistants** - Deploy AI-powered chatbots for 24/7 customer service
- **Internal Knowledge Bases** - Create conversational interfaces for company documentation and FAQs
- **Sales & Lead Qualification** - Automate initial customer interactions and lead scoring
- **Employee Onboarding** - Interactive AI guides for new hire training and orientation

### Technical & Development
- **API Documentation Assistant** - Natural language interface for exploring and understanding APIs
- **Code Review Helper** - AI-powered code analysis and suggestions
- **DevOps Assistant** - Conversational interface for infrastructure queries and troubleshooting
- **Technical Documentation Chat** - Interactive Q&A for complex technical documentation

### Healthcare & Professional Services
- **Medical Triage Assistant** - Pre-screening and symptom assessment (with proper compliance)
- **Legal Document Assistant** - Help with contract review and legal document understanding
- **Financial Advisory Chatbot** - Personal finance guidance and investment information

### Education & Training
- **Learning Companions** - Personalized tutoring and educational assistance
- **Training Simulators** - Role-play scenarios for customer service or sales training
- **Language Learning** - Conversational practice with AI language partners

### Content & Creative
- **Content Generation** - Blog posts, marketing copy, and creative writing assistance
- **Research Assistant** - Literature review and research summarization
- **Brainstorming Partner** - Creative ideation and concept development

## ✨ Key Features

### Backend (Phoenix/Elixir)
- **AWS Bedrock Integration** - Native support for Claude 3 models with streaming
- **Phoenix LiveView** - Real-time, server-rendered chat interface
- **RESTful API** - CORS-enabled endpoints for cross-origin requests
- **Scalable Architecture** - Built on Elixir/OTP for high concurrency

### Frontend (React/TypeScript)
- **Multiple UI Implementations** - Three different chat interfaces to choose from
- **AG-UI Protocol** - Standardized agent communication using official SDK
- **Real-time Streaming** - Server-Sent Events for efficient data streaming
- **Modern Tech Stack** - React 18, TypeScript, Vite for fast development

### Integration & Protocol
- **AG-UI Client SDK** - Official `@ag-ui/client` HttpAgent implementation
- **Event-driven Architecture** - Structured event handling (start, content, end, error)
- **WebSocket Support** - Alternative transport for bidirectional communication
- **Type Safety** - Full TypeScript support throughout

## 🏗️ Architecture

- **Backend**: Phoenix LiveView with Elixir
- **Frontend**: React with TypeScript and Vite
- **AI Service**: AWS Bedrock or AWS Bedrock AgentCore (recommended)
- **Models**: Claude 3 Sonnet, Haiku, Opus
- **Protocol**: AG-UI compatible streaming protocol (https://docs.ag-ui.com)
- **Communication**: Server-Sent Events (SSE) and WebSockets
- **Database**: PostgreSQL (via Ecto)

### Two Integration Options

#### 1. AWS Bedrock AgentCore (Recommended)
Managed service with zero infrastructure management, built-in memory, tools, and code interpreter.

**Pros:**
- Serverless scaling
- Built-in memory management
- Tool integration (APIs, Lambda, MCP)
- Code interpreter & browser runtime
- Observability & tracing

**Use when:** Building production agents that need memory, tools, or advanced features.

#### 2. Direct AWS Bedrock API (Legacy)
Direct API calls to AWS Bedrock models.

**Pros:**
- Simple integration
- Direct control
- Lower complexity

**Use when:** Simple chat interfaces without memory or tools.

## 🚀 Quick Start

### Option A: AgentCore Setup (Recommended)

```bash
# 1. Install AgentCore toolkit
curl -LsSf https://astral.sh/uv/install.sh | sh
uv pip install bedrock-agentcore-starter-toolkit

# 2. Create and deploy your agent (see docs/AGENTCORE_SETUP.md)
agentcore deploy

# 3. Set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
export AGENTCORE_AGENT_ID=your-deployed-agent-id

# 4. Clone and setup BedrockFlow
git clone <your-repo-url>
cd BedrockFlow
mix deps.get
mix ecto.create

# 5. Install frontend and start
cd frontend && npm install
cd .. && mix phx.server  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

### Option B: Direct Bedrock (Legacy)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd BedrockFlow

# 2. Set up AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# 3. Install backend dependencies
mix deps.get
mix ecto.create

# 4. Install frontend dependencies
cd frontend
npm install

# 5. Start both servers (in separate terminals)
mix phx.server  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

### Access Points

- **React Frontend**: http://localhost:5173
- **Phoenix LiveView**: http://localhost:4000/chat
- **AgentCore API**: http://localhost:4000/api/agentcore/stream
- **Direct Bedrock API**: http://localhost:4000/api/chat/stream

## 📋 Prerequisites

- **Elixir** 1.15+ and Erlang/OTP 27+
- **Node.js** 18+ and npm
- **PostgreSQL** (for Phoenix Ecto)
- **AWS Account** with Bedrock access
- **AWS Credentials** configured

## 📦 Detailed Setup

### 1. Backend Setup (Phoenix/Elixir)

```bash
# Install dependencies
mix deps.get

# Configure your database in config/dev.exs
# Then create the database
mix ecto.create

# Set up AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Start the Phoenix server
mix phx.server
```

The Phoenix server will be available at `http://localhost:4000`

### 2. Frontend Setup (React/TypeScript)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The React frontend will be available at `http://localhost:5173`

## 🤖 AWS Bedrock AgentCore Setup

For detailed AgentCore setup instructions, see [docs/AGENTCORE_SETUP.md](docs/AGENTCORE_SETUP.md)

### Quick AgentCore Setup

```bash
# 1. Install toolkit
uv pip install bedrock-agentcore-starter-toolkit

# 2. Create agent.py
cat > agent.py << 'EOF'
def invoke(payload):
    import anthropic
    import os

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    prompt = payload.get("prompt", "Hello!")

    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    return {"result": message.content[0].text}
EOF

# 3. Deploy
agentcore deploy

# 4. Test
agentcore invoke '{"prompt": "Hello!"}'

# 5. Set environment variable
export AGENTCORE_AGENT_ID=<your-agent-id-from-deployment>
```

## AWS Bedrock Configuration (Direct API)

1. Ensure you have access to AWS Bedrock in your AWS account
2. Request access to Claude models (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`)
3. Configure your AWS credentials via:
   - Environment variables (recommended for development)
   - AWS credentials file (`~/.aws/credentials`)
   - IAM role (for production)

Required IAM permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/*"
    }
  ]
}
```

## Project Structure

```
.
├── lib/
│   ├── bedrock_app/
│   │   ├── application.ex
│   │   ├── bedrock_client.ex          # AWS Bedrock client
│   │   └── repo.ex
│   └── bedrock_app_web/
│       ├── controllers/
│       │   └── chat_controller.ex     # API endpoints for React
│       ├── live/
│       │   └── chat_live.ex           # LiveView chat interface
│       ├── endpoint.ex
│       └── router.ex
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BedrockChatInterface.tsx   # @ag-ui/client HttpAgent (recommended)
│   │   │   ├── AGUIChatInterface.tsx      # Custom AG-UI implementation
│   │   │   └── ChatInterface.tsx          # Legacy implementation
│   │   ├── lib/
│   │   │   ├── bedrock-agent.ts           # BedrockAgent wrapper for HttpAgent
│   │   │   └── agui.ts                    # Custom AG-UI protocol client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── config/
├── priv/
└── mix.exs
```

## 🔌 API Endpoints

### POST /api/agentcore/stream (Recommended)

Streams chat responses from AWS Bedrock AgentCore with advanced features.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "session_id": "user-123",
  "mode": "agent_runtime",
  "enable_trace": false
}
```

**Parameters:**
- `messages` (required): Array of message objects with role and content
- `session_id` (optional): Session ID for conversation continuity
- `mode` (optional): `"agent_runtime"` (default) or `"custom_endpoint"`
- `enable_trace` (optional): Enable tracing for debugging

**Response:** Server-Sent Events stream
```
data: {"type":"chunk","content":"Hello! I'm Claude"}
data: {"type":"chunk","content":", your AI assistant."}
data: {"type":"done"}
```

**Features:**
- ✅ Built-in memory and session management
- ✅ Tool integration support
- ✅ Code interpreter capabilities
- ✅ Browser automation
- ✅ Observability and tracing

### POST /api/chat/stream (Legacy)

Streams chat responses from direct AWS Bedrock API.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ]
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"chunk","content":"Hello"}
data: {"type":"chunk","content":"! I'm"}
data: {"type":"chunk","content":" doing"}
data: {"type":"done"}
```

**Use when:** Simple chat without memory or advanced features.

## AG-UI Protocol Implementation

This application implements the AG-UI protocol using the official SDK for streaming AI responses.

### AG-UI Client SDK (@ag-ui/client)

The application uses `@ag-ui/client` which provides the `HttpAgent` class for connecting to agent APIs.

Documentation: https://docs.ag-ui.com/sdk/js/client/overview

#### Installation

```bash
npm install @ag-ui/client @ag-ui/core
```

#### Usage with HttpAgent

```typescript
import { HttpAgent } from '@ag-ui/client';
import { BedrockAgent, createStreamSubscriber } from './lib/bedrock-agent';

// Initialize agent
const agent = new BedrockAgent({
  url: 'http://localhost:4000/api/chat/stream',
});

// Create subscriber for handling events
const subscriber = createStreamSubscriber({
  onTextStart: (messageId) => {
    console.log('Message started:', messageId);
  },
  onTextDelta: (delta) => {
    console.log('Delta:', delta);
  },
  onTextEnd: (messageId, fullText) => {
    console.log('Message completed:', fullText);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
  onComplete: () => {
    console.log('Stream complete');
  },
});

// Run the agent
await agent.runAgent(messages, subscriber);
```

### AG-UI Event Types

The protocol uses a streaming event-based architecture with the following events:

1. **TEXT_MESSAGE_START** - Signals the beginning of an assistant message
2. **TEXT_MESSAGE_CONTENT** - Streaming text chunks (delta)
3. **TEXT_MESSAGE_END** - Signals message completion
4. **ERROR** - Error events

### Available Components

The frontend includes three chat interface implementations:

1. **BedrockChatInterface** (Recommended) - Uses `@ag-ui/client` HttpAgent
2. **AGUIChatInterface** - Custom implementation with AG-UI event types
3. **ChatInterface** - Legacy implementation

Switch between them in `App.tsx`.

## Development

### Running Tests

```bash
# Backend tests
mix test

# Frontend tests
cd frontend && npm test
```

### Building for Production

```bash
# Backend
MIX_ENV=prod mix compile
MIX_ENV=prod mix assets.deploy
MIX_ENV=prod mix release

# Frontend
cd frontend && npm run build
```

## 🎨 Customization

### Changing the AI Model

Edit `lib/bedrock_app/bedrock_client.ex`:

```elixir
@default_model "anthropic.claude-3-haiku-20240307-v1:0"  # Faster, cheaper
# or
@default_model "anthropic.claude-3-opus-20240229-v1:0"   # Most capable
```

### Adjusting Response Parameters

Modify temperature, max_tokens, and other parameters in `bedrock_client.ex`:

```elixir
payload = %{
  "anthropic_version" => "bedrock-2023-05-31",
  "max_tokens" => 4096,           # Increase for longer responses
  "temperature" => 0.7,            # Lower for more focused responses
  "top_p" => 0.95
}
```

### Switching Chat Interfaces

In `frontend/src/App.tsx`:

```typescript
// Option 1: HttpAgent with @ag-ui/client (Recommended)
return <BedrockChatInterface />;

// Option 2: Custom AG-UI implementation
return <AGUIChatInterface />;

// Option 3: Legacy SSE implementation
return <ChatInterface />;
```

### Adding Custom Styling

Modify `frontend/src/App.css` or use Tailwind classes in components.

## 🚢 Deployment

### Backend (Phoenix)

**Option 1: Docker**
```bash
# Create Dockerfile and build
docker build -t bedrockflow .
docker run -p 4000:4000 bedrockflow
```

**Option 2: Fly.io**
```bash
fly launch
fly deploy
```

**Option 3: AWS ECS/Fargate**
- Package as release: `MIX_ENV=prod mix release`
- Deploy to ECS with proper IAM roles for Bedrock access

### Frontend (React)

**Option 1: Vercel**
```bash
cd frontend
vercel deploy
```

**Option 2: Netlify**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**Option 3: AWS S3 + CloudFront**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

### Environment Variables for Production

**Backend (.env or configuration)**
```bash
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
AWS_REGION=us-east-1
DATABASE_URL=your_database_url
SECRET_KEY_BASE=your_secret_key
PHX_HOST=your-domain.com
```

**Frontend (.env.production)**
```bash
VITE_API_URL=https://api.your-domain.com
```

## ⚡ Performance Considerations

### Backend Optimization
- **Connection Pooling**: Phoenix uses connection pooling by default for database connections
- **Concurrency**: Elixir/OTP can handle thousands of concurrent WebSocket/SSE connections
- **Caching**: Consider adding Redis for caching frequent queries
- **Rate Limiting**: Implement rate limiting for API endpoints

### Frontend Optimization
- **Code Splitting**: Vite automatically splits code for optimal loading
- **Lazy Loading**: Consider lazy loading chat history
- **Debouncing**: Debounce typing indicators to reduce unnecessary updates
- **Virtual Scrolling**: For long chat histories, implement virtual scrolling

### AWS Bedrock Optimization
- **Model Selection**: Choose appropriate model for use case (Haiku for speed, Sonnet for balance, Opus for quality)
- **Streaming**: Always use streaming for better UX
- **Token Limits**: Set appropriate max_tokens to control costs
- **Regional Endpoints**: Use the closest AWS region to reduce latency

## 🔒 Security Best Practices

1. **Never commit AWS credentials** - Use environment variables or AWS IAM roles
2. **Enable CORS properly** - Only allow trusted origins in production
3. **Rate limiting** - Implement rate limiting to prevent abuse
4. **Input validation** - Validate and sanitize all user inputs
5. **Authentication** - Add authentication before deploying to production
6. **HTTPS only** - Always use HTTPS in production
7. **Database security** - Use connection encryption and secure credentials

## 🐛 Troubleshooting

### AWS Credentials Not Found
- Verify your AWS credentials are set correctly
- Check the environment variables are loaded
- Ensure you have the correct IAM permissions

### CORS Errors
- Verify the frontend URL is in the CORS allowlist in `router.ex`
- Check that the Phoenix server is running on port 4000

### Streaming Not Working
- Ensure your browser supports Server-Sent Events
- Check network tab for SSE connection
- Verify AWS Bedrock model is accessible in your region

### Database Connection Issues
```bash
# Reset database
mix ecto.drop && mix ecto.create && mix ecto.migrate
```

### Port Already in Use
```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port
PORT=4001 mix phx.server
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow Elixir style guide for backend code
- Use ESLint and Prettier for frontend code
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Phoenix Framework** - Productive web framework for Elixir
- **AWS Bedrock** - Managed AI service with Claude models
- **AG-UI Protocol** - Standardized agent communication protocol
- **Anthropic** - Claude language models
- **Elixir Community** - For the amazing ecosystem

## 📚 Learn More

### Documentation
* [Phoenix Framework](https://www.phoenixframework.org/)
* [Phoenix Guides](https://hexdocs.pm/phoenix/overview.html)
* [AG-UI Protocol](https://docs.ag-ui.com)
* [AG-UI Client SDK](https://docs.ag-ui.com/sdk/js/client/overview)
* [AG-UI Core SDK](https://docs.ag-ui.com/sdk/js/core/overview)
* [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
* [Claude API Reference](https://docs.anthropic.com/claude/reference)

### Related Projects
* [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html)
* [Elixir](https://elixir-lang.org/)
* [React](https://react.dev/)
* [Vite](https://vitejs.dev/)

---

**Built with ❤️ using Phoenix, React, and AWS Bedrock**

For questions, issues, or feature requests, please open an issue on GitHub.
