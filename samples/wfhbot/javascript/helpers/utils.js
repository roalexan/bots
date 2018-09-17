var moment = require('moment-timezone');
var findOneIana = require('windows-iana');

const DATE_FORMAT = 'MM/DD/YYYY';
const TIME_FORMAT = 'hh:mm A';
const DATETIME_FORMAT = DATE_FORMAT + ' ' + TIME_FORMAT;
/**
 * Convert timezone
 * @param {*} date Date object //new Date('2011-04-11T10:20:30Z')
 * @param {*} srcTimezone Source timezone string
 * @param {*} destTimezone Destination timezone string
 */
function convertTimezone(date, srcTimezone, destTimezone) {
    var src = moment(date).tz(findOneIana.findOneIana(srcTimezone)); //.format(format);
    return src.tz(findOneIana.findOneIana(destTimezone));
}
exports.convertTimezone = convertTimezone;

function formatDate(m) {
    return m.format(DATE_FORMAT);
}
exports.formatDate = formatDate;

function formatTime(m) {
    return m.format(TIME_FORMAT);
}
exports.formatTime = formatTime;
