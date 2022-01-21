var gui_tl_gold = true; //Enable Kill (or XP) till level & GPH [scripted session] = true, Disable Kill (or XP) till level & GPH [scripted session] = false
var gui_timer = false; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
var till_level = 0; //Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

var uc = false; //Enable Upgrading/Compounding/selling/exchanging of items = true, Disable Upgrading/Compounding/selling/exchanging of items = false
var upgrade_level = 8; //Max level it will stop upgrading items at if enabled
var compound_level = 3; //Max level it will stop compounding items at if enabled
swhitelist = []; //swhitelist is for the selling of items
ewhitelist = []; //ewhitelist is for the exchanging of items
uwhitelist = []; //uwhitelist is for the upgrading of items.
cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //cwhitelist is for the compounding of items.
// Upgrading/Compounding/selling/exchanging //

var purchase_pots = false; //Enable Potion Purchasing = true, Disable Potion Purchasing = false
var buy_hp = false; //Allow HP Pot Purchasing = true, Disallow HP Pot Purchasing = false
var buy_mp = true; //Allow MP Pot Purchasing = true, Disallow MP Pot Purchasing = false
var hp_potion = 'hpot1'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
var mp_potion = 'mpot1'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
var pots_minimum = 50; //If you have less than this, you will buy more
var pots_to_buy = 999; //This is how many you will buy
// Potion Maintenance //

useInvis = false; //[Rogue Skill] //Enable going invisible on cooldown = true, Disable going invisible on cooldown = false
useBurst = false; //[Mage Skill] //Enable Using burst on cooldown [only on targets above 6,000 hp] = true, Disable using burst on cooldown = false
useCharge = false; //[Warrior Skill] //Enable Using charge on cooldown = true, Disable using charge on cooldown = false
useSupershot = false; //[Ranger Skill] //Enable using supershot on cooldown = true, Disable using supershot on cooldown = false
// Skill Usage [Only turn on skill for the class you are running, if you want to use skills] //
useEnergize = true;

//Grind Code start --------------------------
setInterval(function() {

  //Party leader
  let leader = get_player(character.party);

  //Current target and target of leader.
  let currentTarget = get_target();
  let leaderTarget = get_target_of(leader);
  let targetTarget = get_target_of(currentTarget);

  //Change the target.
  if (!currentTarget || currentTarget !== leaderTarget) {
    //Current target is empty or other than the leader's.
    change_target(leaderTarget);
    currentTarget = get_target();
  }

  //Uses Vanish if enabled
  if (useInvis && character.ctype === 'rogue') {
    invis();
  }

  //Uses Burst if enabled [only on targets above 6,000 hp]
  if (useBurst && currentTarget && currentTarget.hp > 6000 && character.ctype === 'mage') {
    burst(currentTarget);
  }

  //Uses Charge if enabled
  if (useCharge && character.ctype === 'warrior') {
    charge();
  }

  //Uses supershot if enabled [only on targets above 6,000 hp]
  if (useSupershot && currentTarget && currentTarget.hp > 6000 && character.ctype === 'ranger') {
    supershot(currentTarget);
  }

  if (useEnergize) {
    energize();
  }

  //Attack the target.
  if (currentTarget && can_attack(currentTarget) && targetTarget == leader) {
    //Current target isn't empty and attackable.
    attack(currentTarget);
    set_message("Attacking: " + currentTarget.mtype);
  }

}, (1 / character.frequency + 50) / 4); //base loop off character frequency

/* setInterval(function() {

  //Party leader
  let leader = get_player(character.party);

  //Move to leader.
  if (leader && !character.moving)
    //Move only if you are not already moving.
    move(leader.real_x + 30, leader.real_y);

}, 250); //Loop every 250 milliseconds */

setInterval(function() {

  //Upgrade/Compound/Sell/Exchange Items
  if (uc) {
    seuc_merge(upgrade_level, compound_level);
  }

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions(buy_hp, buy_mp);
  }

}, 1000); //Loop every 1 second.

setInterval(function() {

  //Updates GUI for Till_Level/Gold
  if (gui_tl_gold) {
    updateGUI();
  }

  //Updates GUI for Time Till Level
  if (gui_timer) {
    update_xptimer();
  }

  //Loot available chests
  loot();

}, 250); //Loop every 500 milliseconds

//Check for Merchant's Luck buff every 5 seconds, sets true/false in LocalStorage
setInterval(function() {

  if (!character.s.hasOwnProperty('mluck')) {
    set(character.name + '_mluck', 'mluck_false');
  } else {
    set(character.name + '_mluck', 'mluck_true');
  }

}, 5000)

//--------------------------Grind Code End

//Upgrade/Compound/Sell/Exchange Items
function seuc_merge(ulevel, clevel) {
  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];
    if (c) {
      if (uwhitelist.includes(c.name) && c.level < ulevel) {
        let grades = item_info(c).grades;
        let scrollname;
        //Gets the item grade from parent.G.items so it only uses the cheapest scroll possible.
        if (c.level < grades[0])
          scrollname = 'scroll0';
        else if (c.level < grades[1])
          scrollname = 'scroll1';
        else
          scrollname = 'scroll2';
        //Check if the required scroll is in the inventory, buy one if there isn't.

        let [scroll_slot, scroll] = find_item_filter(i => i.name === scrollname);
        if (!scroll) {
          parent.buy(scrollname);
          return;
        }

        //Upgrade the item.
        parent.socket.emit('upgrade', {
          item_num: i,
          scroll_num: scroll_slot,
          offering_num: null,
          clevel: c.level
        });
        return;
      } else if (cwhitelist.includes(c.name) && c.level < clevel) { //There is an item that has to be compounded.
        let [item2_slot, item2] = find_item_filter((item) => c.name === item.name && c.level === item.level, i + 1); //The second item to compound.
        let [item3_slot, item3] = find_item_filter((item) => c.name === item.name && c.level === item.level, item2_slot + 1); //The third item to compound.
        if (item2 && item3) { //If there is a second and third copy of the item compound them.
          let cscrollname;
          if (c.level < 2) //Use whitescroll at base and +1.
            cscrollname = 'cscroll0';
          else //Use blackscroll at +2 and higher
            cscrollname = 'cscroll1';

          //Check if the required scroll is in the inventory, buy one if there isn't.
          let [cscroll_slot, cscroll] = find_item_filter(i => i.name === cscrollname);
          if (!cscroll) {
            parent.buy(cscrollname);
            return;
          }

          //Compound the items.
          parent.socket.emit('compound', {
            items: [i, item2_slot, item3_slot],
            scroll_num: cscroll_slot,
            offering_num: null,
            clevel: c.level
          });
          return;
        }
      } else if (c && ewhitelist.includes(c.name)) { //There is an item that has to be exchanged.

        //Exchange the items.
        exchange(i)
        parent.e_item = i;
      } else if (c && swhitelist.includes(c.name)) { //There is an item that has to be sold.

        //Sell the items.
        sell(i);
      }
    }
  }
}

//Purchase Potions
function purchase_potions(buyHP, buyMP) {
  let [hpslot, hppot] = find_item_filter(i => i.name == hp_potion);
  let [mpslot, mppot] = find_item_filter(i => i.name == mp_potion);

  if (buyHP && (!hppot || hppot.q < pots_minimum)) {
    parent.buy(hp_potion, pots_to_buy);
    set_message("Buying HP pots.");
  }
  if (buyMP && (!mppot || mppot.q < pots_minimum)) {
    parent.buy(mp_potion, pots_to_buy);
    set_message("Buying MP pots.");
  }
}

//Returns the item information from parent.G.items of the item.
function item_info(item) {
  return parent.G.items[item.name];
}

//Returns the item slot and the item given the slot to start from and a filter.
function find_item_filter(filter, search_slot) {
  let slot = search_slot;
  if (!slot)
    slot = 0

  for (let i = slot; i < character.items.length; i++) {
    let item = character.items[i];

    if (item && filter(item))
      return [i, character.items[i]];
  }

  return [-1, null];
}

//Skill Usage

//Casts Vanish if class is Rogue and enabled and off cooldown
var lastinvis;

function invis() {
  //Vanish once invis is off cd (cd is 12sec).
  if (!lastinvis || new Date() - lastinvis > 12000) {
    lastinvis = new Date();
    parent.socket.emit("ability", {
      name: "invis",
    });
  }
}

//Casts burst if class is mage and enabled and off cooldown
var lastburst;

function burst(currentTarget) {
  //Cast burst on target whenever you're off cd (cd is 10sec).
  if (!lastburst || new Date() - lastburst > 10000) {
    lastburst = new Date();
    parent.socket.emit("ability", {
      name: "burst",
      id: currentTarget.id
    });
  }
}

//casts charge if class is warrior and enabled and off cooldown
var lastcharge;

function charge() {
  //Charge only if charge is off of cd (cd is 40sec).
  if (!lastcharge || new Date() - lastcharge > 40000) {
    lastcharge = new Date();
    parent.socket.emit("ability", {
      name: "charge",
    });
  }
}

//casts supershot when off cooldown and if enabled
var lastsupershot;

function supershot(currentTarget) {
  //Cast supershot on target whenever you're off cd (cd is 30sec).
  if (!lastsupershot || new Date() - lastsupershot > 30000) {
    lastsupershot = new Date();
    parent.socket.emit("ability", {
      name: "supershot",
      id: currentTarget.id
    });
  }
}

var lastEnergize;

function energize() {
  let nameRanger = 'Syuu6';
  rangerObj = parent.entities[nameRanger]
  if (!lastEnergize || new Date() - lastEnergize > 4000) {
    if (is_in_range(rangerObj, "energize")) {
      lastEnergize = new Date();
      use_skill("energize", nameRanger);
    }
  }
}

//GUI Stuff
var minute_refresh; //how long before the tracker refreshes
var last_target = null;
var gold = character.gold;
var date = new Date();
var p = parent;

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  p.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);

  let $ = p.$;
  let brc = $('#bottomrightcorner');

  brc.find('#xptimer').remove();

  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '96px',
    fontSize: '28px',
    color: '#77EE77',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px'
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
//lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;

  let $ = p.$;
  let now = new Date();

  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
  if (time < 1) return; //1s safe delay
  let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
  if (time > 60 * minute_refresh) {
    last_minutes_checked = new Date();
    last_xp_checked_minutes = character.xp;
  }
  last_xp_checked_kill = character.xp;

  let xp_missing = p.G.levels[character.level] - character.xp;
  let seconds = Math.round(xp_missing / xp_rate);
  let minutes = Math.round(seconds / 60);
  let hours = Math.round(minutes / 60);
  let counter = `${hours}h ${minutes % 60}min`;

  $('#xpcounter').text(counter);
  $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}

function initGUI() {
  let $ = p.$;
  let brc = $('#bottomrightcorner');
  let blc = $('#bottomleftcorner2');
  $('#xpui').css({
    fontSize: '25px',
  });

  brc.find('.xpsui').css({
    background: 'url("https://i.imgur.com/zCb8PGK.png")',
    backgroundSize: 'cover'
  });

  blc.find('#goldui').remove();
  blc.find('#goldgainloss').remove();
  let gb = $('<div id="goldui"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  let ggl = $('<div id="goldgainloss"></div>').css({ //gold gain loss
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  $('#bottomleftcorner2').prepend(ggl);
  $('#bottomleftcorner2').prepend(gb);
}

if (till_level === 0)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / p.G.levels[character.level]) * 100).toFixed(2);
  let xp_string = `LV${character.level} ${xp_percent}%`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  if (last_target) {
    let xp_missing = p.G.levels[character.level] - character.xp;
    let monster_xp = p.G.monsters[last_target].xp;
    goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
    let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
    let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
    xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
  }
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
} else if (till_level === 1)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
  let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

if (gui_tl_gold) {
  initGUI();
}

if (gui_timer) {
  init_xptimer(5);
}