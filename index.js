const express = require("express");
const bodyParser = require("body-parser");
const { SessionsClient } = require("dialogflow");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Initialize Dialogflow SessionsClient with credentials
const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Route for the root URL to prevent 404 errors
app.get("/", (req, res) => {
  res.send("Welcome to the Nebula Chatbot! The server is running.");
});

// Handle POST requests from Dialogflow webhook
app.post("/webhook", async (req, res) => {
  const sessionId = req.body.session;
  const query = req.body.queryResult.queryText;

  // Create the session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    process.env.PROJECT_ID,
    sessionId
  );

  // Build the request to send to Dialogflow
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en-US",
      },
    },
  };

  try {
    // Send the request to Dialogflow and get the response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Send the response back to Dialogflow
    res.json({ fulfillmentText: result.fulfillmentText });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error processing the request");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
