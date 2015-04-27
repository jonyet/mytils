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
var json2csv = require('json2csv');

var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1588.0 Safari/537.36'
}

function displayer(array) {
	console.log(array);
	console.log('>> done. writing results...');
	 
	json2csv({data: array, fields: ['status', 'url', 'redirect']}, function(err, csv) {
	  if (err) console.log(err);
	  fs.writeFile('httpResults.csv', csv, function(err) {
	    if (err) throw err;
	    console.log('file saved');
	  });
	}); 

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
		s(url, {headers: headers, maxRedirects: 10}, function(error, res){
			var result = {
				status: null,
				url: url,
				redirect: null,
				parsedOrigin: null,
				parsedRedirect: null
			}

			if(error){
				console.log(error);
				result.status = error.code
				result.redirect = error.code
				pages.push(result);

			} else {

				var parsedOrigin = utility.parseUri(url);
				var parsedRedirect = utility.parseUri(res.request.href);

				result = {
					status: res.statusCode,
					url: url,
					redirect: res.request.href,
					parsedOrigin: parsedOrigin,
					parsedRedirect: parsedRedirect
				}

				console.log(result.url);
				console.log(result.status);
				console.log(result.redirect);
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
