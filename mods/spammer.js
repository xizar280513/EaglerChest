let startCommandReceived = false;
let lolMessageInterval;

// Function to send "lol" messages repeatedly
function sendLolMessages() {
    lolMessageInterval = setInterval(() => {
        if (startCommandReceived) {
            ModAPI.network.sendPacketChatMessage({messageIn: "lol"});
        }
    }, 500); // Adjust the interval as needed (e.g., every second)
}

// Function to stop sending "lol" messages
function stopSendingLolMessages() {
    clearInterval(lolMessageInterval);
}

// Event listener for receiving chat messages
ModAPI.addEventListener("sendchatmessage", (data) => {
    if (data.message === ".start") {
        startCommandReceived = true;
        console.log("Received start command. Sending 'lol' messages.");
        sendLolMessages();
    }
});

// Event listener for key presses
ModAPI.addEventListener("key", (data) => {
    if (data.key === 1) { // Key code for Escape key
        console.log("Escape key pressed. Stopping 'lol' messages.");
        startCommandReceived = false;
        stopSendingLolMessages();
    }
});