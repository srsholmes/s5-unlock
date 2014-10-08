var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    gutil = require('gulp-util'),
    livereload = require('gulp-livereload'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber');

var server = require('./server');

server.listen(4000);

var onerror = function(err) {
    if (err) gutil.log(gutil.colors.magenta('!! Error'), ':', gutil.colors.cyan(err.plugin), '-', gutil.colors.red(err.message));
};

gulp.task('scripts', function() {
    return gulp.src(['./src/app.js'])
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(gulp.dest('./public/assets/scripts'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/assets/scripts'))
        .pipe(livereload());

});

gulp.task('styles', function() {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(sass({
            sourceComments: 'map'
        }))
        .pipe(prefix({
            browsers: ['> 1%', 'last 3 versions', 'ie 8']
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./public/assets/css'))
        .pipe(livereload());
});

gulp.task('html', function() {
    return gulp.src(['./public/**/*.html'])
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(livereload());
});

gulp.task('watch', ['styles', 'scripts', 'html'], function() {
    gulp.watch('scss/**/*.scss', ['styles']);
    gulp.watch('src/**/*.js', ['scripts']);
    gulp.watch('public/**/*.html', ['html']);
});

gulp.task('default', ['watch']);