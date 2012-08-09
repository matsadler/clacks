var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
	"Oct", "Nov", "Dec"];

var zeroPad = function (number) {
	if (number < 10) {
		return "0" + number;
	}
	return number.toString();
};

var offsetToZone = function (offset) {
	var abs = Math.abs(offset),
		sign = offset > 0 ? "-" : "+";
	return sign + zeroPad(Math.floor(abs / 60)) + zeroPad(abs % 60);
};

var commonLogDate = function (now) {
	var day = now.getDate(),
		month = now.getMonth(),
		year = now.getFullYear(),
		hour = now.getHours(),
		min = now.getMinutes(),
		sec = now.getSeconds(),
		offset = now.getTimezoneOffset(),
		date = zeroPad(day) + "/" + months[month] + "/" + year,
		time = zeroPad(hour) + ":" + zeroPad(min) + ":" + zeroPad(sec),
		zone = offsetToZone(offset);
	
	return date + ":" + time + " " + zone;
};

exports.commonLog = function (request, response, completedAt) {
	completedAt = completedAt || new Date();
	var remote = request.headers["x-forwarded-for"] ||
			request.connection.remoteAddress,
		user = request.remoteUser || "-",
		date = commonLogDate(completedAt),
		method = request.method,
		path = request.url,
		version = request.httpVersion,
		code = response.statusCode,
		size = response.headers && response.headers["content-length"] || "-";
	
	return remote + " - " + user + " [" + date + "] " + '"' + method + " " +
		path + " HTTP/" + version + '" ' + code + " " + size;
};
