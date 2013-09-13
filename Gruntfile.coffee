module.exports = (grunt) ->
  
  # Project configuration.
  grunt.initConfig
    
    pkg: grunt.file.readJSON("package.json")

    coffee:
      dev:
        options:
          join: true
          bare: true
          sourceMap: true
        files:
          'valet.js': 'valet.coffee'
          'public/js/app.js': ['coffee/*.coffee']

    notify:
      starting:
        options:
          message: 'Grunt Started'
      coffee:
        options:
          message: 'Coffee Compiled'
      
    watch:
      options:
        livereload: true
      coffee:
        files: ['coffee/*.coffee', 'valet.coffee']
        tasks: ['coffeeBuild']
      views:
        files: ['views/**/*.html', 'views/**/*.jade', 'public/appViews/**/*.html']
        tasks: ['notifyChange']

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-notify"

  # Default task(s).
  grunt.registerTask "default", ["notify:starting", "coffee:dev", "notify:coffee"]
  grunt.registerTask "coffeeBuild", ["notify:starting", "coffee:dev", "notify:coffee"]
  grunt.registerTask "notifyChange", ["notify:starting"]



