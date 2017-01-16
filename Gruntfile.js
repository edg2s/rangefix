/*!
 * Grunt file
 */

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		eslint: {
			dev: [
				'*.js'
			]
		},
		stylelint: {
			dev: [
				'*.css'
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

	grunt.registerTask( 'test', [ 'eslint', 'stylelint' ] );
	grunt.registerTask( 'default', 'test' );
};
