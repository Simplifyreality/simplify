var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('styles', function () {
  return gulp.src(['styles/scss/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({ style: 'expanded' }))
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('styles/css/'));
});