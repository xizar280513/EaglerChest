// Ancient Sword Mod
(function AncientSwordMod() {

    ModAPI.meta.title("Ancient Sword");
    ModAPI.meta.description("Adds a mystical Ancient Sword with a unique recipe");
    ModAPI.meta.credits("By You");
    ModAPI.meta.version("v1.2");

    function registerItem() {
        console.log("Registering Ancient Sword...");

        LibCustomItems.registerItem({
            tag: "mymod:ancient_sword",
            base: "diamond_sword",
            name: "Ancient Sword",
            qty: 1,
            useRecipe: true,

            recipe: [
                " O ",
                " G ",
                " S "
            ],

            recipeLegend: {
                "O": { type: "block", id: "obsidian" },
                "G": { type: "item", id: "gold_ingot" },
                "S": { type: "item", id: "stick" }
            },

            onRightClickGround: `/*/user, world, itemstack, blockpos/*/
                var newHealth = user.getHealth() + 2;
                if(newHealth > 20) newHealth = 20;
                user.setHealth(newHealth);
                return false;
            `
        });

        console.log("Ancient Sword registered!");
    }

    // 🔥 THIS IS THE FIX
    if (typeof LibCustomItems !== "undefined") {
        // Library already loaded
        registerItem();
    } else {
        // Wait for it
        ModAPI.addEventListener("lib:libcustomitems:loaded", registerItem);
    }

})();
