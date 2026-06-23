const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = '032197a1-90cd-4d10-92e8-cbf0f5cf4abb';

if (!API_KEY) {
  console.error("No VAPI_API_KEY found in .env");
  process.exit(1);
}

const configPath = path.join(__dirname, 'vapi_assistant_config.json');
let configData;

try {
  configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) {
  console.error("Could not read config file:", e.message);
  process.exit(1);
}

// Remove any existing id or orgId if they accidentally got in there
delete configData.id;
delete configData.orgId;

fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(configData)
})
.then(res => res.json())
.then(data => {
  if (data.id) {
    console.log(`\n✅ Success! Assistant updated magically with your Ngrok URL.\nAssistant ID: ${data.id}`);
  } else {
    console.error("Failed to update assistant:", data);
  }
})
.catch(err => {
  console.error("Error updating assistant:", err);
});
