var blockKeys = Object.keys(PluginAPI.blocks);
blockKeys.forEach(key=>{
   if(PluginAPI?.blocks?.[key]?.slipperiness) {// TeaVM likes to add metadata properties which are `null` or `undefined`
      PluginAPI.blocks[key].slipperiness = 0.98; //Ice slipperiness value.
      PluginAPI.blocks[key].reload(); //The new method, `PluginAPI.updateComponent` is obsolete now.
   }
});
