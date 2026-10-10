ModAPI.require("player");
ModAPI.require("settings");
let playerFound = false;

function checkForGame() {
    if (typeof ModAPI.player !== 'undefined') {
        playerFound = true;
    } else {
        console.log('Player doesn\'t exist yet, please join a server or singleplayer world...');
    }
}

checkForGame();

const intervalId = setInterval(() => {
    if (playerFound) {
        clearInterval(intervalId); // Stop the interval
        ModAPI.displayToChat({msg: "§5StatsHud is now loading"})
        initializeHud();
    } else {
        checkForGame();
    }
}, 1000);

function initializeHud() {
        setTimeout(async function () {
            const url_to_font_name =
                "https://raw.githubusercontent.com/AstralisLLC/fonts/main/PressStart2P.ttf";
            const font_name = new FontFace("pressStart", `url(${url_to_font_name})`);
            await font_name.load();
            document.fonts.add(font_name);

            // PLACE CODE HERE



    }, 1500);

}

// §