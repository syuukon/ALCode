function partyTime(name) {

  if (character.name !== 'Syuu6') return;

  if (!character.party || !parent.party_list.includes(name)) {
    send_party_invite(name)
  }
  setTimeout(() => {
    partyTime(name)
  }, 5000)
}

partyTime('Syuu2');
partyTime('Syuu');
//partyTime('Syuu6');
partyTime('Syuu4');
partyTime('Syuu5');

function on_party_invite(name) {
  if (name === "Syuu6") {
    return accept_party_invite(name);
  }
}

function on_magiport(name) {
  if (name === 'Syuu2') {
    game_log("Accepting magiport!");
    return accept_magiport(name);
  }
}