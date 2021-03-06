/*global require, module*/
const ApiBuilder = require('claudia-api-builder'),
	AWS = require('aws-sdk');
	
var api = new ApiBuilder(),
	fs = require('fs'),
	superb = require('superb'),
	dynamoDb = new AWS.DynamoDB.DocumentClient(),
	util = require('util');

module.exports = api;

// returning the sourceip and the country of the request
api.get('/', function (request) {
	'use strict';
	return {
		IP: request.context.sourceIp,
		Country: request.headers['CloudFront-Viewer-Country']
	};
});

// just return the result value for synchronous processing
api.get('/hello', function () {
	'use strict';
	return 'hello world';
});

// just return the result value for synchronous processing
api.get('/hello/{name}', function (request) {
	'use strict';
	return 'hello ' + request.pathParams.name;
});

// just return 1 day phrase first without using dynamodb
api.get('/dayphrase/random', function () {
	'use strict';
	var dayPhrasesJson = [
		{"dayphraseid":"1","language":"es","phrase":"El amor eterno dura aproximadamente 3 meses.","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"2","language":"en","phrase":"It's way better to do it badly than to not do it at all","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"3","language":"en","phrase":"You don't wanna be secure: you wanna be strong.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"4","language":"en","phrase":"A clear conscious is better than happiness","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"5","language":"en","phrase":"Your limitation—it’s only your imagination","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"6","language":"en","phrase":"Push yourself, because no one else is going to do it for you.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"7","language":"en","phrase":"Sometimes later becomes never. Do it now.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"8","language":"en","phrase":"Great things never come from comfort zones.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"9","language":"es","phrase":"No te metas en el mundo de las drogas. Ya somos muchos y hay muy poca","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"10","language":"es","phrase":"Tener la conciencia limpia es sintoma de mala memoria","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"11","language":"es","phrase":"El que nace pobre y feo tiene grandes posibilidades de que al crecerse le desarrollen ambas condiciones","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"12","language":"en","phrase":"Dream it. Wish it. Do it.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"13","language":"en","phrase":"Success doesn’t just find you. You have to go out and get it.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"14","language":"en","phrase":"The harder you work for something, the greater you’ll feel when you achieve it.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"15","language":"en","phrase":"Dream bigger. Do bigger.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"16","language":"en","phrase":"Don’t stop when you’re tired. Stop when you’re done.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"17","language":"en","phrase":"Wake up with determination. Go to bed with satisfaction.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"18","language":"en","phrase":"Do something today that your future self will thank you for.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"19","language":"es","phrase":"La pereza es la madre de todos los vicios y como madre hay que respetarla","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"20","language":"es","phrase":"Trabajar nunca mato a nadie... pero para que arriesgarse","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"21","language":"es","phrase":"El alcohol mata lentamente. No importa no tengo prisa.","topic":"funny","author":"Les Luthiers","imageurl":"#"},
		{"dayphraseid":"22","language":"en","phrase":"Little things make big days.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"23","language":"en","phrase":"It’s going to be hard, but hard does not mean impossible.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"24","language":"en","phrase":"Don’t wait for opportunity. Create it.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"25","language":"en","phrase":"Sometimes we’re tested not to show our weaknesses, but to discover our strengths.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"26","language":"en","phrase":"The key to success is to focus on goals, not obstacles.","topic":"motivational","imageurl":"#"},
		{"dayphraseid":"27","language":"en","phrase":"Dream it. Believe it. Build it.","topic":"motivational","imageurl":"#"}
	];
	var result = dayPhrasesJson[Math.floor(Math.random() * 27) + 1];
	return result;
});

// Saving dayphrase on dynamodb with post
api.post('/dayphrase', function (request) {
	var body = request.body;
	// Need to add the Header Content-Type:application/json
	var params = {  
	  TableName: 'dayphrases',  
	  Item: {
		  dayphraseid: body.dayphraseid,
		  phrase: body.phrase,
		  language: body.language,
		  topic: body.topic,
		  author: body.author,
		  imageurl: body.imageurl,
		  testobject: body.testobject,
		  testarray: body.testarray
	  } 
	}
	return dynamoDb.put(params).promise(); // returns dynamo result 
  }, { success: 201 }); // returns HTTP status 201 - Created if successful

  // bring all dayphrases
  api.get('/dayphrase', function (request) { // GET all users
	return dynamoDb.scan({ TableName: 'dayphrases' }).promise()
		.then(response => response.Items)
  });

  api.get('/dayphrase/{id}', function (request) { // GET a users
	'use strict';
	var id, params;
	// Get the id from the pathParams
	id = request.pathParams.id;
	params = {
		TableName: 'dayphrases',
		Key: {
			dayphraseid: id
		}
	};

	// post-process dynamo result before returning
	return dynamoDb.get(params).promise().then(function (response) {
		return response.Item;
	});
  });
  
  // delete user with {id}
	api.delete('/dayphrase/{id}', function (request) {
		'use strict';
		var id, params;
		// Get the id from the pathParams
		id = request.pathParams.id;
		params = {
			TableName: 'dayphrases',
			Key: {
				dayphraseid: id
			}
		};
		// return a completely different result when dynamo completes
		return dynamoDb.delete(params).promise()
			.then(function () {
				return 'Deleted dayphrase with id "' + id + '"';
			});
	}, {success: { contentType: 'text/plain'}});
// pass some arguments using the query string or headers to this
// method and see that they're all in the request object
api.get('/echo', function (request) {
	'use strict';
	return request;
});

// use request.queryString for query arguments
api.get('/greet', function (request) {
	'use strict';
	return request.queryString.name + ' is ' + superb.random();
});

// use {} for dynamic path parameters
api.get('/people/{name}', function (request) {
	'use strict';
	return request.pathParams.name + ' is ' + superb.random();
});

// Return a promise for async processing
api.get('/packages', function () {
	'use strict';
	var read = util.promisify(fs.readFile);
	return read('./package.json')
		.then(JSON.parse)
		.then(function (val) {
			return val;
		});
});

// use .post to handle a post; or .delete, .patch, .head, .put
api.post('/echo', function (request) {
	'use strict';
	return request;
});