(function EmpowerMobsOnTick() {
    const empowered = new Set();

    ModAPI.addEventListener("update", () => {
        const mobs = ModAPI.world.getLoadedEntityList();

        mobs.forEach(mob => {
            if (!mob.isMob || empowered.has(mob.getEntityId())) return;

            const uuid = mob.getUniqueID().toString();

            // Apply two random effects
            const effects = [
                { id: "speed", level: 1 },
                { id: "strength", level: 1 },
                { id: "resistance", level: 0 },
                { id: "fire_resistance", level: 0 },
                { id: "regeneration", level: 0 },
                { id: "health_boost", level: 0 }
            ];

            const chosen = [];
            while (chosen.length < 2) {
                const e = effects[Math.floor(Math.random() * effects.length)];
                if (!chosen.some(b => b.id === e.id)) chosen.push(e);
            }

            // Apply effects using commands
            chosen.forEach(effect => {
                mob.command(`/effect give @e[type=!player,limit=1,sort=nearest] minecraft:${effect.id} 1000000 ${effect.level} true`);
            });

            mob.setCustomNameTag("§dEmpowered");
            empowered.add(mob.getEntityId());
        });
    });
})();
