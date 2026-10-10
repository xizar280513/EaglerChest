// GitHubビルド用の正しい登録方法
ModAPI.registerMod("LaserStartItem", "1.0", "YourName");

// グローバル変数で始点の位置を共有
window.laserStartX = null;
window.laserStartY = null;
window.laserStartZ = null;

// ゲーム起動時に"laser_emitter"という新しいアイテムIDを完全に新規登録する
ModAPI.addEventListener("init", function() {
    ModAPI.items.registerNewItem("laser_emitter", "レーザー送信機");
});

// アイテムを使ったときの処理
ModAPI.addEventListener("useitem", function(event) {
    if (event.item && event.item.id === "laser_emitter") {
        window.laserStartX = event.targetX;
        window.laserStartY = event.targetY;
        window.laserStartZ = event.targetZ;
        ModAPI.displayToChat("§c[レーザー送信機] 始点を設置しました。終点を設置してください...");
    }
});
