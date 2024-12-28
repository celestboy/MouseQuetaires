document.addEventListener("DOMContentLoaded", function () {
  // Burger Menu
  const burgerButton = document.getElementById("burger-menu");
  const mobileMenu = document.getElementById("mobile-menu");

  burgerButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  // Chart configuration
  const data = {
    labels: [
      "Consommation\nénergétique\n(kWh/mois)",
      "Émissions\nCO2\n(kg/mois)",
    ],
    datasets: [
      {
        label: "CMS",
        data: [6.86, 3.26],
        backgroundColor: "#ef4444",
        barThickness: 30,
      },
      {
        label: "Site Codé",
        data: [2.69, 1.28],
        backgroundColor: "#10b981",
        barThickness: 30,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 10,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
          title: {
            display: true,
            text: "Valeur",
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: window.innerWidth < 768 ? 12 : 14,
            },
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
            maxRotation: 0,
            minRotation: 0,
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            padding: 20,
            font: {
              size: window.innerWidth < 768 ? 12 : 14,
            },
            boxWidth: 30,
            boxHeight: 15,
          },
        },
        title: {
          display: false,
        },
      },
    },
  };

  const ctx = document.getElementById("impactChart").getContext("2d");
  new Chart(ctx, config);

  // Resize handler
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const chart = Chart.instances[0];

    if (chart) {
      chart.options.scales.x.ticks.font.size = width < 768 ? 10 : 12;
      chart.options.scales.y.ticks.font.size = width < 768 ? 10 : 12;
      chart.options.plugins.legend.labels.font.size = width < 768 ? 12 : 14;
      chart.update();
    }
  });
});




      // IA :



function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
}

function addMessage(message, isUser = false) {
  const messagesDiv = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
  messageDiv.textContent = message;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Prompt :
function buildPrompt(userMessage) {
  return `[INST] Tu es un assistant virtuel professionnel pour l'agence web Mouse Quetaires. 
  Voici quelques informations importantes sur l'agence :
  - Mouse Quetaires est une agence de développement web composée de 4 personnes : 3 développeurs et un designer
  - Ils créent des sites web sur mesure sans utiliser de CMS
  - Leurs sites sont 50% plus rapides que WordPress
  - Ils proposent du développement web, du design/graphisme et de la maintenance
  - L'équipe est composée de Samuel Alhadef (CCO), Célestin Godefroy (COO), Ilan Maouchi (Expert Coding) et Dorian Collet (Designer)
  - Ils mettent l'accent sur le développement durable avec 60.8% de réduction énergétique par rapport aux CMS
  
  Question du client : ${userMessage}
  
  Réponds de manière professionnelle, concise et pertinente en te basant sur ces informations. Adopte un ton commercial
  et mets en avant les points forts de l'agence quand c'est pertinent. Il faut que ta réponse soit la plus courte possible
  IMPORTANT : dans le cas où la question du client n'a rien à voir avec ce que nous faisont, tu ne dois pas répondre à sa
  question en précisant pourquoi.
  [/INST]`;
}


function handleAPIError(error) {
  console.error("Erreur API:", error);
  return "Je suis désolé, je rencontre actuellement des difficultés techniques. Je vous invite à nous contacter directement via notre formulaire de contact ou par téléphone.";
}


async function queryAPI(userMessage) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: buildPrompt(userMessage),
          parameters: {
            max_new_tokens: 500,
            temperature: 0.4,
            top_p: 0.85,
            top_k: 50,
            repetition_penalty: 1.2,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      let cleanedResponse = data[0].generated_text
        .trim()
        .replace(/\[\/INST\]/g, '')
        .replace(/^\s*-\s*/gm, '• ')
        .trim();
      
      return cleanedResponse;
    } else {
      throw new Error("Format de réponse invalide");
    }
  } catch (error) {
    return handleAPIError(error);
  }
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();

  if (message) {
    addMessage(message, true);
    input.value = "";

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message";
    loadingDiv.textContent = "Je réfléchis à votre demande...";
    document.getElementById("chat-messages").appendChild(loadingDiv);

    try {
      const response = await queryAPI(message);
      
      loadingDiv.textContent = response;
    } catch (error) {
      loadingDiv.textContent = "Je suis désolé, je ne peux pas répondre à votre demande pour le moment. N'hésitez pas à nous contacter directement.";
    }
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const messages = document.getElementById("chat-messages");
  messages.scrollTop = messages.scrollHeight;
});



  // Pop up

function toggleChat() {
    const chatbot = document.getElementById("chatbot");
    if (chatbot.classList.contains("flex")) {
        chatbot.classList.remove("chatbot-show");
        setTimeout(() => {
            chatbot.classList.remove("flex");
            chatbot.classList.add("hidden");
        }, 300);
    } else {
        chatbot.classList.remove("hidden");
        chatbot.classList.add("flex");
        
        chatbot.offsetHeight;
        chatbot.classList.add("chatbot-show");
    }
}

function addMessage(message, isUser = false) {
    const messagesDiv = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = isUser ? "user-message" : "ai-message";
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message) {
        addMessage(message, true);
        input.value = "";

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "ai-message flex items-center space-x-2";
        loadingDiv.innerHTML = `
            <div class="flex space-x-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        `;
        document.getElementById("chat-messages").appendChild(loadingDiv);

        try {
            const response = await queryAPI(message);
            loadingDiv.remove();
            addMessage(response);
        } catch (error) {
            loadingDiv.remove();
            addMessage("Je suis désolé, je ne peux pas répondre à votre demande pour le moment. N'hésitez pas à nous contacter directement.");
        }
    }
}