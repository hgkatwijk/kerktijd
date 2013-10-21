module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build/*'],
    copy: {
      build: {
        options: {
          processContent: function (content, srcpath) {
            return grunt.template.process(content);
          }
        },
        files: [
          { expand: true, cwd: 'src/', src: ['**'], dest: 'build/' }
        ]
      }
    },
    htmlmin: {
      build: {
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
    replace: {
      options: {
        //force: true,
        variables: {
          appName: 'Kerktijd',
          appDescription: 'Wees op de hoogte van de kerkdiensten van de Hervormde Gemeente Katwijk aan Zee.',
          authorName: '<%= pkg.author.name %>',
          authorEmail: '<%= pkg.author.email %>',
          authorURL: '<%= pkg.author.url %>',
          timestamp: '<%= grunt.template.today() %>',
          version: '<%= pkg.version %>'
        }
      },
      build: {
        files: [
          { expand: true, cwd: 'src/', src: ['**'], dest: 'build/' }
        ]
      }
    },
    uglify: {
      options: {
        output: {
          max_line_len: 80
        }
      },
      build: {
        files: {
          'build/app.min.js': ['build/app.js']
        }
      }
    },
    sass: {
      build: {
        files: {
          'build/app.css': [

          ]
        }
      },
    },
    cssmin: {
      build: {
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
    'sass:build',
    'concat:build'
  ]);
  grunt.registerTask('build-optimize', [
    'htmlmin:build',
    'uglify:build',
    'cssmin:build'
  ]);

  grunt.registerTask('clean-build', ['clean']);

};
