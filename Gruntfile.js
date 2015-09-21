/* jshint node: true */
'use strict';

var auth = require('./.auth.json')
var exec = require('sync-exec')

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-concat')

    grunt.registerTask('default', ['jshint', 'upload'])
    grunt.registerTask('upload', ['concat', 'screeps'])

    var branch = exec('ref=$(git symbolic-ref HEAD 2> /dev/null);echo ${ref#refs/heads/}').stdout.replace(/\n$/, '')

    grunt.initConfig({
        jshint: {
          all: ['*.js'],
          options: grunt.file.readJSON('package.json').jshintConfig
        },
        concat: {
            options: {
              separator: ';'
            },
            dist: {
              src: ['*.js', '!Gruntfile.js'],
              dest: 'dist/main.js',
            },
          },
        screeps: {
            options: {
                email: auth.username,
                password: auth.password,
                branch: (grunt.option('branch') || branch)
            },
            dist: {
                src: ['dist/main.js']
            }
        }
    });
}