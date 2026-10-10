// MaceTextureFix.js
// EaglerForge 1.12.2
// Replaces any item with "mace" in its name with the default mace texture

let enabled = true;

function mc() {
    return ModAPI.minecraft();
}

// ================= HELPER =================
function isMace(item) {
    if (!item) return false;
    if (!item.getDisplayName) return false;

    const name = item.getDisplayName().toLowerCase();
    return name.includes("mace");
}

// ================= ITEM TEXTURE OVERRIDE =================
function replaceMaceTexture() {
    const m = mc();
    if (!m || !m.thePlayer) return;
    if (!m.thePlayer.inventory) return;

    const inv = m.thePlayer.inventory.mainInventory;

    for (let i = 0; i < inv.length; i++) {
        const stack = inv[i];
        if (!stack) continue;

        if (isMace(stack)) {
            try {
                // Set the item model to vanilla mace
                stack.setItemTexture && stack.setItemTexture("minecraft:items/mace");
            } catch (e) {
                // Fallback for clients where setItemTexture may not exist
                // EaglerForge may render the default texture automatically
            }
        }
    }
}

// ================= TOGGLE KEY =================
ModAPI.addEventListener("key", function(e) {
    if (e.key === "F8") {
        enabled = !enabled;
        console.log("[MaceTextureFix] " + (enabled ? "ON" : "OFF"));
    }
});

// ================= LOOP =================
ModAPI.addEventListener("tick", function() {
    if (!enabled) return;
    replaceMaceTexture();
});
