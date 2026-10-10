function initializeGUI() {

    const ui = document.createElement("div");
        document.body.appendChild(ui);
        ui.style.position = "fixed";
        ui.style.fontFamily = "'pressStart', sans-serif";
        ui.style.width = "66%";
        ui.style.height = "66%";
        ui.style.top = "50%";
        ui.style.left = "50%";
        ui.style.transform = "translate(-50%, -50%)"; // Center the div
        ui.style.background = "rgba(0, 0, 0, 0.7)";
        ui.id = "ui";
        ui.style.borderRadius = "20px";
        ui.style.zIndex = "1001";
        ui.style.display = "grid";
        ui.style.gridTemplateColumns = "repeat(3, 1fr)";
        ui.style.gridTemplateRows = "repeat(2, 1fr)";
        ui.style.gap = "10px";
        ui.style.padding = "20px";
        ui.style.boxShadow = "0 0 30px #00ffee";
        ui.style.backdropFilter = "blur(3px)";

}



ModAPI.require("player");
ModAPI.require("settings");
let playerFound = false;

function checkForGame() {
    if (typeof ModAPI.player !== 'undefined') {
        playerFound = true;
    } else {
        console.warn('Player doesn\'t exist yet, please join a server or singleplayer world...');
    }
}

checkForGame();

const intervalId = setInterval(() => {
    if (playerFound) {
        clearInterval(intervalId); // Stop the interval
        ModAPI.displayToChat({msg: "§5MOD NAME HERE is now loading..."})
        initialize();
    } else {
        checkForGame();
    }
}, 1000);






function initialize() {
    setTimeout(async function () {
        const pressStartUrl =
            "https://raw.githubusercontent.com/AstralisLLC/fonts/main/PressStart2P.ttf";
        const dreamscapeUrl =
            "https://raw.githubusercontent.com/AstralisLLC/fonts/main/Dreamscape.ttf";
        const comfortaaUrl =
            "https://raw.githubusercontent.com/AstralisLLC/fonts/main/Comfortaa.ttf";
        const pressStart2p = new FontFace("pressStart", `url(${[pressStartUrl]})`);
        const dreamscape = new FontFace("dreamscape", `url(${[dreamscapeUrl]})`);
        const comfortaa = new FontFace("pressStart", `url(${[comfortaaUrl]})`);
        await pressStart2p.load();
        await comfortaa.load();
        await pressStart2p.load();
        document.fonts.add(pressStart2p);
        document.fonts.add(comfortaa);
        document.fonts.add(dreamscape);

        //Place code here
        initializeGUI();
        

    }, 200);
}

// §
function initializeGUI() {

    const ui = document.createElement("div");
    document.body.appendChild(ui);
    ui.style.position = "fixed";
    ui.style.fontFamily = "'pressStart', sans-serif";
    ui.style.width = "66%";
    ui.style.height = "66%";
    ui.style.top = "50%";
    ui.style.left = "50%";
    ui.style.transform = "translate(-50%, -50%)"; // Center the div
    ui.style.background = "rgba(255, 255, 255, 0.3)";
    ui.id = "ui";
    ui.style.borderRadius = "20px"; // Apply borderRadius only to the top corners
    ui.style.zIndex = "1001";
    ui.style.display = "grid";
    ui.style.gridTemplateColumns = "repeat(3, 1fr)";
    ui.style.gridTemplateRows = "repeat(2, 1fr)";
    ui.style.gap = "10px";
    ui.style.margin = '0';
    ui.style.padding = '0';
    ui.style.boxShadow = "0px 0px 30px #ffffff";
    ui.style.backdropFilter = "blur(3px)";

    // Create a topBar that spans all three columns
    const topBar = document.createElement('div');
    ui.appendChild(topBar);
    topBar.style.gridColumn = 'span 3';
    topBar.style.height = '30px'; // Set the height of the topBar
    topBar.style.background = '#333'; // Set the background color
    topBar.style.color = '#f1f1f1'; // Set the text color
    topBar.style.alignItems = 'center';
    topBar.style.justifyContent = 'center';
    topBar.style.margin = '0'; // Set margin to zero
    topBar.style.borderRadius = "20px 20px 0 0";


    const uiLabel = document.createElement('div');
    topBar.appendChild(uiLabel);
    uiLabel.id = "uiLabel";
    uiLabel.style.display = 'flex';
    uiLabel.style.background = 'rgba(225, 225, 225, 0.3';
    uiLabel.style.width = "130px";
    uiLabel.style.height = "100%";
    uiLabel.style.borderRadius = "20px 15px 15px 0";
    uiLabel.style.alignItems = 'center';
    uiLabel.style.justifyContent = 'center';

    const uiLabelText = document.createElement('p');
    uiLabel.appendChild(uiLabelText);
    uiLabelText.id = "labelText";
    uiLabelText.style.color = "#FFFFFF";
    uiLabelText.innerText = "EaglerHUD";
    uiLabelText.style.fontFamily = "'dreamscape', sans-serif";








    // Track the initial mouse position and UI position
let isDragging = false;
let initialMouseX, initialMouseY;
let initialUiX, initialUiY;

// Function to handle mouse down event on the topBar
topBar.addEventListener("mousedown", function (e) {
    isDragging = true;
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
    initialUiX = ui.offsetLeft;
    initialUiY = ui.offsetTop;

    // Prevent text selection while dragging
    e.preventDefault();
});

// Function to handle mouse move event
document.addEventListener("mousemove", function (e) {
    if (isDragging) {
        const deltaX = e.clientX - initialMouseX;
        const deltaY = e.clientY - initialMouseY;

        // Update the UI position
        ui.style.left = initialUiX + deltaX + "px";
        ui.style.top = initialUiY + deltaY + "px";
    }
});

// Function to handle mouse up event
document.addEventListener("mouseup", function () {
    isDragging = false;
});

}


