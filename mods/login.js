// Press J to login
// Change the password constant with your password
// Created by Instel
const password = "REPLACE WITH YOUR PASSWORD";

ModAPI.require('player');
window.addEventListener("keydown", event => {
    if (event.keyCode == '74') {
        if (('/login ' + password).charAt(0) === "/") {
            ModAPI.player.sendChatMessage({
                message: ('/login ' + password)
            })
        }
    }
});