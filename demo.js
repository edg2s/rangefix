$( function () {
	var selection = document.getSelection();
	$( document ).on( 'mousemove', function () {
		if ( selection.rangeCount === 0 ) {
			return;
		}
		var i, l, rects, offset,
			range = selection.getRangeAt( 0 ),
			$highlightsNative = $( '<div>' ),
			$highlightsFixed = $( '<div>' );

		rects = range.getClientRects();
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsNative.append( $( '<div>' ).addClass( 'highlight' ).css( rects[i] ) );
		}
		$( '.highlights-native' ).empty().append( $highlightsNative );

		rects = rangeGetClientRects( range );
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsFixed.append( $( '<div>' ).addClass( 'highlight' ).css( rects[i] ) );
		}
		$( '.highlights-fixed' ).empty().append( $highlightsFixed );

		offset = $( '.col-text' )[0].getBoundingClientRect();
		$( '.highlights' ).css( { top: -offset.top, left: -offset.left } );
	} );
} );