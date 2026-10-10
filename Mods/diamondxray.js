//Coalest xray mod to ever exist!

//IIFE. I like scoped variables.
(function () {
    var targets = ["diamond_block","diamond_ore"]; //The target blocks
    var allblocks = Object.keys(ModAPI.blocks); //List of all block IDsw
    function update() {
      allblocks.forEach(block=>{ //Loop through all the blocks
        if (targets.includes(block)) { //If it is in the targets list, force it to render.
          ModAPI.blocks[block].forceRender = true;
          ModAPI.blocks[block].reload(); //Push the changes.
        } else if (ModAPI.blocks[block] && ("noRender" in ModAPI.blocks[block])) { //Otherwise, if it is a valid block, and can be set to not render, do so.
          ModAPI.blocks[block].noRender = true;
          ModAPI.blocks[block].reload(); //Push the changes.
        }
      });
    }
    update(); //Trigger the coal xray.
  })();
