{
	"opts": {
		"template": "./node_modules/ink-docstrap/template",  // same as -t templates/default
		"encoding": "utf8",               // same as -e utf8
		"destination": "../qpp-web",          // same as -d ./out/
		"recurse": true                  // same as -r
		// "tutorials": "path/to/tutorials", // same as -u path/to/tutorials
	},
	"plugins": ["plugins/markdown"],
	"templates": {
		"monospaceLinks": true,
		"systemName" : "QPP (Promises Augmentation & Patterns)",
		"footer": "This work is contribution to nodejs open source community",
		"copyright" :  "The MIT License (MIT)<br/>\nCopyright (c) 2015 Sasha Rudan",
		"includeDate"           : "false",
		"navType"   : "inline",
		"theme"     : "cerulean",
		"linenums"  : true,
		"collapseSymbols"       : false,
		"inverseNav": true,
		"outputSourceFiles"     : true ,
		"outputSourcePath"      : true,
		"dateFormat": "dddd, MMMM Do YYYY", // http://momentjs.com/docs/#/displaying/format/
		"syntaxTheme"           : "default", // https://github.com/tmont/sunlight/tree/master/src/themes
		"sort"      : true
	},
	"markdown": {
		"tags": ["params", "returns", "var", "vars", "type", "types"]
	},
	"source": {
		"include": [
			"./index.js",
			"./README.md"
		],
		"exclude": [ "../src/js/libs/jquery.js" ],
		"includePattern": ".+\\.js(doc)?$",
		"excludePattern": "(^|\\/|\\\\)_"
	}
}