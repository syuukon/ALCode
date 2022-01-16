game_log("---Script Start---");

let state = "idle";

var min_potions = 0; //The number of potions at which to do a resupply run.
var purchase_amount = 0; //How many potions to buy at once.
var potion_types = ["mpot1"]; //The types of potions to keep supplied.

//Movement And Attacking
setInterval(function () {

    //Determine what state we should be in.
    state_controller();

    //Switch statement decides what we should do based on the value of 'state'
    switch (state) {
        case "dead":
            handleDead();
            break;
        case "banking":
            banking();
            break;
        case "treebuff":
            treebuff();
            break;
        case "fishing":
            fishing();
            break;
        case "mining":
            mining();
            break;
        case "resupply_potions":
            resupply_potions();
            break;
        case "idle":
            idle();
            break;
    }

}, 100); //Execute 10 times per second

//Potions And Looting
setInterval(function () {

    loot();

}, 500); //Execute 2 times per second

setInterval(function () {

    parent.socket.emit("emotion", { name: 'hearts_single' })

}, 2500); //Execute 2 times per second

function state_controller() {

    //Default to farming
    let new_state = "idle";

    if (character.rip) {
        new_state = "dead";
    }

    if (character.map === 'bank' || character.map === 'woffice') {
        if (smart.moving) {
            stop("move");
        }
        new_state = banking;
        set_message('Banking')
    }

    //Do we need tree buff?
/*     if (!character.s.hasOwnProperty('holidayspirit')) {
        new_state = "treebuff";
        set_message('Move2Tree');
    } */

    if (character.map !== 'bank' && character.map !== 'woffice' && !character.rip) {
        if (!is_on_cooldown('fishing')) {
            new_state = "fishing";
        }
    }

    if (is_on_cooldown('fishing') && !character.rip && character.map !== 'bank') {
        if (!is_on_cooldown('mining') && new_state !== 'fishing') {
            new_state = "mining";
        }
    }

    if (is_on_cooldown('fishing') && is_on_cooldown('mining') && !character.rip) {
        new_state = "idle";
    }

    //Do we need potions?
    for (type_id in potion_types) {
        let type = potion_types[type_id];

        let num_potions = num_items(type);

        if (num_potions < min_potions) {
            new_state = "resupply_potions";
            break;
        }
    }

    if (state != new_state) {
        state = new_state;
    }

}

function handleDead() {

    set_message('Respawning');

    setInterval(function () {
        respawn();
    }, 15000);

}

//This function contains our logic during treebuff runs
/* async function treebuff() {
    if (!character.s.hasOwnProperty('holidayspirit')) {
        let x = character.x
        let y = character.y
        let map = character.map
        if (!smart.moving) {
            await smart_move({
                to: 'newyear_tree'
            })
            parent.socket.emit('interaction', {
                type: 'newyear_tree'
            })
        }
        if (!smart.moving) {
            await smart_move({
                map: map,
                x: x,
                y: y
            })
        }
    }
} */

async function fishing() {
    if (character.map === 'main' && character.x === -1365 && character.y === -25) return;
    set_message('Fishing');
    if (!smart.moving) {
        await smart_move({
            map: 'main',
            x: -1365,
            y: -25
        });
        if (!character.slots["mainhand"] || character.slots["mainhand"].name != "rod") {
            unequip("mainhand");
            equip(locate_item("rod"), "mainhand");
            if (!is_on_cooldown('fishing')) {
                fishingloop = setInterval(() => {
                    if (!character.c.fishing) {
                        use_skill('fishing');
                    }
                }, 1000);
            }
        }
    }
}

async function mining() {
    if (character.map === 'tunnel' && character.x === -275 && character.y === -30) return;
    set_message('Mining');
    if (!smart.moving) {
        await smart_move({
            map: 'tunnel',
            x: -275,
            y: -30
        });
        if (!character.slots["mainhand"] || character.slots["mainhand"].name != "pickaxe") {
            unequip("mainhand");
            equip(locate_item("pickaxe"), "mainhand");
            if (is_on_cooldown('mining')) {
                clearInterval(miningloop);
            } else 
            if (!is_on_cooldown('mining')) {
                miningloop = setInterval(() => {
                    if (!character.c.mining) {
                        use_skill('mining');
                    }
                }, 1000);
            }
        }
    }
}

//This function contains our logic for when we're idle (no jobs)
async function idle() {
    if (character.map === 'bank') return;
    if (!character.slots["mainhand"] || character.slots["mainhand"].name != "broom") {
        unequip("mainhand");
        equip(locate_item("broom"), "mainhand");
    }
    if (!smart.moving && !character.moving) {
        if (character.x === -270 && character.y === -150) return;
        game_log('Moving to idle position');
        set_message('Idle');
        await smart_move({
            map: 'main',
            x: -270,
            y: -150
        });
    }
    fishingloop = clearInterval(fishingloop);
    miningloop = clearInterval(miningloop);
}

function banking() {
    if (character.map === 'bank') {
        return;
    }
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