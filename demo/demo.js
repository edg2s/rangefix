/* eslint-disable no-jquery/no-global-selector */

$( function () {

	const isBrokenOriginal = RangeFix.isBroken,
		isBroken = RangeFix.isBroken(),
		selection = document.getSelection();

	for ( const prop in isBroken ) {
		const val = isBroken[ prop ];
		$( '.isBroken-' + prop )
			.toggleClass( 'broken', val ).toggleClass( 'working', !val )
			.text( val ? 'Broken' : 'Working' );
	}

	function getCssProps( rect ) {
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
		let $col;
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

		const $highlightsNative = $( '<div>' );
		const $highlightsFixed = $( '<div>' );

		// Native
		const nativeRects = range.getClientRects();
		Array.prototype.forEach.call( nativeRects, ( rect, i ) => {
			$highlightsNative.append(
				$( '<div>' ).addClass( 'highlight' ).css( getCssProps( rect ) ).append( $( '<span>' ).text( i ) )
			);
		} );
		$( '.highlights-native' ).empty().append( $highlightsNative );

		const nativeBoundingRect = range.getBoundingClientRect();
		$highlightsNative.append( $( '<div>' ).addClass( 'bounding' ).css( getCssProps( nativeBoundingRect ) ) );

		// Mock isBroken
		RangeFix.isBroken = function () {
			return {
				getClientRects: true,
				getBoundingClientRect: true
			};
		};

		// Fixed
		const fixedRects = RangeFix.getClientRects( range );
		Array.prototype.forEach.call( fixedRects, ( rect, i ) => {
			$highlightsFixed.append(
				$( '<div>' ).addClass( 'highlight' ).css( getCssProps( rect ) ).append( $( '<span>' ).text( i ) )
			);
		} );
		$( '.highlights-fixed' ).empty().append( $highlightsFixed );

		const fixedBoundingRect = RangeFix.getBoundingClientRect( range );
		if ( fixedBoundingRect ) {
			$highlightsFixed.append( $( '<div>' ).addClass( 'bounding' ).css( getCssProps( fixedBoundingRect ) ) );
		}

		// Restore
		RangeFix.isBroken = isBrokenOriginal;

		// Adjust for container position
		const offset = $col[ 0 ].getBoundingClientRect();
		$( '.highlights' ).css( { top: -offset.top, left: -offset.left } );
	}

	const hasSelectionChange = 'onselectionchange' in document;
	const events = hasSelectionChange ? 'selectionchange' : 'mousemove mouseup keypress keydown keyup';
	$( document ).on( events, render.bind( this, null ) );
	$( window ).on( 'resize', render.bind( this, null ) );

	$( '.ce' ).on( 'input keyup', () => {
		updateMirrors();
	} );

	updateMirrors();

	$( '.testRange' ).on( 'click', ( e ) => {
		const range = document.createRange(),
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
