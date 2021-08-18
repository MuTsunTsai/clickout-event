let gulp = require('gulp');
let ts = require('gulp-typescript');
let wrapJS = require("gulp-wrap-js");
let terser = require('gulp-terser');

let pkg = require('./package.json');
let header = `/**
 * ${pkg.name} v${pkg.version}
 * (c) 2020-${new Date().getFullYear()} Mu-Tsun Tsai
 * Released under the MIT License.
 */`;

let terserOption = {
	"compress": {
		"evaluate": false,
		"properties": false,
		"unsafe_arrows": true
	},
	"output": {
		"comments": true
	}
};

let project = ts.createProject("tsconfig.json");
gulp.task('default', () =>
	project.src()
		.pipe(project())
		.pipe(gulp.dest("test"))
		.pipe(wrapJS(`${header};(function(){ %= body % })()`))
		.pipe(terser(terserOption))
		.pipe(gulp.dest("dist"))
);