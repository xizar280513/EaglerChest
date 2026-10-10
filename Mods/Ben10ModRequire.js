// Ben 10 Omnitrix (AlienEVO-style) for Eaglercraft 1.8.8 (EaglerForge)
//
// Controls:
//  J           = Open/Close Omnitrix dial (vertical list)
//  Mouse wheel = Scroll aliens on current wheel
//  Left click  = Slam (transform into selected alien)
//  Right click = Switch wheel (1: Heatblast–Ghostfreak, 2: Cannonbolt–Way Big)
//
// Mechanics:
//  - 19 classic aliens (Heatblast -> Way Big)
//  - 8.5 minute max transform duration
//  - 10 minute cooldown after reverting
//  - Omnitrix appears on wrist (armor-based model)
//  - Green overlay while transformed
//  - Slam flash + spinning Omnitrix core when dial open

// -------------------- ALIEN WHEELS --------------------

const WHEEL_1 = [
    "Heatblast",
    "Wildmutt",
    "Diamondhead",
    "XLR8",
    "Grey Matter",
    "Four Arms",
    "Stinkfly",
    "Ripjaws",
    "Upgrade",
    "Ghostfreak"
];

const WHEEL_2 = [
    "Cannonbolt",
    "Wildvine",
    "Blitzwolfer",
    "Snare-Oh",
    "Frankenstrike",
    "Upchuck",
    "Ditto",
    "Eye Guy",
    "Way Big"
];

let currentWheel = 1;
let selectedIndex = 0;
let dialOpen = false;

let currentAlien = null;
let transformed = false;

// times in ms
const TRANSFORM_DURATION = 8.5 * 60 * 1000; // 8.5 minutes
const COOLDOWN_DURATION  = 10 * 60 * 1000;  // 10 minutes

let transformStartTime = 0;
let lastTransformEndTime = 0;

// visual slam flash
let slamFlash = 0;

// -------------------- HELPERS --------------------

function getCurrentWheelArray() {
    return currentWheel === 1 ? WHEEL_1 : WHEEL_2;
}

function getSelectedAlien() {
    return getCurrentWheelArray()[selectedIndex];
}

function canTransformNow() {
    const now = Date.now();
    if (transformed) return false;
    if (lastTransformEndTime === 0) return true;
    return (now - lastTransformEndTime) >= COOLDOWN_DURATION;
}

function openDial() {
    dialOpen = true;
    showOmnitrixOnWrist();
}

function closeDial() {
    dialOpen = false;
    // you can choose to keep it visible or hide it here
    // hideOmnitrixFromWrist();
}

// -------------------- TRANSFORM FLOW --------------------

function startTransform(alienName) {
    if (!canTransformNow()) {
        ModAPI.displayToChat({msg: "§c[Omnitrix] Cooling down..."});
        return;
    }

    transformed = true;
    currentAlien = alienName;
    transformStartTime = Date.now();

    ModAPI.displayToChat({msg: "§a[Omnitrix] Morph: §f" + alienName});
    ModAPI.playSound("random.orb", 1.0, 1.0);

    slamFlash = 8;
    showOmnitrixOnWrist();
    applyAlienModel(alienName);
    applyAlienForm(alienName);
}

function endTransform() {
    if (!transformed) return;

    transformed = false;
    lastTransformEndTime = Date.now();

    ModAPI.displayToChat({msg: "§c[Omnitrix] Time's up. Reverting."});
    ModAPI.playSound("random.fizz", 1.0, 1.0);

    removeAlienModel();
    clearAlienForm();
    currentAlien = null;

    // keep Omnitrix visible on wrist after revert (AlienEVO vibe)
    showOmnitrixOnWrist();
}

// -------------------- OMNITRIX WRIST MODEL --------------------

function showOmnitrixOnWrist() {
    // These texture names must exist in your resource pack:
    // assets/minecraft/textures/models/armor/omnitrix_layer_1.png
    // assets/minecraft/textures/models/armor/omnitrix_layer_2.png
    //
    // Exact API may differ; adapt to your ModAPI version.
    try {
        ModAPI.player.setArmorTexture("body", "ben10/omnitrix_layer_1");
        ModAPI.player.setArmorTexture("legs", "ben10/omnitrix_layer_2");
    } catch (e) {
        // ignore if not supported
    }
}

function hideOmnitrixFromWrist() {
    try {
        ModAPI.player.resetArmorTextures();
    } catch (e) {
        // ignore if not supported
    }
}

// -------------------- ALIEN MODELS --------------------

function applyAlienModel(alienName) {
    // Each alien uses armor-based models:
    // assets/minecraft/textures/models/armor/ben10_<alien>_layer_1.png
    // assets/minecraft/textures/models/armor/ben10_<alien>_layer_2.png
    //
    // Use lowercase + no spaces for file names (you can adjust mapping below).

    const key = alienName.toLowerCase().replace(" ", "").replace("-", "");

    const tex1 = "ben10/ben10_" + key + "_layer_1";
    const tex2 = "ben10/ben10_" + key + "_layer_2";

    try {
        ModAPI.player.setArmorTexture("body", tex1);
        ModAPI.player.setArmorTexture("legs", tex2);
    } catch (e) {
        // fallback: keep Omnitrix only
        showOmnitrixOnWrist();
    }
}

function removeAlienModel() {
    // Reset to Omnitrix-only or default
    showOmnitrixOnWrist();
}

// -------------------- ALIEN FORMS / ABILITIES --------------------

function applyAlienForm(alienName) {
    clearAlienForm();

    // Baseline example; you can tune values to your liking.
    switch (alienName) {
        case "Heatblast":
            // Fire immunity, flame aura
            // ModAPI.player.setFireImmunity(true);
            break;

        case "Wildmutt":
            // Night vision, jump boost
            break;

        case "Diamondhead":
            // Resistance, armor
            break;

        case "XLR8":
            // High speed
            // ModAPI.player.setSpeed(1.8);
            break;

        case "Grey Matter":
            // Small, agile (simulate with jump + speed)
            break;

        case "Four Arms":
            // Strength, knockback
            // ModAPI.player.setStrength(3.0);
            break;

        case "Stinkfly":
            // Slow fall, poison spit (projectile hook)
            break;

        case "Ripjaws":
            // Water breathing, swim speed
            break;

        case "Upgrade":
            // Speed + armor, maybe special interaction with blocks
            break;

        case "Ghostfreak":
            // Invisibility, night vision
            break;

        case "Cannonbolt":
            // Roll mode (speed + collision damage)
            break;

        case "Wildvine":
            // Regeneration, vine whip
            break;

        case "Blitzwolfer":
            // Sonic howl (AoE knockback)
            break;

        case "Snare-Oh":
            // Slow enemies, jump boost
            break;

        case "Frankenstrike":
            // Strength, lightning ability
            break;

        case "Upchuck":
            // Eat items -> temporary strength (you can hook into inventory)
            break;

        case "Ditto":
            // Clone effect (visual copies)
            break;

        case "Eye Guy":
            // Laser beam (projectile)
            break;

        case "Way Big":
            // Massive strength, shockwave stomp
            break;
    }
}

function clearAlienForm() {
    // Reset stats/effects to human baseline
    try {
        // ModAPI.player.setSpeed(1.0);
        // ModAPI.player.setStrength(1.0);
        // ModAPI.player.setFireImmunity(false);
        // ModAPI.player.clearPotionEffects();
    } catch (e) {
        // ignore if not supported
    }
}

function tickAlienForm(alienName) {
    // Continuous per-form effects (particles, overlays, etc.)
    switch (alienName) {
        case "Heatblast":
            // Example: flame particles
            // ModAPI.spawnParticle("flame", ModAPI.player.getX(), ModAPI.player.getY(), ModAPI.player.getZ());
            break;

        case "XLR8":
            // Maintain speed, maybe subtle motion effect
            break;

        case "Ghostfreak":
            // Keep invisibility, spooky particles
            break;

        case "Way Big":
            // Occasional shockwave dust
            break;

        // Add more per-alien tick logic as you like
    }
}

// -------------------- INIT --------------------

ModAPI.addEventListener("init", () => {
    ModAPI.displayToChat({msg: "§aBen 10 Omnitrix (AlienEVO-style) loaded. Press J."});
    showOmnitrixOnWrist();
});

// -------------------- INPUT: KEYS & MOUSE --------------------

ModAPI.addKeyBind("Open Omnitrix", "key.keyboard.j", () => {
    if (dialOpen) {
        closeDial();
    } else {
        openDial();
    }
});

ModAPI.addEventListener("mouseScroll", (event) => {
    if (!dialOpen) return;

    const delta = event.delta;
    const wheel = getCurrentWheelArray();

    if (delta > 0) {
        selectedIndex = (selectedIndex + 1) % wheel.length;
    } else if (delta < 0) {
        selectedIndex = (selectedIndex - 1 + wheel.length) % wheel.length;
    }

    ModAPI.playSound("random.click", 1.0, 1.5);
});

ModAPI.addEventListener("mouseClick", (event) => {
    if (!dialOpen) return;

    // Left click = slam / transform
    if (event.button === 0) {
        const alien = getSelectedAlien();
        if (!canTransformNow()) {
            ModAPI.displayToChat({msg: "§c[Omnitrix] Still cooling down..."});
            return;
        }
        closeDial();
        startTransform(alien);
    }

    // Right click = switch wheel
    if (event.button === 1 || event.button === 2) {
        currentWheel = (currentWheel === 1 ? 2 : 1);
        selectedIndex = 0;
        ModAPI.playSound("random.orb", 1.0, 2.0);
        ModAPI.displayToChat({msg: "§a[Omnitrix] Wheel " + currentWheel});
    }
});

// -------------------- UPDATE LOOP --------------------

ModAPI.addEventListener("update", () => {
    const now = Date.now();

    // Handle timeout
    if (transformed && (now - transformStartTime) >= TRANSFORM_DURATION) {
        endTransform();
    }

    // Per-form tick
    if (transformed && currentAlien !== null) {
        tickAlienForm(currentAlien);
    }

    // Decay slam flash
    if (slamFlash > 0) slamFlash--;
});

// -------------------- RENDER: OVERLAY, DIAL, CORE, COOLDOWN --------------------

ModAPI.addEventListener("renderOverlay", () => {
    const sw = ModAPI.getScreenWidth();
    const sh = ModAPI.getScreenHeight();

    // Green overlay when transformed
    if (transformed) {
        ModAPI.drawRect(0, 0, sw, sh, 0x2200FF00);
    }

    // Slam flash
    if (slamFlash > 0) {
        ModAPI.drawRect(0, 0, sw, sh, 0x44A0FF00);
    }

    // Omnitrix dial UI (vertical list)
    if (dialOpen) {
        const centerX = sw / 2;
        const centerY = sh / 2;
        const width = 180;
        const height = 200;

        // Background
        ModAPI.drawRect(centerX - width/2, centerY - height/2, centerX + width/2, centerY + height/2, 0xCC001100);

        const wheel = getCurrentWheelArray();

        // Title
        ModAPI.drawString("§aOMNITRIX - WHEEL " + currentWheel, centerX - width/2 + 8, centerY - height/2 + 8, 0x00FF00);

        // Spinning Omnitrix core above list
        const t = (Date.now() % 1000) / 1000;
        const angle = t * 360;
        try {
            // Requires texture: assets/minecraft/textures/gui/ben10_omnitrix_core.png
            ModAPI.drawRotatedTexture("ben10/ben10_omnitrix_core",
                centerX - 16, centerY - height/2 + 24, 32, 32, angle);
        } catch (e) {
            // ignore if not supported
        }

        // List aliens
        let y = centerY - height/2 + 60;
        for (let i = 0; i < wheel.length; i++) {
            const name = wheel[i];
            const selected = (i === selectedIndex);
            const color = selected ? 0x00FF00 : 0xFFFFFF;
            const prefix = selected ? "> " : "  ";
            ModAPI.drawString(prefix + name, centerX - width/2 + 16, y, color);
            y += 10;
        }

        // Instructions
        ModAPI.drawString("Scroll: Select  |  L-Click: Slam  |  R-Click: Wheel",
            centerX - width/2 + 8, centerY + height/2 - 16, 0xAAAAAA);
    }

    // Cooldown indicator
    if (!transformed && lastTransformEndTime !== 0) {
        const now = Date.now();
        const elapsed = now - lastTransformEndTime;
        if (elapsed < COOLDOWN_DURATION) {
            const remaining = Math.ceil((COOLDOWN_DURATION - elapsed) / 1000);
            const text = "Omnitrix cooldown: " + remaining + "s";
            ModAPI.drawString(text, 8, sh - 20, 0xFF5555);
        }
    }
});
