'use strict';

var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var pkg = require('./package.json');
var chalk = require('chalk');
var fs = require('fs');
var watch = require('gulp-watch');
var deploy = require('gulp-gh-pages');
var consolidate = require("gulp-consolidate");
var connect = require('gulp-connect');
var googlecdn = require('gulp-google-cdn');
var glob = require("glob");
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var annotate = require('gulp-ng-annotate');
var concat = require('gulp-concat-util');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');

var settings = {
	sources: './src',
	docs: './docs',
	dist: './dist',
	pages: './pages'
};

var context = {
	ngversion: '1.2.16',
	bsversion: '3.1.1',
	pkg: pkg,
	archivename: pkg.name + '-' + pkg.version + '.zip'
};

var banner = gutil.template('/**\n' +
	' * <%= pkg.name %>\n' +
	' * @version v<%= pkg.version %> - <%= today %>\n' +
	' * @link <%= pkg.homepage %>\n' +
	' * @author <%= pkg.author.name %> (<%= pkg.author.email %>)\n' +
	' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
	' */\n', {file: '', pkg: pkg, today: new Date().toISOString().substr(0, 10)}
);

gulp.task('scripts:pages', function() {
	gulp.watch(path.join(settings.sources, '**/*'), function() {
		buildModules();
		buildPages();
	});
	gulp.watch(path.join(settings.docs, '**/*'), function() {
		buildPages();
	});
	buildModules();
	buildPages();
});

gulp.task('deploy', function() {
	return gulp.src(path.join(settings.pages, '**/*'))
	.pipe(deploy());
});


gulp.task('serve', function() {
	connect.server({
		root: [settings.pages],
		port: 9090,
		livereload: true
	});
});


gulp.task('scripts:dist', function() {
	//gulp.src(settings.dist, {read: false})
	//	.pipe(clean());
	gulp.src(['*/*.js'], {cwd: settings.sources})
	.pipe(sourcemaps.init())
	.pipe(annotate())
	.pipe(concat(pkg.name + '.js', {process: function(src) { return '// Source: ' + path.basename(this.path) + '\n' + (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); }}))
	.pipe(concat.header('(function(window, document, undefined) {\n\'use strict\';\n'))
	.pipe(concat.footer('\n})(window, document);\n'))
	.pipe(concat.header(banner))
	.pipe(gulp.dest(settings.dist))
	.pipe(rename(function(path) { path.extname = '.min.js'; }))
	.pipe(uglify())
	.pipe(concat.header(banner))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dist));

	gulp.src(['*/*.css'], {cwd: settings.sources})
	.pipe(sourcemaps.init())
	.pipe(concat(pkg.name + '.css'))
	.pipe(gulp.dest(settings.dist))
	.pipe(rename(function(path) { path.extname = '.min.css'; }))
	.pipe(cssmin())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dist));

	gulp.src(['README.md', 'LICENSE'])
	.pipe(gulp.dest(settings.dist));

	gulp.src(path.join(settings.dist, '**/*'))
	.pipe(zip(context.archivename))
	.pipe(gulp.dest(settings.pages));
});

function buildModules() {
	var folders = getFolders(settings.sources);
	context.modules = [];
	folders.map(function(folder) {
		var module = { name: folder, path: path.join(settings.sources, folder), demo_html: [] },
			cwd = path.join(settings.sources, folder);
		glob.sync(path.join(module.path, settings.docs, '*.html')).map(function(htmlfile) {
			module.demo_html.push(fs.readFileSync(htmlfile));
		});
		gulp.src('*.html', { cwd: cwd })
		.pipe(gulp.dest(path.join(settings.pages, folder)));
		gulp.src('**/*.js', { cwd: cwd })
		.pipe(gulp.dest(path.join(settings.pages, folder)));
		gulp.src('**/*.css', { cwd: cwd })
		.pipe(gulp.dest(path.join(settings.pages, folder)));
		module.js_files = glob.sync(path.join(folder, '*.js'), { cwd: settings.sources })
		.concat(glob.sync(path.join(folder, '*/*.js'), { cwd: settings.sources }));
		module.css_files = glob.sync(path.join(folder, '**/*.css'), { cwd: settings.sources });
		console.log(module.js_files);
		context.modules.push(module);
	});
}

function buildPages() {
	// create the main index.html file
	gulp.src(path.join(settings.docs, 'index.html'))
	.pipe(consolidate('lodash', context))
	.pipe(googlecdn(require('./bower.json')))
	.pipe(gulp.dest(settings.pages));

	// copy docs/assets to pages
	gulp.src(path.join(settings.docs, 'assets/**/*'))
	.pipe(gulp.dest(path.join(settings.pages, 'assets')));
}

function getFolders(dir) {
	return fs.readdirSync(dir)
	.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}
