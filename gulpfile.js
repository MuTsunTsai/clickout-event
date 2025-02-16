const gulp = require('gulp');
const ts = require('gulp-typescript');
const through2 = require("gulp-through2");
const terser = require('gulp-terser');

const pkg = require('./package.json');
const header = `/**
 * ${pkg.name} v${pkg.version}
 * (c) 2020-${new Date().getFullYear()} Mu-Tsun Tsai
 * Released under the MIT License.
 */`;

const terserOption = {
	"compress": {
		"evaluate": false,
		"properties": false,
		"unsafe_arrows": true
	},
	"output": {
		"comments": true
	}
};

const project = ts.createProject("tsconfig.json");
gulp.task('default', () =>
	project.src()
		.pipe(project())
		.pipe(gulp.dest("test"))
		.pipe(through2(body => `${header};(function(){ ${body} })()`))
		.pipe(terser(terserOption))
		.pipe(gulp.dest("dist"))
);