// rework by vox frameworks
ModAPI.require("player");

var flying = false; // Starts off

ModAPI.addEventListener("key", (e) => {
    if (e.key == 35) { // If 'H' is pressed
        flying = !flying; // Toggle true/false
        
        // Tell you in chat so you know if it's on or off
        if(flying) ModAPI.displayToChat({msg: "Flight: ON"});
        else ModAPI.displayToChat({msg: "Flight: OFF"});
    }
});

ModAPI.addEventListener("update", () => {
    if (flying) {
        ModAPI.player.motionY = 0.8; // Fly up speed
    }
});
