(function EaglerOffhand() {
    ModAPI.meta.title("EaglerOffhand")
    ModAPI.meta.credits("By: MrNorshare")
    ModAPI.meta.description("Press f to use your offhand, \n You might need to change your binds \n in control settings!")
  ModAPI.require("player");
  const KeyboardConstantsClass = ModAPI.reflect.getClassByName("KeyboardConstants");
  
  var wrappedKeybinding = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.client.settings.KeyBinding").constructors[0](
    ModAPI.util.str("Offhand"),
    KeyboardConstantsClass.staticVariables.KEY_F,
    ModAPI.util.str("EaglerOffhand")
  ));
  ModAPI.mc.gameSettings.keyBindings.push(wrappedKeybinding.getRef());
  ModAPI.addEventListener("update", ()=>{
     if (wrappedKeybinding.isPressed()) { //on first press
         ModAPI.player.sendChatMessage(ModAPI.util.str("/offhand"));
     }
  });
})();