/*jslint maxlen: 160*/
var assert = require("assert");
var MiniUnit = require("mini-unit");
var commonLog = require("./../lib/clacks/common-log").commonLog;

var requestDouble = {
	headers: {},
	connection: {remoteAddress: "192.0.2.0"},
	method: "GET",
	url: "/example",
	httpVersion: "1.1"
};

var responseDouble = {
	statusCode: 200,
	headers: {"content-length": "14"}
};

var date = new Date("2012/08/09 09:00:00 GMT+0100");

var tc = new MiniUnit.TestCase("commonLog");

tc.testBasic = function () {
	var result = commonLog(requestDouble, responseDouble, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 14');
};

tc.testRemoteAddress = function () {
	var requestDoubleWithRemoteAddress = Object.create(requestDouble),
		result;
	
	requestDoubleWithRemoteAddress.connection = {remoteAddress: "198.51.100.0"};
	
	result = commonLog(requestDoubleWithRemoteAddress, responseDouble, date);
	
	assert.equal(result, '198.51.100.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 14');
};

tc.testXForwardedFor = function () {
	var requestDoubleWithXForwardedFor = Object.create(requestDouble),
		result;
	
	requestDoubleWithXForwardedFor.headers = {"x-forwarded-for": "203.0.113.0"};
	
	result = commonLog(requestDoubleWithXForwardedFor, responseDouble, date);
	
	assert.equal(result, '203.0.113.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 14');
};

tc.testRemoteUser = function () {
	var requestDoubleWithRemoteUser = Object.create(requestDouble),
		result;
	
	requestDoubleWithRemoteUser.remoteUser = "arthur.dent";
	
	result = commonLog(requestDoubleWithRemoteUser, responseDouble, date);
	
	assert.equal(result, '192.0.2.0 - arthur.dent [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 14');
};

tc.testDate = function () {
	var otherDate = new Date("2012/11/21 10:01:20 GMT+0000"),
		result;
	
	result = commonLog(requestDouble, responseDouble, otherDate);
	
	assert.equal(result, '192.0.2.0 - - [21/Nov/2012:10:01:20 +0000] "GET /example HTTP/1.1" 200 14');
};

tc.testMethod = function () {
	var requestDoubleWithMethod = Object.create(requestDouble),
		result;
	
	requestDoubleWithMethod.method = "POST";
	
	result = commonLog(requestDoubleWithMethod, responseDouble, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "POST /example HTTP/1.1" 200 14');
};

tc.testPath = function () {
	var requestDoubleWithURL = Object.create(requestDouble),
		result;
	
	requestDoubleWithURL.url = "/testing?one=two";
	
	result = commonLog(requestDoubleWithURL, responseDouble, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /testing?one=two HTTP/1.1" 200 14');
};

tc.testVersion = function () {
	var requestDoubleHTTPVersion = Object.create(requestDouble),
		result;
	
	requestDoubleHTTPVersion.httpVersion = "0.9";
	
	result = commonLog(requestDoubleHTTPVersion, responseDouble, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/0.9" 200 14');
};

tc.testResponseCode = function () {
	var responseDoubleWithCode = Object.create(responseDouble),
		result;
	
	responseDoubleWithCode.statusCode = "404";
	
	result = commonLog(requestDouble, responseDoubleWithCode, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 404 14');
};

tc.testContentLength = function () {
	var responseDoubleWithContentLength = Object.create(responseDouble),
		result;
	
	responseDoubleWithContentLength.headers = {"content-length": "42"};
	
	result = commonLog(requestDouble, responseDoubleWithContentLength, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 42');
};

tc.testContentLengthMissing = function () {
	var responseDoubleWithoutContentLength = Object.create(responseDouble),
		result;
	
	responseDoubleWithoutContentLength.headers = {};
	
	result = commonLog(requestDouble, responseDoubleWithoutContentLength, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 -');
};

tc.testResponseHeadersMissing = function () {
	var responseDoubleWithoutHeaders = Object.create(responseDouble),
		result;
	
	responseDoubleWithoutHeaders.headers = undefined;
	
	result = commonLog(requestDouble, responseDoubleWithoutHeaders, date);
	
	assert.equal(result, '192.0.2.0 - - [09/Aug/2012:09:00:00 +0100] "GET /example HTTP/1.1" 200 -');
};

if (require.main === module) {
	MiniUnit.run(tc);
} else {
	module.exports = tc;
}
