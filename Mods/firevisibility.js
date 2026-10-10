// TinyCornerFire.js
// Displays small fire icons in screen corners instead of full overlay
// Eaglercraft 1.12.2 | EaglerForge

let enabled = true;

function mc() {
    return ModAPI.minecraft();
}

// ================= FIRE SUPPRESSION =================
function suppressFullScreenFire() {
    const m = mc();
    if (!m || !m.thePlayer) return;

    // Prevent full-screen overlay
    m.thePlayer.remainingFireTicks = Math.min(
        m.thePlayer.remainingFireTicks,
        1
    );
}

// ================= CORNER FLAME RENDER =================
function drawCornerFire() {
    const m = mc();
    if (!m || !m.fontRendererObj || !m.ingameGUI) return;

    if (m.thePlayer.isBurning && m.thePlayer.remainingFireTicks > 0) {
        const fr = m.fontRendererObj;
        const sr = m.ingameGUI.getScaledResolution();
        const text = "🔥"; // small flame emoji / icon
        const size = 8; // font size multiplier

        // Draw tiny flames in each corner
        fr.drawStringWithShadow(text, 2, 2, 0xFF5500); // top-left
        fr.drawStringWithShadow(text, sr.getScaledWidth() - 10, 2, 0xFF5500); // top-right
        fr.drawStringWithShadow(text, 2, sr.getScaledHeight() - 10, 0xFF5500); // bottom-left
        fr.drawStringWithShadow(text, sr.getScaledWidth() - 10, sr.getScaledHeight() - 10, 0xFF5500); // bottom-right
    }
}

// ================= TOGGLE KEY =================
ModAPI.addEventListener("key", function(e) {
    if (e.key === "F6") {
        enabled = !enabled;
        console.log("[TinyCornerFire] " + (enabled ? "ON" : "OFF"));
    }
});

// ================= LOOP =================
ModAPI.addEventListener("tick", function() {
    if (!enabled) return;
    suppressFullScreenFire();
});

ModAPI.addEventListener("render", function() {
    if (!enabled) return;
    drawCornerFire();
});
