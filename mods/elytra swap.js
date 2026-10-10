// hotkey-swap.js
// Eaglercraft / EaglerForge 1.12 client-side hotkey swap: chestplate <-> elytra
// Keybind: O
// Author: ChatGPT

(function() {
    // Config
    const HOTKEY = 79; // O key
    const CHEST_SLOT = 6; // Player inventory slot for chest armor in slot.armor.chest
    let isKeyDown = false;

    // Helper function: find item in inventory
    function findItem(player, itemName) {
        for (let i = 0; i < player.inventory.main.length; i++) {
            let stack = player.inventory.main[i];
            if (stack && stack.item && stack.item.name === itemName) {
                return i;
            }
        }
        return -1;
    }

    // Swap function
    function swapElytraChest() {
        let player = mc.thePlayer;
        if (!player) return;

        let chestStack = player.inventory.armor[2]; // Chestplate slot
        let elytraSlot = findItem(player, "minecraft:elytra");

        // Refuse swap if inventory full or elytra not found
        if (elytraSlot === -1 && chestStack == null) return;

        if (chestStack && elytraSlot !== -1) {
            // Swap chestplate and elytra
            let temp = player.inventory.armor[2];
            player.inventory.armor[2] = player.inventory.main[elytraSlot];
            player.inventory.main[elytraSlot] = temp;
            mc.thePlayer.playSound("random.pop", 1, 1);
        } else if (chestStack == null && elytraSlot !== -1) {
            // Equip elytra if no chestplate
            player.inventory.armor[2] = player.inventory.main[elytraSlot];
            player.inventory.main[elytraSlot] = null;
            mc.thePlayer.playSound("random.pop", 1, 1);
        } else if (chestStack && elytraSlot === -1) {
            // Inventory full, refuse swap
            mc.thePlayer.addChatMessage("§cSwap refused: No empty slot for chestplate!");
        }
    }

    // Key listener
    mc.gameSettings.keyBindForward.keyPressEvents.push(function(event) {
        if (event.keyCode === HOTKEY && !isKeyDown) {
            swapElytraChest();
            isKeyDown = true;
        }
    });

    window.addEventListener("keyup", function(e) {
        if (e.keyCode === HOTKEY) isKeyDown = false;
    });

    console.log("Hotkey swap mod loaded: Press 'O' to swap chestplate and elytra.");
})();
