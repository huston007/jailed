var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');

var scripts = {
    main: [
        'node_modules/es6-promise/dist/es6-promise.js',
        'lib/_frame.js',
        'lib/_JailedSite.js',
        'lib/_pluginWebIframe.js',
        'lib/_pluginWebWorker.js',
        'lib/_pluginCore.js'
    ],
    jailedSite: [
        'node_modules/es6-promise/dist/es6-promise',
        'lib/_JailedSite.js'
    ]
};

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('scripts-main', function() {
    return gulp.src(scripts.main)
        //.pipe(uglify())
        .pipe(concat('_frame.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('frame-html', function () {
    return gulp.src(['lib/_frame.html'])
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts-jailed-site', function() {
    return gulp.src(scripts.jailedSite)
        //.pipe(uglify())
        .pipe(concat('jailed-site.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['default'], function() {
    gulp.watch(scripts.main, ['scripts-main']);
});


gulp.task('default', ['clean', 'scripts-main', 'frame-html']);