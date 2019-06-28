/* eslint-env jquery */

$( function () {

	var prop, val,
		isBroken = RangeFix.isBroken(),
		selection = document.getSelection(),
		hasSelectionChange = 'onselectionchange' in document,
		events = hasSelectionChange ? 'selectionchange' : 'mousemove mouseup keypress keydown keyup';

	for ( prop in isBroken ) {
		val = isBroken[ prop ];
		$( '.isBroken-' + prop )
			.toggleClass( 'broken', val ).toggleClass( 'working', !val )
			.text( val ? 'Broken' : 'Working' );
	}

	function cssProps( rect ) {
		return {
			left: rect.left,
			top: rect.top,
			width: Math.max( rect.width, 1 ),
			height: Math.max( rect.height, 1 )
		};
	}

	function updateMirrors() {
		$( '.ce-mirror' ).html( $( '.ce' ).html() );
	}

	function render( range ) {
		var i, l, rect, rects, offset,
			$col, $highlightsNative, $highlightsFixed;

		if ( !range ) {
			if ( selection.rangeCount === 0 ) {
				return;
			}

			$col = $( selection.focusNode ).closest( '.col' );
			if ( !$col.is( '.col-text' ) ) {
				return;
			}
			range = selection.getRangeAt( 0 );
		} else {
			$col = $( '.col-text' );
		}

		$highlightsNative = $( '<div>' );
		$highlightsFixed = $( '<div>' );

		// Native
		rects = range.getClientRects();
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsNative.append(
				$( '<div>' ).addClass( 'highlight' ).css( cssProps( rects[ i ] ) ).append( $( '<span>' ).text( i ) )
			);
		}
		$( '.highlights-native' ).empty().append( $highlightsNative );

		rect = range.getBoundingClientRect();
		$highlightsNative.append( $( '<div>' ).addClass( 'bounding' ).css( cssProps( rect ) ) );

		// Fixed
		rects = RangeFix.getClientRects( range );
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsFixed.append(
				$( '<div>' ).addClass( 'highlight' ).css( cssProps( rects[ i ] ) ).append( $( '<span>' ).text( i ) )
			);
		}
		$( '.highlights-fixed' ).empty().append( $highlightsFixed );

		rect = RangeFix.getBoundingClientRect( range );
		if ( rect ) {
			$highlightsFixed.append( $( '<div>' ).addClass( 'bounding' ).css( cssProps( rect ) ) );
		}

		// Adjust for container position
		offset = $col[ 0 ].getBoundingClientRect();
		$( '.highlights' ).css( { top: -offset.top, left: -offset.left } );
	}

	$( document ).on( events, render.bind( this, null ) );
	$( window ).on( 'resize', render.bind( this, null ) );

	$( '.ce' ).on( 'input keyup', function () {
		updateMirrors();
	} );

	updateMirrors();

	$( '.testRange' ).on( 'click', function ( e ) {
		var range = document.createRange(),
			testNode = $( '.testNode' )[ 0 ];

		range.setStart( testNode.firstChild, 1 );
		if ( +$( e.target ).data( 'range' ) === 1 ) {
			range.setEnd( testNode.firstChild.nextSibling, 0 );
		} else {
			range.setEnd( testNode.firstChild.nextSibling.firstChild.nextSibling, 3 );
		}
		render( range );

	} );
} );
