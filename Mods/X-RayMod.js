ModAPI.require("player", function(player) {
  ModAPI.require("settings", function(settings) {
    class XRay {
      constructor() {
        this.enabled = false;
        this.blocks = ["diamond_ore", "gold_ore", "iron_ore"]; // Customizable blocks
        this.toggle();
      }

      toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
          this.enableXRay();
        } else {
          this.disableXRay();
        }
      }

      enableXRay() {
        player.highlightBlocks(this.blocks); // Example method, needs to be implemented
      }

      disableXRay() {
        player.removeHighlight(); // Example method, needs to be implemented
      }
    }

    const xray = new XRay();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'x') { // Press 'x' to toggle X-Ray
        xray.toggle();
      }
    });
  });
});
