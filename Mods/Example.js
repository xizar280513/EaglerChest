ModAPI.require("player");
ModAPI.require("settings");

// MODULE FUNCTIONS
let fullbrightToggled = false;

function fullbrightToggle() {
  if (fullbrightToggled == false) {
    ModAPI.blocks.air.lightValue = 12
    ModAPI.blocks.reload()
    fullbrightToggled = !fullbrightToggled
  } else if (fullbrightToggled == true) {
    ModAPI.blocks.air.lightValue = 0
    ModAPI.blocks.reload()
    fullbrightToggled = !fullbrightToggled
  }
}

// Function to create a modular button
function createButton(text, onClick) {
  const button = document.createElement("button");
  button.innerText = text;
  Object.assign(button.style, {
    width: "auto", // Default width
    height: "auto", // Default height
    fontSize: "14px", // Optionally adjust the font size as needed
    background: "#555",
    color: "white",
    border: "none",
    marginRight: "10px",
    cursor: "pointer",
    borderRadius: "10px",
  });
  button.addEventListener("click", onClick);
  return button;
}

function getLocalTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
}

let uiVisible = true;
let uiToggled = true;

function toggleUI() {
  uiVisible = !uiVisible;
  uiToggled = !uiToggled;
  ui.style.display = uiVisible ? "grid" : "none";
  if (uiToggled == false) {

  }
}

setTimeout(async function () {
  const url_to_font_name =
    "https://raw.githubusercontent.com/AstralisLLC/fonts/main/PressStart2P.ttf";
  const font_name = new FontFace("pressStart", `url(${url_to_font_name})`);
  await font_name.load();
  document.fonts.add(font_name);

  const clientTitle = document.createElement("div");
  document.body.appendChild(clientTitle);
  clientTitle.id = "clientTitle"; // Set the id to "clientTitle"
  clientTitle.style.position = "fixed";
  clientTitle.style.width = "350px"; // Set the width to 350px
  clientTitle.style.height = "55px"; // Set the height to 55px
  clientTitle.style.top = "10px";
  clientTitle.style.left = "10px";
  clientTitle.style.background = "rgba(255, 255, 255, 0.3)";
  clientTitle.style.zIndex = "1000";
  clientTitle.style.boxShadow = "0 0 30px #ffffff"; // Light blue glow with 30px blur radius
  clientTitle.style.borderRadius = "20px"; // Rounded corners
  clientTitle.style.backdropFilter = "blur(3px)";

  // Additional styling to center content within clientTitle
  clientTitle.style.display = "grid";
  clientTitle.style.placeItems = "center";
  clientTitle.style.cursor = "default"; // Set cursor to grab

  // Track the initial mouse position and clientTitle position
  let isTitleDragging = false;
  let initialTitleMouseX, initialTitleMouseY;
  let initialTitleX, initialTitleY;

  // Function to handle mouse down event on the clientTitle
  clientTitle.addEventListener("mousedown", function (e) {
    isTitleDragging = true;
    initialTitleMouseX = e.clientX;
    initialTitleMouseY = e.clientY;
    initialTitleX = clientTitle.offsetLeft;
    initialTitleY = clientTitle.offsetTop;

    // Set cursor to grabbing while dragging
    clientTitle.style.cursor = "default";

    // Prevent text selection while dragging
    e.preventDefault();
  });

  // Function to handle mouse move event
  document.addEventListener("mousemove", function (e) {
    if (isTitleDragging) {
      const deltaX = e.clientX - initialTitleMouseX;
      const deltaY = e.clientY - initialTitleMouseY;

      // Update the clientTitle position
      clientTitle.style.left = initialTitleX + deltaX + "px";
      clientTitle.style.top = initialTitleY + deltaY + "px";
    }
  });

  // Function to handle mouse up event
  document.addEventListener("mouseup", function () {
    isTitleDragging = false;

    // Reset cursor to grab when dragging is finished
    clientTitle.style.cursor = "default";
  });

  const titleText = document.createElement("p");
  clientTitle.appendChild(titleText);
  titleText.style.fontFamily = "'pressStart', sans-serif";
  titleText.style.color = "#FF00FF"; // Set the color to #FF00FF for the main text
  titleText.style.fontSize = "14px"; // Adjust the font size as needed
  titleText.style.margin = "0"; // Remove margin to ensure proper alignment

  function updateTitleText() {
    const localTime = getLocalTime();
    const formattedHours = localTime.hours < 10 ? '0' + localTime.hours : localTime.hours;
    const formattedMinutes = localTime.minutes < 10 ? '0' + localTime.minutes : localTime.minutes;
    const formattedSeconds = localTime.seconds < 10 ? '0' + localTime.seconds : localTime.seconds;

    // Assuming 'titleText' is already defined
    titleText.innerText = `[NeverFlag] ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  updateTitleText(); // Initial update
  setInterval(updateTitleText, 1000);

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
  ui.style.boxShadow = "0 0 30px #ffffff";
  ui.style.backdropFilter = "blur(3px)";

  // Create a topBar that spans all three columns
  const topBar = document.createElement('div');
  ui.appendChild(topBar);
  topBar.style.gridColumn = 'span 3';
  topBar.style.height = '30px'; // Set the height of the topBar
  topBar.style.background = '#333'; // Set the background color
  topBar.style.color = '#f1f1f1'; // Set the text color
  topBar.style.display = 'flex';
  topBar.style.alignItems = 'center';
  topBar.style.justifyContent = 'center';
  topBar.style.margin = '0'; // Set margin to zero
  topBar.style.borderRadius = "20px 20px 0 0";

  const linuxButtonsContainer = document.createElement("div");
  topBar.appendChild(linuxButtonsContainer);
  linuxButtonsContainer.style.display = 'flex';
  linuxButtonsContainer.style.alignItems = 'center';
  linuxButtonsContainer.style.justifyContent = 'center';

// Function to create Linux-styled button as tabs
function createTabButton(text, onClick, openAsNewUI = false) {
  const button = createButton(text, function () {
    onClick();  
    if (openAsNewUI) {
      // Create a new UI when the button is clicked
      const newUI = document.createElement("div");
      document.body.appendChild(newUI);
      newUI.style.position = "fixed";
      newUI.style.fontFamily = "'pressStart', sans-serif";
      newUI.style.width = "66%";
      newUI.style.height = "66%";
      newUI.style.top = "50%";
      newUI.style.left = "50%";
      newUI.style.transform = "translate(-50%, -50%)"; // Center the div
      newUI.style.background = "rgba(255, 255, 255, 0.3)";
      newUI.style.borderRadius = "20px"; // Apply borderRadius only to the top corners
      newUI.style.zIndex = "1001";
      newUI.style.display = "grid";
      newUI.style.gridTemplateColumns = "repeat(3, 1fr)";
      newUI.style.gridTemplateRows = "repeat(2, 1fr)";
      newUI.style.gap = "10px";
      newUI.style.margin = '0';
      newUI.style.padding = '0';
      newUI.style.boxShadow = "0 0 30px #ffffff";
      newUI.style.backdropFilter = "blur(3px)";

      // Make newUI draggable
      let isDraggingUI = false;
      let initialMouseX, initialMouseY;
      let initialUiX, initialUiY;

      // Function to handle mouse down event on newUI
      newUI.addEventListener("mousedown", function (e) {
        isDraggingUI = true;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        initialUiX = newUI.offsetLeft;
        initialUiY = newUI.offsetTop;

        // Prevent text selection while dragging
        e.preventDefault();
      });

      // Function to handle mouse move event
      document.addEventListener("mousemove", function (e) {
        if (isDraggingUI) {
          const deltaX = e.clientX - initialMouseX;
          const deltaY = e.clientY - initialMouseY;

          // Update the newUI position
          newUI.style.left = initialUiX + deltaX + "px";
          newUI.style.top = initialUiY + deltaY + "px";
        }
      });

      // Function to handle mouse up event
      document.addEventListener("mouseup", function () {
        isDraggingUI = false;
      });

      // Create a new div as a copy of the topBar
      const newTopBar = document.createElement("div");
      newTopBar.style.gridColumn = 'span 3';
      newTopBar.style.height = '30px'; // Set the height of the topBar
      newTopBar.style.background = '#333'; // Set the background color
      newTopBar.style.color = '#f1f1f1'; // Set the text color
      newTopBar.style.display = 'flex';
      newTopBar.style.alignItems = 'center';
      newTopBar.style.justifyContent = 'center';
      newTopBar.style.margin = '0'; // Set margin to zero
      newTopBar.style.borderRadius = "20px 20px 0 0";
      newUI.appendChild(newTopBar);

      // Create a close button for the new UI
      const closeButton = createButton("Close", function () {
        document.body.removeChild(newUI); // Remove the new UI
      });
      closeButton.classList.add("linuxButton"); // Add the Linux button class
      closeButton.style.marginRight = "10px"; // Add margin for spacing
      newTopBar.appendChild(closeButton);
    }
  });
  button.classList.add("linuxButton"); // Add the Linux button class
  linuxButtonsContainer.appendChild(button);
}

// Create Linux-styled buttons as tabs
createTabButton("Tab 1", function () {
  // Handle click for Tab 1
  ModAPI.displayToChat({msg: "§5Tab 1 has been successfully loaded! Now sorting modules..."})
}, true); // Open as a new UI

createTabButton("Tab 2", function () {
  // Handle click for Tab 2
  ModAPI.displayToChat({msg: "§5Tab 2 has been successfully loaded! Now sorting modules..."})
});


  const sidebar = document.createElement('div');
  ui.appendChild(sidebar);
  sidebar.id = "sidebar";
  sidebar.style.height = "100%";
  sidebar.style.width = "30%";
  sidebar.style.zIndex = "1002";

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

  ModAPI.displayToChat({msg: "§5Client has succesfully loaded!"})
  ModAPI.displayToChat({msg: "§5Menu bind is currently set to \"§3P§5\"!"})

}, 500);

ModAPI.addEventListener("key", event => {
  if(event.key == 54){
      toggleUI()
  }
})