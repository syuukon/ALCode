setInterval(function () {

    if (character.ctype === "merchant" && is_moving(character) && character.stand) close_stand();
    if (character.ctype === "merchant" && !is_moving(character) && !character.stand) open_stand();

}, 50);