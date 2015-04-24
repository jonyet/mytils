"use strict"

var fs = require('fs');
var cheerio = require('cheerio');
// var request = require('request');
// var hyperquest = require('hyperquest');
var hyperquext = require('hyperquext');
var hyperquextDirect = hyperquext.decorators.hyperquextDirect;
var s = hyperquextDirect(hyperquext);
var r = hyperquext.devcorators.attachBodyToResponse(hyperquext);
var _ = require('underscore');
var utility = require('./utility');

var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1588.0 Safari/537.36'
}

function displayer(array) {
	console.log(array)
	console.log('done')
	// console.log('\n\n404s: ', _.where(array, {parsedUrl.substring(0, parsedUrl): 404}).length);
	// console.log('\n301s: ', _.where(array, {status: 301}).length);
	// console.log('\n200s: ', _.where(array, {status: 200}).length);
	// console.log('\n\n404s: ', _.where(array, {status: 404}));
	// console.log('\n301s: ', _.where(array, {status: 301}));
	// console.log('\n200s: ', _.where(array, {status: 200}));

	// console.log('\n\ncontrol objects:', _.where(array, {type: 'control'}).length);
	// console.log(arrayOne.length);
	// console.log('treatment objects:', _.where(array, {type: 'offer'}).length);
	// console.log(arrayTwo.length);
	// console.log(_.where(array, {status: 200, url: 'http://www.verizonwireless.com/smartphones/iphone-6/?test=bk_offer&bkCmpID=61563,61602'}));
	// console.log('\n>> There were ' + _.where(array, {status: 302, type: 'offer'}).length + ' links unavailable for test.\n>> Reason:\n', _.where(array, {status: 302, type: 'offer'}));
}

function astronaut(array){
	var pages = []
	_.each(array, function(url){
		// request(url, {headers: headers, maxRedirects: 10}, function(error, res, html){
		s(url, {headers: headers, maxRedirects: 10}, function(error, res){
			var result = {
				url: url,
				status: null,
				redirect: null,

			}

			if(error){
				console.error(url + ' ERROR ' + error);
				result.status = 'error, connection reset'
			} else{

				var parsed = utility.parseUri(url);
				var rarsed = utility.parseUri(res.request.href);

				result = {
					url: url,
					status: res.statusCode,
					redirect: res.request.href,
					parsed: parsed,
					rarsed: rarsed
				}

				console.log(result.url);
				console.log(result.status);
				console.log(result.redirect);
				// console.log(result.parsed);
				pages.push(result);

				if (pages.length === array.length){
					displayer(pages)
				}
			}
		});			
	});
}

function gatherer(array){
	var linkArray = _.uniq(array)
	var urlArray = []
	_.each(linkArray, function(url){
		var base = url.replace(/(http(s)?:\/\/)|(\/.*){1}/g, '')
		if (base === 'www.verizonwireless.com' || base === 'espanol.vzw.com'){ //define the urls you want
			urlArray.push(url)
			return urlArray
		}
	})
	console.log('>>', urlArray.length, 'urls extracted..sorting..')
	// console.log(urlArray)
	astronaut(urlArray)
}

fs.readFile(process.argv[2], 'utf8', function(err, result){
	if (err) {
		return console.log(err);
	}		
	var linkArray = result.split(',')
	gatherer(linkArray)
})
