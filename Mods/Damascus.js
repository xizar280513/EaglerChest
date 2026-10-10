(function Damascus() {
    const flintHatchetTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAT1JREFUOE9jZKAQMOLTLy4u/h8m//LlS6xqcRoA0iwqKgrW/+XLF4bv378zpPvKMDTNOYuih6ABIM0g8PXrV4bySAWGkkmnCRsAsx2m+e/fvww/fvwAG/D1JwPD37//4C7B6gJkA0CaQSDFS4KBm52BoX7uNZiLwHrxegHmfxBdHKnBwMfFxLBg33eG169fM8ACFW8s1KUY/2dmZgLb/OnbP9INCLSR/K8ux8Ww89QrBl8HNYbe5TcYeHh44Lbj9YKvtfh/LnYmhpuPvjBcuPMZp0uxSniZCv2XEOdiOHz+DcPtpz/wehND0stc/L+9oSDDhkMvGI5f+4BXM4YXPExE/ivJ8DDsO/eG4cajLwQ1oxgQYC3x30Sdl2HtoRcM5/H4GT3vwG1Rl+X6z8jwn+HG4+9E2QwziCTF2HIuABqGgxEQsvKSAAAAAElFTkSuQmCC";

    // Mod metadata
    ModAPI.meta.title("Damascus");
    ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAMdJREFUOE9jZKAQMKLrn8rK+j/7928McVz2oCgEaQYpBBlArEF4bcpkZ/8//edPvGpwSoI06/z7x3CFiYkBnyE4wwBmAMhLIENAAJtBBF0g/x8cLAxbmZnBBqCHDVYDQLaDNGX8/MnwmIWFYSI7O8Pur1+xqsUq6MrN/b/n61ewZhBYxcLC8JyZGashOA3I//mT4RYvL8OTb9/AhlxmYSHeAJAGEwaG/4Lc3GDN779+ZTjDwEC8F0hJ3UQnWaKSMik2w9QOvAsAiQVQEU/ucD4AAAAASUVORK5CYIIA");
    ModAPI.meta.description("Adds a lot of content and stages to the game.");
    ModAPI.meta.credits("By OkLobster");

    // Item registration
    function ServersideItem() {
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
        var itemSuper = ModAPI.reflect.getSuper(itemClass, (x) => x.length === 1);
        var itemUseAnimation = ModAPI.reflect.getClassById("net.minecraft.item.EnumAction").staticVariables["NONE"];
        var itemGetAttributes = ModAPI.reflect.getClassById("net.minecraft.item.Item").methods.getItemAttributeModifiers.method;

        function CustomItem() {
            itemSuper(this);
            this.$maxStackSize = 1;
            this.$setMaxDamage(50);
            this.$setCreativeTab(ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabTools);
        }
        ModAPI.reflect.prototypeStack(itemClass, CustomItem);

        CustomItem.prototype.$getMaxItemUseDuration = function () {
            return 0;
        };
        CustomItem.prototype.$getItemUseAction = function () {
            return itemUseAnimation;
        };
        CustomItem.prototype.$onItemRightClick = function (itemstack, world, player) {
            return itemstack;
        };
        CustomItem.prototype.$getItemAttributeModifiers = function () {
            var attributeMap = itemGetAttributes.apply(this, []);
            try {
                const AttributeModifier = ModAPI.reflect.getClassByName("AttributeModifier").constructors.find(x => x.length === 4);
                const secretUUID = ModAPI.reflect.getClassByName("Item").staticVariables.itemModifierUUID;
                const modifier = AttributeModifier(secretUUID, ModAPI.util.str("Tool modifier"), 1.0, 0);
                attributeMap.$put(ModAPI.util.str("generic.attackDamage"), modifier);
                console.log("Applied attack damage modifier to Flint Hatchet");
            } catch (e) {
                console.error("Failed to apply attack damage modifier:", e);
            }
            return attributeMap;
        };
        CustomItem.prototype.$getStrVsBlock = function (itemstack, block) {
            return block.material === "wood" ? 2.0 : 1.0;
        };

        function internalReg() {
            var customItem = new CustomItem().$setUnlocalizedName(ModAPI.util.str("flint_hatchet"));
            itemClass.staticMethods.registerItem.method(
                ModAPI.keygen.item("flint_hatchet"),
                ModAPI.util.str("flint_hatchet"),
                customItem
            );
            ModAPI.items["flint_hatchet"] = customItem;
            console.log("Flint Hatchet registered with ID: damascus:flint_hatchet");
            return customItem;
        }

        if (ModAPI.items) {
            return internalReg();
        } else {
            ModAPI.addEventListener("bootstrap", internalReg);
        }
    }

    ModAPI.dedicatedServer.appendCode(ServersideItem);
    var customItem = ServersideItem();

    // Texture and model registration
    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("lib:asyncsink:registeritems", (renderItem) => {
            renderItem.registerItem(customItem, ModAPI.util.str("flint_hatchet"));
        });
        AsyncSink.L10N.set("item.flint_hatchet.name", "Flint Hatchet");
        AsyncSink.setFile(
            "resourcepacks/AsyncSinkLib/assets/minecraft/models/item/flint_hatchet.json",
            JSON.stringify({
                "parent": "builtin/generated",
                "textures": {
                    "layer0": "items/flint_hatchet"
                },
                "display": {
                    "thirdperson": {
                        "rotation": [-90, 0, 0],
                        "translation": [0, 1, -3],
                        "scale": [0.55, 0.55, 0.55]
                    },
                    "firstperson": {
                        "rotation": [0, -135, 25],
                        "translation": [0, 4, 2],
                        "scale": [1.7, 1.7, 1.7]
                    }
                }
            })
        );
        AsyncSink.setFile(
            "resourcepacks/AsyncSinkLib/assets/minecraft/textures/items/flint_hatchet.png",
            await (await fetch(flintHatchetTexture)).arrayBuffer()
        );
    });

    // Crafting recipe
    function registerRecipe() {
        function internalRegister() {
            var ObjectClass = ModAPI.reflect.getClassById("java.lang.Object").class;
            function ToChar(char) {
                return ModAPI.reflect.getClassById("java.lang.Character").staticMethods.valueOf.method(char[0].charCodeAt(0));
            }
            var resultItemArg = "item/flint_hatchet";
            var recipeLegend = {
                "F": { type: "item", id: "flint" },
                "S": { type: "item", id: "stick" },
                "Z": { type: "item", id: "string" }
            };
            var recipePattern = ["FF", "SZ"];
            var recipeInternal = [];
            Object.keys(recipeLegend).forEach((key) => {
                recipeInternal.push(ToChar(key));
                var ingredient = ModAPI.items[recipeLegend[key].id].getRef();
                recipeInternal.push(ingredient);
            });

            var recipeContents = recipePattern.map(row => ModAPI.util.str(row));
            var recipe = ModAPI.util.makeArray(ObjectClass, recipeContents.concat(recipeInternal));

            var itemStackFromItem = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[4];
            var resultItem = itemStackFromItem(ModAPI.items[resultItemArg.replace("item/", "")].getRef(), 1);

            var craftingManager = ModAPI.reflect.getClassById("net.minecraft.item.crafting.CraftingManager").staticMethods.getInstance.method();
            ModAPI.hooks.methods.nmic_CraftingManager_addRecipe(craftingManager, resultItem, recipe);
        }

        if (ModAPI.items) {
            internalRegister();
        } else {
            ModAPI.addEventListener("bootstrap", internalRegister);
        }
    }
    ModAPI.dedicatedServer.appendCode(registerRecipe);
    registerRecipe();

        function registerRecipe() {
        function internalRegister() {
            var ObjectClass = ModAPI.reflect.getClassById("java.lang.Object").class;
            function ToChar(char) {
                return ModAPI.reflect.getClassById("java.lang.Character").staticMethods.valueOf.method(char[0].charCodeAt(0));
            }
            var resultItemArg = "item/air";
            var recipeLegend = {
                "W": { type: "item", id: "planks" },
                "S": { type: "item", id: "stick" },
            };
            var recipePattern = [" WW", " SW", " S "];
            var recipeInternal = [];
            Object.keys(recipeLegend).forEach((key) => {
                recipeInternal.push(ToChar(key));
                var ingredient = ModAPI.items[recipeLegend[key].id].getRef();
                recipeInternal.push(ingredient);
            });

            var recipeContents = recipePattern.map(row => ModAPI.util.str(row));
            var recipe = ModAPI.util.makeArray(ObjectClass, recipeContents.concat(recipeInternal));

            var itemStackFromItem = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[4];
            var resultItem = itemStackFromItem(ModAPI.items[resultItemArg.replace("item/", "")].getRef(), 1);

            var craftingManager = ModAPI.reflect.getClassById("net.minecraft.item.crafting.CraftingManager").staticMethods.getInstance.method();
            ModAPI.hooks.methods.nmic_CraftingManager_addRecipe(craftingManager, resultItem, recipe);
        }

        if (ModAPI.items) {
            internalRegister();
        } else {
            ModAPI.addEventListener("bootstrap", internalRegister);
        }
    }
    ModAPI.dedicatedServer.appendCode(registerRecipe);
    registerRecipe();
        // Set harvest level for wood blocks
    function setWoodHarvestLevel() {
        function internalSetHarvestLevel() {
            const blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
            const setHarvestLevelMethod = blockClass.methods.setHarvestLevel.find(m => m.parameterCount === 2);

            const woodBlocks = [
                "minecraft:log",      // Oak, Spruce, Birch, Jungle
                "minecraft:log2",     // Acacia, Dark Oak
                "minecraft:planks"    // All plank variants
            ];

            woodBlocks.forEach(blockId => {
                const block = ModAPI.blocks[blockId];
                if (block) {
                    try {
                        setHarvestLevelMethod.method.apply(block.getRef(), [ModAPI.util.str("axe"), 1]);
                        console.log(`Set harvest level to 1 for ${blockId}`);
                    } catch (e) {
                        console.error(`Failed to set harvest level for ${blockId}:`, e);
                    }
                } else {
                    console.warn(`Block ${blockId} not found`);
                }
            });
        }

        if (ModAPI.blocks) {
            internalSetHarvestLevel();
        } else {
            ModAPI.addEventListener("bootstrap", internalSetHarvestLevel);
        }
    }
    ModAPI.dedicatedServer.appendCode(setWoodHarvestLevel);
    setWoodHarvestLevel();
})();
