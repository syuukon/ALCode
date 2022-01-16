let lastPotion = 0;

setInterval(function () {

    if (character.rip === 'true') return;

    //Heal With skill if we're below 80% hp.
    if (character.hp / character.max_hp < 0.40 && new Date() - lastPotion > 2000) {
        use_skill('use_hp');
        lastPotion = new Date();
    }
    if (character.mp / character.max_mp < 0.50 && new Date() - lastPotion > 2000) {
        use_skill('use_mp');
        lastPotion = new Date();
    }
    if (character.mp / character.max_mp < 0.90 && new Date() - lastPotion > 4000) {
        use_skill("regen_mp");
        lastPotion = new Date();
    }
    if (character.hp / character.max_hp < 0.95 && new Date() - lastPotion > 4000) {
        use_skill("regen_hp");
        lastPotion = new Date();
    }

}, 250);