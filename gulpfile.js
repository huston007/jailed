var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

var DIST_WEB = 'dist/web'

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('lib/_frame.js')
        .pipe(browserify({
            debug : false
        }))
        .pipe(rename('_frame.js'))
        .pipe(gulp.dest(DIST_WEB));
});

gulp.task('worker', function() {
    // Single entry point to browserify
    gulp.src('lib/worker-index.js')
        .pipe(browserify({
            debug : false
        }))
        .pipe(rename('_worker.js'))
        .pipe(gulp.dest(DIST_WEB));
});

gulp.task('frame-html', function () {
    return gulp.src(['lib/_frame.html'])
        .pipe(gulp.dest(DIST_WEB));
});

gulp.task('build-web', ['scripts', 'worker', 'frame-html']);

gulp.task('default', ['build-web']);