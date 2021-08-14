// Gets the time for the TIME command.
function getTimeString(delimeter = ":") {
    var date = new Date();

    var hours = date.getHours().toString();
    if (hours.length < 2) {
        hours = "0" + hours;
    }

    var mins = date.getMinutes().toString();
    if (mins.length < 2) {
        mins = "0" + mins;
    }

    var secs = date.getSeconds().toString();
    if (secs.length < 2) {
        secs = "0" + secs;
    }

    return hours + delimeter + mins + delimeter + secs;
}

// Gets the date for the date command.
function getDateString(delimeter = "/", flip = false) {
    var date = new Date();

    var day = date.getDate().toString();
    if (day.length < 2) {
        day = "0" + day;
    }

    var month = (date.getMonth() + 1).toString();
    if (month.length < 2) {
        month = "0" + month;

    }
    var year = date.getFullYear().toString();

    if (!flip) {
        return day + delimeter + month + delimeter + year;
    }
    else {
        return year + delimeter + month + delimeter + day;
    }
}

module.exports = {
    getTimeString,
    getDateString
};