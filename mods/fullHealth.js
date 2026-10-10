/*
    Doesn't work because of the server's health sync
*/

ModAPI.require("player");

ModAPI.addEventListener("update", () => {
    if (ModAPI.player.getHealth() < ModAPI.player.getMaxHealth()) {
        ModAPI.player.setPlayerSPHealth({health: 20});
        ModAPI.player.reload();
    }
})