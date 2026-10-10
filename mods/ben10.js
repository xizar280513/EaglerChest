// Ben 10 Mod for Eaglercraft (EaglerForge)
// Omnitrix transformation system

let currentAlien = null;
let aliens = ["Heatblast", "Four Arms", "XLR8", "Diamondhead", "Ghostfreak"];
let index = 0;

ModAPI.addEventListener("init", () => {
    ModAPI.displayToChat({msg: "§aBen 10 Mod Loaded! Press O to transform."});
});

// Keybind: cycle aliens
ModAPI.addKeyBind("Next Alien", "key.keyboard.p", () => {
    index = (index + 1) % aliens.length;
    ModAPI.displayToChat({msg: "§a[Omnitrix] Selected: §f" + aliens[index]});
});

// Keybind: transform
ModAPI.addKeyBind("Transform", "key.keyboard.o", () => {
    if(currentAlien === null){
        currentAlien = aliens[index];
        ModAPI.displayToChat({msg: "§a[Omnitrix] Transforming into §f" + currentAlien});
        ModAPI.playSound("random.orb", 1.0, 1.0);
    } else {
        ModAPI.displayToChat({msg: "§c[Omnitrix] Reverting to human form"});
        ModAPI.playSound("random.fizz", 1.0, 1.0);
        currentAlien = null;
    }
});

// Apply alien abilities
ModAPI.addEventListener("update", () => {
    if(currentAlien === "XLR8"){
        ModAPI.player.setSpeed(1.5);
    }
    if(currentAlien === "Four Arms"){
        ModAPI.player.setStrength(3);
    }
    if(currentAlien === "Heatblast"){
        ModAPI.spawnParticle("flame", ModAPI.player.getX(), ModAPI.player.getY(), ModAPI.player.getZ());
    }
});

// Green Omnitrix overlay
ModAPI.addEventListener("renderOverlay", () => {
    if(currentAlien !== null){
        ModAPI.drawRect(0, 0, ModAPI.getScreenWidth(), ModAPI.getScreenHeight(), 0x3300FF00);
    }
});
