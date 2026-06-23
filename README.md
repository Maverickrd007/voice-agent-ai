# Agentic Voice AI with Vapi & Twilio

This project provides a robust backend and configuration for a voice AI agent using Vapi as the voice orchestration platform, Twilio for the phone number, and OpenAI's GPT-4o for reasoning.

The agent is designed to answer calls, converse naturally, collect the caller's name, email, and reason for calling, and then save this data to the backend via a webhook function call. It also logs the end-of-call summary provided by Vapi.

## Project Structure

- `server.js`: The Express backend that listens for Vapi webhooks.
- `vapi_assistant_config.json`: The JSON configuration for the Vapi assistant, including the `gpt-4o` model prompt and the `save_caller_info` tool definition.
- `package.json`: Project dependencies.
- `.env.example`: Environment variables template.

## Setup Instructions

### 1. Local Backend Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   The server will run on port `3000`.

### 2. Expose Local Server (for Testing)

Vapi needs a public URL to send webhooks. We'll use `ngrok` for local testing.
1. Install `ngrok` (if you haven't already).
2. Run ngrok to expose port 3000:
   ```bash
   ngrok http 3000
   ```
3. Note the Forwarding URL (e.g., `https://abcdef123.ngrok-free.app`).

### 3. Vapi Dashboard Setup

1. Go to the [Vapi Dashboard](https://dashboard.vapi.ai).
2. **Add Twilio Phone Number**:
   - Navigate to the **Phone Numbers** tab.
   - Click "Import" or "Buy". If you have a Twilio account, input your Twilio Account SID and Auth Token to import an existing Twilio number into Vapi.
3. **Create the Assistant**:
   - Go to the **Assistants** tab and create a new assistant.
   - Use the provided `vapi_assistant_config.json` to configure the assistant.
   - **IMPORTANT**: In the configuration (both in the tool's server URL and the main server URL at the bottom), replace `YOUR_SERVER_URL` with your actual ngrok URL (e.g., `https://abcdef123.ngrok-free.app`).
   - You can copy-paste the JSON into the Vapi JSON editor or use it via the Vapi API.
4. **Link Phone Number to Assistant**:
   - Go back to the **Phone Numbers** tab.
   - Select your imported Twilio number.
   - Assign the newly created assistant to this phone number.

### 4. Testing the Agent

1. Make sure your local Node server and ngrok are running.
2. Call your Twilio phone number.
3. The agent should pick up and start a conversation.
4. Provide your name, email, and reason for calling. Let the agent ask follow-up questions if you withhold information.
5. Watch your local terminal (`node server.js` output):
   - You should see a webhook hit for `function-call` triggering `save_caller_info`.
   - When you hang up, you will see an `end-of-call-report` webhook hit with the transcript and call summary.

---

## Deployment to Render

To deploy this Node.js backend to a production environment like [Render](https://render.com):

1. **Push your code to GitHub**.
2. **Create a New Web Service** on Render:
   - Connect your GitHub repository.
3. **Configure the Service**:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Add Environment Variables**:
   - In the Render dashboard, add the variables from `.env.example` (like `PORT`).
5. **Deploy**:
   - Click "Create Web Service".
6. **Update Vapi Configuration**:
   - Once Render provides you with a live URL (e.g., `https://your-app.onrender.com`), go back to your Vapi dashboard.
   - Update the Server URL for the assistant (and the tool's server URL) to `https://your-app.onrender.com/webhook/vapi`.
