/*!
 * Grunt file
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: {
				jshintrc: true
			},
			dev: [
				'*.js'
			]
		},
		jscs: {
			dev: '<%= jshint.dev %>'
		},
		watch: {
			files: [
				'.{jscsrc,jshintignore,jshintrc}',
				'<%= jshint.dev %>'
			],
			tasks: '_test'
		}
	} );

	grunt.registerTask( 'test', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'default', 'test' );
};
