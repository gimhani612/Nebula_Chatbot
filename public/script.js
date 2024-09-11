document.addEventListener("DOMContentLoaded", () => {
  const chatContent = document.getElementById("chat-content");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // Function to add messages to the chat
  function addMessage(content, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);

    // Convert newlines into <br> and handle bullet points
    const formattedContent = formatMessage(content);
    messageElement.innerHTML = formattedContent; // Use innerHTML to render the formatted content

    chatContent.appendChild(messageElement);
    chatContent.scrollTop = chatContent.scrollHeight; // Scroll to bottom
  }

  // Function to format the message (replacing newlines with <br> and handling bullet points)
  function formatMessage(content) {
    // Convert bullet points (e.g., '- item' or '* item') into <ul><li> elements
    if (content.includes("\n")) {
      const lines = content.split("\n").map((line) => {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li>${line.substring(2)}</li>`;
        } else {
          return line; // Keep the rest of the message unchanged
        }
      });

      // Check if there are any <li> tags in the content, wrap them in <ul> tags
      const hasBulletPoints = lines.some((line) => line.startsWith("<li>"));
      if (hasBulletPoints) {
        return `<ul>${lines.join("")}</ul>`;
      } else {
        return lines.join("<br>"); // Use <br> for regular line breaks
      }
    } else {
      return content; // Return content as is if no newlines are found
    }
  }

  // Function to send message to backend
  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;
    addMessage(message, "user");
    userInput.value = "";

    // Send message to backend
    fetch("/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: "12345", // Replace with a unique session ID as needed
        queryResult: { queryText: message },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.fulfillmentText) {
          addMessage(data.fulfillmentText, "bot");
        } else {
          addMessage(
            "Sorry, there was an error processing your request.",
            "bot"
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        addMessage("Sorry, there was an error processing your request.", "bot");
      });
  }

  // Event listener for send button
  sendBtn.addEventListener("click", sendMessage);

  // Event listener for Enter key
  userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
});
