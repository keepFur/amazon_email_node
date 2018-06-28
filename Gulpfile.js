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

gulp.task("clean", function (callback) {
    del(["dest", "src/dest/", "src/dist/"], callback);
});

gulp.task("sass", function () {
    return gulp.src("src/sass/*").pipe(sass()).pipe(gulp.dest("src/css/"));
});

gulp.task("concat:css", ["sass"], function () {
    return gulp.src("src/css/*").pipe(concat("acs.all.css")).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("cssmin", ["concat:css"], function () {
    return gulp.src("src/dest/css/acs.all.css").pipe(cssmin()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest("src/dest/css/"));
});

gulp.task("sass:watch", ["sass"], function () {
    return gulp.watch("src/sass/*.scss", ["sass"]);
});

gulp.task('copy', ["cssmin"], function () {
    return gulp.src('src/fonts/**')
        .pipe(gulp.dest('src/dest/fonts/'))
});

gulp.task('clear-flyer-min-js', function (callback) {
    del(["src/plugins/js/flyer.all.min.js"], callback);
});

gulp.task('flyer-min-js', function () {
    return gulp.src('src/plugins/js/flyer.all.js').pipe(uglify()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest('src/plugins/js/'));
});

gulp.task('flyer-min-css', ["concat:css"], function () {
    return gulp.src('src/plugins/css/flyer.all.css').pipe(cssmin()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest('src/plugins/css/'));
});

gulp.task("default", ["clean", "sass", "cssmin", "sass:watch", "copy", "clear-flyer-min-js", "flyer-min-js", 'flyer-min-css']);