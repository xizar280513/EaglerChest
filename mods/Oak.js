/* 
* OakAPI by stpv22(1). 
* Docs coming soon!
*/
var OakAPI = {
    version: 1.0,
    displayVersion: function () {
        ModAPI.drawStringWithShadow({msg: "OakAPI " + OakAPI.version, x: 1, y: 27, color: -1});
    },
    detectNewVersion: function() {}, //coming soon
    alert: function (opts) {
        // {title: string, subtext: string, time: Integer} maybe add an icon later.
        var alertContainer = document.createElement("div");
        alertContainer.class = "alertBox"
        alertContainer.style = "position: fixed; top: 1rem; left: 1rem; border: 0.2rem solid; border-color: black; padding: 10px; background-color: rgb(60, 60, 60); font-family: Minecraftia, sans-serif; min-width: 100px;";

        var alertTitle = document.createElement("h2");
        alertTitle.style = "box-sizing: border-box; border: none; margin-top: 2px; margin-bottom: 2px; color: yellow;"
        alertTitle.innerHTML = opts.title;

        var alertText = document.createElement("p");
        alertText.style = "color: white;"
        alertText.innerHTML = opts.subtext;

        var timeout = document.createElement("div");
        timeout.style = "box-sizing: border-box; background-color: black; position: absolute; left: 0; bottom: 0; width: 100%; height: 0.5rem;"

        alertContainer.appendChild(alertTitle);
        alertContainer.appendChild(alertText);
        alertContainer.appendChild(timeout);
        document.body.appendChild(alertContainer);

        //make the timeout animation
        var startTime = new Date().getTime();

        var alertTimeout = function (){
            var currTime = new Date().getTime();
            var newWidth = (100 - ((currTime - startTime)/1000) * opts.time);
            timeout.style.width = newWidth + "%";

            if (newWidth >= 0) {
                window.requestAnimationFrame(alertTimeout);
            } else {
                alertContainer.remove();
            }
        }
        alertTimeout();

        //return variables so that if anyone wants to change the alertbox style. I think this works.
        return [alertContainer, alertTitle, alertText, alertTimeout];
    },
    displayNewGUI: function(opts) {
        // {containerStyle: String, html: String}
        var guiContainer = document.createElement("div");
        guiContainer.style = opts.containerStyle;
        guiContainer.innerHTML = opts.html;

        document.body.appendChild(guiContainer);
    },
    sendKeybind: function (opts) {
        // {type: String, send: Integer} I habe no idea where to find these in the client.
        if (opts.type === "forward") {
            ModAPI.mcinstance.$gameSettings.$keyBindForward.$pressed = opts.send;
            ModAPI.update();
        }
        if (opts.type === "left") {
            ModAPI.mcinstance.$gameSettings.$keyBindLeft.$pressed = opts.send;
            ModAPI.update();
        }
        if (opts.type === "back") {
            ModAPI.mcinstance.$gameSettings.$keyBindBack.$pressed = opts.send;
            ModAPI.update();
        }
        if (opts.type === "right") {
            ModAPI.mcinstance.$gameSettings.$keyBindRight.$pressed = opts.send;
            ModAPI.update();
        }
        if (opts.type === "inventory") {
            ModAPI.mcinstance.$gameSettings.$keyBindInventory.$pressed = opts.send;
            ModAPI.update();
        }
    },
    key: { //I'll finish later
      esc: 1,
      num1: 2,
      num2: 3,
      num3: 4,
      num4: 5,
      num5: 6,
      num7: 7,
    },
    gamepad: {
      index: null,
    }
};


function displayGui() {
   function gui() {
      if (document.querySelector("#eaglerpl_gui")) {
        document.querySelector("#eaglerpl_gui").remove();
      }
        localStorage.setItem(
          "ml::Mods",
          localStorage.getItem("ml::Mods") || "[]"
        );
        try {
          localStorage.setItem(
            "ml::Mods",
            JSON.stringify(JSON.parse(localStorage.getItem("ml::Mods")))
          );
        } catch (error) {
          localStorage.setItem("ml::Mods", "[]");
        }
        var Mods = JSON.parse(localStorage.getItem("ml::Mods"));
        var container = document.createElement("div");
        container.id = "eaglerpl_gui";
        container.style = `width:100%; height: 100%; position: fixed; top: 0; left: 0; z-index: 10; color: white; font-family: Minecraftia, sans-serif; overflow-y: scroll; overflow-x: hidden; background-image: url(data:image/png;base64,UklGRhoBAABXRUJQVlA4TA0BAAAvn8AnAIWjtpEECdnA2N0DsTROy7xUqfrWw0jbyLkJKTz0+I20jTT/Bo89e1YR/Wfktm0Y+wNKLobT7QP/n/B7Z/naW26QHoTpHB7LFouyKHlzeHxfCStSuj9KdbC8z1IJ5iWiyQed48vtYJ+lUu0t4VwranS1XMIutSiLYlbb8G54uf2p3VPSfRZtSrlsPFjOzZZrd/us3B3uK+HcHJQql+xbLMrS/WqNpm6DeZ/VIPVYaN/KzUbp91nd9xl5pYu50dU2W417nbdTj5l2Ne92uM9qXNpyf6+oXkabHKXaZ1HS4Iaqpim+1KIJ+0M49/LjNbTGP5mrrMZEuc7Uzcb1ViOJ6TuOt4NGJs+zDgA=); background-color: rgb(60,60,60); background-blend-mode: multiply; background-size: 64px;`;
        var title = document.createElement("h1");
        title.style = "text-shadow: 0px 0px 0px;";
        title.innerHTML = "Mod Manager";
        var closeButton = document.createElement("a");
        closeButton.style = `margin-left: 2rem; color: red;`;
        closeButton.href = "javascript:void(0)";
        closeButton.addEventListener("click", () => {
          document.querySelector("#eaglerpl_gui").remove();
        });
        closeButton.innerHTML = "[X]";
        title.appendChild(closeButton);
        container.appendChild(title);
    
        var warningPoster = document.createElement("p");
        warningPoster.style = "font-size: 0.8rem; color: orangered;";
        warningPoster.innerHTML =
          "Warning: Installing Mods gives them full control over the game. Be cautious when installing them.<br>Mods that have been removed also need a reload to stop running in the background.";
        container.appendChild(warningPoster);
    
        var tipPoster = document.createElement("p");
        tipPoster.style = "font-size: 0.8rem; color: yellow;";
        tipPoster.innerHTML =
          "Tip: if the mods say that they failed loading, try refreshing the gui";
        container.appendChild(tipPoster);
    
        var table = document.createElement("table");
        table.style = "table-layout: fixed; width: 100%";
        var headerRow = document.createElement("tr");
        headerRow.style = "background: rgb(50,50,50);";
        var urlBox = document.createElement("th");
        urlBox.style = "text-align: center;";
        urlBox.innerHTML = "URL";
        headerRow.appendChild(urlBox);
        var statusBox = document.createElement("th");
        statusBox.style = "text-align: center; width: 15%;";
        statusBox.innerHTML = "Status";
        headerRow.appendChild(statusBox);
        table.appendChild(headerRow);
    
        Mods.forEach((url) => {
          var row = document.createElement("tr");
          row.style = `box-shadow: 0px 2px 0px grey;`;
          var urlBox = document.createElement("td");
          urlBox.style = "user-select: text;";
          var textWrapper = document.createElement("div");
          textWrapper.style = `max-width: 100%; overflow-wrap: anywhere; max-height: 4.5rem; overflow-y: scroll;`;
          textWrapper.innerText = url;
          urlBox.append(textWrapper);
          row.appendChild(urlBox);
          var statusBox = document.createElement("td");
          statusBox.innerHTML = ((curl) => {
            var targs = document.querySelectorAll("script[data-Mod]");
            for (let i = 0; i < targs.length; i++) {
              const elem = targs[i];
              if (elem.getAttribute("data-Mod") === curl) {
                return "LOADED";
              }
            }
            return "FAILED";
          })(url);
          switch (statusBox.innerHTML) {
            case "LOADED":
              statusBox.style = "background-color: green; text-align: center;";
              break;
            case "FAILED":
              statusBox.style = "background-color: dimgrey; text-align: center;";
              break;
            default:
              break;
          }
          var binBtn = document.createElement("button");
          binBtn.style =
            "background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: 'Minecraftia', sans-serif; text-decoration: underline; border: 0; margin-left: 1rem; font-size: 1rem;";
          binBtn.innerHTML = "[X]";
          binBtn.addEventListener("click", () => {
            if (!window.confirm("Delete Mod?") || Mods.indexOf(url) === -1) {
              return;
            }
            Mods.splice(Mods.indexOf(url), 1);
            localStorage.setItem("ml::Mods", JSON.stringify(Mods));
            gui();
          });
          statusBox.appendChild(binBtn);
          row.appendChild(statusBox);
          table.appendChild(row);
        });
    
        var addBtn = document.createElement("button");
        addBtn.style =
          "background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: 'Minecraftia', sans-serif; text-decoration: underline; border: 0; margin-right: 1rem;  font-size: 1rem;";
        addBtn.innerHTML = "Add new";
        addBtn.addEventListener("click", () => {
          var newMod = window.prompt("URL of Mod: ", "http://example.com/example.js");
          Mods.push(
            newMod
          );
          localStorage.setItem("ml::Mods", JSON.stringify(Mods));
          if(window.ModLoader){
            ModLoader([newMod]);
          }
          gui();
        });
    
        var uploadBtn = document.createElement("button");
        uploadBtn.style =
          "background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: 'Minecraftia', sans-serif; text-decoration: underline; border: 0;  font-size: 1rem;";
        uploadBtn.innerHTML = "Upload...";
        uploadBtn.addEventListener("click", function uploadBtnListener() {
          var filePicker = document.createElement("input");
          filePicker.type = "file";
          filePicker.accept = ".js";
          filePicker.addEventListener("input", function onInput() {
            if (filePicker.files[0]) {
              var reader = new FileReader();
              reader.addEventListener("load", function onModRead() {
                var newMod = reader.result.replace(";base64", `;fs=${encodeURIComponent(filePicker.files[0].name) || "unknown"};base64`);
                Mods.push(newMod);
                localStorage.setItem("ml::Mods", JSON.stringify(Mods));
                if(window.ModLoader){
                  ModLoader([newMod]);
                }
                gui();
              });
              reader.readAsDataURL(filePicker.files[0]);
            }
          });
          filePicker.click();
        });
    
        container.appendChild(table);
        container.appendChild(addBtn);
        container.appendChild(uploadBtn);
    
        var notice = document.createElement("a");
        notice.innerHTML = "Refresh GUI";
        notice.href = "javascript:void(0)";
        notice.addEventListener("click", function reloadListener() {
          setTimeout(gui, 500);
          this.remove();
        });
        notice.style = "color: yellow; display: block; margin-top: 2rem; width: 0; white-space: nowrap;";
    container.appendChild(notice);
    ModAPI.events.callEvent("gui", {});
    document.body.appendChild(container);
  }
  gui();
};

OakAPI.detectNewVersion();