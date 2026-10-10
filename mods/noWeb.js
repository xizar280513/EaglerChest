/*
    Untested plugin that should disable the web effect when toggled on.
*/

ModAPI.require("player");

var isToggled = false;
const defaultSpeed = ModAPI.player.capabilities.getWalkSpeed();

ModAPI.addEventListener("update", () => {
    if (isToggled && ModAPI.player.isInWeb) {
        ModAPI.player.capabilities.setWalkSpeed(defaultSpeed);
        ModAPI.player.isInWeb = false;
        ModAPI.player.reload();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "x") {
        isToggled = !isToggled;
        ModAPI.displayToChat({msg: "Web effect is now " + (isToggled ? "enabled" : "disabled")})
    }
});