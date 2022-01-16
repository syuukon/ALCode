let goldReq = (G.levels[character.level] - character.xp) / 3.2;

function tradeHistory() {
    parent.socket.emit('trade_history');
}

function pauseGfx() {
    pause()
};

function expReq() {

    game_log(goldReq)

}

function addButtons() {

    add_top_button('pause_button', 'PauseGfx', pauseGfx)
    add_top_button('trade_button', 'TradeHistory', tradeHistory)

    /* add_bottom_button('xp_required', goldReq, expReq) */

}

addButtons();