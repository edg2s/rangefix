( function () {

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

	function appendRectList( arr, rectList ) {
		var i;
		for ( i = 0; i < rectList.length; i++ ) {
			arr.push( rectList[i] );
		}
	}

	function rangeGetClientRects( range ) {
		// Chrome gets the end container rects wrong when spanning
		// nodes so we need to traverse up the tree from the endContainer until
		// we reach the common ancestor, then we can add on from start to where
		// we got up to
		// https://code.google.com/p/chromium/issues/detail?id=324437
		var rects = [],
			endContainer = range.endContainer;
			endOffset = range.endOffset;
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

	// Expose
	window.rangeGetClientRects = rangeGetClientRects;
} )();