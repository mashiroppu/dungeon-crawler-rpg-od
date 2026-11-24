// Format large numbers
const nFormatter = (num) => {
    let lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(2).replace(rx, "$1") + item.symbol : "0";
}

// Get a randomized number between 2 integers
const randomizeNum = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.floor(Math.random() * (max - min + 1)) + min); //The maximum is inclusive and the minimum is inclusive 
}

// Get a randomized decimal between 2 numbers
const randomizeDecimal = (min, max) => {
    return Math.random() * (max - min) + min;
}

// Name display width: ASCII = 1, non-ASCII (e.g. Japanese) = 2. Max allowed width is 16 ('a' x 16)
const NAME_MAX_WIDTH = 16;
const nameWidth = (name) => {
    let w = 0;
    for (const ch of name) {
        w += (ch.codePointAt(0) > 0x7f) ? 2 : 1;
    }
    return w;
}
const isValidNameWidth = (name) => nameWidth(name) <= NAME_MAX_WIDTH;