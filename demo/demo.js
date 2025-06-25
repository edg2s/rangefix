/* eslint-disable no-jquery/no-global-selector */

$( function () {

	var isBrokenOriginal = RangeFix.isBroken,
		isBroken = RangeFix.isBroken(),
		selection = document.getSelection();

	for ( var prop in isBroken ) {
		var val = isBroken[ prop ];
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
		var $col;
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

		var $highlightsNative = $( '<div>' );
		var $highlightsFixed = $( '<div>' );

		var i, l;
		// Native
		var rects = range.getClientRects();
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsNative.append(
				$( '<div>' ).addClass( 'highlight' ).css( cssProps( rects[ i ] ) ).append( $( '<span>' ).text( i ) )
			);
		}
		$( '.highlights-native' ).empty().append( $highlightsNative );

		var rect = range.getBoundingClientRect();
		$highlightsNative.append( $( '<div>' ).addClass( 'bounding' ).css( cssProps( rect ) ) );

		// Mock isBroken
		RangeFix.isBroken = function () {
			return {
				getClientRects: true,
				getBoundingClientRect: true
			};
		};

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

		// Restore
		RangeFix.isBroken = isBrokenOriginal;

		// Adjust for container position
		var offset = $col[ 0 ].getBoundingClientRect();
		$( '.highlights' ).css( { top: -offset.top, left: -offset.left } );
	}

	var hasSelectionChange = 'onselectionchange' in document;
	var events = hasSelectionChange ? 'selectionchange' : 'mousemove mouseup keypress keydown keyup';
	$( document ).on( events, render.bind( this, null ) );
	$( window ).on( 'resize', render.bind( this, null ) );

	$( '.ce' ).on( 'input keyup', function () {
		updateMirrors();
	} );

	updateMirrors();

	$( '.testRange' ).on( 'click', function ( e ) {
		var range = document.createRange(),
			testNode1 = $( '.testNode1' )[ 0 ],
			testNode2 = $( '.testNode2' )[ 0 ];

		switch ( +$( e.target ).data( 'range' ) ) {
			case 1:
				range.setStart( testNode1.firstChild, 1 );
				range.setEnd( testNode1.firstChild.nextSibling, 0 );
				break;
			case 2:
				range.setStart( testNode1.firstChild, 1 );
				range.setEnd( testNode1.firstChild.nextSibling.firstChild.nextSibling, 3 );
				break;
			case 3:
				range.setStart( testNode1, 0 );
				range.setEnd( testNode1, 2 );
				break;
			case 4:
				range.setStart( testNode2.childNodes[ 0 ], 3 );
				range.setEnd( testNode2.childNodes[ 0 ], 4 );
				break;
			case 5:
				range.setStart( testNode2.childNodes[ 0 ], 3 );
				range.setEnd( testNode2.childNodes[ 0 ], 5 );
				break;
		}
		selection.removeAllRanges();
		selection.addRange( range );
		render( range );

	} );
} );
