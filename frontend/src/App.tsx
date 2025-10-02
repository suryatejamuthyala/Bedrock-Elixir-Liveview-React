import { BedrockChatInterface } from './components/BedrockChatInterface';
import { AGUIChatInterface } from './components/AGUIChatInterface';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  // Use @ag-ui/client HttpAgent version (recommended)
  return <BedrockChatInterface />;

  // Alternative implementations:
  // return <AGUIChatInterface />;  // AG-UI Protocol events with custom client
  // return <ChatInterface />;       // Legacy version
}

export default App;
