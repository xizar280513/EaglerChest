/*  this script currenly supports 2 players, and sum of this code was made by chat GTP, but most of 
 * it was made by me.
 *
 * DO NOT run have multiple instances of this mod running, as it will result in the
 * event listeners running the functions multples of times, and if you run the makePillars scritpts,
 * this will result in 100+ commands being run, freezing the client.
 * 
 * steps:
 *  done) give the player a random item
 *  done) extend to other players
 *  done) add a script that makes the pillars for you
 *  4) add a score board with a countdown and score or bossbar
 */

ModAPI.require("player");

//random function
function getRandom(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function randomItemFunc2(p1, p2) {
    ModAPI.player.sendChatMessage({message: "game starting..."});

    var itemList = Object.keys(ModAPI.items);
    var minItem = 2;
    var itemCount = itemList.length;

    const randomItemInterval = setInterval(() => {
        ModAPI.player.sendChatMessage({message: `/give ${p1} ${itemList[getRandom(minItem, itemCount)]}`});
        ModAPI.player.sendChatMessage({message: `/give ${p2} ${itemList[getRandom(minItem, itemCount)]}`});

    }, 30000);
}
function randomItemFunc2(p1, p2, p3) {
    ModAPI.player.sendChatMessage({message: "game starting..."});

    var itemList = Object.keys(ModAPI.items);
    var minItem = 2;
    var itemCount = itemList.length;

    const randomItemInterval = setInterval(() => {
        ModAPI.player.sendChatMessage({message: `/give ${p1} ${itemList[getRandom(minItem, itemCount)]}`});
        ModAPI.player.sendChatMessage({message: `/give ${p2} ${itemList[getRandom(minItem, itemCount)]}`});
        ModAPI.player.sendChatMessage({message: `/give ${p3} ${itemList[getRandom(minItem, itemCount)]}`});
    }, 30000);
}

function makePillars2P() {
    ModAPI.displayToChat({msg: "making pillars..."});

    //think of the player as 0
    //base
    ModAPI.player.sendChatMessage({message: `/fill ~ ~-2 ~ ~16 ~-2 ~-16 bedrock`});
    ModAPI.player.sendChatMessage({message: `/fill ~ ~-1 ~ ~16 ~-1 ~-16 air`});

    //netherrack ring
    ModAPI.player.sendChatMessage({message: `/setblock ~3 ~-1 ~-3 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~2 ~-1 ~-4 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~4 ~-1 ~-2 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~5 ~-1 ~-1 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~6 ~-1 ~-1 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~7 ~-1 ~ netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~8 ~-1 ~ netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~9 ~-1 ~ netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~10 ~-1 ~-1 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~11 ~-1 ~-1 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~12 ~-1 ~-2 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~13 ~-1 ~-3 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~14 ~-1 ~-4 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~1 ~-1 ~-5 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~1 ~-1 ~-6 netherrack`});
    ModAPI.player.sendChatMessage({message: `/fill ~0 ~-1 ~-7 ~0 ~-1 ~-9 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~1 ~-1 ~-10 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~1 ~-1 ~-11 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~2 ~-1 ~-12 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~3 ~-1 ~-13 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~4 ~-1 ~-14 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~5 ~-1 ~-15 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~6 ~-1 ~-15 netherrack`});
    ModAPI.player.sendChatMessage({message: `/fill ~7 ~-1 ~-16 ~9 ~-1 ~-16 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~10 ~-1 ~-15 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~11 ~-1 ~-15 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~12 ~-1 ~-14 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~13 ~-1 ~-13 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~14 ~-1 ~-12 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~15 ~-1 ~-11 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~15 ~-1 ~-10 netherrack`});
    ModAPI.player.sendChatMessage({message: `/fill ~16 ~-1 ~-9 ~16 ~-1 ~-7 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~15 ~-1 ~-6 netherrack`});
    ModAPI.player.sendChatMessage({message: `/setblock ~15 ~-1 ~-5 netherrack`});

    //lava pool
    ModAPI.player.sendChatMessage({message: `/fill ~2 ~-1 ~-5 ~14 ~-1 ~-11 lava`});
    ModAPI.player.sendChatMessage({message: `/fill ~5 ~-1 ~-2 ~11 ~-1 ~-14 lava`});

    //pillars
    ModAPI.player.sendChatMessage({message: `/fill ~8 ~-1 ~-4 ~8 ~25 ~-4 bedrock`});
    ModAPI.player.sendChatMessage({message: `/fill ~8 ~-1 ~-12 ~8 ~25 ~-12 bedrock`});
}

function info() {
    ModAPI.displayToChat({message: "Pillars idk"});
}

ModAPI.addEventListener("sendchatmessage", (ev) => {
    if (ev.message.toLowerCase().startsWith('.pillars')) {
        ev.preventDefault = true;
    
        const args = ev.message.split(' ');

        //starting the game
        if (args[1] === 'start' && args[2] === '2') {
            const p1 = args[3];
            const p2 = args[4];
            
            if (p2 === undefined || p1 === undefined) {
                ModAPI.displayToChat({message: 'Please input 2 players'});
            } else {
                randomItemFunc2(p1, p2);
            }
        } else if (args[1] === 'start' && args[2] === '3') {
            const p1 = args[3];
            const p2 = args[4];
            const p3 = args[5];
            
            if (p3 === undefined || p2 === undefined || p1 === undefined) {
                ModAPI.displayToChat({message: 'Please input 3 players'});
            } else {
                randomItemFunc3(p1, p2, p3);
            }
        } else if (args[1] === 'make' && args[2] === '2') {
            makePillars2P();
        } else if (args[1] === 'tp' && args[2] === '1') {
            const p1 = args[3];
            if (p1 === null) {
                ModAPI.displayToChat({message: 'Please input 1 player'});
            }
        
            ModAPI.player.sendChatMessage({message: `/tp ${p1} ~8 ~27 ~-4`});

        } else if(args[1] === 'tp' && args[2] === '2') {
            const p1 = args[3];
            const p2 = args[4];
            if (p2 === undefined || p1 === undefined) {
                ModAPI.displayToChat({message: 'Please input 2 players'});
            }
            
            ModAPI.player.sendChatMessage({message: `/effect ${p1} slowness 5 255`});
            ModAPI.player.sendChatMessage({message: `/effect ${p2} slowness 5 255`});
    
            ModAPI.player.sendChatMessage({message: `/tp ${p1} ~8 ~27 ~-4`});
            ModAPI.player.sendChatMessage({message: `/tp ${p2} ${p1}`});
            ModAPI.player.sendChatMessage({message: `/tp ${p2} ~ ~ ~-8`});
        } else {
            ModAPI.displayToChat({message: 'Invalid command'});
        }

    }
});
