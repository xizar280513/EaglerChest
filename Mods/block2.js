PluginAPI.require("player");
PluginAPI.addEventListener("update", () => {
	var mx = PluginAPI.player.x;
	var my = PluginAPI.player.y;
	var mz = PluginAPI.player.z;
	PluginAPI.displayToChat({ msg: "the amount of air blocks under you:" + PluginAPI.player.fallHeight + "." });
});