/*
    might work on 1.2.5
*/
ModAPI.require("player");
ModAPI.require("network");

ModAPI.addEventListener("sendchatmessage", (e) => {
    if (e.message == ".setPos") {
        let X = e.message.split(" ")[1];
        let Y = e.message.split(" ")[2];
        let Z = e.message.split(" ")[3];
        ModAPI.network.sendPacketPlayerPosition({
            posX: X,
            posY: Y,
            posZ: Z,
            isOnGround: true
        });
        ModAPI.player.reload();
    }
});