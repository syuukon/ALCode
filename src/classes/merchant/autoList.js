let item = G.items;
var itemListDef = [
/*  	{
		name: 'wcap',
		slot: 1,
		price: item.wcap.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wcap',
		slot: 2,
		price: item.wcap.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wattire',
		slot: 7,
		price: item.wattire.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wattire',
		slot: 8,
		price: item.wattire.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wbreeches',
		slot: 13,
		price: item.wbreeches.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wbreeches',
		slot: 14,
		price: item.wbreeches.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wshoes',
		slot: 19,
		price: item.wshoes.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wshoes',
		slot: 20,
		price: item.wshoes.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wgloves',
		slot: 25,
		price: item.wgloves.g - 1,
		quantity: 1,
		level: 0
	},
	{
		name: 'wgloves',
		slot: 26,
		price: item.wgloves.g - 1,
		quantity: 1,
		level: 0
	}, */
/* 	{
 		name: 'bataxe',
		slot: 10,
		price: 25000000,
		quantity: 1,
		level: 0
	}, */
];

function tryListItem(saleItem) {
	if (character.stand) {
		var slotName = "trade" + saleItem.slot;
		var slot = character.slots[slotName];

		var itemIndex = -1;

		for (var id in character.items) {
			var item = character.items[id];
			if (item != null) {
				if (item.name == saleItem.name && (saleItem.level == null || saleItem.level == item.level)) {
					itemIndex = id;
					break;
				}
			}
		}

		if (itemIndex != -1) {
			var listItem = false;

			if (slot != null && slot.name == saleItem.name) {
				var quantity = 1;

				if (slot.q != null) {
					quantity = slot.q;
				}

				if (quantity != saleItem.quantity || slot.price != saleItem.price) {
					parent.socket.emit("unequip", {
						slot: slotName
					});
					listItem = true;
				}
			} else {
				parent.socket.emit("unequip", {
					slot: slotName
				});
				listItem = true;
			}

			if (listItem) {
				parent.trade('trade' + saleItem.slot, itemIndex, saleItem.price, saleItem.quantity);
			}
		}
	}
}

setInterval(function () {
	for (id in itemListDef) {
		item = itemListDef[id];

		tryListItem(item);
	}
}, 1000);