setInterval(function () {

    if (character.ctype !== 'merchant') return;

    //searches everyone nearby
    for (id in parent.entities) {
        var current = parent.entities[id];

        //makes sure its a player
        if (current && current.type == 'character' && !current.npc) {
            //determines if they already have a mluck boost
            if (current.s.mluck) {
                //checks to see if the boost is not from their own merchant
                if (!current.s.mluck.strong) {

                    //checks to see if the boost is from you
                    if (current.s.mluck.f && current.s.mluck.f != character.name) {
                        //boosts them if they are in range
                        if (Math.sqrt((character.real_x - current.real_x) *
                                (character.real_x - current.real_x) +
                                (character.real_y - current.real_y) *
                                (character.real_y - current.real_y)) < 320) {
                            luck(current);
                        }
                    }
                }
            } else {
                //if they dont already have a boost then boost them
                if (Math.sqrt((character.real_x - current.real_x) *
                        (character.real_x - current.real_x) +
                        (character.real_y - current.real_y) *
                        (character.real_y - current.real_y)) < 320) {
                    luck(current);
                }
            }
        }
    }
}, 750);

var lastluck = new Date(0);

function luck(target) {
    if (character.ctype !== 'merchant') return;
    // Luck only if not on cd (cd is .1sec).
    if ((new Date() - lastluck > 100)) {
        parent.socket.emit("skill", {
            name: "mluck",
            id: target.id
        });
        //set_message("Lucky " + target.name);
        lastluck = new Date();
    }

}