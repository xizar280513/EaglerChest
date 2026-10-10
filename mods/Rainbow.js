ModAPI.require('settings');
let toggled = false;
let keybind = 38; // Keybind is L

function toggle() {
    toggled = !toggled; // Toggle the state
    if (toggled) {
        startRainbowEffect();
        ModAPI.displayToChat({msg: `§5[§dRainbow Mod§5] §bRainbow effect is now enabled.`});
    } else {
        stopRainbowEffect();
        ModAPI.displayToChat({msg: `§5[§dRainbow Mod§5] §bRainbow effect is now disabled.`});
    }
}

let rainbowInterval;

function startRainbowEffect() {
    rainbowInterval = setInterval(() => {
        let time = Date.now() * 0.002; 
        let r = Math.sin(time + 0) * 127 + 128;
        let g = Math.sin(time + 2) * 127 + 128;
        let b = Math.sin(time + 4) * 127 + 128;
        ModAPI.settings.gammaSetting = r << 16 | g << 8 | b;
        ModAPI.settings.reload();
    }, 100); 
}

function stopRainbowEffect() {
    clearInterval(rainbowInterval);
    ModAPI.settings.gammaSetting = 1000;
    ModAPI.settings.reload();
}

ModAPI.addEventListener('key', function(a) {
    if (a.key == keybind) {
        toggle();
    }
});

ModAPI.addEventListener('sendchatmessage', function(b) {
    if (b.message.startsWith('.key')) {
        b.preventDefault = true;
        if (b.message.substr(5) != '') {
            if (!isNaN(Number(b.message.substr(5)))) {
                keybind = Number(b.message.substr(5));
                ModAPI.displayToChat({msg: `§5[§dRainbow Mod§5] §bKeybind is now set to §6${keybind}`});
            }
        } else {
            ModAPI.displayToChat({msg: `§5[§dRainbow Mod§5] §6[§4ERROR§6] §cInvalid key, please use a keycode from the opened window!`});
            window.open('https://eaglerforge.github.io/apidocs/events/addEventListener.html');
        }
    }
});