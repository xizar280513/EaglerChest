/* Experimental touch controls for compatible Eaglercraft 1.12.2 ModAPI builds. */
(function () {
  'use strict';
  if (window.EaglerTouch1122) return;
  var options = window.EaglerTouch1122Config || {};
  var touchDevice = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  if (options.enabled === false || (options.enabled !== true && !touchDevice)) return;
  if (!window.ModAPI || !ModAPI.hooks || typeof ModAPI.addEventListener !== 'function') {
    console.warn('[EaglerTouch1122] ModAPI is unavailable. Load this script after ModAPI.');
    return;
  }

  var hooks = ModAPI.hooks;
  var input = hooks._rippedStaticProperties && hooks._rippedStaticProperties.nlei_PlatformInput;
  var grabKey = 'nlei_PlatformInput_mouseSetGrabbed';
  if (!input || !hooks.methods || typeof hooks.methods[grabKey] !== 'function') {
    console.error('[EaglerTouch1122] Incompatible build: nlei_PlatformInput input bridge is unavailable.');
    return;
  }
  var canvasSelector = options.canvasSelector || '#game_frame canvas';
  try { document.querySelector(canvasSelector); }
  catch (_) {
    console.error('[EaglerTouch1122] Invalid canvasSelector. Input was not patched.');
    return;
  }

  // Minecraft checks isMouseGrabbed() each tick and opens pause if it is false.
  // On iOS the native method returns early because pointer lock is unsupported.
  // Keep the game's own grab/ungrab transitions, without requesting pointer lock.
  input.pointerLockSupported = 0;
  hooks.methods[grabKey] = function (grab) {
    input.pointerLockFlag = grab ? 1 : 0;
    input.pointerLockWaiting = 0;
    input.mouseDX = 0;
    input.mouseDY = 0;
  };

  var root, stick, nub, textbar, textfield;
  var pointers = new Map();
  var pressed = new Map();
  var moveKeys = new Set();
  var mode = 'loading';
  var lastScreen = null;
  var joystickId = null, lookId = null, guiId = null;
  var origin = { x: 0, y: 0 };
  var lookPos = { x: 0, y: 0 };
  var canvas = null;
  var engineReady = false;
  var controllerStyle = null;
  var canvasTouchAction = null;
  var activatedPrompt = null;
  var keyDefs = {
    forward: ['w', 'KeyW', 87], back: ['s', 'KeyS', 83],
    left: ['a', 'KeyA', 65], right: ['d', 'KeyD', 68],
    jump: [' ', 'Space', 32], sneak: ['Shift', 'ShiftLeft', 16],
    sprint: ['Control', 'ControlLeft', 17], inventory: ['e', 'KeyE', 69],
    chat: ['t', 'KeyT', 84], pause: ['Escape', 'Escape', 27]
  };

  function key(type, def) {
    var p = keyDefs[def] || def;
    var ev = new KeyboardEvent(type, {
      key: p[0], code: p[1], keyCode: p[2], which: p[2],
      bubbles: true, cancelable: true
    });
    ev.ec1122Touch = true;
    window.dispatchEvent(ev);
  }
  function hold(action, active) {
    var old = moveKeys.has(action);
    if (old === active) return;
    if (active) moveKeys.add(action); else moveKeys.delete(action);
    key(active ? 'keydown' : 'keyup', action);
    var button = root && root.querySelector('[data-action="' + action + '"]');
    if (button) button.classList.toggle('active', active);
  }
  function tap(action) {
    if (action === 'previous' || action === 'next') {
      if (canvas) canvas.dispatchEvent(new WheelEvent('wheel', {
        bubbles: true, cancelable: true, deltaY: action === 'next' ? 100 : -100,
        clientX: innerWidth / 2, clientY: innerHeight / 2
      }));
      return;
    }
    key('keydown', action); key('keyup', action);
  }
  function mouse(type, button, x, y) {
    if (!canvas) return;
    canvas.dispatchEvent(new MouseEvent(type, {
      bubbles: true, cancelable: true, view: window, button: button,
      clientX: x, clientY: y, screenX: x, screenY: y
    }));
  }
  function mouseAction(action, down) {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    mouse(down ? 'mousedown' : 'mouseup', action === 'use' ? 2 : 0, x, y);
  }
  function release(reason) {
    Array.from(moveKeys).forEach(function (k) { hold(k, false); });
    for (var action of pressed.keys()) if (action === 'attack' || action === 'use') mouseAction(action, false);
    if (guiId !== null) mouse('mouseup', 0, lookPos.x, lookPos.y);
    pressed.clear(); pointers.clear();
    joystickId = lookId = guiId = null;
    if (nub) nub.style.transform = 'translate(-50%,-50%)';
    if (stick) stick.classList.remove('active');
    if (root) root.querySelectorAll('.ec1122-touch-btn.active').forEach(function (e) { e.classList.remove('active'); });
    input.mouseDX = 0; input.mouseDY = 0;
  }
  function prop(obj, name) {
    if (!obj) return null;
    if (name in obj) return obj[name];
    try { var near = ModAPI.util.getNearestProperty(obj, name); return near ? obj[near] : null; }
    catch (_) { return null; }
  }
  function screen() {
    try { return prop(ModAPI.mcinstance, '$currentScreen'); } catch (_) { return null; }
  }
  function screenName(value) {
    if (!value) return '';
    try { return String(value.getClass ? value.getClass().getName() : value.constructor && value.constructor.name || ''); }
    catch (_) { return ''; }
  }
  function onNativeLaunch(ev) {
    if (!ev.isTrusted || !ev.target || typeof ev.target.closest !== 'function') return;
    var button = ev.target.closest('._eaglercraftX_mobile_launch_client');
    var panel = button && button.closest('._eaglercraftX_mobile_press_any_key');
    if (!panel || panel !== input.mobilePressAnyKeyScreen) return;
    // Let the native button handler run first. Audio resume still needs this real gesture.
    activatedPrompt = panel;
    var audio = hooks._rippedStaticProperties.nlei_PlatformAudio;
    try {
      if (audio && audio.audioctx && typeof audio.audioctx.resume === 'function') {
        var resumed = audio.audioctx.resume();
        if (resumed && typeof resumed.catch === 'function') resumed.catch(function () {});
      }
    } catch (_) {}
  }
  function tick() {
    if (input.pointerLockSupported !== 0) input.pointerLockSupported = 0;
    var selected = document.querySelector(canvasSelector);
    if (selected && selected.tagName !== 'CANVAS') selected = null;
    if (selected !== canvas) {
      release('canvas');
      if (canvas) canvas.style.touchAction = canvasTouchAction;
      canvas = selected;
      canvasTouchAction = canvas ? canvas.style.touchAction : null;
      if (canvas) canvas.style.touchAction = 'none';
    }
    var scr = screen();
    var player = !!(ModAPI.player || prop(ModAPI.mcinstance, '$player'));
    // Some compatible builds leave the launch panel attached after startup.
    // Hide only the engine-owned panel the user clicked, once its gate has completed.
    if (activatedPrompt && canvas && (scr || player) && input.hasShownPressAnyKey === 1 && input.isOnMobilePressAnyKey === 0) {
      activatedPrompt.style.setProperty('display', 'none', 'important');
      activatedPrompt = null;
    }
    var active = true;
    if (typeof options.isActive === 'function') {
      try { active = !!options.isActive(); }
      catch (error) { active = false; console.error('[EaglerTouch1122] isActive failed:', error); }
    }
    var next = !canvas || !active ? 'loading' : scr ? 'gui' : player ? 'world' : 'loading';
    if (next !== mode || scr !== lastScreen) release('mode');
    mode = next; lastScreen = scr;
    if (!root) return;
    root.dataset.mode = mode;
    var name = screenName(scr);
    var textMode = /GuiChat|GuiEditSign|GuiRepair|GuiCommandBlock|GuiScreenBook/i.test(name);
    if (!textMode && scr && ModAPI.reflect && ModAPI.reflect.getClassById) {
      textMode = ['net.minecraft.client.gui.GuiChat','net.minecraft.client.gui.inventory.GuiEditSign',
        'net.minecraft.client.gui.GuiScreenBook'].some(function (id) {
          try { var type = ModAPI.reflect.getClassById(id); return !!(type && type.instanceOf(scr)); }
          catch (_) { return false; }
        });
    }
    textbar.hidden = !(mode === 'gui' && textMode);
    if (mode === 'world' && !input.pointerLockFlag) input.pointerLockFlag = 1;
    if (mode !== 'world') { input.mouseDX = 0; input.mouseDY = 0; }
  }
  function joystick(x, y) {
    var dx = x - origin.x, dy = y - origin.y, radius = 43;
    var len = Math.hypot(dx, dy), scale = len > radius ? radius / len : 1;
    nub.style.transform = 'translate(calc(-50% + ' + Math.round(dx * scale) + 'px),calc(-50% + ' + Math.round(dy * scale) + 'px))';
    var threshold = 15;
    hold('forward', dy < -threshold && Math.abs(dy) >= Math.abs(dx) * .5);
    hold('back', dy > threshold && Math.abs(dy) >= Math.abs(dx) * .5);
    hold('left', dx < -threshold && Math.abs(dx) >= Math.abs(dy) * .5);
    hold('right', dx > threshold && Math.abs(dx) >= Math.abs(dy) * .5);
  }
  function onDown(ev) {
    if (mode !== 'world') return;
    ev.preventDefault(); ev.stopPropagation();
    var target = ev.target.closest('[data-action],#ec1122-touch-stick,#ec1122-touch-look');
    if (!target) return;
    try { target.setPointerCapture(ev.pointerId); } catch (_) {}
    if (target.id === 'ec1122-touch-stick') {
      if (joystickId !== null) return;
      joystickId = ev.pointerId; origin.x = ev.clientX; origin.y = ev.clientY;
      stick.classList.add('active'); pointers.set(ev.pointerId, 'stick'); joystick(ev.clientX, ev.clientY);
    } else if (target.id === 'ec1122-touch-look') {
      if (lookId !== null) return;
      lookId = ev.pointerId; lookPos.x = ev.clientX; lookPos.y = ev.clientY;
      pointers.set(ev.pointerId, 'look');
    } else {
      var action = target.dataset.action;
      if (pressed.has(action)) return;
      pressed.set(action, ev.pointerId); pointers.set(ev.pointerId, action);
      target.classList.add('active');
      if (action === 'attack' || action === 'use') mouseAction(action, true);
      else if (action === 'jump' || action === 'sneak' || action === 'sprint') hold(action, true);
      else tap(action);
    }
  }
  function onMove(ev) {
    var action = pointers.get(ev.pointerId);
    if (!action) return;
    ev.preventDefault(); ev.stopPropagation();
    if (action === 'stick') joystick(ev.clientX, ev.clientY);
    if (action === 'look') {
      var dx = ev.clientX - lookPos.x, dy = ev.clientY - lookPos.y;
      lookPos.x = ev.clientX; lookPos.y = ev.clientY;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        input.mouseDX = Math.max(-180, Math.min(180, input.mouseDX + dx * 1.35));
        input.mouseDY = Math.max(-180, Math.min(180, input.mouseDY - dy * 1.35));
      }
    }
  }
  function onUp(ev) {
    var action = pointers.get(ev.pointerId);
    if (!action) return;
    ev.preventDefault(); ev.stopPropagation();
    pointers.delete(ev.pointerId);
    if (action === 'stick') {
      joystickId = null; ['forward','back','left','right'].forEach(function (a) { hold(a, false); });
      nub.style.transform = 'translate(-50%,-50%)'; stick.classList.remove('active');
    } else if (action === 'look') lookId = null;
    else {
      pressed.delete(action);
      var target = root.querySelector('[data-action="' + action + '"]');
      if (target) target.classList.remove('active');
      if (action === 'attack' || action === 'use') mouseAction(action, false);
      if (action === 'jump' || action === 'sneak' || action === 'sprint') hold(action, false);
    }
  }
  function onGuiDown(ev) {
    if (mode !== 'gui' || guiId !== null || !canvas || ev.target !== canvas) return;
    ev.preventDefault(); ev.stopPropagation(); guiId = ev.pointerId;
    lookPos.x = ev.clientX; lookPos.y = ev.clientY;
    try { canvas.setPointerCapture(ev.pointerId); } catch (_) {}
    mouse('mousemove', 0, ev.clientX, ev.clientY);
    mouse('mousedown', 0, ev.clientX, ev.clientY);
  }
  function onGuiMove(ev) {
    if (mode !== 'gui' || guiId !== ev.pointerId) return;
    lookPos.x = ev.clientX; lookPos.y = ev.clientY;
    ev.preventDefault(); ev.stopPropagation(); mouse('mousemove', 0, ev.clientX, ev.clientY);
  }
  function onGuiUp(ev) {
    if (guiId !== ev.pointerId) return;
    ev.preventDefault(); ev.stopPropagation(); guiId = null;
    lookPos.x = ev.clientX; lookPos.y = ev.clientY;
    mouse('mousemove', 0, ev.clientX, ev.clientY);
    mouse('mouseup', 0, ev.clientX, ev.clientY);
  }
  function onGuiCaptureLost(ev) {
    if (guiId === ev.pointerId) release('capture');
  }
  function captureText(ev) {
    if (!textfield || ev.target !== textfield || ev.ec1122Touch) return;
    ev.stopImmediatePropagation();
  }
  function commitText(value) {
    Array.from(value).forEach(function (c) {
      var code = c === ' ' ? 32 : c.toUpperCase().charCodeAt(0);
      var def = [c, c === ' ' ? 'Space' : 'Key' + c.toUpperCase(), code];
      key('keydown', def); key('keyup', def);
    });
  }
  function mount() {
    if (root) return;
    controllerStyle = document.createElement('style');
    controllerStyle.textContent = '\
      #ec1122-touch{position:fixed;inset:0;z-index:50;pointer-events:none;color:#fff;font:700 14px system-ui,sans-serif;--edge: max(12px, env(safe-area-inset-left));}\
      #ec1122-touch[data-mode="loading"]{display:none}#ec1122-touch[data-mode="gui"] .ec1122-touch-world{display:none}\
      #ec1122-touch .ec1122-touch-world{position:absolute;inset:0;pointer-events:none;touch-action:none}\
      #ec1122-touch-look{position:absolute;left:49%;top:15%;width:51%;height:69%;pointer-events:auto;touch-action:none}\
      #ec1122-touch-stick{position:absolute;left:var(--edge);bottom:max(26px,env(safe-area-inset-bottom));width:116px;height:116px;border-radius:50%;border:2px solid #ffffff70;background:#111a;pointer-events:auto;touch-action:none;box-shadow:0 4px 18px #0009}\
      #ec1122-touch-stick:after{content:"";position:absolute;inset:22px;border-radius:50%;border:1px solid #ffffff44}#ec1122-touch-nub{position:absolute;left:50%;top:50%;width:48px;height:48px;border-radius:50%;background:#fca311d9;border:2px solid #fff;transform:translate(-50%,-50%);box-shadow:0 2px 12px #0008}\
      .ec1122-touch-btn{position:absolute;display:grid;place-items:center;width:54px;height:54px;border:1.5px solid #ffffffa0;border-radius:16px;background:#151515bd;color:#fff;box-shadow:0 3px 12px #000b;pointer-events:auto;touch-action:none;user-select:none;padding:0;font:700 14px system-ui,sans-serif}\
      .ec1122-touch-btn.active{background:#fca311;color:#111}.ec1122-touch-btn:focus{outline:none}\
      #ec1122-touch [data-action="jump"]{right:max(14px,env(safe-area-inset-right));bottom:max(34px,env(safe-area-inset-bottom));width:65px;height:65px}\
      #ec1122-touch [data-action="attack"]{right:max(94px,calc(env(safe-area-inset-right) + 80px));bottom:max(21px,env(safe-area-inset-bottom))}\
      #ec1122-touch [data-action="use"]{right:max(18px,env(safe-area-inset-right));bottom:max(112px,calc(env(safe-area-inset-bottom) + 79px))}\
      #ec1122-touch [data-action="sneak"]{left:max(143px,calc(env(safe-area-inset-left) + 130px));bottom:max(30px,env(safe-area-inset-bottom));width:48px;height:48px}\
      #ec1122-touch [data-action="inventory"]{right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top))}\
      #ec1122-touch [data-action="chat"]{right:max(76px,calc(env(safe-area-inset-right) + 64px));top:max(12px,env(safe-area-inset-top))}\
      #ec1122-touch [data-action="pause"]{left:max(12px,env(safe-area-inset-left));top:max(12px,env(safe-area-inset-top))}\
      #ec1122-touch [data-action="sprint"]{left:max(138px,calc(env(safe-area-inset-left) + 124px));bottom:max(92px,calc(env(safe-area-inset-bottom) + 76px));width:52px;height:46px;font-size:11px}\
      #ec1122-touch [data-action="previous"]{left:calc(50% - 60px);bottom:max(65px,calc(env(safe-area-inset-bottom) + 48px));width:46px;height:42px}\
      #ec1122-touch [data-action="next"]{left:calc(50% + 14px);bottom:max(65px,calc(env(safe-area-inset-bottom) + 48px));width:46px;height:42px}\
      #ec1122-touch-gui-back{display:none;position:absolute;left:max(12px,env(safe-area-inset-left));top:max(12px,env(safe-area-inset-top));width:auto;min-width:66px;height:44px;padding:0 13px;border:1.5px solid #fff9;border-radius:12px;background:#111d;color:#fff;pointer-events:auto;touch-action:manipulation;font:700 14px system-ui,sans-serif}\
      #ec1122-touch[data-mode="gui"] #ec1122-touch-gui-back{display:grid;place-items:center}\
      #ec1122-touch-text{position:absolute;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));display:flex;gap:8px;padding:8px;border-radius:12px;background:#111e;pointer-events:auto}\
      #ec1122-touch-text[hidden]{display:none}#ec1122-touch-text input{min-width:0;flex:1;height:42px;font:16px system-ui}#ec1122-touch-text button{height:42px;padding:0 14px;border-radius:8px;background:#fca311;color:#111}\
      @media(orientation:portrait){#ec1122-touch-stick{width:104px;height:104px;bottom:max(88px,calc(env(safe-area-inset-bottom) + 70px))}#ec1122-touch-look{left:37%;width:63%;top:17%;height:55%}.ec1122-touch-btn{width:49px;height:49px}#ec1122-touch [data-action="jump"]{bottom:max(101px,calc(env(safe-area-inset-bottom) + 83px))}#ec1122-touch [data-action="attack"]{bottom:max(33px,env(safe-area-inset-bottom));right:max(86px,calc(env(safe-area-inset-right) + 72px))}#ec1122-touch [data-action="use"]{bottom:max(166px,calc(env(safe-area-inset-bottom) + 148px))}#ec1122-touch [data-action="sneak"]{bottom:max(30px,env(safe-area-inset-bottom));left:max(18px,env(safe-area-inset-left))}#ec1122-touch [data-action="sprint"]{bottom:max(205px,calc(env(safe-area-inset-bottom) + 187px));left:max(20px,env(safe-area-inset-left))}#ec1122-touch [data-action="previous"],#ec1122-touch [data-action="next"]{bottom:max(81px,calc(env(safe-area-inset-bottom) + 63px))}}';
    document.head.appendChild(controllerStyle);
    root = document.createElement('div'); root.id = 'ec1122-touch'; root.dataset.mode = 'loading';
    root.innerHTML = '<div class="ec1122-touch-world"><div id="ec1122-touch-look" aria-label="Look around"></div><div id="ec1122-touch-stick" aria-label="Move"><div id="ec1122-touch-nub"></div></div>' +
      '<button class="ec1122-touch-btn" data-action="pause" aria-label="Menu">Ⅱ</button><button class="ec1122-touch-btn" data-action="chat">Chat</button><button class="ec1122-touch-btn" data-action="inventory">Items</button>' +
      '<button class="ec1122-touch-btn" data-action="jump">Jump</button><button class="ec1122-touch-btn" data-action="attack">Hit</button><button class="ec1122-touch-btn" data-action="use">Use</button><button class="ec1122-touch-btn" data-action="sneak">Crouch</button><button class="ec1122-touch-btn" data-action="sprint">Sprint</button>' +
      '<button class="ec1122-touch-btn" data-action="previous" aria-label="Previous hotbar slot">◀</button><button class="ec1122-touch-btn" data-action="next" aria-label="Next hotbar slot">▶</button></div>' +
      '<button id="ec1122-touch-gui-back" type="button">Back</button>' +
      '<form id="ec1122-touch-text" hidden><input id="ec1122-touch-input" aria-label="Game text" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit">Send</button></form>';
    document.body.appendChild(root);
    stick = root.querySelector('#ec1122-touch-stick'); nub = root.querySelector('#ec1122-touch-nub');
    textbar = root.querySelector('#ec1122-touch-text'); textfield = root.querySelector('#ec1122-touch-input');
    root.querySelector('#ec1122-touch-gui-back').addEventListener('click', function () { tap('pause'); });
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('lostpointercapture', onUp);
    document.addEventListener('pointerdown', onGuiDown, true);
    document.addEventListener('pointermove', onGuiMove, true);
    document.addEventListener('pointerup', onGuiUp, true);
    document.addEventListener('pointercancel', onGuiUp, true);
    document.addEventListener('lostpointercapture', onGuiCaptureLost, true);
    window.addEventListener('keydown', captureText, true);
    window.addEventListener('keyup', captureText, true);
    textbar.addEventListener('submit', function (ev) {
      ev.preventDefault(); commitText(textfield.value); textfield.value = '';
      key('keydown', ['Enter','Enter',13]); key('keyup', ['Enter','Enter',13]);
    });
    window.addEventListener('blur', function () { release('blur'); });
    window.addEventListener('pagehide', function () { release('hidden'); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) release('hidden'); });
    window.addEventListener('resize', function () { release('resize'); });
    window.addEventListener('orientationchange', function () { release('orientation'); });
    setInterval(tick, 50); tick(); engineReady = true;
  }
  ModAPI.addEventListener('load', mount);
  document.addEventListener('click', onNativeLaunch);
  if (options.mountNow === true) mount();
  window.EaglerTouch1122 = { version: 1, get mode() { return mode; }, release: release,
    inspect: function () { return { mode: mode, pointers: pointers.size, held: Array.from(moveKeys), grab: input.pointerLockFlag,
      look: [input.mouseDX, input.mouseDY], ready: engineReady }; } };
})();
