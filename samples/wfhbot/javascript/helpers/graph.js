// TODO for now, hardcoded "Eastern Standard Time" but should work with other timezones... maybe consider using moment.js
var MicrosoftGraph = require("@microsoft/microsoft-graph-client").Client;
var utils = require('./utils');

var client;

/**
 * Initialize Graph API wrapper with the existing token.
 * Should already have a valid token at this time.
 * @param {*} session 
 */
function init(accessToken) {
	client = MicrosoftGraph.init({
		defaultVersion: 'v1.0',
		authProvider: (done) => {
			done(null, accessToken); //first parameter takes an error if you can't get an access token
		}
	});
}

/**
 * TODO apply this function back to app.js
 * Update session.userData
 * @param {*} accessToken if null, erase userData. Otherwise, get user info and add to userData
 * @param {*} session 
 * @param {*} callback 
 */
function updateSessionUserData(accessToken, session, callback) {
	if (accessToken) {
		session.userData.accessToken = accessToken;
		session.save();

		getUserName(accessToken,
            (res) => {
                if (res) {
					session.userData.givenName = res;
					session.save();
					if (callback) callback(true);
				}
                else {
					if (callback) callback(false);
				}
            });
	}
	else {
		session.userData.givenName = {};
		session.userData.accessToken = {};
		session.save();
		if (callback) callback(true);
	}
}

exports.updateSessionUserData = updateSessionUserData;

function getUserName(accessToken, callback) {
	if (!client) init(accessToken);

	client.api('/me')
		.select("givenName")
		.get((err, res) => {
			if (res) {
				callback(res.givenName);
			}
			else {
				console.log(err);
				if (err.code == 'InvalidAuthenticationToken') callback(null);
				else callback(undefined);
			} 
	    });
}

exports.getUserName = getUserName;

/**
 * Parse datetime to start and end
 * @param {*} datetime 
 */
function parseDatetime(datetime) {
	var start;
	if (datetime) {
		start = new Date(datetime);
	}
	else {
		start = new Date();
	}
	start.setHours(0,0,0);

	//	end = start date + 1 day
	var end = new Date(new Date(start).setDate(start.getDate() + 1));
	
	return {
		start: start,
		end: end
	};
	
	// TODO get timezone...
	
	
}

/**
 * TODO timezone...
 */
function getEvents(accessToken, entities, callback) {
	if (!client) init(accessToken);
	
	var datetime = parseDatetime(entities.datetime);
	client.api(`/me/calendarView?startDateTime=${datetime.start.toISOString()}&endDateTime=${datetime.end.toISOString()}`)
		.select('subject, start, end, isAllDay')
		.orderby('start/dateTime ASC')
	    .get((err, res) => {
			if (res) {
				let upcomingEventNames = [];
		        for (let i = 0; i < res.value.length; i++) {
					let event = [];
					event.push(res.value[i].subject + " (");
					
					let startDate = utils.convertTimezone(new Date(res.value[i].start.dateTime), 
						res.value[i].start.timeZone, "Eastern Standard Time");		// TODO replace hardcoded timezone to user's timezone
					let endDate = utils.convertTimezone(new Date(res.value[i].end.dateTime), 
						res.value[i].end.timeZone, "Eastern Standard Time");
					
					if (res.value[i].isAllDay) {
						event.push(utils.formatDate(startDate));
						if (endDate.dayOfYear() - startDate.dayOfYear() > 1) event.push(" - " + utils.formatDate(endDate));
					}
					else {
						event.push(utils.formatDate(startDate) + " " + utils.formatTime(startDate) + " - ");
						// if start and end date is different, show both dates; else show date only at the start
						if (startDate.year() == endDate.year() && startDate.dayOfYear() != endDate.dayOfYear())
							event.push(utils.formatDate(endDate) + " ");
						event.push(utils.formatTime(endDate));
					}
					event.push(")");
					
					upcomingEventNames.push(event.join(""));
		        }
				callback(upcomingEventNames);
			}
			else {
				console.log(err);
				if (err.code == 'InvalidAuthenticationToken') callback(null);
				else callback(undefined);
			}
	    });
}

exports.getEvents = getEvents;


/**
 * TODO debugging. by passing session...
 * TODO timezone
 * 
 */
function postEvent(session, entities, callback) {
	var accessToken = session.userData.accessToken;
	if (!client) init(accessToken);

	session.send("parsing time " + entities.datetime);
	var datetime = parseDatetime(entities.datetime);

	var showAs;
	if (entities.event == 'WFH') showAs = "workingElsewhere";
	else showAs = "oof";	// oof or pto

	var body = {
		"subject": entities.event,
        "start": {
				"dateTime": datetime.start.toISOString(),
				"timeZone": "UTC"
		},
        "end": {
				"dateTime": datetime.end.toISOString(),
				"timeZone": "UTC"
		},
		"isAllDay": true,
		"showAs": showAs,
		"attendees": []
	};

	client.api('/me/events')
		.post(body,
			(err, res) => {
	            if (err) {
					session.send(err);
					console.log(err);
					if (err.code == 'InvalidAuthenticationToken') callback(null);
					else callback(undefined);
				}
				else {
					// POST to Group cal // DEBUG This part doesn't work
					client.api('/groups/e256f4bb-c336-491e-91cd-100534ba4f2a/events')
						.post(body,
							(err, res) => {
					            if (err) {
									session.send(err);
									console.log(err);
									if (err.code == 'InvalidAuthenticationToken') callback(null);
									else callback(undefined);
								}
								else {
									callback(true);
								}
					        }
						);
				}
	        }
		);
		
	// not to send invitation to group members...
}

exports.postEvent = postEvent;
