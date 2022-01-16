vendorTrash = ["mushroomstaff", "cclaw", "hpamulet", "hpbelt", "slimestaff", 'ringsj'];

function sellStuff() {

    for (let i = 0; i < character.items.length; i++) {
        let item = character.items[i];

        if (item && vendorTrash.includes(item.name)) {
            log("Selling " + item.name + " to vendor.");
            sell(i, item.q);
        }
    }
    game.log('Sold items!');
    return;
}

let keepGold = 1000000
keep_whitelist = ["tracker", "hpot1", "mpot1", 'xpbooster', 'luckbooster', 'goldbooster']

function xferStuff() {
    if (character.ctype != 'merchant') {
        let merchant = get_player("SyuuMerch");
        if (merchant != null) {
            // send gold and items
            var to_send = character.gold - keepGold;
            if (character.gold > (keepGold * 2)) {
                //game_log('SENDING gold: ' + to_send);
                send_gold(merchant, to_send);
            }
            //game_log('GOLD Remaining: ' + character.gold);
            for (let i in character.items) {
                let item = character.items[i];
                if (item) {
                    if (!keep_whitelist.includes(item.name)) {
                        let slot = locate_item(item.name);
                        send_item(merchant, slot, 9999);
                    }
                }
            }
        }
    }
}


function pauseGfx() {
    pause()
};

function addButtons() {

    add_top_button('pause_button', 'PauseGfx', pauseGfx)
    add_top_button("sell_button", "VendorTrash", sellStuff);
    add_top_button("xfer_button", "S2Merch", xferStuff);

}

addButtons();