# AI Agent Specification

## Agent Configuration

The OpenAI Agent must be configured with the following parameters:
- Model: Latest supported model compatible with Agents SDK
- Tool access: Restricted to the defined MCP tools only
- Memory context: Limited to current conversation plus recent history from database
- Temperature: Configurable parameter for response creativity (default: 0.7)

## Prompting Strategy

The agent employs a high-level contextual approach that:
- Interprets natural language user inputs for todo management intents
- Maps user requests to appropriate MCP tool calls
- Maintains conversation context across multiple exchanges
- Generates natural language responses that match the user's communication style
- Handles ambiguous requests by seeking clarification when needed

## Tool Selection Rules

- Analyzes user input to identify specific todo management intents
- Matches recognized intents to corresponding MCP tools:
  - Task creation requests → add_task tool
  - Task listing requests → list_tasks tool
  - Task completion requests → complete_task tool
  - Task deletion requests → delete_task tool
  - Task modification requests → update_task tool
- Applies fuzzy matching for variations in user language
- Requests clarification when intent is ambiguous

## Tool Chaining Rules

- Executes multiple tools in sequence when required for complex requests
- Uses output from one tool as context for subsequent tool calls
- Maintains logical flow between related operations (e.g., list then complete)
- Combines results from multiple tools into cohesive responses
- Handles dependencies between operations appropriately

## Error Recovery Behavior

- Gracefully handles tool execution failures by informing the user
- Attempts alternative approaches when specific tools fail
- Recovers from malformed tool call arguments
- Provides helpful error messages in natural language
- Maintains conversation context during error recovery
- Logs errors for debugging while protecting user privacy