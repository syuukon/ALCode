let SECONDHAND_ITEMS = ['carrot']

setInterval (function() {

    buySecondhands()
     
}, 1000);

function buySecondhands() {
    parent.socket.once("secondhands", function (secondhands) {
        for (let item of secondhands) {
            if (localStorage.getItem(SECONDHAND_ITEMS)?.includes(item.name)) {
                parent.socket.emit("sbuy", { rid: item.rid })
                customLog('Bought secondhand: ' + item)
            }
        }
    });
    parent.socket.emit("secondhands")
}