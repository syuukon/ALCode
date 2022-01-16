vendorTrash = [
    'wbreeches',
    'wcap',
    'wattire', 
    'wgloves',
    'wshoes',
   'stramulet',
   'carrotsword',
   'rednose',
   'warmscarf',
   'candycanesword',
   'xmashat',
   'merry',
   'xmassweater',
   'xmaspants',
   'xmasshoes',
   "mushroomstaff",
   "cclaw",
   "hpamulet",
   "hpbelt",
   "ringsj",
   "stinger",
   "slimestaff",
   "pants1",
   "coat1",
   "gloves1",
   "helmet1",
   "shoes1"
];

setInterval(function () {
    {
        autoVendor();
    }
}, 1000);

function autoVendor() {
    if (character.ctype !== 'merchant') return;
    if (character.map === 'bank') return;

    for (let i = 0; i < character.items.length; i++) {
        let item = character.items[i];

        if (item && vendorTrash.includes(item.name) && item.level < 1 && !item.p) {
            log("Selling " + item.name + " to vendor.");
            sell(i, item.q);
        }
    }
}