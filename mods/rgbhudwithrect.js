ModAPI.require("settings")
ModAPI.settings.hud24h = false
ModAPI.settings.hudCoords = false
ModAPI.settings.hudFps = false
ModAPI.settings.hudPlayer = false
ModAPI.settings.hudStats = false
ModAPI.settings.hudWorld = false
ModAPI.settings.reload();

function getRainbow(seconds, saturation, brightness) {
    var hue = (Date.now() % (seconds * 1000)) / (seconds * 1000);
    var color = HSBtoRGB(hue, saturation, brightness);
    return color;
}

function HSBtoRGB(hue, saturation, brightness) {
    var r = 0, g = 0, b = 0;
    if (saturation == 0) {
        r = g = b = Math.round(brightness * 255.0);
    } else {
        var h = (hue - Math.floor(hue)) * 6.0;
        var f = h - Math.floor(h);
        var p = brightness * (1.0 - saturation);
        var q = brightness * (1.0 - saturation * f);
        var t = brightness * (1.0 - (saturation * (1.0 - f)));
        switch (Math.floor(h)) {
            case 0:
                r = Math.round(brightness * 255.0);
                g = Math.round(t * 255.0);
                b = Math.round(p * 255.0);
                break;
            case 1:
                r = Math.round(q * 255.0);
                g = Math.round(brightness * 255.0);
                b = Math.round(p * 255.0);
                break;
            case 2:
                r = Math.round(p * 255.0);
                g = Math.round(brightness * 255.0);
                b = Math.round(t * 255.0);
                break;
            case 3:
                r = Math.round(p * 255.0);
                g = Math.round(q * 255.0);
                b = Math.round(brightness * 255.0);
                break;
            case 4:
                r = Math.round(t * 255.0);
                g = Math.round(p * 255.0);
                b = Math.round(brightness * 255.0);
                break;
            case 5:
                r = Math.round(brightness * 255.0);
                g = Math.round(p * 255.0);
                b = Math.round(q * 255.0);
                break;
        }
    }
    return 0xff000000 | (r << 16) | (g << 8) | (b << 0);
}

function drawRainbowStringWithShadow(msg, x, y) {
    var seconds = 5;
    var saturation = 1.0;
    var brightness = 1.0;

    var rainbowColor = getRainbow(seconds, saturation, brightness);

    ModAPI.drawStringWithShadow({msg: msg, x: x, y: y, color: rainbowColor});
}

function drawrect(rectleft, recttop, rectright, rectbottom, rectcolor){
    ModAPI.drawRect({left: rectleft, top: recttop, right: rectright, bottom: rectbottom, color: rectcolor})
}

function drawRectBehindScaledText(text, x, y, scale) {
    var scaledTextWidth = ModAPI.getStringWidth({string: text}) * scale;
    var scaledTextHeight = ModAPI.getFONT_HEIGHT() * scale;

    var paddingX = 4 * scale;
    var paddingY = 2 * scale;

    var rectLeft = x - paddingX;
    var rectTop = y - paddingY;
    var rectRight = x + scaledTextWidth + paddingX;
    var rectBottom = y + scaledTextHeight + paddingY;

    var darkGrayColor = 0x80000000;

    drawrect(rectLeft, rectTop, rectRight, rectBottom, darkGrayColor);
}


ModAPI.addEventListener("frame", function() {
    let sr = ModAPI.ScaledResolution
    let gsm = ModAPI.GlStateManager
    drawRectBehindScaledText("cool client b1", 4, 4, 1.5);
    gsm.pushMatrix();
    gsm.translate ({x: 4, y: 4, z: 0});
    gsm.scale({x: 1.5, y: 1.5, z: 1});
    gsm.translate({x: -4, y: -4, z: 0});
    drawRainbowStringWithShadow("cool client b1", 4, 4);
    gsm.popMatrix();
});
