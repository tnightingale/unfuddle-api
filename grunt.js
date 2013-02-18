/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', '*.js', 'test/**/*.js']
    },
    mochaTest: {
      files: ['test/**/*.test.js']
    },
    mochaTestConfig: {
      options: {
        reporter: 'nyan',
        ui: 'tdd'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint mochaTest'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {
        require: true,
        module: true,
        suite: true,
        test: true,
        setup: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint mochaTest');
  grunt.loadNpmTasks('grunt-mocha-test');
};
