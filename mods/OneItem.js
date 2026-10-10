(() =>{
    ModAPI.require("player");

    //a list of all possible givable items
    var Items = [
        {Name: "air 1 0", Variants: null}, 
        {Name: "stone 1 0", Variants: ["{Damage: 0}", "{Damage:1}", "{Damage:2}", "{Damage:3}", "{Damage:4}", "{Damage:5}", "{Damage:6}"]}, //granite, 
        {Name: "grass 1 0", Variants: null}, 
        {Name: "dirt 1 0", Variants: ["{Damage: 0}", "{Damage: 1}", "{Damage: 2}"]}, //coarse, podzol
        {Name: "cobblestone 1 0", Variants: null},
        {Name: "planks 1 0", Variants: ["{Damage: 0}", "{Damage:1}", "{Damage:2}", "{Damage:3}", "{Damage:4}", "{Damage:5}"]},//Spruce, Birch, Jungle, Accatia, Dark Oak
        {Name: "sapling 1 0", Variants: ["{Damage: 0}", "{Damage:1}", "{Damage:2}", "{Damage:3}", "{Damage:4}", "{Damage:5}"]},
        {Name: "bedrock 1 0", Variants: null},
        {Name: "", Variants: null},
    ];

    var GUIbutton = document.createElement("button");
    GUIbutton.style="position: fixed; top:1rem; left:1rem;";
    GUIbutton.innerHTML = "RandomItem GUI";
    GUIbutton.addEventListener("click", () => {
        sendRandomItem()
    });

    function sendRandomItem() {
        ModAPI.player.sendChatMessage({message: "/give @a " + Items[Math.random(1, 7)].Name});
    }

    //todo
    document.body.appendChild(GUIbutton);
})