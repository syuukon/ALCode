game_log('--- Script Started ---');

let state = 'idle';

var min_potions = 100;
var purchase_amount = 9999;
var potion_types = ["mpot1"];

let quickMove = true;

var luck = get('leadermluck');

//Main loop executes 10 times per second
setInterval(function () {

    //Set state
    state_controller();

    //Switch statement to decide state
    switch (state) {

        case 'dead':
            handleDead();
            break;

        case 'banking':
            pause();
            break;

        case 'holidayspirit':
            treeBuff();
            break;

        case 'mluck':
            moveToLuck();
            break;

        case 'fishing':
            goFishing();
            break;

        case 'mining':
            goMining();
            break;

        case 'idle':
            idle();
            break;

        case "resupply_potions":
            resupply_potions();
            break;

        case 'nostate':
            noState();
            break;

    }

}, 100);

//Looting 2 times per second
setInterval(function () {

    loot();

}, 500);

//Cosmetic heart 1 time per 3 seconds
setInterval(function () {

    parent.socket.emit('emotion', {
        name: 'hearts_single'
    })

}, 3000);

/* setInterval(function () {

    mluck = get('leadermluck');

}, 10000) */

function state_controller() {

    //Default state = idle
    let new_state = 'idle';

    //Check leader mluck status
    mluck = get('leadermluck');

    //Are we dead?
    if (character.rip) {
        new_state = 'dead';
    }

    //Are we in the bank or the office?
    if (character.map === 'bank' || character.map === 'woffice') {
        if (smart.moving) {
            stop('move');
        }
        new_state = 'nostate';
        set_message('Temp Pause')
    }

    //Do we need the tree buff?
    if (parent.S.holidayspirit === 'undefined' || character.s.hasOwnProperty('holidayspirit')) {
        return;
    } else {
        new_state = 'holidayspirit';
    }

    if (mluck === 'false') {
        new_state = 'mluck'
    }

    //Can we go fishing?
    if (!is_on_cooldown('fishing')) {
        new_state = "fishing";
    }

    //Can we go mining?
    if (!is_on_cooldown('mining') && is_on_cooldown('fishing')) {
        new_state = "mining";
    }

    //Are we currently out of jobs?
    if (mluck === 'true' && is_on_cooldown('fishing') && is_on_cooldown('mining')) {
        new_state = "idle";
    }

    //Do we need to buy potions?
    for (type_id in potion_types) {
        let type = potion_types[type_id];

        let num_potions = num_items(type);

        if (num_potions < min_potions) {
            new_state = "resupply_potions";
            break;
        }
    }

    if (state !== new_state) {
        state = new_state;
    }

    if (character.moving) {
        if (!character.slots['mainhand'] || character.slots['mainhand'].name !== 'broom') {
            equip(locate_item('broom'), 'mainhand');
        }

        if (quickMove === true && character.map !== 'bank' && character.map !== 'woffice' && character.moving && character.mp > 4000 && !is_on_cooldown('mcourage')) {
            use_skill('mcourage');
        };
    }

}

//Respawn logic
async function handleDead() {

    set_message('Respawning');

    //If we are dead, attempt to respawn every 15 seconds. If we are alive, clear the respawn interval
    if (!character.rip) {
        clearInterval(respawnTimer);
    } else {
        respawnTimer = setInterval(() => {
            respawn();
        }, 15000);
    }

};

//Tree buff logic (ONLY DURING XMAS EVENT)
async function treeBuff() {

    let x = character.x
    let y = character.y
    let map = character.map

    set_message('Tree Buff');

    if (!smart.moving) {
        await smart_move({
            to: 'newyear_tree'
        });
        await parent.socket.emit('interaction', {
            type: 'newyear_tree'
        });
    };

    if (!smart.moving && character.s.hasOwnProperty('holidayspirit')) {
        await smart_move({
            map: map,
            x: x,
            y: y
        });
    };

};

async function moveToLuck() {
    let leaderposition = get('leaderposition');
    let leaderluck = get('leadermluck');
    set_message('MLuck');

    if (!smart.moving && leaderluck === 'false') {
        await smart_move(leaderposition);
    }
}



//Fishing logic
async function goFishing() {

    set_message('Fishing')

    if (!smart.moving && character.x !== -1365 && character.y !== -25) {
        await smart_move({
            map: 'main',
            x: -1365,
            y: -25
        });

        if (character.x === -1365 && character.y === -25 && (!character.slots['mainhand'] || character.slots['mainhand'].name !== 'rod')) {
            equip(locate_item('rod'), 'mainhand');
            if (!is_on_cooldown('fishing')) {
                fishingLoop = setInterval(() => {
                    if (!character.c.fishing) {
                        use_skill('fishing');
                    }
                }, 1000);
            }
        }
    }
};

//Mining logic
async function goMining() {

    set_message('Mining')

    if (!smart.moving && character.x !== -275 && character.y !== -15) {
        await smart_move({
            map: 'tunnel',
            x: -275,
            y: -15
        });

        if (character.x === -275 && character.y === -15 && (!character.slots['mainhand'] || character.slots['mainhand'].name !== 'pickaxe')) {
            equip(locate_item('pickaxe'), 'mainhand');
            if (!is_on_cooldown('mining')) {
                miningLoop = setInterval(() => {
                    if (!character.c.mining) {
                        use_skill('mining');
                    }
                }, 1000);
            }
        }
    }
};

//Idle logic (no jobs)
function idle() {

    if (character.map === 'bank' || character.map === 'woffice') {
        return;
    }

    set_message('Idle');

    if (!smart.moving && !character.moving && character.x !== -50 && character.y !== -50) {
        smart_move({
            map: 'main',
            x: -50,
            y: -50
        })
    };

};

//Pause logic (temporary pause while in bank or office)
function noState() {

    set_message('Temp Pause');

}

//This function contains our logic during resupply runs
function resupply_potions() {

    buy_potions();

}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions() {

    if (empty_slots() > 0) {
        for (type_id in potion_types) {
            let type = potion_types[type_id];

            let item_def = parent.G.items[type];

            if (item_def != null) {
                let cost = item_def.g * purchase_amount;

                if (character.gold >= cost) {
                    let num_potions = num_items(type);

                    if (num_potions < min_potions) {
                        buy(type, purchase_amount);
                    }
                } else {
                    game_log("Not Enough Gold!");
                }
            }
        }
    } else {
        game_log("Inventory Full!");
    }

}


//Returns the number of items in your inventory for a given item name;
function num_items(name) {

    let item_count = character.items.filter(item => item != null && item.name == name).reduce(function (a, b) {
        return a + (b["q"] || 1);
    }, 0);

    return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots() {

    return character.esize;

}

//Gets an NPC by name from the current map.
function get_npc(name) {

    let npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

    if (npc.length > 0) {
        return npc[0];
    }

    return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {

    return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));

}