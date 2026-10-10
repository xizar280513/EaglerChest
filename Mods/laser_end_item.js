ModAPI.registerMod("LaserEndItem", "1.0", "YourName");

ModAPI.addEventListener("init", function() {
    ModAPI.items.registerNewItem("laser_receiver", "レーザー受信機");
});

ModAPI.addEventListener("useitem", function(event) {
    if (event.item && event.item.id === "laser_receiver") {
        if (window.laserStartX !== null) {
            ModAPI.displayToChat("§6[レーザー受信機] 終点を設置！ビームを接続します。");
            
            let startX = window.laserStartX;
            let endX = event.targetX;
            let ly = event.targetY;
            let lz = event.targetZ;

            let minX = Math.min(startX, endX);
            let maxX = Math.max(startX, endX);

            // 送信機から受信機へ画像通りの赤いビームを引く
            ModAPI.addEventListener("update", function() {
                for (let x = minX; x <= maxX; x++) {
                    ModAPI.spawnParticle("reddust", x + 0.5, ly + 1.2, lz + 0.5, 0, 0, 0);
                }

                // プレイヤーの接触判定（触れたら大爆発）
                let px = Math.floor(ModAPI.player.x);
                let py = Math.floor(ModAPI.player.y);
                let pz = Math.floor(ModAPI.player.z);

                if (py === ly && pz === lz && px >= minX && px <= maxX) {
                    ModAPI.displayToChat("§4🚨 侵入者検知！レーザーに接触しました！");
                    ModAPI.createExplosion(ModAPI.player.x, ModAPI.player.y, ModAPI.player.z, 4.0, true);
                }
            });
        } else {
            ModAPI.displayToChat("§c[エラー] 先に「レーザー送信機（始点）」を設置してください。");
        }
    }
});
