PluginAPI.addEventListener("update", () => {
  // Get the player's position
  const playerPos = new Vector3(PluginAPI.player.x, PluginAPI.player.y, PluginAPI.player.z);
  
  // Define the radius within which entities will be hit
  const hitRadius = 5;
  
  // Iterate through all entities in the world
  for (const entity of PluginAPI.world.entities) {
    // Skip non-living entities (e.g., items, experience orbs)
    if (!(entity instanceof EntityLivingBase)) {
      continue;
    }
    
    // Calculate the distance between the player and the entity
    const entityPos = new Vector3(entity.posX, entity.posY, entity.posZ);
    const dx = playerPos.x - entityPos.x;
    const dy = playerPos.y - entityPos.y;
    const dz = playerPos.z - entityPos.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Check if the entity is within the hit radius
    if (distance <= hitRadius) {
      // Hit the entity (you can replace this with your desired action)
      entity.attackEntityFrom(DamageSource.generic, 1);
    }
  }
});
