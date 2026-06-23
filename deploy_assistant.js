const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VAPI_API_KEY;

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

fetch('https://api.vapi.ai/assistant', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(configData)
})
.then(res => res.json())
.then(data => {
  if (data.id) {
    console.log(`\n✅ Success! Assistant created magically.\nAssistant ID: ${data.id}`);
    console.log(`\nNext Steps:\n1. Go to your Vapi Dashboard -> Phone Numbers.\n2. Click on your phone number and assign it to the newly created assistant (it will be named "${data.name}").\n`);
  } else {
    console.error("Failed to create assistant:", data);
  }
})
.catch(err => {
  console.error("Error creating assistant:", err);
});
