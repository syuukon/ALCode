game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
var monster_targets = ["crab"];

var state = "farm";

var min_potions = 0; //The number of potions at which to do a resupply run.
var purchase_amount = 0; //How many potions to buy at once.
var potion_types = ["mpot1"]; //The types of potions to keep supplied.


let lastPotion = 0;

function circleCoords(x = 0, y = 0, radius = 50) {
	let targetPos = {
		x: x,
		y: y
	}
	let theta = Math.atan2(character.y - targetPos.y, character.x - targetPos.x) + (180 / Math.PI)
	targetPos.x += Math.cos(theta) * radius
	targetPos.y += Math.sin(theta) * radius

	move(targetPos.x, targetPos.y)
}

function circle() {
	let partyThrowerPlayer = get_player('Syuu6')

	if (null == partyThrowerPlayer) {
		return
	}

	circleCoords(-1155, -60)
}

setInterval(circle, 120)

//Movement And Attacking
setInterval(function () {

	//Determine what state we should be in.
	state_controller();

	//Switch statement decides what we should do based on the value of 'state'
	switch (state) {
		case "farm":
			farm();
			break;
		case "resupply_potions":
			resupply_potions();
			break;
	}
}, 100); //Execute 10 times per second

//Potions And Looting
setInterval(function () {

	loot();

}, 250); //Execute 2 times per second

//Check for our own Merchant's Luck buff every 10 seconds, sets true/false in LocalStorage, along with current co-ordinates if false
setInterval(function () {

	//checks to see if the boost is not from our own merchant

	if (character.name !== 'Syuu6') return;
	if (!character.s.hasOwnProperty('mluck') && character.s.mluck.strong === 'true') {
		set('leadermluck', 'false');
		set('leaderposition', {x:character.x, y:character.y, map:character.map})
	} else {
		set('leadermluck', 'true');
	}

}, 10000)

function state_controller() {
	//Default to farming
	var new_state = "farm";

	//Do we need potions?
	for (type_id in potion_types) {
		var type = potion_types[type_id];

		var num_potions = num_items(type);

		if (num_potions < min_potions) {
			new_state = "resupply_potions";
			break;
		}
	}

	if (state != new_state) {
		state = new_state;
	}

}

//This function contains our logic for when we're farming mobs
function farm() {
	var target = find_viable_targets()[0];
	//Attack or move to target
	if (target != null) {
		//Use Ranger Skills
		if (character.mp > 400 && character.level >= 60) {
			//Multishots (3-Shot and 5-Shot)
			//Only if there is no master
			if (!is_on_cooldown("attack")) {
				let target = Object.values(parent.entities).filter(entity => entity.mtype === monster_targets[0] && entity.level <= 1 && is_in_range(entity, "3shot") && is_in_range(entity, "5shot"));
				/* 				if (target.length >= 5 && character.mp > G.skills["5shot"].mp) {
									use_skill("5shot", target);
									game_log("Used 5-Shot");
								} else  */
				if (target.length >= 3 && character.mp > G.skills["3shot"].mp) {
					use_skill("3shot", target);
					game_log("Used 3-Shot");
				}
			}
		} else if (character.level < 65 && can_attack(target)) {
			attack(target);
		} else {
			return target; //move_to_target(target);
		}
	} else {
		if (!smart.moving) {
			return;
			//			game_log("finding a target");
			//            smart_move({ to: monster_targets[0] });
		}
	}
}

//This function contains our logic during resupply runs
function resupply_potions() {
	var potion_merchant = get_npc("fancypots");

	var distance_to_merchant = null;

	if (potion_merchant != null) {
		distance_to_merchant = distance_to_point(potion_merchant.position[0], potion_merchant.position[1]);
	}

	if (!smart.moving &&
		(distance_to_merchant == null || distance_to_merchant > 250)) {
		smart_move({
			to: "potions"
		});
	}

	if (distance_to_merchant != null &&
		distance_to_merchant < 250) {
		buy_potions();
	}
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions() {
	if (empty_slots() > 0) {
		for (type_id in potion_types) {
			var type = potion_types[type_id];

			var item_def = parent.G.items[type];

			if (item_def != null) {
				var cost = item_def.g * purchase_amount;

				if (character.gold >= cost) {
					var num_potions = num_items(type);

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
	var item_count = character.items.filter(item => item != null && item.name == name).reduce(function (a, b) {
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
	var npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

	if (npc.length > 0) {
		return npc[0];
	}

	return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
	return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
}

//This function will ether move straight towards the target entity,
//or utilize smart_move to find their way there.
function move_to_target(target) {
	if (can_move_to(target.real_x, target.real_y)) {
		smart.moving = false;
		smart.searching = false;
		move(
			character.real_x + (target.real_x - character.real_x) / 2,
			character.real_y + (target.real_y - character.real_y) / 2
		);
	} else {
		if (!smart.moving) {
			smart_move({
				x: target.real_x,
				y: target.real_y
			});
		}
	}
}

//Returns an ordered array of all relevant targets as determined by the following:
////1. The monsters' type is contained in the 'monsterTargets' array.
////2. The monster is attacking you or a party member.
////3. The monster is not targeting someone outside your party.
//The order of the list is as follows:
////Monsters attacking you or party members are ordered first.
////Monsters are then ordered by distance.
function find_viable_targets() {
	var monsters = Object.values(parent.entities).filter(
		mob => (mob.target == null ||
			parent.party_list.includes(mob.target) ||
			mob.target == character.name) &&
		(mob.type == "monster" &&
			(parent.party_list.includes(mob.target) ||
				mob.target == character.name)) ||
		monster_targets.includes(mob.mtype));

	for (id in monsters) {
		var monster = monsters[id];

		if (parent.party_list.includes(monster.target) ||
			monster.target == character.name) {
			monster.targeting_party = 1;
		} else {
			monster.targeting_party = 0;
		}
	}

	//Order monsters by whether they're attacking us, then by distance.
	monsters.sort(function (current, next) {
		if (current.targeting_party > next.targeting_party) {
			return -1;
		}
		var dist_current = distance(character, current);
		var dist_next = distance(character, next);
		// Else go to the 2nd item
		if (dist_current < dist_next) {
			return -1;
		} else if (dist_current > dist_next) {
			return 1
		} else {
			return 0;
		}
	});
	return monsters;
}