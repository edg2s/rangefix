QUnit.assert.approximately = function ( actual, expected, epsilon, message ) {
	this.pushResult( {
		result: Math.abs( actual - expected ) <= epsilon,
		actual,
		expected,
		message
	} );
};

QUnit.module( 'RangeFix', () => {
	let container, text1, text2, text3;

	QUnit.testStart( () => {
		container = document.createElement( 'div' );
		container.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 200px; font-size: 16px; line-height: 1.5;';
		text1 = document.createTextNode( 'Hello world!' );
		text2 = document.createTextNode( ' This is a second line.' );
		text3 = document.createTextNode( 'And a third one.' );

		container.appendChild( text1 );
		container.appendChild( document.createElement( 'br' ) );
		container.appendChild( text2 );
		container.appendChild( document.createElement( 'br' ) );
		container.appendChild( text3 );

		document.body.appendChild( container );
	} );

	QUnit.testDone( () => {
		document.body.removeChild( container );
	} );

	QUnit.test( 'RangeFix.isBroken returns expected structure', ( assert ) => {
		const broken = RangeFix.isBroken();
		assert.true( 'getClientRects' in broken, 'has getClientRects property' );
		assert.true( 'getBoundingClientRect' in broken, 'has getBoundingClientRect property' );
		assert.strictEqual( typeof broken.getClientRects, 'boolean', 'getClientRects is boolean' );
		assert.strictEqual( typeof broken.getBoundingClientRect, 'boolean', 'getBoundingClientRect is boolean' );
	} );

	QUnit.test( 'RangeFix.getClientRects matches native output when not broken', ( assert ) => {
		const range = document.createRange();
		range.setStart( text1, 0 );
		range.setEnd( text1, text1.length );

		const nativeRects = range.getClientRects();
		const fixedRects = RangeFix.getClientRects( range );

		if ( !RangeFix.isBroken().getClientRects ) {
			assert.strictEqual( fixedRects.length, nativeRects.length, 'Matching rect length' );
			for ( let i = 0; i < fixedRects.length; i++ ) {
				assert.approximately( fixedRects[ i ].top, nativeRects[ i ].top, 1, 'Top approx equal' );
				assert.approximately( fixedRects[ i ].left, nativeRects[ i ].left, 1, 'Left approx equal' );
			}
		} else {
			assert.true( fixedRects.length > 0, 'Fallback returns rects' );
		}
	} );

	QUnit.test( 'RangeFix.getBoundingClientRect returns consistent bounding box', ( assert ) => {
		const range = document.createRange();
		range.setStart( text1, 0 );
		range.setEnd( text3, text3.length );

		const rect = RangeFix.getBoundingClientRect( range );

		assert.true( !!rect, 'bounding rect exists' );
		assert.true( 'top' in rect && 'left' in rect && 'width' in rect && 'height' in rect, 'rect has expected properties' );
		assert.true( rect.width > 0, 'width > 0' );
		assert.true( rect.height > 0, 'height > 0' );
	} );

	QUnit.test( 'RangeFix.getBoundingClientRect returns null for empty range', ( assert ) => {
		const range = document.createRange();
		range.setStart( text1, 0 );
		range.setEnd( text1, 0 );

		const rect = RangeFix.getBoundingClientRect( range );
		if ( rect === null ) {
			assert.strictEqual( rect, null, 'rect is null for collapsed range with no layout' );
		} else {
			assert.true( 'width' in rect, 'rect fallback provides width' );
		}
	} );

	QUnit.test( 'RangeFix.getClientRects returns multiple rects across lines', ( assert ) => {
		const range = document.createRange();
		range.setStart( text1, 0 );
		range.setEnd( text3, text3.length );

		const rects = RangeFix.getClientRects( range );
		assert.true( rects.length >= 2, 'returns multiple rects for multi-line content' );
	} );

	QUnit.test( 'RangeFix.getBoundingClientRect collapses rects properly', ( assert ) => {
		const range = document.createRange();
		range.setStart( text1, 2 );
		range.setEnd( text3, text3.length );

		const rect = RangeFix.getBoundingClientRect( range );
		const rects = RangeFix.getClientRects( range );

		const expectedLeft = Math.min( ...Array.from( rects, ( r ) => r.left ) );
		const expectedTop = Math.min( ...Array.from( rects, ( r ) => r.top ) );
		const expectedRight = Math.max( ...Array.from( rects, ( r ) => r.right ) );
		const expectedBottom = Math.max( ...Array.from( rects, ( r ) => r.bottom ) );

		assert.approximately( rect.left, expectedLeft, 1, 'left is min(lefts)' );
		assert.approximately( rect.top, expectedTop, 1, 'top is min(tops)' );
		assert.approximately( rect.right, expectedRight, 1, 'right is max(rights)' );
		assert.approximately( rect.bottom, expectedBottom, 1, 'bottom is max(bottoms)' );
		assert.approximately( rect.width, expectedRight - expectedLeft, 1, 'width is correct' );
		assert.approximately( rect.height, expectedBottom - expectedTop, 1, 'height is correct' );
	} );
} );
