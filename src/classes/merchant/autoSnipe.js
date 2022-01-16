setInterval(function () {

  if (character.ctype !== 'merchant') return;

  buyCheapStuff();

}, 250);

function buyCheapStuff() {
  if (character.ctype !== 'merchant') return;
  for (i in parent.entities) {
    let otherPlayer = parent.entities[i];
    if (otherPlayer.player &&
      otherPlayer.ctype === "merchant" &&
      otherPlayer.slots &&
      distance(character, otherPlayer) < G.skills.mluck.range) {

      let tradeSlots = Object.keys(otherPlayer.slots).filter(tradeSlot => tradeSlot.includes("trade"));
      tradeSlots.forEach(tradeSlot => {
        if (otherPlayer.slots[tradeSlot] &&
          !otherPlayer.slots[tradeSlot].b &&
          !otherPlayer.slots[tradeSlot].hasOwnProperty('giveaway') &&
          otherPlayer.slots[tradeSlot].price < item_value(otherPlayer.slots[tradeSlot]) &&
          character.gold > otherPlayer.slots[tradeSlot].price) {
          trade_buy(otherPlayer, tradeSlot);
          log("Bought " + otherPlayer.slots[tradeSlot].name + " from player: " + otherPlayer.name)
        }
      });
    }
  }
}