// this plugin logs you packets and stores it in a txt file that you can download by doing .downloadpackets and can be viewed in another tab using .viewpackets
// i got chatgpt to write the packets for me. lmao
var date = new Date()
var properties
var loggedpackets = []
var info = "packets logged using packet logger v1.0 plugin by radmanplays\n\n\n"
function getCurrentTimeWithMilliseconds() {
    var currentDate = new Date();
    var hours = addLeadingZero(currentDate.getHours());
    var minutes = addLeadingZero(currentDate.getMinutes());
    var seconds = addLeadingZero(currentDate.getSeconds());
    var milliseconds = currentDate.getMilliseconds();
  
    var formattedTime = hours + ":" + minutes + ":" + seconds + "+" + milliseconds;
  
    return formattedTime;
  }
  
  function addLeadingZero(number) {
    return number < 10 ? "0" + number : number;
}
PluginAPI.addEventListener("event", (ev) => {
  if (ev.event.startsWith("sendpacket")) {
    time = getCurrentTimeWithMilliseconds();
    data = ev.data
    switch (ev.event) {
        case "sendpacketanimation":
          properties = null;
          break;
        case "sendpacketentityaction":
          properties = "entityId: " + data.entityID + ", action: " + data.action + ", auxData: " + data.auxData;
          break;
        case "sendpacketinput":
          properties = "strafeSpeed: " + data.strafeSpeed + ", forwardSpeed: " + data.forwardSpeed + ", jumping: " + data.jumping + ", sneaking: " + data.sneaking;
          break;
        case "sendpacketclosewindow":
          properties = "windowId: " + data.windowId;
          break;
        case "sendpacketclickwindow":
          properties = "windowId: " + data.windowId + ", slotId: " + data.slotId + ", usedButton: " + data.usedButton + ", mode: " + data.mode + ", clickedItemRef: " + (data.clickedItem ? data.clickedItem.getRef() : "{}") + ", actionNumber: " + data.actionNumber;
          break;
        case "sendpacketconfirmtransaction":
          properties = "windowId: " + data.windowId + ", uid: " + data.uid + ", accepted: " + data.accepted;
          break;
        case "sendpacketchatmessage":
          properties = "messageIn: " + data.message;
          break;
        case "sendpacketuseentity":
          properties = "entityId: " + data.entityId + ", action: " + data.action;
          break;
        case "sendpacketplayerposition":
          properties = "posX: " + data.x + ", posY: " + data.y + ", posZ: " + data.z + ", yaw: " + data.yaw + ", pitch: "+ data.pitch + ", isOnGround: " + data.onGround + ", ismoving: " + data.moving + ", isrotating: " + data.rotating;
          break;
        case "sendpacketplayerlook":
          properties = "playerYaw: " + data.yaw + ", playerPitch: " + data.pitch + ", isOnGround: " + data.onGround;
          break;
        case "sendpacketplayerposlook":
          properties = "playerX: " + data.x + ", playerY: " + data.y + ", playerZ: " + data.z + ", playerYaw: " + data.yaw + ", playerPitch: " + data.pitch + ", isOnGround: " + data.onGround;
          break;
        case "sendpacketplayer":
          properties = "isOnGround: " + data.onGround;
          break;
        case "sendpacketplayerdigging":
          properties = "pos: " + data.position + ", facing: " + data.facing + ", action: " + data.status;
          break;
        case "sendpacketplayerblockplacement":
          properties = "stackRef: " + data.stack.getRef() + ", posRef: " + data.position.getRef() + ", placedBlockDirectionIn: " + data.placedBlockDirection + ", facingXIn: " + data.facingX + ", facingYIn: " + data.facingY + ", facingZIn: " + data.facingZ;
          break;
        case "sendpackethelditemchange":
          properties = "slotId: " + data.slotId;
          break;
        case "sendpacketcreativeinventoryaction":
          properties = "slotId: " + data.slotId + ", stackRef: " + data.stack.getRef();
          break;
        case "sendpacketenchantitem":
          properties = "windowId: " + data.windowId + ", button: " + data.button;
          break;
        case "sendpacketupdatesign":
          properties = "pos: " + data.pos + ", lines: " + data.lines;
          break;
        case "sendpacketplayerabilities":
          properties = "invulnerable: " + data.invulnerable + ", flying: " + data.flying + ", allowFlying: " + data.allowFlying + ", creativeMode: " + data.creativeMode + ", flySpeed: " + data.flySpeed + ", walkSpeed: " + data.walkSpeed + ", capabilitiesRef: " + PluginAPI.player.capabilities.getRef();
          break;
        case "sendpackettabcomplete":
          properties = "msg: " + data.message + ", target: " + data.targetBlock;
          break;
        case "sendpacketclientsettings":
          properties = "lang: " + data.lang + ", view: " + data.view + ", chatVisibility: " + data.chatVisibility + ", enableColors: " + data.enableColors + ", modelPartFlags: " + data.modelPartFlags;
          break;
        case "sendpacketclientstatus":
          properties = "status: " + data.status;
          break;
        case "sendpacketspectate":
          properties = "uuid: " + data.id;
          break;
        case "sendpacketresourcepackstatus":
          properties = "hash: " + data.hash + ", status: " + data.status;
          break;
        default:
          properties = null;
          break;
      }      
    if (properties !== null){
        loggedpackets.push("[packetsent]["+ time +"] "+ev.event+ " properties= " + properties)
    } else {
        loggedpackets.push("[packetsent]["+ time +"] "+ev.event)
    }
  }
  if (ev.event.startsWith("packet")) {
    time = getCurrentTimeWithMilliseconds();
    data = ev.data
    switch (ev.event) {
      case "packetjoingame":
          properties = "ip: " + data.ip + ", gameType: " + data.gameType + ", difficulty: " + data.difficulty + ", entityId: " + data.entityId + ", maxPlayers: " + data.maxPlayers + ", hardcoreMode: " + data.hardcoreMode;
          break;
      case "packetspawnobject":
          properties = "entityId: " + data.entityId + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", speedX: " + data.speedX + ", speedY: " + data.speedY + ", speedZ: " + data.speedZ + ", pitch: " + data.pitch + ", yaw: " + data.yaw + ", type: " + data.type;
          break;
      case "packetspawnxporb":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", xpValue: " + data.xpValue;
          break;
      case "packetspawnglobalentity":
          properties = "entityId: " + data.entityId + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", type: " + data.type;
          break;
      case "packetspawnpainting":
          properties = "entityId: " + data.entityId + ", position: " + data.position + ", title: " + data.title;
          break;
      case "packetentityvelocity":
          properties = "entityId: " + data.entityId + ", motionX: " + data.motionX + ", motionY: " + data.motionY + ", motionZ: " + data.motionZ;
          break;
      case "packetentitymetadata":
          properties = "entityId: " + data.entityId;
          break;
      case "packetspawnplayer":
          properties = "entityId: " + data.entityId + ", playerId: " + data.playerId + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", currentItem: " + data.currentItem;
          break;
      case "packetentityteleport":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", onGround: " + data.onGround;
          break;
      case "packethelditemchange":
          properties = "heldItemHotbarIndex: " + data.heldItemHotbarIndex;
          break;
      case "packetentity":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", onGround: " + data.onGround;
          break;
      case "packetentityheadlook":
          properties = "entityId: " + data.entityId + ", yaw: " + data.yaw;
          break;
      case "packetdestroyentities":
          properties = "entityIDs: " + data.entityIDs;
          break;
      case "packetplayerposlook":
          properties = "x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch;
          break;
      case "packetmultiblockchange":
          properties = null
          break;
      case "packetchunkdata":
          properties = "chunkX: " + data.chunkX + ", chunkZ: " + data.chunkZ + ", extractedData: " + data.extractedData;
          break;
      case "packetblockchange":
          properties = "blockPosition: " + data.blockPosition;
          break;
      case "packetdisconnect":
          properties = "reason: " + data.reason;
          break;
      case "packetcollectitem":
          properties = "entityId: " + data.entityId + ", collectedItemEntityId: " + data.collectedItemEntityId;
          break;
      case "packetchat":
          properties = "type: " + data.type + ", chat: " + data.chat;
          break;
      case "packetanimation":
          properties = "type: " + data.type + ", entityId: " + data.entityId;
          break;
      case "packetusebed":
          properties = "playerID: " + data.playerID + ", bedPos: " + data.bedPos;
          break;
      case "packetspawnmob":
          properties = "entityId: " + data.entityId + ", type: " + data.type + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", headPitch: " + data.headPitch + ", velocityX: " + data.velocityX + ", velocityY: " + data.velocityY + ", velocityZ: " + data.velocityZ + ", metadata: " + data.metadata;
          break;
      case "packetentityeffect":
          properties = "entityId: " + data.entityId + ", effectId: " + data.effectId + ", amplifier: " + data.amplifier + ", duration: " + data.duration + ", ambient: " + data.ambient;
          break;
      case "packetentitystatus":
          properties = "entityId: " + data.entityId + ", entityStatus: " + data.entityStatus;
          break;
      case "packetplayerabilities":
          properties = null
          break;
      case "packettabcomplete":
          properties = "text: " + data.text;
          break;
      case "packetteams":
          properties = "teamName: " + data.teamName + ", mode: " + data.mode;
          break;
      case "packettimeupdate":
          properties = "worldAge: " + data.worldAge + ", timeOfDay: " + data.timeOfDay;
          break;
      case "packetspawnposition":
          properties = "x: " + data.x + ", y: " + data.y + ", z: " + data.z;
          break;
      case "packetupdatehealth":
          properties = "health: " + data.health + ", food: " + data.food + ", saturation: " + data.saturation;
          break;
      case "packetscoreboardobjective":
          properties = "name: " + data.name + ", mode: " + data.mode + ", value: " + data.value + ", type: " + data.type;
          break;
      case "packetspawnexperienceorb":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", xpValue: " + data.xpValue;
          break;
      case "packetentityattributes":
          properties = "entityId: " + data.entityId + ", properties: " + data.properties;
          break;
      case "packetentitymetadata":
          properties = "entityId: " + data.entityId + ", metadata: " + data.metadata;
          break;
      case "packetspawnlivingentity":
          properties = "entityId: " + data.entityId + ", type: " + data.type + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", headPitch: " + data.headPitch + ", velocityX: " + data.velocityX + ", velocityY: " + data.velocityY + ", velocityZ: " + data.velocityZ + ", metadata: " + data.metadata;
          break;
      case "packetspawnpainting":
          properties = "entityId: " + data.entityId + ", position: " + data.position + ", title: " + data.title;
          break;
      case "packetentityvelocity":
          properties = "entityId: " + data.entityId + ", motionX: " + data.motionX + ", motionY: " + data.motionY + ", motionZ: " + data.motionZ;
          break;
      case "packetspawnexperienceorb":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", xpValue: " + data.xpValue;
          break;
      case "packetspawnmob":
          properties = "entityId: " + data.entityId + ", type: " + data.type + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", headPitch: " + data.headPitch + ", velocityX: " + data.velocityX + ", velocityY: " + data.velocityY + ", velocityZ: " + data.velocityZ + ", metadata: " + data.metadata;
          break;
      case "packetspawnlivingentity":
          properties = "entityId: " + data.entityId + ", type: " + data.type + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", headPitch: " + data.headPitch + ", velocityX: " + data.velocityX + ", velocityY: " + data.velocityY + ", velocityZ: " + data.velocityZ + ", metadata: " + data.metadata;
          break;
      case "packetspawnpainting":
          properties = "entityId: " + data.entityId + ", position: " + data.position + ", title: " + data.title;
          break;
      case "packetspawnplayer":
          properties = "entityId: " + data.entityId + ", playerId: " + data.playerId + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", yaw: " + data.yaw + ", pitch: " + data.pitch + ", currentItem: " + data.currentItem;
          break;
      case "packetspawnxporb":
          properties = "entityId: " + data.entityId + ", posX: " + data.posX + ", posY: " + data.posY + ", posZ: " + data.posZ + ", xpValue: " + data.xpValue;
          break;
      case "packetspawnglobalentity":
          properties = "entityId: " + data.entityId + ", x: " + data.x + ", y: " + data.y + ", z: " + data.z + ", type: " + data.type;
          break;
      case "packetentityproperties":
          properties = "entityId: " + data.entityId;
          break;
      default:
          properties = null;
      }
    if (properties !== null){
        loggedpackets.push("[packetreceived]["+ time +"] "+ev.event+ " properties= " + properties)
    } else {
        loggedpackets.push("[packetreceived]["+ time +"] "+ev.event)
    }
  }
});
function downloadPackets() {
  if (counter >= 1){
    PluginAPI.displayToChat({msg: "[packetlogger] because of browser limitations you can only download the txt file once. do .viewpackets to open them in a new tab"})
    return;
  }
  var counter = 0
  const textContent = info + loggedpackets.join('\n');
  const blob = new Blob([textContent], { type: 'text/plain' });
  const saveLink = document.createElement('a');
  saveLink.href = URL.createObjectURL(blob);
  saveLink.download = "packet_logs.txt";
  saveLink.click();
  counter++
}
function openPacketsInNewTab() {
  const textContent = info + loggedpackets.join('\n');
  const blob = new Blob([textContent], { type: 'text/plain' });
  const dataUrl = URL.createObjectURL(blob);
  const newTab = window.open(dataUrl, '_blank');
  newTab.document.title = "packet_logs.txt";
}
PluginAPI.addEventListener("sendchatmessage", function(event) {
  if (event.message === ".downloadpackets") {
    downloadPackets()
    PluginAPI.displayToChat({ msg: "[packetlogger] logged packets downloaded to packet_logs.txt" });
    event.preventDefault = true;
  }
});
PluginAPI.addEventListener("sendchatmessage", function(event) {
  if (event.message === ".viewpackets") {
    openPacketsInNewTab()
    PluginAPI.displayToChat({ msg: "[packetlogger] opened logged packets to a new tab" });
    event.preventDefault = true;
  }
});
