ModAPI.require("player", function(player) {
  class Teleport {
    constructor() {
      this.waypoints = {};
      this.init();
    }

    init() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 't') { // Press 't' to set a waypoint
          let name = prompt("Enter waypoint name:");
          if (name) {
            this.waypoints[name] = player.getPosition();
          }
        } else if (e.key === 'y') { // Press 'y' to teleport to a waypoint
          let name = prompt("Enter waypoint name to teleport:");
          if (name && this.waypoints[name]) {
            player.teleport(this.waypoints[name]);
          }
        }
      });
    }
  }

  const teleport = new Teleport();
});
