'use strict';

module.exports = function ( config ) {
	config.set( {
		frameworks: [ 'qunit' ],
		files: [
			'src/rangefix.js',
			'tests/*.test.js'
		],
		browsers: [ 'ChromeHeadless', 'FirefoxHeadless' ],
		singleRun: true,
		plugins: [
			require( 'karma-qunit' ),
			require( 'karma-chrome-launcher' ),
			require( 'karma-firefox-launcher' )
		]
	} );
};
