'use strict';

module.exports = function( grunt ) {

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		project: {
			src  : {
				scss : [ 'src/scss' ],
				js   : [ 'src/js' ],
			},
			dist : {
				css  : [ 'dist/css' ],
				js   : [ 'dist/js' ],
			}
		},

		sass: {
            options: {
				loadPath: [
					require( 'node-bourbon' ).includePaths,
			 	]
			},
			dist: {
				options: {
					style: 'expanded',  // nested, compact, compressed, expanded
					//sourcemap: 'none'     // auto, file, inline, none
				},
				files: {
                    '<%= project.dist.css %>/leadvids.min.css': [ '<%= project.src.scss %>/leadvids.scss' ],
                    //'<%= project.dist.css %>/examples.min.css': [ '<%= project.src.scss %>/examples.scss' ]
                }
			}
		},

		uglify: {
			options: {
				banner: '/*! \n * <%= pkg.name %> v<%= pkg.version %>\n * <%= pkg.repo %>\n * \n * Copyright (c) 2018 Derek Cavaliero @ WebMechanix\n * \n * Date: <%= grunt.template.today("yyyy-mm-dd HH:MM:ss Z") %> \n */\n',
			},
			dist: {
				options: {
					beautify: false,  // minify file when set to false
					compress: true, // renames variables and all that
					mangle: true,
					compress: {
						drop_console: true
					}
				},
				files: {
					'<%= project.dist.js %>/jquery.leadvids.min.js': [
						'<%= project.src.js %>/jquery.leadvids.js'
					]
				}
			},
			dev: {
				options: {
					beautify: true,  // minify file when set to false
					compress: false, // renames variables and all that
					mangle: false,
					compress: {
						drop_console: false
					}
				},
				files: {
					'<%= project.dist.js %>/jquery.leadvids.js': [
						'<%= project.src.js %>/jquery.leadvids.js'
					]
				}
			}
		},

		watch: {
			grunt: {
				files	   : [ 'Gruntfile.js' ],
				tasks	   : [ 'build' ]
			},
			options: {
				livereload : true
			},
			// sass: {
			// 	files      : [ '<%= project.src.scss %>/**/*.scss' ],
			// 	tasks      : [ 'sass' ],
			// 	exclude    : [ '!**/node_modules/**', '!**/bower_components/**' ]
			// },
			scripts: {
				files      : [ '<%= project.src.js %>/**/*.js' ],
				tasks  	   : [ 'uglify' ],
				exclude    : [ '!**/node_modules/**', '!**/bower_components/**' ]
			},
			theme: {
				files	   : ['**/*.html'],
				exclude	   : ['!**/node_modules/**', '!**/bower_components/**' ]
			}
		},

	});

	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	grunt.registerTask( 'build', [ 'sass', 'uglify' ] );
	grunt.registerTask( 'default', [ 'build', 'watch' ] );

}
