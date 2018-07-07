"use strict";
let gulp = require("gulp"),
    sass = require("gulp-sass"),
    concat = require("gulp-concat"),
    clean = require("gulp-clean"),
    uglify = require("gulp-uglify"),
    cssmin = require("gulp-cssmin"),
    htmlmin = require("gulp-htmlmin"),
    copy = require("gulp-copy"),
    rename = require("gulp-rename"),
    csscomb = require("gulp-csscomb"),
    del = require("del");

gulp.task("clean", function(callback) {
    del(["dest", "src/dest/"], callback);
});

gulp.task("sass-console", function() {
    return gulp.src("src/sass/console/*").pipe(sass()).pipe(gulp.dest("src/css/console"));
});

gulp.task("concat-console:css", ["sass-console"], function() {
    return gulp.src("src/css/console/*").pipe(concat("yidian.console.all.css")).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("sass-front", function() {
    return gulp.src("src/sass/front/*").pipe(sass()).pipe(gulp.dest("src/css/front"));
});

gulp.task("concat-front:css", ["sass-front"], function() {
    return gulp.src("src/css/front/*").pipe(concat("yidian.front.all.css")).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("cssmin-console", ["concat-console:css"], function() {
    return gulp.src("src/dest/css/yidian.console.all.css").pipe(cssmin()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("cssmin-front", ["concat-front:css"], function() {
    return gulp.src("src/dest/css/yidian.front.all.css").pipe(cssmin()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("sass:watch", ["sass-console", "sass-front"], function() {
    return gulp.watch("src/sass/*.scss", ["sass-console", "sass-front"]);
});

gulp.task('copy', ["cssmin-console", "cssmin-front"], function() {
    return gulp.src('src/fonts/**')
        .pipe(gulp.dest('src/dest/fonts/'))
});

gulp.task('clear-flyer-min-js', function(callback) {
    del(["src/plugins/js/flyer.all.min.js"], callback);
});

gulp.task('flyer-min-js', function() {
    return gulp.src('src/plugins/js/flyer.all.js').pipe(uglify()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest('src/plugins/js/'));
});

gulp.task('flyer-min-css', function() {
    return gulp.src('src/plugins/css/flyer.all.css').pipe(cssmin()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest('src/plugins/css/'));
});

gulp.task("default", ["clean", "sass-console", "sass-front", "cssmin-front", "cssmin-console", "sass:watch", "copy", "clear-flyer-min-js", "flyer-min-js", 'flyer-min-css']);