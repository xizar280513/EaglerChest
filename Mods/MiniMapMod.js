ModAPI.require("player", function(player) {
  ModAPI.require("settings", function(settings) {
    class Minimap {
      constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 200;
        this.canvas.height = 200;
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '10px';
        this.canvas.style.right = '10px';
        this.scale = 5;
        this.update();
      }

      drawPlayer(position) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(position.x / this.scale, position.z / this.scale, 4, 4);
      }

      drawEntities(entities) {
        this.ctx.fillStyle = 'blue';
        entities.forEach(entity => {
          this.ctx.fillRect(entity.x / this.scale, entity.z / this.scale, 4, 4);
        });
      }

      update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let playerPos = player.getPosition();
        this.drawPlayer(playerPos);
        let nearbyEntities = player.getNearbyEntities(100); // Example method, needs to be implemented
        this.drawEntities(nearbyEntities);
        requestAnimationFrame(() => this.update());
      }
    }

    const minimap = new Minimap();
  });
});
