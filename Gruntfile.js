module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-bump');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    app: grunt.file.readJSON('app.json'),
    clean: ['build/*'],
    copy: {
      "build": {
        options: {
          processContent: function (content, srcpath) {
            var extIndex = srcpath.lastIndexOf(".");
            if (extIndex && /appcache|html|js/.test(srcpath.substr(extIndex + 1)))
              return grunt.template.process(content);
            else
              return content;
          },
          processContentExclude: ['**/*.{png,gif,jpg,ico,ttf,eot,svg,woff}']
        },
        files: [
          { expand: true, cwd: 'src/', src: ['**'], dest: 'build/' },
          { expand: true, cwd: 'bower_components/roboto-fontface/fonts', src: ['Roboto-Regular.*'], dest: 'build/fonts' }
        ]
      },
      "build-dist": {
        files: [
          { src: ['build/index.html'], dest: 'build/dist/index.html' },
          { src: ['build/app.appcache'], dest: 'build/dist/app.appcache' },
          { src: ['build/app.min.css'], dest: 'build/dist/app.css' },
          { src: ['build/app.html'], dest: 'build/dist/app.html' },
          { src: ['build/app.min.js'], dest: 'build/dist/app.js' },
        ]
      }
    },
    htmlmin: {
      "build-min": {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeOptionalTags: true
        },
        files: [
          { expand: true, cwd: 'build/tpl/', src: ['**/*.html'], dest: 'build/tpl-min', ext: '.html' }
        ],
      }
    },
    uglify: {
      options: {
        output: {
          max_line_len: 80
        }
      },
      "build-min": {
        files: {
          'build/app.min.js': ['build/app.js']
        }
      }
    },
    sass: {
      options: {
        loadPath: [
          'bower_components/foundation/scss'
        ]
      },
      "build": {
        files: {
          'build/app.css': [
            'src/app.scss'
          ]
        }
      },
    },
    cssmin: {
      "build-min": {
        options: {
          keepSpecialComments: 0,
          report: true
        },
        files: {
          'build/app.min.css': [ 'build/app.css' ]
        }
      },
    }

  });

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.registerTask('test', [

  ]);

  grunt.registerTask('build', [
    'copy:build',
    'sass:build'
  ]);
  grunt.registerTask('build-min', [
    'uglify:build-min',
    'cssmin:build-min'
  ]);

  grunt.registerTask('clean-build', ['clean']);

};
