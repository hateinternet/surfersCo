'use strict';

var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber'); // no crash
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso'); // css
var uglify = require('gulp-uglify'); // js
var imagemin = require('gulp-imagemin'); // img
var svgmin = require('gulp-svgmin'); // svg
var svgstore = require('gulp-svgstore'); // svg sprite
var cheerio = require('gulp-cheerio'); // svg sprite error :)
var replace = require('gulp-replace');
var gulpIf = require('gulp-if');
var del = require('del');
var run = require('run-sequence');
var server = require('browser-sync').create();

gulp.task('style', function () {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 2 versions'
      ]})
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'))
    .pipe(server.stream());
});

gulp.task('js:min', function () {
  gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(gulpIf('!*.min.js', rename({suffix: '.min'})))
    .pipe(gulp.dest('js'));
});

gulp.task('watch', ['style'], function () {
  server.init({
    server: '.',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('*.html').on('change', server.reload);
});

gulp.task('sprite', function () {
  return gulp.src('img/icons/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('img/sprite'));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task('copy', function () {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'js/**',
    'img/**',
    '*.html'
  ], {
    base: '.'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('build style', function () {
  gulp.src('sass/style.scss')
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([
      autoprefixer({browsers:
        'last 2 versions'
      })
    ]))
    .pipe(minify())
    .pipe(gulp.dest('build/css'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('build js', function () {
  gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(gulpIf('!*.min.js', rename({suffix: '.min'})))
    .pipe(gulp.dest('build/js'));
});

gulp.task('build img', function () {
  gulp.src('img/*.{jpg,png,gif,svg}')
    .pipe(gulpIf('*.{jpg,png,gif}', imagemin([
      imagemin.optipng({optimisationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ])))
    .pipe(gulpIf('*.svg', svgmin({
      js2svg: {
        pretty: true
      }
    })))
    .pipe(gulp.dest('build/img'));
});

gulp.task('build svg sprite', function () {
  return gulp.src('img/icons/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/sprite'));
});

gulp.task('build', function (fn) {
  run(
      'clean',
      'copy',
      'build style',
      'build js',
      'build img',
      // 'build svg sprite',
      fn
  );
});


gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});
