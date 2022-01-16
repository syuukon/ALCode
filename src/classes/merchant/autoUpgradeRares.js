var upgradeMaxLevel = 8; // Max level it will stop upgrading items at if enabled
var upgradeWhitelist = {

	//  	ItemName, Max Level
	//		broom: 7,
	//		hbow: 7,
	//		eslippers: 7,
	//		eears: 7,
	//		epyjamas: 7
	//		ecape: 7
	//		bow: upgradeMaxLevel
	// 		pyjamas: upgradeMaxLevel,
	//		bunnyears: upgradeMaxLevel,
	//		carrotsword: upgradeMaxLevel,
	//		firestaff: 7,
	//		fireblade: 6,
	//		sshield: 7,
	//		shield: 7,
	//		wgloves: upgradeMaxLevel,
	//		wattire: upgradeMaxLevel,
	//		wcap: upgradeMaxLevel,
	//		wbreeches: upgradeMaxLevel,
	//		wshoes: upgradeMaxLevel,
	//		gphelmet: 7,
	//		cclaw: 7
	//		gloves1: 7,
	//		coat1: 7,
	//		helmet1: 7,
	//		pants1: 7,
	//		shoes1: 7,
	//		harbringer: 5,
	//		oozingterror: 5,
	//		bataxe: 7,
	//		spear: 7,
	//		xmaspants: 7,
	//		xmassweater: 7,
	//		xmashat: 7,
	//		xmasshoes: 7,
	//		mittens: 7,
	//		ornamentstaff: 7,
	//		candycanesword: 7,
	//		warmscarf: 7,
	//		t2bow: 7,
	//		pmace: 7,
	//		basher: 8,
	//		harmor: 5,
	//		hgloves: 5,
	//		wingedboots: 7,
	//		fierygloves: 7
	//		mcape: 8,
	//		mittens: 8,
	//		ornamentstaff: 8
	//		firebow: 10
	//		pickaxe: 7
	//		ololipop: 6,
	//		glolipop: 6
	//		tshirt4: 3, //speed
	//		tshirt7: 5, //a.piercing
	//		tshirt3: 5  //xp shirt
	//		daggerofthedead: 5,
	//		throwingstars: 7,
	//		vboots: 7,
	//		dagger: 7,
	//		snowflakes: 5

};

var combineWhitelist = {

	// ItemName, Max Level
	// lostearring: 2,
	wbook0: 3,
	strearring: 3,
	intearring: 3,
	dexearring: 3,
	ctristone: 3,
//	hpbelt: 3,
//	ringsj: 3,
//	strring: 3,
//	intring: 3,
//	dexring: 3,
	vitring: 2,
	dexamulet: 5,
	intamulet: 5,
	stramulet: 5,
	vitearring: 3,
	dexbelt: 3,
	intbelt: 3,
	strbelt: 3,
	jacko: 3,
	skullamulet: 3

};

setInterval(function () {
	if (character.ctype !== 'merchant') return;
	if (character.map === 'bank') return;

	if (parent != null && parent.socket != null) {
		if (!character.q.upgrade) {
			upgrade();
		}
		if (!character.q.compound) {
			compound_items();
		}
	}

}, 500);

function upgrade() {
	for (let i = 0; i < character.items.length; i++) {
		let c = character.items[i];

		if (c) {
			var level = upgradeWhitelist[c.name];
			if (level && c.level < level) {
				let grades = get_grade(c);
				let scrollname;
				if (c.level < grades[0])
					scrollname = 'scroll0';
				else if (c.level < grades[1])
					scrollname = 'scroll1';
				else
					scrollname = 'scroll2';

				let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
				if (!scroll) {
					parent.buy(scrollname);
					return;
				}

				if (!character.s.hasOwnProperty('massproduction') && character.mp > G.skills.massproduction.mp) {
					use_skill('massproduction');
				}

				parent.socket.emit('upgrade', {
					item_num: i,
					scroll_num: scroll_slot,
					offering_num: null,
					clevel: c.level
				});
				return;
			}
		}
	}
}

function compound_items() {
	let to_compound = character.items.reduce((collection, item, index) => {
		if (item && combineWhitelist[item.name] != null && item.level < combineWhitelist[item.name]) {
			let key = item.name + item.level;
			!collection.has(key) ? collection.set(key, [item.level, item_grade(item), index]) : collection.get(key).push(index);
		}
		return collection;
	}, new Map());

	for (var c of to_compound.values()) {
		let scroll_name = "cscroll" + c[1];

		for (let i = 2; i + 2 < c.length; i += 3) {
			let [scroll, _] = find_item(i => i.name == scroll_name);
			if (scroll == -1) {
				parent.buy(scroll_name);
				return;
			}

			game_log(scroll_name);
			game_log(c[i]);
			game_log(c[i + 1]);
			game_log(c[i + 2]);

			if (!character.s.hasOwnProperty('massproduction') && character.mp > G.skills.massproduction.mp) {
				use_skill('massproduction');
			}

			parent.socket.emit('compound', {
				items: [c[i], c[i + 1], c[i + 2]],
				scroll_num: scroll,
				offering_num: null,
				clevel: c[0]
			});
			return;
		}
	}
}

function get_grade(item) {
	return parent.G.items[item.name].grades;
}

// Returns the item slot and the item given the slot to start from and a filter.
function find_item(filter) {
	for (let i = 0; i < character.items.length; i++) {
		let item = character.items[i];

		if (item && filter(item))
			return [i, character.items[i]];
	}

	return [-1, null];
}