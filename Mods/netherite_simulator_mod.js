// EaglerForge Netherite Simulator Mod
// This client-side script modifies diamond items to look and feel like Netherite.

ModAPI.addEventListener("update", () => {
    // 1. Rename Held Item if it is Diamond Gear
    if (ModAPI.player && ModAPI.player.getCurrentEquippedItem()) {
        let item = ModAPI.player.getCurrentEquippedItem();
        let unlocalizedName = item.getUnlocalizedName() || "";
        
        if (unlocalizedName.includes("diamond")) {
            // Apply custom lore/display name simulation via chat notification on first hold
            if (!item._netherite_named) {
                ModAPI.displayToChat({
                    msg: "§8[Netherite Mod] §7Your Diamond tool is now infused with §5Netherite§7!"
                });
                item._netherite_named = true;
            }
        }
    }
});

ModAPI.addEventListener("drawscreen", () => {
    // 2. HUD Overlay showing Netherite Status
    let hasDiamondHelmet = false;
    let hasDiamondChest = false;
    let hasDiamondLegs = false;
    let hasDiamondBoots = false;
    
    // Check inventory armor slots if accessible via ModAPI structure
    if (ModAPI.player && ModAPI.player.inventory && ModAPI.player.inventory.armorInventory) {
        let armor = ModAPI.player.inventory.armorInventory;
        if (armor[3] && armor[3].getUnlocalizedName().includes("diamond")) hasDiamondHelmet = true;
        if (armor[2] && armor[2].getUnlocalizedName().includes("diamond")) hasDiamondChest = true;
        if (armor[1] && armor[1].getUnlocalizedName().includes("diamond")) hasDiamondLegs = true;
        if (armor[0] && armor[0].getUnlocalizedName().includes("diamond")) hasDiamondBoots = true;
    }

    if (hasDiamondHelmet || hasDiamondChest || hasDiamondLegs || hasDiamondBoots) {
        ModAPI.drawString({
            text: "§5§lNETHERITE BUFF ACTIVE",
            x: 10,
            y: 25,
            color: 0xAA00AA
        });
    }
});
