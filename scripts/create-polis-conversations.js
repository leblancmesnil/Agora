/**
 * Script to create Pol.is conversations for all propositions.
 *
 * Requirements:
 * - Pol.is API credentials (API_KEY, API_SECRET).
 * - Node.js installed.
 *
 * Usage:
 * 1. Set your Pol.is API credentials in the `API_KEY` and `API_SECRET` variables.
 * 2. Run the script: `node create-polis-conversations.js`
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Pol.is API credentials
const API_KEY = 'your-polis-api-key';
const API_SECRET = 'your-polis-api-secret';

// Load propositions data
const propositionsPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'propositions.json');
const propositionsData = JSON.parse(fs.readFileSync(propositionsPath, 'utf-8'));

// Pol.is API base URL
const POLIS_API_BASE = 'https://api.polis.io/v3';

// Function to create a Pol.is conversation
async function createConversation(polisId, title, description) {
  try {
    const response = await axios.post(
      `${POLIS_API_BASE}/conversations`,
      {
        title,
        description,
        slug: polisId,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Created conversation: ${polisId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create conversation: ${polisId}`);
    console.error(error.response?.data || error.message);
  }
}

// Main function
async function main() {
  const propositions = propositionsData.propositions;
  for (const proposition of propositions) {
    const { polisId, titre, body } = proposition;
    if (!polisId) {
      console.warn(`⚠️ Skipping proposition without Pol.is ID: ${titre}`);
      continue;
    }

    const description = body.split('\n')[0]; // Use the first line of the body as the description
    await createConversation(polisId, titre, description);
  }
}

main().catch(err => console.error(err));