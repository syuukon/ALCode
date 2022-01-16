setInterval(() => {
    if (character.ctype !== 'merchant') return;

    joinGiveAways();

}, 1000)

function joinGiveAways() {
    for (let id in parent.entities) {
        let entity = parent.entities[id];
        if (entity.id != character.id) {
            for (let slot_name in entity.slots) {
                let slot = entity.slots[slot_name];
                if (slot && slot.giveaway) {
                    if (!slot.list.includes(character.id)) {
                        parent.join_giveaway(slot_name, entity.id, slot.rid);
                        return;
                    }
                }
            }
        }
    }
}