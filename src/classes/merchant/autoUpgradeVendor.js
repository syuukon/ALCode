const ITEM_TO_BUY_AND_UPGRADE = ''; //'helmet'; 'coat'; //'gloves'; //'pants';  //'shoes';
const NUM_TO_KEEP = 1
const NUM_TO_BUY = 2 // If this is less than NUM_TO_KEEP, we won't buy anything.
const LEVEL_TO_UPGRADE_TO = 8

setInterval(function () {

    if (!character.q.upgrade && !character.q.compound) {
        buyAndUpgradeLoop();
    }

}, 500);

async function buyAndUpgradeLoop() {

    if (character.ctype !== 'merchant') return;

    /** Buy items if we need */
    let numItems = 0
    for (let i = 0; i < character.isize; i++) {
        const item = character.items[i]
        if (!item) continue // No item in this slot
        if (item.name !== ITEM_TO_BUY_AND_UPGRADE) continue // Not the item we're looking for
        numItems += 1
    }
    if (numItems < NUM_TO_BUY) {
        await buy(ITEM_TO_BUY_AND_UPGRADE)
        return
    }
    if (numItems <= NUM_TO_KEEP) return // No more to upgrade

    /** Find the lowest level item, we'll upgrade that one */
    let lowestLevel = Number.MAX_SAFE_INTEGER
    let lowestLevelPosition
    for (let i = 0; i < character.isize; i++) {
        const item = character.items[i]
        if (!item) continue // No item in this slot

        if (item.name == ITEM_TO_BUY_AND_UPGRADE) {
            // This is an item we want to upgrade!
            if (item.level < lowestLevel) {
                lowestLevel = item.level
                lowestLevelPosition = i
            }
        }
    }

    /** Don't upgrade if it's already the level we want, or there's no items to upgrade */
    if (lowestLevel < LEVEL_TO_UPGRADE_TO) {
        /** Find the scroll that corresponds with the grade of the item */
        const grade = item_grade(character.items[lowestLevelPosition])
        const scroll = `scroll${grade}`

        /** Buy a scroll if we don't have one */
        let scrollPosition = locate_item(scroll)
        if (scrollPosition == -1) scrollPosition = (await buy(scroll)).num

        /** Speed up the upgrade if we can */
        if (can_use("massproduction")) use_skill("massproduction")

        /** Upgrade! */
        await upgrade(lowestLevelPosition, scrollPosition)
    }

}


// Move to a spot where we can buy scrolls and equipment, and upgrade. (Don't need this if you have an ancient computer in-game)
//smart_move({ map: "main", x: -225, y: -125 })