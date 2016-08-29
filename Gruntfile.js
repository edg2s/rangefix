/*!
 * Grunt file
 */

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		eslint: {
			dev: [
				'*.js'
			]
		},
		watch: {
			files: [
				'.{eslint.json}',
				'<%= eslint.dev %>'
			],
			tasks: '_test'
		}
	} );

	grunt.registerTask( 'test', [ 'eslint' ] );
	grunt.registerTask( 'default', 'test' );
};
