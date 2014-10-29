( function () {

	/**
	 * Polyfill for Array.indexOf
	 *
	 * @private
	 * @param {Mixed} elem Element to find
	 * @param {Array} arr Array to find in
	 * @param {number} [i] Starting offset
	 * @return {number} Index of element in array, or -1 if not found
	 */
	function indexOf( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( Array.prototype.indexOf ) {
				return Array.prototype.indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	}

	/**
	 * Append ClientRect items from a ClientRectList to an array
	 *
	 * @private
	 * @param {Array} arr Array to append to
	 * @param {ClientRectList} rectList ClientRectList object
	 */
	function appendRectList( arr, rectList ) {
		var i;
		for ( i = 0; i < rectList.length; i++ ) {
			arr.push( rectList[i] );
		}
	}

	/**
	 * Get client rectangles from a range
	 *
	 * @param {Range} range Range
	 * @return {ClientRect[]} List of ClientRect objects (similar to ClientRectList) describing range
	 */
	function rangeGetClientRects( range ) {
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

			appendRectList( rects, partialRange.getClientRects() );

			endOffset = indexOf( endContainer, endContainer.parentNode.childNodes );
			endContainer = endContainer.parentNode;
		}

		// Once we've reached the common ancestor, add on the range from the
		// original start position to where we ended up.
		partialRange = range.cloneRange();
		partialRange.setEnd( endContainer, endOffset );
		appendRectList( rects, partialRange.getClientRects() );
		return rects;
	}

	/**
	 * Get bounding rectangle from a range
	 *
	 * @param {Range} range Range
	 * @return {Object} ClientRect-like object describing bounding rectangle
	 */
	function rangeGetBoundingClientRect( range ) {
		var i, l, boundingRect,
			rects = rangeGetClientRects( range );

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
	}

	// Expose
	window.rangeGetClientRects = rangeGetClientRects;
	window.rangeGetBoundingClientRect = rangeGetBoundingClientRect;
} )();
