
module.exports = {
	
    baseUrl: "js/",
	
    name: "../node_modules/almond/almond",
	include: ["main"],
	insertRequire: ["main"],
	
	/*
	appDir: "./",
	dir: "dist/rjs",
	modules: [
        {
            name: "main"
        }
    ],*/
	
	paths: {
		"requirejs-text": "../node_modules/requirejs-text/text"
	},
	
	optimize: "none",
	generateSourceMaps: true,
	preserveLicenseComments: false,
	
	wrap: true,
	
	out: "dist/main.js"
};