document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatContent = document.getElementById("chat-content");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const closeBtn = document.getElementById("close-btn");

  // Function to add messages to the chat
  function addMessage(content, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);

    // Convert newlines into <br> and handle bullet points
    const formattedContent = formatMessage(content);
    messageElement.innerHTML = formattedContent;

    chatContent.appendChild(messageElement);
    chatContent.scrollTop = chatContent.scrollHeight; // Scroll to bottom
  }

  // Function to format the message
  function formatMessage(content) {
    if (content.includes("\n")) {
      const lines = content.split("\n").map((line) => {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li>${line.substring(2)}</li>`;
        } else {
          return line;
        }
      });

      const hasBulletPoints = lines.some((line) => line.startsWith("<li>"));
      if (hasBulletPoints) {
        return `<ul>${lines.join("")}</ul>`;
      } else {
        return lines.join("<br>");
      }
    } else {
      return content;
    }
  }

  // Function to send message to backend
  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;
    addMessage(message, "user");
    userInput.value = "";

    fetch("/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: "12345",
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

  // Toggle Chat Window
  chatToggleBtn.addEventListener("click", () => {
    chatContainer.style.display = "block";
    chatToggleBtn.style.display = "none";
  });

  // Close Chat
  closeBtn.addEventListener("click", () => {
    chatContainer.style.display = "none";
    chatToggleBtn.style.display = "block";
  });

  // Send message on button click
  sendBtn.addEventListener("click", sendMessage);

  // Send message on Enter key press
  userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
});
