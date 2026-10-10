ModAPI.require("player");

var givenBook = false;

ModAPI.addEventListener("update", function () {
    if (givenBook || !ModAPI.player) {
        return;
    }

    givenBook = true;

    try {
        var itemStackClass = ModAPI.reflect.getClassByName("ItemStack");
        var constructor = itemStackClass.getConstructorByArgs("itemIn", "amount");

        var book = constructor(
            ModAPI.items["book"].getRef(),
            1
        );

        ModAPI.player.inventory.addItemStackToInventory(book);

        ModAPI.displayToChat("§6[STALKER] §fYou found a book.");
    } catch (e) {
        console.error("[STALKER] ERROR:", e);
        ModAPI.displayToChat("§c[STALKER] Item creation failed.");
    }
});
