// Add a boolean variable to track if the "g" key has been pressed
var isKeyPressed = false;

function X(){
  var div = document.getElementById("GUI");
      if (div) {
        div.remove();
      } else {
        console.log("Element not found.");
      }
}

// Add event listener for key press
PluginAPI.addEventListener("key", function(event) {

  // Check if the pressed key is "g"
  if (event.key === 34) { // Key code for "g"
    var div = document.createElement('div');
    div.id = 'GUI';
    div.innerHTML = `
        <h1 style="text-shadow: 0px 0px 4px;">Really Cool GUI<a href="javascript:void(0)" onclick="X()" style="margin-left: 2rem; color: red;">[X]</a></h1>
        <p style="font-size: 0.8rem; color: orangered;">some text</p>
        <table style="table-layout: fixed; width: 100%;">
            <tr style="background: rgb(80, 80, 80);">
                <th style="text-align: center;">some text</th>
                <th style="text-align: center; width: 15%;">more text</th>
            </tr>
            <tr style="box-shadow: grey 0px 2px 0px;">
                <td style="user-select: text;">
                </td>
                <td style="background-color: green; text-align: center;">TEXT<button style="background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: Minecraftia, sans-serif; text-decoration: underline; border: 0px; margin-left: 1rem; font-size: 1rem;">[X]</button></td>
            </tr>
        </table>
        <button style="background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: Minecraftia, sans-serif; text-decoration: underline; border: 0px; margin-right: 1rem; font-size: 1rem;">cool button</button>
        <button style="background: transparent; text-align: center; color: yellow; cursor: pointer; font-family: Minecraftia, sans-serif; text-decoration: underline; border: 0px; font-size: 1rem;">really cool button</button>
        <a href="javascript:void(0)" style="color: yellow; display: block; margin-top: 2rem; width: 0px; white-space: nowrap;">coolest button</a>
      `;

    // Set the styles for the div
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'fixed';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.zIndex = '10';
    div.style.color = 'white';
    div.style.fontFamily = 'Minecraftia, sans-serif';
    div.style.overflow = 'hidden scroll';
    div.style.backgroundColor = 'rgb(80, 80, 80 / 42%);';
    div.style.backgroundBlendMode = 'multiply';
    div.style.backgroundSize = '64px';

    // Append the div to the end of the body tag
    document.body.appendChild(div);
  }
});
