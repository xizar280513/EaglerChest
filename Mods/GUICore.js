class GuiButton {
  constructor(buttonId, x, y, buttonText) {
    this.id = buttonId;
    this.posX = x;
    this.posY = y;
    this.text = buttonText;
  }

  visible = true;
  enabled = true;
  height = 20;
  width = 200;
  onClick = function(button) {
    alert("You clicked on the button with text '" + button.text + "'!");
  }

  drawToScreen = function(screen) {
    let screenObject;
    if (screen != null) {
      screenObject = screen;
    } else {
      screenObject = ModAPI.mcinstance.$currentScreen;
    }
    screenObject.$buttonList.$add(this.getRef());
      const originalOptionsAction = screenObject.$actionPerformed;
      const id = this.id;
      const onClick = this.onClick;
      const self = this;
      screenObject.$actionPerformed = function (...args) {
        if (args.find((element) => element.$id12 == id)) {
          onClick(self);
        }
        var x = originalOptionsAction.apply(this, args);
        return x;
      }
    }

  isHovered = function () {
    return this.getRef().$hovered === 1;
  }

  getRef = function() {
    let ref = ModAPI.hooks._classMap.nmcg_GuiButton.constructors[0](this.id, this.posX, this.posY, ModAPI.util.string(this.text));
    ref.$height16 = this.height;
    ref.$width14 = this.width;
    ref.$visible = this.visible?1:0;
    ref.$enabled = this.enabled?1:0;
    return ref;
  }
}
