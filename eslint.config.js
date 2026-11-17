'use strict';

const wikimedia = require( 'eslint-config-wikimedia/flat' );

const isGlobalIgnore = ( config ) => Object.keys( config ).length === 1 && !!config.ignores;

/**
 * Limit configs to files in a directory.
 *
 * @param {string} dir Directory
 * @param {Object[]} configs Flat config objects
 * @return {Object[]} Flat config objects
 */
const scope = ( dir, configs ) => configs.map( ( config ) => {
	if ( isGlobalIgnore( config ) ) {
		return config;
	}
	if ( !config.files ) {
		return { ...config, files: [ `${ dir }/**` ] };
	}
	// A nested array matches files that match all of its patterns.
	return { ...config, files: config.files.map( ( pattern ) => [ `${ dir }/**`, ...[].concat( pattern ) ] ) };
} );

const subdirs = [ 'src', 'tests', 'demo' ];

const rangeFixGlobals = {
	RangeFix: 'readonly'
};

module.exports = [
	...wikimedia( 'server' ).map( ( config ) => isGlobalIgnore( config ) ? config : {
		...config,
		ignores: [ ...( config.ignores || [] ), ...subdirs.map( ( dir ) => `${ dir }/**` ) ]
	} ),
	...scope( 'src', [
		...wikimedia( 'client/es6' ),
		{
			languageOptions: {
				globals: {
					...rangeFixGlobals,
					// CommonJS and AMD
					module: 'readonly',
					exports: 'readonly',
					require: 'readonly',
					define: 'readonly'
				}
			},
			rules: {
				'max-len': 'off'
			}
		}
	] ),
	...scope( 'tests', [
		...wikimedia( 'client', 'jquery', 'qunit' ),
		{ languageOptions: { globals: rangeFixGlobals } }
	] ),
	...scope( 'demo', [
		...wikimedia( 'client/es6', 'jquery' ),
		{ languageOptions: { globals: rangeFixGlobals } }
	] )
];
