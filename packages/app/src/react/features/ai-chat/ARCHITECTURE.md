# AI Chat System Architecture

Professional, production-ready chat system with modern React patterns and complete TypeScript support.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│                  (Your UI Implementation)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    useChat Hook                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Message State Management                          │  │
│  │  • File Upload Orchestration                         │  │
│  │  • Retry Logic                                       │  │
│  │  • Error Handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  useChatStream Hook                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Stream Lifecycle Management                       │  │
│  │  • Abort Control                                     │  │
│  │  • Error State Management                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  ChatAPIClient                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • HTTP Streaming                                     │  │
│  │  • Chunk Processing                                   │  │
│  │  • File Upload                                        │  │
│  │  • Error Handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Stream Utilities                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • splitJSONStream()                                  │  │
│  │  • extractFunctionName()                              │  │
│  │  • formatFunctionName()                               │  │
│  │  • formatStatusMessage()                              │  │
│  │  • ThinkingMessageManager                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
ai-chat/
├── types/
│   └── chat.types.ts              # Complete TypeScript definitions
│       ├── IChatMessage           # Message structure
│       ├── IChatStreamChunk       # Stream response format
│       ├── IChatStreamConfig      # Stream configuration
│       ├── IChatStreamCallbacks   # Event callbacks
│       ├── IChatError             # Error structure
│       ├── IUseChatReturn         # Hook return type
│       └── ... (more types)
│
├── clients/
│   └── chat-api.client.ts         # API Client
│       ├── ChatAPIClient          # Main client class
│       ├── streamChat()           # Stream chat method
│       ├── uploadFile()           # File upload method
│       └── chatAPI                # Singleton instance
│
├── hooks/
│   ├── use-chat.ts                # Main chat hook
│   │   ├── useChat()              # Complete chat management
│   │   ├── sendMessage()          # Send messages
│   │   ├── retryLastMessage()    # Retry logic
│   │   └── stopGenerating()      # Abort control
│   │
│   └── use-chat-stream.ts         # Stream management hook
│       ├── useChatStream()        # Stream lifecycle
│       ├── startStream()          # Start streaming
│       └── abortStream()          # Abort stream
│
├── utils/
│   └── stream.utils.ts            # Stream utilities
│       ├── splitJSONStream()      # Parse JSON chunks
│       ├── extractFunctionName()  # Extract function names
│       ├── formatFunctionName()   # Format for display
│       ├── formatStatusMessage()  # Format status
│       ├── processStreamChunk()   # Process chunks
│       └── ThinkingMessageManager # Thinking messages
│
├── examples/
│   └── usage-example.tsx          # Complete usage examples
│
├── components/                     # (Your existing components)
├── index.ts                       # Main exports
├── README.md                      # Documentation
├── MIGRATION.md                   # Migration guide
└── ARCHITECTURE.md                # This file
```

## 🔄 Data Flow

### 1. Sending a Message

```
User Input
   │
   ▼
useChat.sendMessage(message, files?)
   │
   ├──► Upload files (if present)
   │    │
   │    └──► ChatAPIClient.uploadFile()
   │         │
   │         └──► Returns: IChatFileAttachment[]
   │
   ├──► Add user message to state
   │
   ├──► Add empty AI message (for streaming)
   │
   └──► useChatStream.startStream()
        │
        └──► ChatAPIClient.streamChat()
             │
             ├──► HTTP POST /api/page/chat/stream
             │
             └──► Process stream chunks
                  │
                  ├──► Content chunks → Update AI message
                  ├──► Thinking updates → Update thinking message
                  ├──► Function calls → Log/notify
                  ├──► Debug info → Log/notify
                  └──► Errors → Display error
```

### 2. Stream Processing

```
HTTP Response Stream
   │
   ▼
ReadableStream<Uint8Array>
   │
   ▼
TextDecoder
   │
   ▼
Accumulated String Buffer
   │
   ▼
splitJSONStream(buffer)
   │
   ▼
IChatStreamChunk[]
   │
   ▼
processStreamChunk(chunk)
   │
   ├──► hasContent? → onContent(content)
   ├──► hasThinking? → onThinking(message, type)
   ├──► hasFunctionCall? → onToolCall(name, args)
   ├──► hasDebug? → onDebug(chunk)
   └──► hasError? → onError(error)
```

### 3. Error Handling Flow

```
Error Occurs
   │
   ├──► DOMException (AbortError)
   │    └──► IChatError { type: 'abort_error', isAborted: true }
   │
   ├──► TypeError (Network)
   │    └──► IChatError { type: 'network_error' }
   │
   ├──► HTTP Error
   │    └──► IChatError { type: 'stream_error' }
   │
   └──► Generic Error
        └──► IChatError { type: 'system_error' }
             │
             └──► useChatStream.error state
                  │
                  └──► useChat.error state
                       │
                       └──► Component error display
```

## 🧩 Component Integration

### Basic Integration

```typescript
import { useChat } from '@react/features/ai-chat';

const ChatComponent = () => {
  const chat = useChat({
    agentId: 'agent-123',
    chatId: 'chat-456',
  });

  return (
    <>
      {chat.messages.map((msg) => <Message key={msg.id} {...msg} />)}
      <Input onSend={chat.sendMessage} disabled={chat.isGenerating} />
      {chat.error && <Error error={chat.error} onRetry={chat.retryLastMessage} />}
    </>
  );
};
```

### Advanced Integration with Custom Client

```typescript
import { createChatClient, useChat } from '@react/features/ai-chat';

// Create custom client
const client = createChatClient({
  baseUrl: '/custom/api',
  timeout: 60000,
  defaultHeaders: {
    Authorization: 'Bearer token',
  },
});

const AdvancedChat = () => {
  const chat = useChat({
    agentId: 'agent-123',
    chatId: 'chat-456',
    client, // Use custom client
    headers: {
      'X-Session-Id': sessionId,
    },
  });

  // ... component implementation
};
```

## 🎯 Design Principles

### 1. Separation of Concerns

- **Types**: Pure type definitions (no logic)
- **Utilities**: Pure functions (no state)
- **Client**: HTTP logic only (no React)
- **Hooks**: React state management (no HTTP details)
- **Components**: UI only (no business logic)

### 2. Single Responsibility

- Each module has one clear purpose
- Easy to test in isolation
- Easy to replace/extend

### 3. Composition Over Inheritance

- Hooks compose other hooks
- Client uses utilities
- Components use hooks

### 4. Dependency Injection

- Custom client can be injected
- Custom headers supported
- Callbacks for extensibility

### 5. Progressive Enhancement

- Basic usage is simple
- Advanced features available when needed
- Gradual complexity increase

## 🔒 Type Safety

### Strict TypeScript Rules

```typescript
// ✅ Good - Fully typed
const message: IChatMessage = {
  id: 1,
  message: 'Hello',
  type: 'user',
  me: true,
  timestamp: Date.now(),
};

// ❌ Bad - Avoided 'any'
const message: any = { ... };

// ✅ Good - Proper error typing
const error: IChatError = {
  message: 'Error',
  type: 'system_error',
};

// ❌ Bad - Unknown error
throw new Error('error');
```

### Type Guards

```typescript
// Type narrowing with discriminated unions
if (message.type === 'user') {
  // TypeScript knows this is a user message
}

if (error.isAborted) {
  // TypeScript knows this is an aborted error
}
```

## ⚡ Performance Considerations

### 1. Memo/Callback Optimization

```typescript
// All hook functions are wrapped in useCallback
const sendMessage = useCallback(async (...) => {
  // Stable reference across renders
}, [dependencies]);
```

### 2. Ref Usage for Non-Reactive Data

```typescript
// Avoid unnecessary re-renders
const currentMessageRef = useRef('');
const lastUserMessageRef = useRef(null);
```

### 3. Minimal State Updates

```typescript
// Only update state when necessary
if (content !== previousContent) {
  setMessage(content);
}
```

### 4. Stream Buffer Management

```typescript
// Clear buffer after processing to prevent memory leaks
if (chunks.length > 0) {
  accumulatedData = '';
}
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test utilities in isolation
describe('splitJSONStream', () => {
  it('should parse multiple JSON objects', () => {
    const result = splitJSONStream('{"a":1}{"b":2}');
    expect(result).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
```

### Integration Tests

```typescript
// Test hook behavior
import { renderHook } from '@testing-library/react';

describe('useChat', () => {
  it('should send message and update state', async () => {
    const { result } = renderHook(() => useChat({ ... }));
    await act(() => result.current.sendMessage('Hello'));
    expect(result.current.messages).toHaveLength(2);
  });
});
```

### E2E Tests

```typescript
// Test complete flow with real API
describe('Chat Flow', () => {
  it('should complete full conversation', async () => {
    // Mount component
    // Send message
    // Verify response
    // Verify state
  });
});
```

## 📊 State Management

### Hook State

```typescript
useChat() manages:
  - messages[]          // All messages
  - isGenerating        // AI responding
  - isProcessing        // Uploading files
  - error              // Current error
  - lastUserMessage    // For retry

useChatStream() manages:
  - isStreaming        // Stream active
  - error             // Stream error
```

### Ref State (Non-Reactive)

```typescript
-lastUserMessageRef - // Retry data
  currentAIMessageRef - // Current accumulation
  abortControllerRef; // Abort control
```

## 🔌 Extension Points

### 1. Custom API Client

```typescript
class CustomChatClient extends ChatAPIClient {
  async streamChat(...) {
    // Custom implementation
  }
}
```

### 2. Custom Stream Processing

```typescript
const customProcessor = (chunk: IChatStreamChunk) => {
  // Custom processing logic
  return processStreamChunk(chunk);
};
```

### 3. Custom Error Handling

```typescript
const { error } = useChat({
  onError: (err) => {
    // Custom error handling
    logToSentry(err);
    notifyUser(err);
  },
});
```

### 4. Custom Thinking Messages

```typescript
const thinkingManager = createThinkingManager();
thinkingManager.start('custom', callback, 'CustomMessage');
```

## 📚 Related Documentation

- [README.md](./README.md) - Feature documentation
- [MIGRATION.md](./MIGRATION.md) - Migration guide
- [usage-example.tsx](./examples/usage-example.tsx) - Usage examples
- [chat.types.ts](./types/chat.types.ts) - Type definitions

## 🤝 Contributing

When extending this system:

1. **Follow TypeScript strict mode** - No `any`, no `!`, no casting
2. **Add JSDoc comments** - Document all public APIs
3. **Write tests** - Unit + integration tests required
4. **Update documentation** - Keep docs in sync with code
5. **Follow patterns** - Use established patterns consistently
