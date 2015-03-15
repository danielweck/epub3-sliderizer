
var args = process.argv.slice(2);
console.log("rjs.js arguments: ");
console.log(args);

var requirejs_config = require(args[0]);

var requirejs = require('requirejs');

requirejs.optimize(requirejs_config, function (buildResponse) {
	console.log(buildResponse);
	
	//var fs = require('fs');
    //var contents = fs.readFileSync(requirejs_config.out, 'utf8');
}, function(err) {
	console.log(err);
	process.exit(-1);
});