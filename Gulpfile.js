'use strict';

var gulp = require('gulp');
var path = require('path');
var del = require('del');
var gutil = require('gulp-util');
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
var markdown = require('gulp-markdown');
var sass = require('gulp-sass');

var settings = {
	sources: './src',
	docs: './docs',
	dist: './dist',
	pkgname: 'bootstrap-plus',
	pages: './pages'
};

var context = {
	ngversion: '1.2.28',
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

gulp.task('watch', function() {
	gulp.watch(path.join(settings.sources, '**/*'), function() {
		buildDist();
		buildPages();
	});
	gulp.watch(path.join(settings.docs, '**/*'), function() {
		buildPages();
	});
	gulp.watch('README.md', function() {
		buildPages();
	});
	buildModules();
	buildDist();
	buildPages();
});

gulp.task('deploy', function() {
	return gulp.src(path.join(settings.pages, '**/*'))
	.pipe(deploy());
});


gulp.task('serve', ['watch'], function() {
	connect.server({
		root: [settings.pages],
		port: 9090,
		livereload: true
	});
});


gulp.task('clean', function() {
	del([settings.dist]);
});

gulp.task('dist', buildDist);

function buildDist() {
	function buildDistPath(src) {
		return '// Source: ' + path.basename(this.path) + '\n' + (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
	}
	console.log('build dist');
	gulp.src(['*/*.js'], {cwd: settings.sources})
	.pipe(sourcemaps.init())
	.pipe(annotate())
	.pipe(concat(settings.pkgname + '.js', {process: buildDistPath}))
	.pipe(concat.header('(function(window, document, undefined) {\n\'use strict\';\n'))
	.pipe(concat.footer('\n})(window, document);\n'))
	.pipe(concat.header(banner))
	.pipe(gulp.dest(settings.dist))
	.pipe(rename(function(path) { path.extname = '.min.js'; }))
	.pipe(uglify())
	.pipe(concat.header(banner))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dist));

//	gulp.src(['*/*.scss'], {cwd: settings.sources})
//	.pipe(sass())
//	.pipe(gulp.dest('.css'));

	gulp.src(['*/*.scss'], {cwd: settings.sources})
	.pipe(sourcemaps.init())
	.pipe(sass({errLogToConsole: true}))
	.pipe(concat(settings.pkgname + '.css'))
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
}

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
		context.modules.push(module);
	});
	//console.log(context);
}

function buildPages() {
	console.log('build pages');

	// convert README.md into HTML snippet to be used inside index.html
	var readme = gulp.src('README.md').pipe(markdown());
	readme.on('data', function(chunk) {
		context.readme_html = chunk.contents.toString().trim();
	});

	// create the main index.html file
	gulp.src(path.join(settings.docs, 'index.html'))
	.pipe(consolidate('lodash', context))
	.pipe(googlecdn(require('./bower.json')))
	.pipe(gulp.dest(settings.pages));

	// copy docs/assets to pages
	gulp.src(path.join(settings.docs, 'assets/**/*'))
	.pipe(gulp.dest(path.join(settings.pages, 'assets')));

	// copy bootstrap-plus.css to pages
	//gulp.src(path.join(settings.dist, 'bootstrap-plus.css'))
	//.pipe(gulp.dest(path.join(settings.pages, 'assets')));
}

function getFolders(dir) {
	return fs.readdirSync(dir)
	.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}
