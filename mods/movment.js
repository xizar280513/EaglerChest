// Ensure the ModAPI is available
if (typeof ModAPI !== 'undefined') {
    var newspeed = 1.0; // Adjusted for 5x normal speed (assuming normal speed is around 0.2)
    var oldspeed = ModAPI.player.getSpeed();

    ModAPI.addEventListener("update", function () {
        if (ModAPI.player.isMoving()) {
            ModAPI.player.setSpeed({speed: newspeed});
        } else {
            ModAPI.player.setSpeed({speed: oldspeed});
        }
    });

    // Log that the speed mod is loaded
    ModAPI.logger.loginfo("Speed mod loaded successfully!");
}
