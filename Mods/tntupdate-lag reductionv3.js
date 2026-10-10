// PvPBoost1122 - PvP FPS Mod (TNT + Crystal Optimized)
// Eaglercraft 1.12.2 | EaglerForge
// Toggle: F7 | HUD: Bottom-left

let enabled = true;

function mc() {
    return ModAPI.minecraft();
}

// ================== SETTINGS ==================

function applyPvPOptimizations() {
    const m = mc();
    if (!m || !m.gameSettings) return;

    const gs = m.gameSettings;

    gs.fancyGraphics = false;
    gs.renderDistanceChunks = 3;
    gs.enableVsync = false;
    gs.clouds = 0;
    gs.particleSetting = 2; // MINIMAL
    gs.mipmapLevels = 0;
    gs.useVbo = false;
    gs.viewBobbing = false;
    gs.ambientOcclusion = 0;
    gs.entityShadows = false;

    gs.soundLevels["ambient"] = 0;
    gs.soundLevels["weather"] = 0;
    gs.soundLevels["hostile"] = 0;

    gs.gammaSetting = 1.5;
}

// ================== ENTITY KILL ==================

function disableMobAnimations() {
    const m = mc();
    if (!m || !m.world) return;

    const list = m.world.loadedEntityList;
    if (!list) return;

    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e) continue;

        // Skip players
        if (e.isPlayer && e.isPlayer()) continue;

        // Generic mob animation kill
        e.hurtTime = 0;
        e.maxHurtTime = 0;
        e.limbSwing = 0;
        e.limbSwingAmount = 0;
        e.swingProgress = 0;
        e.prevSwingProgress = 0;

        // ===== TNT =====
        if (e.getClass && e.getClass().getSimpleName() === "EntityTNTPrimed") {
            e.fuse = Math.min(e.fuse, 2); // shorten visual lifetime
            e.motionX = 0;
            e.motionY = 0;
            e.motionZ = 0;
        }

        // ===== END CRYSTALS =====
        if (e.getClass && e.getClass().getSimpleName() === "EntityEnderCrystal") {
            e.innerRotation = 0;
            e.rotationYaw = 0;
            e.rotationPitch = 0;
            e.setInvisible && e.setInvisible(true);
        }
    }
}

// ================== EXPLOSION / PARTICLES ==================

function suppressExplosions() {
    const m = mc();
    if (!m || !m.effectRenderer) return;

    // Clear explosion & large particle queues
    m.effectRenderer.fxLayers[0].length = 0;
    m.effectRenderer.fxLayers[1].length = 0;
    m.effectRenderer.fxLayers[2].length = 0;
    m.effectRenderer.fxLayers[3].length = 0;
}

// ================== HUD ==================

function drawStatusHUD() {
    const m = mc();
    if (!m || !m.fontRendererObj || !m.ingameGUI) return;

    const fr = m.fontRendererObj;
    const sr = m.ingameGUI.getScaledResolution();

    const text = enabled ? "1" : "0";
    const color = enabled ? 0xFFFFFF : 0x777777;

    fr.drawStringWithShadow(
        text,
        2,
        sr.getScaledHeight() - 10,
        color
    );
}

// ================== EVENTS ==================

ModAPI.addEventListener("key", function(e) {
    if (e.key === "F7") {
        enabled = !enabled;
        if (!enabled) return;
        applyPvPOptimizations();
    }
});

ModAPI.addEventListener("tick", function() {
    if (!enabled) return;
    applyPvPOptimizations();
    disableMobAnimations();
    suppressExplosions();
});

ModAPI.addEventListener("render", function() {
    drawStatusHUD();
});

ModAPI.addEventListener("load", function() {
    applyPvPOptimizations();
});
