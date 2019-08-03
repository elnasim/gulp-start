const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const cache = require("gulp-cache");
const concat = require("gulp-concat");
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

const gulpSrcPath = "src/";
const libsPath = "libs/";
const distPath = "dist/";

// BrowserSync proxy config
function browserSyncProxy() {
  browserSync.init({
    proxy: "test.local"
  });
}

// BrowserSync self config
function browserSyncSelf() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// Build libs.min.js ( Compiling all .js libraries files )
function jsLibs() {
  return gulp
    .src([
      libsPath + "jquery/dist/jquery.min.js" // jQuery
    ])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(distPath + "js"));
}

// Build libs.min.css ( Compiling all .css libraries files )
function cssLibs() {
  return gulp
    .src([
      libsPath + "normalize-css/normalize.css" // Normalize
    ])
    .pipe(concat("libs.min.css"))
    .pipe(cssnano())
    .pipe(gulp.dest(distPath + "css"))
    .pipe(browserSync.stream());
}

// Compiling main.sass files
function mainSass() {
  return gulp
    .src([gulpSrcPath + "sass/main.sass"])
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(concat("common.css"))
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true
      })
    )
    .pipe(gulp.dest(gulpSrcPath + "css"));
}

// Compiling common.js
function commonJs() {
  return gulp
    .src([gulpSrcPath + "js/main/main.js"])
    .pipe(concat("common.js"))
    .pipe(babel({ presets: ["@babel/env"] }))
    .pipe(gulp.dest(gulpSrcPath + "js"));
}

// Clearing cache
function clear(done) {
  return cache.clearAll(done);
}

// // ======================================================
// // Distributions
// // ======================================================

// Clear distribution dir
function clearDist() {
  return del(distPath + "**");
}

// Common css
function commonCssDist() {
  return gulp
    .src([gulpSrcPath + "css/common.css"])
    .pipe(cssnano({ zindex: false }))
    .pipe(rename("common.min.css"))
    .pipe(gulp.dest(distPath + "css"))
    .pipe(browserSync.stream());
}

// Common js
function commonJsDist() {
  return gulp
    .src([gulpSrcPath + "js/common.js"])
    .pipe(uglify())
    .pipe(rename("common.min.js"))
    .pipe(gulp.dest(distPath + "js"))
    .pipe(browserSync.stream());
}

// ======================================================
// Watch
// ======================================================
function watchFiles() {
  gulp.watch(
    `${gulpSrcPath}sass/**/*.sass`,
    gulp.series(mainSass, commonCssDist)
  );
  gulp.watch(
    `${gulpSrcPath}js/main/**/*.js`,
    gulp.series(commonJs, commonJsDist)
  );
  gulp.watch("*.html", browserSyncReload);
  gulp.watch("*.php", browserSyncReload);
}

const watch = gulp.parallel(watchFiles, browserSyncSelf);

exports.default = watch;
exports.commonJsDist = commonJsDist;
exports.commonCssDist = commonCssDist;