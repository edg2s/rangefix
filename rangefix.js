/*!
 * RangeFix v0.1.0
 * https://github.com/edg2s/range-get-client-rects
 *
 * Copyright 2014 Ed Sanders.
 * Released under the MIT license
 */
( function () {

	var isBroken,
		rangeFix = {};

	/**
	 * Check if the bug is present in the native function
	 *
	 * Constructs two lines of text and creates a range between them.
	 * Broken browsers will return three rectangles instead of two.
	 *
	 * @private
	 * @return {booean} The bug is present
	 */
	function isGetClientRectsBroken() {
		if ( isBroken === undefined ) {
			var p1 = document.createElement( 'p' ),
				p2 = document.createElement( 'p' ),
				t1 = document.createTextNode( 'aa' ),
				t2 = document.createTextNode( 'aa' ),
				range = document.createRange();

			p1.appendChild( t1 );
			p2.appendChild( t2 );

			document.body.appendChild( p1 );
			document.body.appendChild( p2 );

			range.setStart( t1, 1 );
			range.setEnd( t2, 1 );
			isBroken = range.getClientRects().length > 2;

			document.body.removeChild( p1 );
			document.body.removeChild( p2 );
		}
		return isBroken;
	}

	/**
	 * Get client rectangles from a range
	 *
	 * @param {Range} range Range
	 * @return {ClientRect[]} List of ClientRect objects (similar to ClientRectList) describing range
	 */
	rangeFix.getClientRects = function ( range ) {
		if ( !isGetClientRectsBroken() ) {
			return range.getClientRects();
		}

		// Chrome gets the end container rects wrong when spanning
		// nodes so we need to traverse up the tree from the endContainer until
		// we reach the common ancestor, then we can add on from start to where
		// we got up to
		// https://code.google.com/p/chromium/issues/detail?id=324437
		var rects = [],
			endContainer = range.endContainer,
			endOffset = range.endOffset,
			partialRange = document.createRange();

		while ( endContainer !== range.commonAncestorContainer ) {
			partialRange.setStart( endContainer, 0 );
			partialRange.setEnd( endContainer, endOffset );

			Array.prototype.push.apply( rects, partialRange.getClientRects() );

			endOffset = endContainer.parentNode.childNodes.indexOf( endContainer );
			endContainer = endContainer.parentNode;
		}

		// Once we've reached the common ancestor, add on the range from the
		// original start position to where we ended up.
		partialRange = range.cloneRange();
		partialRange.setEnd( endContainer, endOffset );
		Array.prototype.push.apply( rects, partialRange.getClientRects() );
		return rects;
	};

	/**
	 * Get bounding rectangle from a range
	 *
	 * @param {Range} range Range
	 * @return {Object} ClientRect-like object describing bounding rectangle
	 */
	rangeFix.getBoundingClientRect = function ( range ) {
		if ( !isGetClientRectsBroken() ) {
			return range.getBoundingClientRect();
		}

		var i, l, boundingRect,
			rects = this.getClientRects( range );

		for ( i = 0, l = rects.length; i < l; i++ ) {
			if ( !boundingRect ) {
				boundingRect = {
					left: rects[i].left,
					top: rects[i].top,
					right: rects[i].right,
					bottom: rects[i].bottom
				};
			} else {
				boundingRect.left = Math.min( boundingRect.left, rects[i].left );
				boundingRect.top = Math.min( boundingRect.top, rects[i].top );
				boundingRect.right = Math.max( boundingRect.right, rects[i].right );
				boundingRect.bottom = Math.max( boundingRect.bottom, rects[i].bottom );
			}
		}
		if ( boundingRect ) {
			boundingRect.width = boundingRect.right - boundingRect.left;
			boundingRect.height = boundingRect.bottom - boundingRect.top;
		}
		return boundingRect;
	};

	// Expose
	window.RangeFix = rangeFix;

} )();
