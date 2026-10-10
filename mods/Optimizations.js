ModAPI.require("settings")
ModAPI.require("player")

setTimeout(function() {

    ModAPI.settings.clouds = 0
    ModAPI.settings.particleSetting = 2
    ModAPI.settings.mipmapLevels = 0
    ModAPI.settings.renderDistanceChunks = 2
    ModAPI.settings.reload()
    
}, 500);