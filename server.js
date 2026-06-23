const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory array to store collected data (replace with a DB in production)
const callersData = [];

// Vapi Webhook Endpoint
app.post('/webhook/vapi', (req, res) => {
  try {
    const payload = req.body;
    const message = payload.message;

    if (!message) {
      console.log('Received an empty message from Vapi.');
      return res.status(400).send('Invalid payload');
    }

    console.log(`\n--- Vapi Webhook Received: ${message.type} ---`);

    // Handle Tool Calls (Function Calls) from the Assistant
    if (message.type === 'tool-calls' || message.type === 'function-call') {
      const toolCalls = message.toolCalls || [message.toolCall]; // Handle different Vapi payload structures
      const results = [];

      toolCalls.forEach(toolCall => {
        if (toolCall && toolCall.function && toolCall.function.name === 'save_caller_info') {
          try {
            // Parse arguments from the function call
            const args = typeof toolCall.function.arguments === 'string' 
              ? JSON.parse(toolCall.function.arguments) 
              : toolCall.function.arguments;

            console.log('\n[SAVE_CALLER_INFO] Action Triggered!');
            console.log('Extracted Data:', args);

            // Store the data
            const record = {
              id: Date.now(),
              name: args.name,
              email: args.email,
              reason: args.reason,
              timestamp: new Date().toISOString()
            };
            callersData.push(record);
            console.log(`Current Callers DB Size: ${callersData.length}`);

            // Return success response for this tool call
            results.push({
              toolCallId: toolCall.id,
              result: 'Information successfully saved to the backend.'
            });
          } catch (error) {
            console.error('Error parsing function arguments:', error);
            results.push({
              toolCallId: toolCall.id,
              result: 'Error parsing parameters. Please try again.'
            });
          }
        }
      });

      // Send the response back to Vapi so the assistant can continue
      return res.status(201).json({ results });
    }

    // Handle End of Call Report
    if (message.type === 'end-of-call-report') {
      console.log('\n[END_OF_CALL_REPORT] Call Ended.');
      console.log('Call Summary:', message.summary);
      console.log('Call Transcript (last few lines):');
      if (message.transcript) {
        // Output the last 5 messages from the transcript to the console
        const transcriptArr = message.transcript.split('\n');
        console.log(transcriptArr.slice(-5).join('\n'));
      }
      return res.status(200).send('Report received.');
    }

    // Handle other events (e.g., status updates)
    console.log(`Event type '${message.type}' ignored.`);
    return res.status(200).send('Event received.');

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Voice AI Server is running on http://localhost:${PORT}`);
  console.log('Waiting for Vapi webhooks on /webhook/vapi...');
});
