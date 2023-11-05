const

	/********* 
		(빌드 방식 (개발, 배포)
		터미널에 작성
		Window = $env:NODE_ENV="production" or "development"
		Mac    = export NODE_ENV=production or development
	*********/ 

	devBuild  = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),

	// paths
	paths = {
		html: 'src/**/*.html',
		css: 'src/css/**/*.scss',
		js: 'src/js/**/*.js',
		img: 'src/images/**/*{jpg,gif,png,svg}',
		// sprite: 'src/images/sprite/**/*.png',
		// spriteScss: 'src/css/sprite',
		inc: 'src/inc/**/*.inc'
	},
	dist = {
		html: 'dist',
		css: 'dist/css',
		js: 'dist/js',
		img: 'dist/images',
		// sprite: 'dist/images/sprite'
	},

	// modules
	{
		src,
		series,
		parallel,
		dest,
		watch,
		lastRun
	}             = require('gulp'),
	noop          = require('gulp-noop'),
	plumber       = require('gulp-plumber'),
	fileinclude   = require('gulp-file-include'),
	cached        = require('gulp-cached'),
	sass          = require('gulp-sass')(require('sass')),
	dependents    = require('gulp-dependents'),
	autoprefixer  = require('gulp-autoprefixer'),
	browsersync   = require('browser-sync').create(),
	del           = require('del'),
	buffer        = require('vinyl-buffer'),
	// spritesmith   = require('gulp.spritesmith-multi'),
	merge         = require('merge-stream'),
	imagemin      = require('gulp-imagemin'),
	newer         = require('gulp-newer'),
	sourcemaps    = devBuild ? require('gulp-sourcemaps') : null;

const onError = err => console.log(err);

console.log('Gulp', devBuild ? 'development' : 'production', 'build');

// html
function copyHtml(done) {
	return src(paths.html)
		.pipe(plumber({ errorHandler: onError }))
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file',
			context: {
				
			}
		}))
		.pipe(cached('html'))
		.pipe(dest(dist.html))
		.on('end', () => browsersync.reload()),
	done();
}
exports.copyHtml = copyHtml;

// css
function compileScss(done) {
	const options = {
		outputStyle: "compressed",  // 컴파일 스타일: expanded, compressed
		indentType: "tab",      // 들여쓰기 스타일: space(default), tab
		indentWidth: 1           // 들여쓰기 칸 수 (Default : 2)
	};
	return src(paths.css, { since: lastRun(compileScss) })
		.pipe(plumber({ errorHandler: onError }))
		.pipe(dependents())
		.pipe(sourcemaps ? sourcemaps.init() : noop())
		.pipe(sass(options).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps ? sourcemaps.write() : noop())
		.pipe(dest(dist.css))
		.pipe(browsersync.reload({ stream: true })),
	done();
}
exports.compileScss = compileScss;

// js
function copyJs(done) {
	return src(paths.js, { since: lastRun(copyJs) })
		.pipe(plumber({ errorHandler: onError }))
		.pipe(dest(dist.js))
		.pipe(browsersync.reload({ stream: true })),
	done();
}
exports.copyJs = copyJs;

// image
function image(done) {
	return src([paths.img, `!${paths.sprite}`])
		.pipe(newer(dist.img))
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.mozjpeg({quality: 75, progressive: true}),
			imagemin.optipng({optimizationLevel: 1}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: false},
					{cleanupIDs: true}
				]
			})
		], {
			verbose: true
		}
		))
		.pipe(dest(dist.img)),
	done();
}
exports.image = image;

// sprite
// function sprite(done) {
// 	const opts = {
// 		spritesmith: function (options, sprite) {
// 			options.imgPath =  `../images/sprite/${options.imgName}`;
// 			options.retinaImgPath = `../images/sprite/${options.retinaImgName}`;
// 			options.cssName = `_${sprite}.scss`;
// 			options.cssTemplate = null;
// 			options.cssSpritesheetName = sprite;
// 			options.padding = 8;
			
// 			return options;
// 		}
// 	};

// 	const spriteData = src(paths.sprite)
// 		.pipe(spritesmith(opts))
// 		.on('error', err => console.log(err));
	
// 	const imgStream = spriteData.img
// 		.pipe(buffer())
// 		.pipe(imagemin([
// 			imagemin.optipng({optimizationLevel: 1})
// 		], {
// 			verbose: true
// 		}
// 		))
// 		.pipe(dest(dist.sprite));
		
// 	const cssStream = spriteData.css
// 		.pipe(buffer())
// 		.pipe(dest(paths.spriteScss));

// 	return merge(imgStream, cssStream)
// 	.on('end', () => done());
// }
// exports.sprite = sprite;

// watch
function watchs(done) {
	watch([paths.html, paths.inc], copyHtml);
	watch(paths.css, compileScss);
	watch(paths.js, copyJs);
	watch([paths.img], image);
	// watch(paths.sprite, sprite);
	done();
}

// server
function server(done) {
	if (browsersync) {
		browsersync.init({
			server: {
				baseDir: 'dist',
				index: 'index.html'
			},
			open: false
		})
	}
	done();
}

// clean
function clean(done) {
	del.sync(['dist/**/*', '!dist/', 'dist/**', '!dist/fonts',]);
	done();
}	
// exports.clean = clean;

// // clean sprite
// function cleanSprite(done) {
// 	del.sync([dist.sprite, paths.spriteScss]);
// 	done();
// }
// exports.cleanSprite = cleanSprite;

exports.default = series(image, compileScss, copyHtml, copyJs, server, watchs);