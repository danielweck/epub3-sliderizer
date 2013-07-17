var EpubReflowableModule = function(spineObject, viewerSettingsObject, CFIAnnotations, bindings) {

    var EpubReflowable = {};

    // Rationale: The order of these matters
    // Description: This model is responsible for implementing the Alternate Style Tags specification
// found at http://idpf.org/epub/altss-tags/. The model selects a "preferred" style sheet or style set 
// with which to render an ePUB document. 
// 
// Notes: The convention in this model is to prepend the names of "private" methods with an underscore ('_')
//
// TODO: More validation for style sets with mixed rel="alternate ..." and rel="stylesheet"?
// TODO: Ensure that the "default" style set (the default in the ePub) is activated if no tags are supplied
 

EpubReflowable.AlternateStyleTagSelector = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function() {},

	/* Description: Activate a style set based on a single, or set, of ePub alternate style tags
	 * Arguments (
	 *   altStyleTags: An array of ePUB alternate style tags
	 *   bookDom: An epub document object
	 * )
	 */
	activateAlternateStyleSet: function(altStyleTags, bookDom) {

		var $bookStyleSheets;
		var styleSetTitles = [];
		var that = this;
		var styleSetToActivate;

		// If there are no alternate tags supplied, do not change the style sets
		if (altStyleTags.length === 0) {

			return bookDom;
		}

		// Get all style sheets in the book dom
		$bookStyleSheets = $("link[rel*='stylesheet']", bookDom);

		// If the book does not have any stylesheets, do not change style sets
		if ($bookStyleSheets.length === 0) {

			return bookDom;
		}

		// Maintain original information about stylesheets
		$bookStyleSheets = this._storeOriginalAttributes($bookStyleSheets);

		// Get a list of the unique style set titles 
		styleSetTitles = this._getStyleSetTitles($bookStyleSheets);

		// Determine which style set should be activated
		styleSetToActivate = this._getStyleSetTitleToActivate($bookStyleSheets, styleSetTitles, altStyleTags);

		// If no style was found to activate, based on the supplied tags, do not change the style sets
		if (styleSetToActivate === null) {

			return bookDom;
		}

		// Activate the specified style set, de-activing all others
		this._activateStyleSet($bookStyleSheets, styleSetToActivate);

		return bookDom;
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	/* Description: Activate the specified style set and de-activate all others
	 * Design rationale: The disabled property is used to activate/de-activate the style sheets, as opposed to changing 
	 * attribute values, as this ensures that the document is re-rendered
	 * Arguments (
	 *   bookStyleSheets: A JQuery object of the ePubs style sheets
	 *   styleSetToActivate: The attribute value for the "title" property of the style set to activate
	 * )
	 */
	_activateStyleSet: function (bookStyleSheets, styleSetToActivate) {

		bookStyleSheets.each(function () {

			$styleSheet = $(this);

			// The stylesheets must all be set as preferred so that when enabled, they will be activated
			$styleSheet.attr("rel", "stylesheet");
			// Always leave persistent style sets activated
			if ($styleSheet.attr('title') === undefined) {

				$styleSheet[0].disabled = false;
			}
			// Activate this style set
			else if ($.trim($styleSheet.attr('title')) === styleSetToActivate) {

				// Chrome is buggy and change to disabled = false is only
				// picked up if you first set it to true
				$styleSheet[0].disabled = true;
				$styleSheet[0].disabled = false;
			}
			// De-activate other style sets
			else {

				$styleSheet[0].disabled = true;
			}
		});

		return bookStyleSheets;
	},

	/* Description: Creates data attributes to store the original stylesheet attribute values
	 * Design rationale: The "rel" attribute must be modified in other methods but we need to "remember" 
	 * the author's original style sheet specification
	 * Arguments (
	 *   bookStyleSheets: A JQuery object of the ePubs style sheets
	 * )
	 */
	_storeOriginalAttributes: function(bookStyleSheets) {

		var $styleSheet;

		// For each style sheet, if the original value attributes are empty, set them
		bookStyleSheets.each(function() {

			$styleSheet = $(this);

			if ($styleSheet.data('orig-rel') === undefined) {

				$styleSheet.attr('data-orig-rel', $styleSheet.attr("rel"));
			}
		});

		return bookStyleSheets;
	},

	/* Description: Finds the title of the style set to activate using HTML preference rules for style sheets, as well as ePub 
	 * alternate style tags.
	 * Arguments (
	 *   bookStyleSheets: A JQuery object of the ePubs style sheets 
	 *   styleSetTitles: An array of the unique style set titles for the ePub
	 *   altStyleTags: An array of ePUB alternate style tags
	 * )
	 * Error handling: Returns null if not title is found
	 */
	_getStyleSetTitleToActivate: function (bookStyleSheets, styleSetTitles, altStyleTags) {

		var styleSetTagMatches = [];
		var styleSetNum;
		var $styleSet;
		var maxNumTagMatches;
		var styleSetCandidates = [];

		// Find the style set with the most matching alternate tags, removing mututally exclusive tags
		for (styleSetNum = 0; styleSetNum < styleSetTitles.length; styleSetNum += 1) {

			$styleSet = bookStyleSheets.filter("link[title='" + styleSetTitles[styleSetNum] + "']");
			$styleSet = this._removeMutuallyExclusiveAltTags($styleSet);
			styleSetTagMatches.push(
				{ "numAltTagMatches" : this._getNumAltStyleTagMatches($styleSet, altStyleTags),
				  "styleSetTitle" : styleSetTitles[styleSetNum] }
			);
		}

		// Get a list of the style sets with the maximum number of tag matches
		// _.max returns one of the info elements with a maximum value, which is why the numAltTagMatches property is used to retrieve the actual max value
		maxNumTagMatches = (_.max(styleSetTagMatches, function (styleSetTagMatchInfo) { return styleSetTagMatchInfo.numAltTagMatches } )).numAltTagMatches;

		// Do nothing if there are no matching tags
		if (maxNumTagMatches === 0) {

			return null;
		}

		// Get a list of the style sets that had the maximum number of alternate tag matches
		_.each(styleSetTagMatches, function(styleSetTagMatchInfo) {

			if (styleSetTagMatchInfo['numAltTagMatches'] === maxNumTagMatches) {

				styleSetCandidates.push(styleSetTagMatchInfo["styleSetTitle"]);
			}
		});

		// If there is only one style set in the candidate list
		if (styleSetCandidates === 1) {

			return styleSetCandidates[0];
		}
		// Since there are multiple candidates, return the style set that is preferred (the first style set with rel="stylesheet")
		else {

			var candidateNum;
			for (candidateNum = 0; candidateNum < styleSetCandidates.length; candidateNum++) {

				// TODO: This assumes that all the style sheets in the style set are marked as either preferred or alternate. It simply checks the first 
				// style sheet of every style set.
				$styleSet = bookStyleSheets.filter("link[title='" + styleSetCandidates[candidateNum] + "']");
				if ($.trim($($styleSet[0]).attr("data-orig-rel")) === "stylesheet") {

					return styleSetCandidates[candidateNum];
				}
			}

			// If none of the stylesheets were preferred (only rel="alternate stylesheet"), return the first style set title
			return styleSetCandidates[0];
		}
	},

	/* Description: Finds the unique list of style set titles from the set of style sheets for the ePub
	 * Arguments (
	 *   bookStyleSheets: A JQuery object of the ePub's style sheets 
	 * )
	 */
	_getStyleSetTitles: function (bookStyleSheets) {

		var styleSetTitles = [];

		// Find the unique style sets from the 'title' property
		bookStyleSheets.each(function() {

			var styleSheetTitle = $(this).attr("title");
			if (!_.include(styleSetTitles, styleSheetTitle)) {

				styleSetTitles.push(styleSheetTitle);
			}
		});

		return styleSetTitles;
	},

	/* Description: Finds the number of alternate style tags in a style set's class attribute
	 * Arguments (
	 *   styleSet: A JQuery object that represents a single style set
	 *   altStyleTags: An array of ePUB alternate style tags
	 * )
	 */
	_getNumAltStyleTagMatches: function (styleSet, altStyleTags) {

		var numMatches = 0;

		// If the alt style tag is found in the style set, increment num matches
		var altTagNum;
		for (altTagNum = 0; altTagNum < altStyleTags.length; altTagNum += 1) {

			// filter used so top-level elements are selected
			if (styleSet.filter("link[class*='" + altStyleTags[altTagNum] + "']").length > 0) {

				numMatches++;	
			}
		}

		return numMatches;
	},

	// 
	/* Description: This method removes, thus ignoring, mututally exclusive alternate tags within a style set
	 * Arguments (
	 *   styleSet: A JQuery object that represents a single style set
	 * )
	 */
	//TODO: Maybe change this to act on data- attributes, rather than the actual class attribute
	_removeMutuallyExclusiveAltTags: function (styleSet) {

		var $styleSheet;

		if (styleSet.filter("link[class*='night']").length > 0 &&
		    styleSet.filter("link[class*='day']").length > 0) {

			styleSet.each(function () { 

				$styleSheet = $(this);

				if ($styleSheet.filter('.night').length > 0) {

					$styleSheet.toggleClass('night');
				}

				if ($styleSheet.filter('.day').length > 0) {

					$styleSheet.toggleClass('day');
				}
			});
		}

		if (styleSet.filter("link[class*='vertical']").length > 0 &&
			styleSet.filter("link[class*='horizontal']").length > 0) {

			styleSet.each(function () { 

				$styleSheet = $(this);

				if ($styleSheet.filter('.vertical').length > 0) {
					
					$styleSheet.toggleClass('vertical');
				}

				if ($styleSheet.filter('.horizontal').length > 0) {

					$styleSheet.toggleClass('horizontal');
				}
			});
		}

		return styleSet;
	}
});
    EpubReflowable.ReflowableAnnotations = Backbone.Model.extend({

    defaults : {
        "saveCallback" : undefined,
        "callbackContext" : undefined
    },

    initialize : function (attributes, options) {
        this.epubCFI = new EpubCFIModule();
        // this.annotations = new EpubAnnotationsModule(0, 0, $("html", this.get("contentDocumentDOM"))[0]);
    },

    // Not sure about this, might remove it. The callbacks are unnecessary
    saveAnnotation : function (CFI, spinePosition) {

        var saveAnnotation = this.get("saveCallback");
        saveAnnotation.call(this.get("callbackContext"), CFI, spinePosition);
    },

    redraw : function () {

        // var leftAddition = -this.getPaginationLeftOffset();
        // this.annotations.redrawAnnotations(0, leftAddition);
    },

    // addHighlight : function (CFI, id) {

    //     var CFIRangeInfo;
    //     var range;
    //     var rangeStartNode;
    //     var rangeEndNode;
    //     var selectedElements;
    //     var leftAddition;
    //     var startMarkerHtml = this.getRangeStartMarker(CFI, id);
    //     var endMarkerHtml = this.getRangeEndMarker(CFI, id);

    //     try {
    //         CFIRangeInfo = this.epubCFI.injectRangeElements(
    //             CFI,
    //             this.get("contentDocumentDOM"),
    //             startMarkerHtml,
    //             endMarkerHtml,
    //             ["cfi-marker"]
    //             );

    //         // Get start and end marker for the id, using injected into elements
    //         // REFACTORING CANDIDATE: Abstract range creation to account for no previous/next sibling, for different types of
    //         //   sibiling, etc. 
    //         rangeStartNode = CFIRangeInfo.startElement.nextSibling ? CFIRangeInfo.startElement.nextSibling : CFIRangeInfo.startElement;
    //         rangeEndNode = CFIRangeInfo.endElement.previousSibling ? CFIRangeInfo.endElement.previousSibling : CFIRangeInfo.endElement;
    //         range = document.createRange();
    //         range.setStart(rangeStartNode, 0);
    //         range.setEnd(rangeEndNode, rangeEndNode.length);

    //         selectionInfo = this.getSelectionInfo(range);
    //         leftAddition = -this.getPaginationLeftOffset();
    //         this.annotations.addHighlight(CFI, selectionInfo.selectedElements, id, 0, leftAddition);

    //         return {
    //             CFI : CFI, 
    //             selectedElements : selectionInfo.selectedElements
    //         };

    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // },

    // addBookmark : function (CFI, id) {

    //     var selectedElements;
    //     var bookmarkMarkerHtml = this.getBookmarkMarker(CFI, id);
    //     var $injectedElement;
    //     var leftAddition;

    //     try {
    //         $injectedElement = this.epubCFI.injectElement(
    //             CFI,
    //             this.get("contentDocumentDOM"),
    //             bookmarkMarkerHtml,
    //             ["cfi-marker"]
    //             );

    //         // Add bookmark annotation here
    //         leftAddition = -this.getPaginationLeftOffset();
    //         this.annotations.addBookmark(CFI, $injectedElement[0], id, 0, leftAddition);

    //         return {

    //             CFI : CFI, 
    //             selectedElements : $injectedElement[0]
    //         };

    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // },

    // addSelectionHighlight : function (id) {

    //     var highlightRange;
    //     var selectionInfo;
    //     var leftAddition;
    //     var currentSelection = this.getCurrentSelectionRange();
    //     if (currentSelection) {

    //         highlightRange = this.injectHighlightMarkers(currentSelection);
    //         selectionInfo = this.getSelectionInfo(highlightRange);
    //         leftAddition = -this.getPaginationLeftOffset();
    //         this.annotations.addHighlight(selectionInfo.CFI, selectionInfo.selectedElements, id, 0, leftAddition);
    //         return selectionInfo;
    //     }
    //     else {
    //         throw new Error("Nothing selected");
    //     }
    // },

    // addSelectionBookmark : function (id) {

    //     var marker;
    //     var partialCFI;
    //     var leftAddition;
    //     var currentSelection = this.getCurrentSelectionRange();
    //     if (currentSelection) {

    //         partialCFI = this.generateCharOffsetCFI(currentSelection);
    //         marker = this.injectBookmarkMarker(currentSelection);
    //         leftAddition = -this.getPaginationLeftOffset();
    //         this.annotations.addBookmark("", marker, id, 0, leftAddition);

    //         return {
    //             CFI : partialCFI,
    //             selectedElements : marker
    //         };
    //     }
    //     else {
    //         throw new Error("Nothing selected");
    //     }
    // },

    // getSelectionInfo : function (selectedRange) {

    //     // Generate CFI for selected text
    //     var CFI = this.generateRangeCFI(selectedRange);
    //     var intervalState = {
    //         startElementFound : false,
    //         endElementFound : false
    //     };
    //     var selectedElements = [];

    //     this.findSelectedElements(
    //         selectedRange.commonAncestorContainer, 
    //         selectedRange.startContainer, 
    //         selectedRange.endContainer,
    //         intervalState,
    //         selectedElements, 
    //         "p"
    //         );

    //     // Return a list of selected text nodes and the CFI
    //     return {
    //         CFI : CFI,
    //         selectedElements : selectedElements
    //     };
    // },

    // generateRangeCFI : function (selectedRange) {

    //     var startNode = selectedRange.startContainer;
    //     var endNode = selectedRange.endContainer;
    //     var startOffset;
    //     var endOffset;
    //     var rangeCFIComponent;

    //     if (startNode.nodeType === Node.TEXT_NODE && endNode.nodeType === Node.TEXT_NODE) {

    //         startOffset = selectedRange.startOffset;
    //         endOffset = selectedRange.endOffset;

    //         rangeCFIComponent = this.epubCFI.generateCharOffsetRangeComponent(startNode, startOffset, endNode, endOffset);
    //         return rangeCFIComponent;
    //     }
    //     else {
    //         throw new Error("Selection start and end must be text nodes");
    //     }
    // },

    // generateCharOffsetCFI : function (selectedRange) {

    //     // Character offset
    //     var startNode = selectedRange.startContainer;
    //     var startOffset = selectedRange.startOffset;
    //     var charOffsetCFI;

    //     if (startNode.nodeType === Node.TEXT_NODE) {
    //         charOffsetCFI = this.epubCFI.generateCharacterOffsetCFIComponent(
    //             startNode,
    //             startOffset,
    //             ["cfi-marker"]
    //             );
    //     }
    //     return charOffsetCFI;
    // },

    findExistingLastPageMarker : function ($visibleTextNode) {

        // Check if a last page marker already exists on this page
        try {
            
            var existingCFI = undefined;
            $.each($visibleTextNode.parent().contents(), function () {

                if ($(this).hasClass("last-page")) {
                    lastPageMarkerExists = true;
                    existingCFI = $(this).attr("data-last-page-cfi");

                    // Break out of loop
                    return false;
                }
            });

            return existingCFI;
        }
        catch (e) {

            console.log("Could not generate CFI for non-text node as first visible element on page");

            // No need to execute the rest of the save position method if the first visible element is not a text node
            return undefined;
        }
    },

    // REFACTORING CANDIDATE: Convert this to jquery
    findSelectedElements : function (currElement, startElement, endElement, intervalState, selectedElements, elementTypes) {

        if (currElement === startElement) {
            intervalState.startElementFound = true;
        }

        if (intervalState.startElementFound === true) {
            this.addElement(currElement, selectedElements, elementTypes);
        }

        if (currElement === endElement) {
            intervalState.endElementFound = true;
            return;
        }

        if (currElement.firstChild) {
            this.findSelectedElements(currElement.firstChild, startElement, endElement, intervalState, selectedElements, elementTypes);
            if (intervalState.endElementFound) {
                return;
            }
        }

        if (currElement.nextSibling) {
            this.findSelectedElements(currElement.nextSibling, startElement, endElement, intervalState, selectedElements, elementTypes);
            if (intervalState.endElementFound) {
                return;
            }
        }
    },

    addElement : function (currElement, selectedElements, elementTypes) {

        // Check if the node is one of the types
        if (currElement.nodeType === Node.TEXT_NODE) {
            selectedElements.push(currElement);
        }
    },

    // REFACTORING CANDIDATE: The methods here inject bookmark/highlight markers for the current selection, after
    //   which information for the selected range is generated and returned in an annotation "info" object. The 
    //   injectedHighlightMarkers method leverages parts of the CFI library that should be private to that library; this
    //   is not ideal, and adds redundant, complex, code to the annotations delegate. A better method here would be to generate
    //   selection info, get the generated range CFI, and use that to inject markers. The only reason this wasn't done is 
    //   because the CFI library did not support CFI range generation or injection when selection and highlighting was done.
    // injectBookmarkMarker : function (selectionRange, id) {

    //     var startNode = selectionRange.startContainer;
    //     var startOffset = selectionRange.startOffset;
    //     var $bookmarkMarker = $(this.getBookmarkMarker("", id));
    //     var highlightRange;

    //     this.epubCFI.injectElementAtOffset(
    //         $(startNode), 
    //         startOffset,
    //         $bookmarkMarker
    //     );

    //     return $bookmarkMarker[0];        
    // },
 
    // injectHighlightMarkers : function (selectionRange, id) {

    //     var highlightRange;
    //     if (selectionRange.startContainer === selectionRange.endContainer) {
    //         highlightRange = this.injectHighlightInSameNode(selectionRange, id);
    //     } else {
    //         highlightRange = this.injectHighlightsInDifferentNodes(selectionRange, id);
    //     }

    //     return highlightRange;
    // },

    // injectHighlightInSameNode : function (selectionRange, id) {

    //     var startNode;
    //     var startOffset = selectionRange.startOffset;
    //     var endNode = selectionRange.endContainer;
    //     var endOffset = selectionRange.endOffset;
    //     var $startMarker = $(this.getRangeStartMarker("", id));
    //     var $endMarker = $(this.getRangeEndMarker("", id));
    //     var highlightRange;

    //     // Rationale: The end marker is injected before the start marker because when the text node is split by the 
    //     //   end marker first, the offset for the start marker will still be the same and we do not need to recalculate 
    //     //   the offset for the newly created end node.

    //     // inject end marker
    //     this.epubCFI.injectElementAtOffset(
    //         $(endNode), 
    //         endOffset,
    //         $endMarker
    //     );

    //     startNode = $endMarker[0].previousSibling;

    //     // inject start marker
    //     this.epubCFI.injectElementAtOffset(
    //         $(startNode), 
    //         startOffset,
    //         $startMarker
    //     );

    //     // reconstruct range
    //     highlightRange = document.createRange();
    //     highlightRange.setStart($startMarker[0].nextSibling, 0);
    //     highlightRange.setEnd($endMarker[0].previousSibling, $endMarker[0].previousSibling.length - 1);

    //     return highlightRange;
    // },

    // injectHighlightsInDifferentNodes : function (selectionRange, id) {

    //     var startNode = selectionRange.startContainer;
    //     var startOffset = selectionRange.startOffset;
    //     var endNode = selectionRange.endContainer;
    //     var endOffset = selectionRange.endOffset;
    //     var $startMarker = $(this.getRangeStartMarker("", id));
    //     var $endMarker = $(this.getRangeEndMarker("", id));
    //     var highlightRange;

    //     // inject start
    //     this.epubCFI.injectElementAtOffset(
    //         $(startNode), 
    //         startOffset,
    //         $startMarker
    //     );

    //     // inject end
    //     this.epubCFI.injectElementAtOffset(
    //         $(endNode), 
    //         endOffset,
    //         $endMarker
    //     );

    //     // reconstruct range
    //     highlightRange = document.createRange();
    //     highlightRange.setStart($startMarker[0].nextSibling, 0);
    //     highlightRange.setEnd($endMarker[0].previousSibling, $endMarker[0].previousSibling.length - 1);

    //     return highlightRange;
    // },

    // Rationale: This is a cross-browser method to get the currently selected text
    getCurrentSelectionRange : function () {

        var currentSelection;
        var iframeDocument = this.get("contentDocumentDOM");
        if (iframeDocument.getSelection) {
            currentSelection = iframeDocument.getSelection();

            if (currentSelection.rangeCount) {
                return currentSelection.getRangeAt(0);
            }
        }
        else if (iframeDocument.selection) {
            return iframeDocument.selection.createRange();
        }
        else {
            return undefined;
        }
    },

    getPaginationLeftOffset : function () {

        var $htmlElement = $("html", this.get("contentDocumentDOM"));
        var offsetLeftPixels = $htmlElement.css("left");
        var offsetLeft = parseInt(offsetLeftPixels.replace("px", ""));
        return offsetLeft;
    },

    getBookmarkMarker : function (CFI, id) {

        return "<span class='bookmark-marker cfi-marker' id='" + id + "' data-cfi='" + CFI + "'></span>";
    },

    getRangeStartMarker : function (CFI, id) {

        return "<span class='range-start-marker cfi-marker' id='start-" + id + "' data-cfi='" + CFI + "'></span>";
    },

    getRangeEndMarker : function (CFI, id) {

        return "<span class='range-end-marker cfi-marker' id='end-" + id + "' data-cfi='" + CFI + "'></span>";
    }
});

    
EpubReflowable.ReflowableElementInfo = Backbone.Model.extend({

    initialize : function () {},

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    getElemPageNumber: function(elem, offsetDir, pageWidth, gapWidth, epubContentDocument) {
        
        var $elem;
        var elemWasInvisible = false;
        var rects, shift;
        var elemRectWidth;

        // Rationale: Elements with an epub:type="pagebreak" attribute value are likely to be set as 
        //   display:none, as they indicate the end of a page in the corresponding physical version of a book. We need 
        //   the position of these elements to get the reflowable page number to set in the viewer. Therefore, 
        //   we check if the element has this epub:type value, set it visible, find its location and then set it to 
        //   display:none again. 
        // REFACTORING CANDIDATE: We might want to do this for any element with display:none. 
        $elem = $(elem);
        if ($elem.attr("epub:type") === "pagebreak" && !$elem.is(":visible")) {

            elemWasInvisible = true;
            $elem.show();
        }

        rects = elem.getClientRects();
        if(!rects || rects.length < 1) {
            // if there were no rects the elem had display none
            return -1;
        }

        shift = rects[0][offsetDir];

        // calculate to the center of the elem
        // Rationale: The -1 or +1 adjustment is to account for the case in which the target element for which the shift offset
        //   is calculated is at the edge of a page and has 0 width. In this case, if a minor arbitrary adjustment is not applied, 
        //   the calculated page number will be off by 1.   
        elemRectWidth = rects[0].left - rects[0].right;
        if (offsetDir === "right" && elemRectWidth === 0) {
            shift -= 1;
        }
        else if (offsetDir === "left" && elemRectWidth === 0) {
            shift += 1;
        } // Rationale: There shouldn't be any other case here. The explict second (if else) condition is for clarity.
        shift += Math.abs(elemRectWidth);
        
        // Re-hide the element if it was original set as display:none
        if (elemWasInvisible) {
            $elem.hide();
        }

        // `clientRects` are relative to the top left corner of the frame, but
        // for right to left we actually need to measure relative to right edge
        // of the frame
        if (offsetDir === "right") {
            // the right edge is exactly `this.page_width` pixels from the right 
            // edge
            shift = pageWidth - shift;
        }
        // less the amount we already shifted to get to cp
        shift -= parseInt(epubContentDocument.style[offsetDir], 10); 
        return Math.ceil( shift / (pageWidth + gapWidth) );
    },

    getElemPageNumberById: function(elemId, epubContentDocument, offsetDir, pageWidth, gapWidth) {

        var elem = $(epubContentDocument).find("#" + elemId);
        if (elem.length == 0) {
            return -1;
        }
        else {
            return this.getElemPageNumber(elem[0], offsetDir, pageWidth, gapWidth, epubContentDocument);
        }
    },

    // Currently for left-to-right pagination only
    findVisibleCharacterOffset : function($textNode, epubContentDocument) {

        var $parentNode;
        var elementTop;
        var elementBottom;
        var POSITION_ERROR_MARGIN = 5;
        var $document;
        var documentTop;
        var documentBottom;
        var percentOfTextOffPage;
        var characterOffset;

        // Get parent; text nodes do not have visibility properties.
        $parentNode = $textNode.parent();

        // Get document
        $document = $(epubContentDocument);

        // Find percentage of visible node on page
        documentTop = $document.position().top;
        documentBottom = documentTop + $document.height();

        elementTop = $parentNode.offset().top;
        elementBottom = elementTop + $parentNode.height();

        // Element overlaps top of the page
        if (elementTop < documentTop) {

            percentOfTextOffPage = Math.abs(elementTop - documentTop) / $parentNode.height();
            characterOffsetByPercent = Math.ceil(percentOfTextOffPage * $textNode[0].length);
            characterOffset = Math.ceil(0.5 * ($textNode[0].length - characterOffsetByPercent)) + characterOffsetByPercent;
        }
        // Element is full on the page
        else if (elementTop >= documentTop && elementTop <= documentBottom) {
            characterOffset = 1;
        }
        // Element overlaps bottom of the page
        else if (elementTop < documentBottom) {
            characterOffset = 1;
        }

        return characterOffset;
    },

    // TODO: Extend this to be correct for right-to-left pagination
    findVisibleTextNode: function (epubContentDocument, isTwoUp, columnGap, columnWidth) {

        var documentLeft = 0;
        var documentRight;
        var doc;
        var $elements;
        var $firstVisibleTextNode;

        // Rationale: The intention here is to get a list of all the text nodes in the document, after which we'll
        //   reduce this to the subset of text nodes that is visible on the page. We'll then select one text node
        //   for which we can create a character offset CFI. This CFI will then refer to a "last position" in the 
        //   EPUB, which can be used if the reader re-opens the EPUB.
        // REFACTORING CANDIDATE: The "audiError" check is a total hack to solve a problem for a particular epub. This 
        //   issue needs to be addressed.
        $elements = $("body", epubContentDocument).find(":not(iframe)").contents().filter(function () {
            if (this.nodeType === 3 && !$(this).parent().hasClass("audiError")) {
                return true;
            } else {
                return false;
            }
        });

        doc = epubContentDocument;

        if (isTwoUp) {
            documentRight = documentLeft + columnGap + (columnWidth * 2);
        } 
        else {
            documentRight = documentLeft + $(doc).width();
        }

        // Find the first visible text node 
        $.each($elements, function() {

            var POSITION_ERROR_MARGIN = 5;
            var $textNodeParent = $(this).parent();
            var elementLeft = $textNodeParent.position().left;
            var elementRight = elementLeft + $textNodeParent.width();
            var nodeText;

            // Correct for minor right and left position errors
            elementLeft = Math.abs(elementLeft) < POSITION_ERROR_MARGIN ? 0 : elementLeft;
            elementRight = Math.abs(elementRight - documentRight) < POSITION_ERROR_MARGIN ? documentRight : elementRight;

            // Heuristics to find a text node with actual text
            nodeText = this.nodeValue.replace(/\n/g, "");
            nodeText = nodeText.replace(/ /g, "");

            if (elementLeft <= documentRight 
                && elementRight >= documentLeft
                && nodeText.length > 10) { // 10 is so the text node is actually a text node with writing - probably

                $firstVisibleTextNode = $(this);

                // Break the loop
                return false;
            }
        });

        return $firstVisibleTextNode;
    },

    // The package document needs to get passed into the view, or the API needs to change. This is not critical at the moment.
    //
    // // Description: Generates a CFI for an element is that is currently visible on the page. This CFI and a last-page payload
    // //   is then saved for the current EPUB.
    // savePosition : function () {

    //     var $visibleTextNode;
    //     var CFI;

    //     // Get first visible element with a text node 
    //     $visibleTextNode = this.reflowableElementsInfo.findVisibleTextNode(
    //         this.getEpubContentDocument(), 
    //         this.viewerModel.get("two_up"),
    //         // REFACTORING CANDIDATE: These two properties should be stored another way. This should be 
    //         //   temporary.
    //         this.reflowablePaginator.gap_width,
    //         this.reflowablePaginator.page_width
    //         );

    //     CFI = this.annotations.findExistingLastPageMarker($visibleTextNode);
    //     if (!CFI) {

    //      CFI = this.annotations.generateCharacterOffsetCFI(
    //          this.reflowableElementsInfo.findVisibleCharacterOffset($visibleTextNode, this.getEpubContentDocument()),
                // $visibleTextNode[0],
                // this.spineItemModel.get("idref"),
                // this.epubController.getPackageDocumentDOM()
       //       );
    //     }
    //     this.annotations.saveAnnotation(CFI, this.spineItemModel.get("spine_index"));
    // },

    findVisiblePageElements: function(flowingWrapper, epubContentDocument) {

        var $elements = $(epubContentDocument).find("[id]");
        var doc = epubContentDocument;
        var doc_top = 0;
        var doc_left = 0;
        var doc_right = doc_left + $(doc).width();
        var doc_bottom = doc_top + $(doc).height();
        
        var visibleElms = this.filterElementsByPosition(flowingWrapper, $elements, doc_top, doc_bottom, doc_left, doc_right);
            
        return visibleElms;
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    // returns all the elements in the set that are inside the box
    filterElementsByPosition: function(flowingWrapper, $elements, documentTop, documentBottom, documentLeft, documentRight) {
        
        var $visibleElms = $elements.filter(function(idx) {
            var elm_top = $(flowingWrapper).offset().top;
            var elm_left = $(flowingWrapper).offset().left;
            var elm_right = elm_left + $(flowingWrapper).width();
            var elm_bottom = elm_top + $(flowingWrapper).height();
            
            var is_ok_x = elm_left >= documentLeft && elm_right <= documentRight;
            var is_ok_y = elm_top >= documentTop && elm_bottom <= documentBottom;
            
            return is_ok_x && is_ok_y;
        });  

        return $visibleElms;
    }
});
    EpubReflowable.ReflowableLayout = Backbone.Model.extend({

    initialize: function (options) {

		this.epubCFI = new EpubCFIModule();
    },

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    initializeContentDocument : function (epubContentDocument, readiumFlowingContent, linkClickHandler, handlerContext, keydownHandler, bindings) {

        var triggers;

        // this.applyBindings( readiumFlowingContent, epubContentDocument );
        this.applySwitches(epubContentDocument); 
        this.injectMathJax(epubContentDocument);
        this.injectLinkHandler(epubContentDocument, linkClickHandler, handlerContext);
        triggers = this.parseTriggers(epubContentDocument);
        this.applyTriggers(epubContentDocument, triggers);
        $(epubContentDocument).attr('title');

        this.injectKeydownHandler(
            readiumFlowingContent, 
            keydownHandler, 
            handlerContext
        );
    },

    // ------------------------------------------------------------------------------------ //
    //  PRIVATE HELPERS                                                                     //
    // ------------------------------------------------------------------------------------ //

    // // REFACTORING CANDIDATE: It looks like this could go on the package document itself
    // getBindings: function (packageDocument) {
    //     var packDoc = packageDocument;
    //     var bindings = packDoc.get('bindings');
    //     return bindings.map(function(binding) {
    //         binding.selector = 'object[type="' + binding.media_type + '"]';
    //         binding.url = packDoc.getManifestItemById(binding.handler).get('href');
    //         binding.url = packDoc.resolveUri(binding.url);
    //         return binding;
    //     })
    // },

    // Binding expected by this:
    //   binding.selector
    //   binding.url
    //   binding.media_type
    // applyBindings: function (readiumFlowingContent, epubContentDocument, bindings) {

    //     var bindingHtml = "<iframe scrolling='no' \
    //                             frameborder='0' \
    //                             marginwidth='0' \
    //                             marginheight='0' \
    //                             width='100%' \
    //                             height='100%' \
    //                             class='binding-sandbox'> \
    //                        </iframe>";

    //     // var bindings = this.getBindings(packageDocument);
    //     var i = 0;
    //     for(var i = 0; i < bindings.length; i++) {
    //         $(bindings[i].selector, epubContentDocument.parentNode).each(function() {
    //             var params = [];
    //             var $el = $(readiumFlowingContent);
    //             var data = $el.attr('data');
    //             var url;
    //             // params.push("src=" + packageDocument.resolveUri(data)); // Not sure what this is doing
    //             params.push('type=' + bindings[i].media_type);
    //             url = bindings[i].url + "?" + params.join('&');
    //             // var content = $(bindingTemplate({}));
    //             var content = $(bindingHtml);
    //             // must set src attr separately
    //             content.attr('src', url);
    //             $el.html(content);
    //         });
    //     }
    // },

    applyTriggers: function (epubContentDocument, triggers) {

        for(var i = 0 ; i < triggers.length; i++) {
            triggers[i].subscribe(epubContentDocument.parentNode);
        }
    },

    // Description: For reflowable content we only add what is in the body tag.
    //   Lots of times the triggers are in the head of the dom
    parseTriggers: function (epubContentDocument) {

        var triggers = [];
        $('trigger', epubContentDocument.parentNode).each(function(index, triggerElement) {
            triggers.push(new EpubReflowable.Trigger(triggerElement) );
        });
        
        return triggers;
    },

    // Description: Parse the epub "switch" tags and hide
    //   cases that are not supported
    applySwitches: function (epubContentDocument) {

        // helper method, returns true if a given case node
        // is supported, false otherwise
        var isSupported = function(caseNode) {

            var ns = $(caseNode).attr("required-namespace");
            if(!ns) {
                // the namespace was not specified, that should
                // never happen, we don't support it then
                console.log("Encountered a case statement with no required-namespace");
                return false;
            }
            // all the xmlns's that readium is known to support
            // TODO this is going to require maintanence
            var supportedNamespaces = ["http://www.w3.org/1998/Math/MathML"];
            return _.include(supportedNamespaces, ns);
        };

        $('switch', epubContentDocument.parentNode).each(function(index, switchElement) {
            
            // keep track of whether or not we found one
            var found = false;

            $('case', switchElement).each(function(index, caseElement) {

                if (!found && isSupported(caseElement)) {
                    found = true; // we found the node, don't remove it
                }
                else {
                    $(caseElement).remove(); // remove the node from the dom
                }
            });

            if (found) {
                // if we found a supported case, remove the default
                $('default', switchElement).remove();
            }
        })
    },

    // Description: Inject mathML parsing code into the content document iframe
    injectMathJax : function (epubContentDocument) {

        var script;
        var head;
        head = $("head", epubContentDocument)[0];
        
        // Rationale: If the content doc is SVG there is no head, and thus
        // mathjax will not be required
        if (head) {
            script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
            head.appendChild(script);
        }
    },

    injectLinkHandler: function (epubContentDocument, linkClickHandler, handlerContext) {

        $('a', epubContentDocument).click(function (e) {
            linkClickHandler.call(handlerContext, e);
        });
    },

    injectKeydownHandler : function (epubContentDocument, keydownHandler, handlerContext) {

        $(epubContentDocument).on("keydown", function (e) {
            keydownHandler.call(handlerContext, e);
        });
    }
});
    // Description: This model is responsible determining page numbers to display for reflowable EPUBs.
// Rationale: This model exists to abstract and encapsulate the logic for determining which pages numbers should be
//   dispalyed in the viewer.

EpubReflowable.ReflowablePageNumberLogic = Backbone.Model.extend({

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    initialize: function () {},

    // Description: This method determines the page numbers to display, given a single page number to "go to"
    // Arguments (
    //   gotoPageNumber (integer): The page number to "go to"
    //   twoUp (boolean): Are two pages currently displayed in the reader?
    //  )
    getPageNumbers : function (gotoPageNumber, twoUp, firstPageOffset) {

        if (twoUp) {
            
            if (firstPageOffset) {

                // EVEN_PAGE |spine| ODD_PAGE
                if (gotoPageNumber % 2 === 1) {
                    return [gotoPageNumber - 1, gotoPageNumber];
                }
                else {
                    return [gotoPageNumber, gotoPageNumber + 1];
                }
            }
            else {
                // ODD_PAGE |spine| EVEN_PAGE
                if (gotoPageNumber % 2 === 1) {
                    return [gotoPageNumber, gotoPageNumber + 1];    
                } 
                else {
                    return [gotoPageNumber - 1, gotoPageNumber];
                }
            }   
        }
        else {  
            return [gotoPageNumber];
        }
    },

    // Description: Get the pages numbers to display when moving in reverse reading order
    // Arguments (
    //  )
    getPreviousPageNumbers: function (currentPages, twoUp) {

        var previousVisiblePageNumber = currentPages[0] - 1;

        if (!twoUp){

            return [previousVisiblePageNumber];
        }
        else {

            return [previousVisiblePageNumber - 1, previousVisiblePageNumber];
        }
    },

    // Description: Get the pages to display when moving in reading order
    // Arguments (
    //  )
    getNextPageNumbers : function (currentPages, twoUp) {

        // Rationale: The length will be 1 or 2.
        var highestVisiblePageNumber = currentPages[currentPages.length - 1];
        var firstVisiblePageNumber = highestVisiblePageNumber + 1;

        if (!twoUp) {

            return [firstVisiblePageNumber];
        }
        else {

            return [firstVisiblePageNumber, firstVisiblePageNumber + 1];
        }
    },

    // Description: This method determines which page numbers to display when switching
    //   between a single page and side-by-side page views and vice versa.
    // Arguments (
    //   displayedPageNumbers (array of integers): An array of page numbers that are currently displayed    
    //   firstPageOffset: Is the first page of a reflowable EPUB offset, to create a blank page for the first page? 
    //  )
    getToggledLayoutPageNumbers : function (displayedPageNumbers, firstPageOffset) {

        var displayed = displayedPageNumbers;
        var twoPagesDisplayed = displayed.length === 2 ? true : false;
        var newPages = [];

        // Two pages are currently displayed; find the single page number to display
        if (twoPagesDisplayed) {

            // Rationale: I think this check is a bit of a hack, for the case in which a set of pages is [0, 1]. Pages are
            //   1-indexed, so the "0" in the 0 index position of the array is not valid.
            if (displayed[0] === 0) {
                newPages[0] = 1;
            } 
            else {
                newPages[0] = displayed[0];
            }
        }
        // A single reflowable page is currently displayed; find two pages to display
        else if (firstPageOffset) {

            if (displayed[0] % 2 === 1) {

                newPages[0] = displayed[0] - 1;
                newPages[1] = displayed[0];
            }
            else {

                newPages[0] = displayed[0];
                newPages[1] = displayed[0] + 1;
            }               
        }
        else {

            if (displayed[0] % 2 === 1) {
                
                newPages[0] = displayed[0];
                newPages[1] = displayed[0] + 1;
            }
            else {
                
                newPages[0] = displayed[0] - 1;
                newPages[1] = displayed[0];
            }
        }

        return newPages;
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //
});
    EpubReflowable.ReflowablePagination = Backbone.Model.extend({ 

    defaults : {
        "numberOfPages" : 0,
        "currentPages" : [1]
    },

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    initialize : function () {

        // Instantiate an object responsible for deciding which pages to display
        this.pageNumberDisplayLogic = new EpubReflowable.ReflowablePageNumberLogic();
        
        // Rationale: Need to adjust the page number to the last page if, when the number of pages changes, the current
        //   page is greater than the number of changes. 
        // Probably a memory leak here, should add a destructor
        this.on("change:numberOfPages", this.adjustCurrentPage, this);
    },

    onFirstPage : function () {

        // Rationale: Need to check for both single and synthetic page spread
        var oneOfCurrentPagesIsFirstPage = this.get("currentPages")[0] === 1 ? true :
                                           this.get("currentPages")[1] === 1 ? true : false;

        if (oneOfCurrentPagesIsFirstPage) {
            return true;
        }
        else {
            return false;
        }
    },

    onLastPage : function () {

        // Rationale: Need to check for both single and synthetic page spread
        var oneOfCurrentPagesIsLastPage = this.get("currentPages")[0] === this.get("numberOfPages") ? true :
                                          this.get("currentPages")[1] === this.get("numberOfPages") ? true : false;

        if (oneOfCurrentPagesIsLastPage) {
            return true;
        }
        else {
            return false;
        }
    },

    toggleTwoUp : function (twoUp, firstPageIsOffset) { 

        // if (this.epubController.epub.get("can_two_up")) {

        var layoutPageNumbers = this.pageNumberDisplayLogic.getToggledLayoutPageNumbers(
            this.get("currentPages"),
            firstPageIsOffset
        );
        if (!twoUp) {
            layoutPageNumbers = this.adjustForMaxPageNumber(layoutPageNumbers);
        }
        this.set("currentPages", layoutPageNumbers);
        // }   
    },

    prevPage : function (twoUp) {

        var previousPageNumbers = this.pageNumberDisplayLogic.getPreviousPageNumbers(
                                    this.get("currentPages"),
                                    twoUp
                                  );
        this.set("currentPages", previousPageNumbers);
    },

    nextPage : function (twoUp) {

        var nextPageNumbers = this.pageNumberDisplayLogic.getNextPageNumbers(
                                this.get("currentPages"),
                                twoUp
                              );
        this.set("currentPages", nextPageNumbers);
    },

    goToPage : function (pageNumber, twoUp, firstPageIsOffset) {

        var gotoPageNumbers = this.pageNumberDisplayLogic.getPageNumbers(
                            pageNumber,
                            twoUp,
                            firstPageIsOffset
                            );
        this.set("currentPages", gotoPageNumbers);
    },

    resetCurrentPages : function () {

        var originalPageNumbers = this.get("currentPages");
        var adjustedPageNumbers = this.adjustForMaxPageNumber(originalPageNumbers);

        if (adjustedPageNumbers !== originalPageNumbers) {
            this.set("currentPages", adjustedPageNumbers);
        }
    },

    // ------------------------------------------------------------------------------------ //  
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //
    adjustForMaxPageNumber : function (newPageNumbers) {

        var currentPages = this.get("currentPages");
        var numberOfPages = this.get("numberOfPages");

        if (newPageNumbers[0] > numberOfPages) {
            return [numberOfPages];
        }
        else {
            return newPageNumbers;
        }
    }
});
    
EpubReflowable.ReflowablePaginator = Backbone.Model.extend({

    initialize: function (options) {},

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    paginateContentDocument : function (isTwoUp, offsetDir, epubContentDocument, readiumFlowingContent, flowingWrapper, firstPageOffset, currentPages, ppd, currentMargin, fontSize) {

        var page = this.adjustIframeColumns(
            offsetDir, 
            epubContentDocument, 
            readiumFlowingContent, 
            flowingWrapper, 
            isTwoUp, 
            firstPageOffset, 
            currentPages, 
            ppd, 
            currentMargin
            );

        var numPages = this.setFontSize(
            fontSize, 
            epubContentDocument, 
            isTwoUp
            );

        return [numPages, page];
    },

    // ------------------------------------------------------------------------------------ //
    //  PRIVATE HELPERS                                                                     //
    // ------------------------------------------------------------------------------------ //

    getColumnAxisCssName : function () {
        var columnAxisName = Modernizr.prefixed('columnAxis') || 'columnAxis';
        return this.createCssPropertyName(columnAxisName);
    },

    getColumnGapCssName : function () {
        var columnGapName = Modernizr.prefixed('columnGap') || 'columnGap';
        return this.createCssPropertyName(columnGapName);
    },

    getColumnWidthCssName : function () {
        var columnWidthName = Modernizr.prefixed('columnWidth') || 'columnWidth';
        return this.createCssPropertyName(columnWidthName);
    },

    createCssPropertyName : function (modernizrName) {

        return modernizrName.replace(/([A-Z])/g, function (modernizrName, m1) {  
            return '-' + m1.toLowerCase(); 
        }).replace(/^ms-/,'-ms-');
    },

    // ------------------------------------------------------------------------------------ //
    //  PRIVATE METHODS
    // ------------------------------------------------------------------------------------ //

    // Description: calculate the number of pages in the current section,
    //   based on section length : page size ratio
    calcNumPages : function (epubContentDocument, isTwoUp, offsetDir) {

        var body, offset, width, num;
        
        // get a reference to the dom body
        body = epubContentDocument;

        // cache the current offset 
        offset = body.style[offsetDir];

        // set the offset to 0 so that all overflow is part of
        // the scroll width
        body.style[offsetDir] = "0px";

        // grab the scrollwidth => total content width
        width = epubContentDocument.scrollWidth;
        this.set("lastScrollWidth", width);

        // reset the offset to its original value
        body.style[offsetDir] = offset;

        // perform calculation and return result...
        num = Math.floor( (width + this.gap_width) / (this.gap_width + this.page_width) );

        // in two up mode, always set to an even number of pages
        if( num % 2 === 0 && isTwoUp) {
            //num += 1;
        }
        return num;
    },

    getFrameWidth : function (flowingWrapperWidth, currentMargin, isTwoUp) {

        var width;
        var margin = currentMargin;
        if (margin === 1) {
            isTwoUp ? (width = 0.95) : (width = 0.90);
        }
        else if (margin === 2) {
            isTwoUp ? (width = 0.89) : (width = 0.80);
        }
        else if (margin === 3) {
            isTwoUp ? (width = 0.83) : (width = 0.70); 
        }
        else if (margin === 4) {
            isTwoUp ? (width = 0.77) : (width = 0.60); 
        }
        else if (margin === 5) {
            isTwoUp ? (width = 0.70) : (width = 0.50); 
        }
        else {
            isTwoUp ? (width = 1.0) : (width = 0.95);
        }
        
        return Math.floor( flowingWrapperWidth * width );
    },

    // Rationale: on iOS frames are automatically expanded to fit the content dom
    //   thus we cannot use relative size for the iframe and must set abs 
    //   pixel size
    setFrameSize : function (flowingWrapperWidth, flowingWrapperHeight, readiumFlowingContent, currentMargin, isTwoUp) {

        var width = this.getFrameWidth(flowingWrapperWidth, currentMargin, isTwoUp).toString() + "px";
        var height = flowingWrapperHeight.toString() + "px"; 

        // Rationale: Set the width for both the iframe (epub content) and its parent. The parent width must be provided so 
        //   that the iframe content can be centered within it, using CSS (margin-left/right: auto; display:block)
        $(readiumFlowingContent).parent().css("width", width);
        $(readiumFlowingContent).parent().css("height", height);

        $(readiumFlowingContent).css("width", width);
        $(readiumFlowingContent).css("height", height);
    },

    getBodyColumnCss : function () {

        var css = {};
        css[this.getColumnAxisCssName()] = "horizontal";
        css[this.getColumnGapCssName()] = this.gap_width.toString() + "px";
        css[this.getColumnWidthCssName()] = this.page_width.toString() + "px";
        css["position"] = "absolute";
        css["width"] = this.page_width.toString() + "px";
        css["height"] = this.frame_height.toString() + "px";
        return css;
    },

    // Description: This method accounts for the case in which the page-spread-* property is set on the current 
    //   content document. When this property is set, it requires that the first page of content is offset by 1, 
    //   creating a blank page as the first page in a synthetic spread.
    accountForOffset : function (readiumFlowingContent, isTwoUp, firstPageIsOffset, currentPages, ppd) {

        var $reflowableIframe = $(readiumFlowingContent);

        if (isTwoUp) {
            // If the first page is offset, adjust the window to only show one page
            var firstPageIsOffset = firstPageIsOffset;
            var firstPageOffsetValue;

            // Rationale: A current page of [0, 1] indicates that the current display is synthetic, and that 
            //   only the first page should be showing in that display
            var onFirstPage = 
                currentPages[0] === 0 &&
                currentPages[1] === 1 
                ? true : false;

            if (firstPageIsOffset && onFirstPage) {

                if (ppd === "rtl") {

                    firstPageOffset = -(this.page_width + this.gap_width);
                    $reflowableIframe.css("margin-left", firstPageOffset + "px");
                }
                // Left-to-right pagination
                else {

                    firstPageOffset = this.page_width + (this.gap_width * 2) - this.padding_width;
                    $reflowableIframe.css("margin-left", firstPageOffset + "px");
                }

                return 1;
            }
            else {

                $reflowableIframe.css("margin-left", "0px");
                return currentPages[0];
            }
        }
        else {

            $reflowableIframe.css("margin-left", "0px");
            return currentPages[0];
        }
    },

    // REFACTORING CANDIDATE: There is a very important assumption encoded in this method: That the direct parent of the "flowingWrapper"
    //   element will be the "reader" element in the DOM in which EPUB content is being displayed. The height and width of this parent are
    //   used to paginate the reflowable content document. This assumption should be made clearer - in fact, this whole model needs to get
    //   refactored at some point. 
    adjustIframeColumns : function (offsetDir, epubContentDocument, readiumFlowingContent, flowingWrapper, isTwoUp, firstPageOffset, currentPages, ppd, currentMargin ) {

        var prop_dir = offsetDir;
        var $frame = $(readiumFlowingContent);
        var page;

        // Rationale: Get width and height of the flowing wrapper parent, as the (application-specific) parent element dimensions are what the epub
        //   content should be sized to fit into.
        this.setFrameSize($(flowingWrapper).parent().width(), $(flowingWrapper).parent().height(), readiumFlowingContent, currentMargin, isTwoUp);

        this.frame_width = parseInt($frame.width(), 10);
        this.frame_height = parseInt($frame.height(), 10);
        this.gap_width = Math.floor(this.frame_width / 10);
        this.padding_width = Math.floor(this.gap_width / 2);

        if (isTwoUp) {
            this.page_width = Math.floor((this.frame_width - this.gap_width - (this.padding_width * 2)) / 2);
        }
        else {
            this.page_width = Math.floor(this.frame_width - (this.padding_width * 2));
        }

        // it is important for us to make sure there is no padding or
        // margin on the <html> elem, or it will mess with our column code
        $(epubContentDocument).css( this.getBodyColumnCss() );
        $(readiumFlowingContent).css("width", this.frame_width - this.padding_width - this.padding_width);
        $(readiumFlowingContent).css("padding-left", this.padding_width);
        $(readiumFlowingContent).css("padding-right", this.padding_width);

        page = this.accountForOffset(readiumFlowingContent, isTwoUp, firstPageOffset, currentPages, ppd);
        return page;
    },

    setFontSize : function (fontSize, epubContentDocument, isTwoUp) {

        var size = fontSize / 10;
        $(epubContentDocument).css("font-size", size + "em");

        // the content size has changed so recalc the number of 
        // pages
        return this.calcNumPages(epubContentDocument, isTwoUp);
    }
});
    EpubReflowable.Trigger = function(domNode) {
	var $el = $(domNode);
	this.action 	= $el.attr("action");
	this.ref 		= $el.attr("ref");
	this.event 		= $el.attr("ev:event");
	this.observer 	= $el.attr("ev:observer");
	this.ref 		= $el.attr("ref");
};

EpubReflowable.Trigger.prototype.subscribe = function(dom) {
	var selector = "#" + this.observer;
	var that = this;
	$(selector, dom).on(this.event, function() {
		that.execute(dom);
	});
};

EpubReflowable.Trigger.prototype.execute = function(dom) {
	var $target = $( "#" + this.ref, dom);
	switch(this.action)
	{
	case "show":
	  $target.css("visibility", "visible");
	  break;
	case "hide":
	  $target.css("visibility", "hidden");
	  break;
	case "play":
	  $target[0].currentTime = 0;
	  $target[0].play();
	  break;
	case "pause":
	  $target[0].pause();
	  break;
	case "resume":
	  $target[0].play();
	  break;
	case "mute":
	  $target[0].muted = true;
	  break;
	case "unmute":
	  $target[0].muted = false;
	  break;
	default:
	  console.log("do not no how to handle trigger " + this.action);
	}
};
    EpubReflowable.ReflowablePaginationView = Backbone.View.extend({

    el : "<div class='flowing-wrapper clearfix' style='display:block;margin-left:auto;margin-right:auto;position:relative;overflow:hidden;'> \
            <iframe scrolling='no' \
                    frameborder='0' \
                    height='100%' \
                    class='readium-flowing-content'> \
            </iframe> \
          </div>",

	initialize : function (options) {

        var ViewerModel = Backbone.Model.extend({});
        var SpineItemModel = Backbone.Model.extend({});

        this.viewerModel = new ViewerModel(options.viewerSettings);
        this.viewerModel.set({ syntheticLayout : options.viewerSettings.syntheticLayout });
        this.spineItemModel = new SpineItemModel(options.spineItem);
        this.epubCFIs = options.contentDocumentCFIs;
        this.bindings = options.bindings;

		// Initalize delegates and other models
		this.reflowableLayout = new EpubReflowable.ReflowableLayout();
		this.reflowablePaginator = new EpubReflowable.ReflowablePaginator();
		this.reflowableElementsInfo = new EpubReflowable.ReflowableElementInfo();
		this.pages = new EpubReflowable.ReflowablePagination();

        // Initialize custom style views
        this.spineDivider = new EpubReflowable.ReflowableSpineDividerView();
        this.$el.append(this.spineDivider.render());
        this.customizer;

		this.annotations;
        this.cfi = new EpubCFIModule();

        // this.mediaOverlayController = this.model.get("media_overlay_controller");
        // this.mediaOverlayController.setPages(this.pages);
        // this.mediaOverlayController.setView(this);

        // Initialize handlers
		// this.mediaOverlayController.on("change:mo_text_id", this.highlightText, this);
        // this.mediaOverlayController.on("change:active_mo", this.indicateMoIsPlaying, this);
	},
	
	destruct : function() {
	
		// Remove all handlers so they don't hang around in memory	
		// this.mediaOverlayController.off("change:mo_text_id", this.highlightText, this);
  		// this.mediaOverlayController.off("change:active_mo", this.indicateMoIsPlaying, this);
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	render : function (goToLastPage, hashFragmentId) {

		var that = this;
		var json = this.spineItemModel.toJSON();

        $("iframe", this.el).attr("src", json.contentDocumentURI);
        $("iframe", this.el).attr("title", json.title);

		// Wait for iframe to load EPUB content document
		$(this.getReadiumFlowingContent()).on("load", function (e) {

            // "Forward" the epubReadingSystem object to the iframe's own window context.
            // Note: the epubReadingSystem object may not be ready when directly using the
            // window.onload callback function (from within an (X)HTML5 EPUB3 content document's Javascript code)
            // To address this issue, the recommended code is:
            // -----
            // function doSomething() { console.log(navigator.epubReadingSystem); };
            // 
            // // With jQuery:
            // $(document).ready(function () { setTimeout(doSomething, 200); });
            // 
            // // With the window "load" event:
            // window.addEventListener("load", function () { setTimeout(doSomething, 200); }, false);
            // 
            // // With the modern document "DOMContentLoaded" event:
            // document.addEventListener("DOMContentLoaded", function(e) { setTimeout(doSomething, 200); }, false);
            // -----
            if (typeof navigator.epubReadingSystem != 'undefined')
            {
               var iFrame = that.getReadiumFlowingContent();
               var iFrameWindow = iFrame.contentWindow || iFrame.contentDocument.parentWindow;
               var ers = navigator.epubReadingSystem;
               iFrameWindow.navigator.epubReadingSystem = ers;
            }

            var borderElement;
			that.initializeContentDocument();

			// Rationale: The content document must be paginated in order for the subsequent "go to page" methods
			//   to have access to the number of pages in the content document.
			that.paginateContentDocument();
			// that.mediaOverlayController.pagesLoaded();

			// Rationale: The assumption here is that if a hash fragment is specified, it is the result of Readium 
			//   following a clicked linked, either an internal link, or a link from the table of contents. The intention
			//   to follow a link should supersede restoring the last-page position, as this should only be done for the 
			//   case where Readium is re-opening the book, from the library view. 
			if (hashFragmentId) {
                that.showPageByElementId(hashFragmentId);
            }
            else {

                if (goToLastPage) {
                    // that.pages.goToLastPage(that.viewerModel.get("syntheticLayout"), that.spineItemModel.get("firstPageIsOffset"));
                }
                else {
                    that.showPageByNumber(1);
                    // that.pages.goToPage(1, that.viewerModel.get("syntheticLayout"), that.spineItemModel.get("firstPageIsOffset"));
                }
            }

            that.annotations = new EpubReflowable.ReflowableAnnotations({
                saveCallback : undefined,
                callbackContext : undefined,
                contentDocumentDOM : that.getEpubContentDocument().parentNode
            });

            that.customizer = new EpubReflowable.ReflowableCustomizer({
                parentElement : that.getFlowingWrapper(),
                readiumFlowingContent : that.getReadiumFlowingContent(),
                spineDividerStyleView : that.spineDivider,
                epubContentDocument : that.getEpubContentDocument()
            });

            that.trigger("contentDocumentLoaded", that.el);
		});
        
		return this.el;
	},
    
	// indicateMoIsPlaying: function () {
	// 	var moHelper = new EpubReflowable.MediaOverlayViewHelper({epubController : this.model});
	// 	moHelper.renderReflowableMoPlaying(
	// 		this.model.get("current_theme"),
	// 		this.mediaOverlayController.get("active_mo"),
	// 		this
	// 	);
	// },

	// highlightText: function () {
	// 	var moHelper = new EpubReflowable.MediaOverlayViewHelper({epubController : this.model});
	// 	moHelper.renderReflowableMoFragHighlight(
	// 		this.model.get("current_theme"),
	// 		this,
	// 		this.mediaOverlayController.get("mo_text_id")
	// 	);
	// },

    showPageByNumber : function (pageNumber) {

        this.pages.goToPage(pageNumber, this.viewerModel.get("syntheticLayout"), this.spineItemModel.get("firstPageIsOffset"));
        this.showCurrentPages();
    },

    // TODO: Check to see if it's a character offset CFI. If it is, inject it and keep track of the injection.
    showPageByCFI : function (CFI) {

        var $rangeTargetElements;
        var $standardTargetElement;
        var targetElement;
        try {

            // Check if it's a CFI range type
            if (new RegExp(/.+,.+,.+/).test(CFI)) {
                $rangeTargetElements = this.cfi.getRangeTargetElements(
                    CFI, 
                    $(this.getEpubContentDocument()).parent()[0],
                    [],
                    [],
                    ["MathJax_Message"]
                );
                targetElement = $rangeTargetElements[0];
            }
            else {
                $standardTargetElement = this.cfi.getTargetElement(
                    CFI,
                    $(this.getEpubContentDocument()).parent()[0],
                    [],
                    [],
                    ["MathJax_Message"]
                );
                targetElement = $standardTargetElement[0];
            }
        }
        catch (error) {
            // Maybe check error type
            throw error;
        }

        if (targetElement.nodeType === Node.TEXT_NODE) {
            this.showPageByElement($(targetElement).parent()[0])
        }
        else {
            this.showPageByElement(targetElement);
        }
    },

    showPageByElementId : function (elementId) {

        var targetElement = $("#" + elementId, this.getEpubContentDocument())[0];
        if (!targetElement) {
            return;
        }

        // Rationale: We get more precise results if we look at the first children
        while (targetElement.children.length > 0) {
            targetElement = targetElement.children[0];
        }

        this.showPageByElement(targetElement);
    },

    showView : function () {
        
        this.$el.show();
        this.updatePageNumber();
    },

    hideView : function () {
        
        this.$el.hide();
    },

    // REFACTORING CANDIDATE: This method is delegating to setFontSize and setMargin. These could both be added 
    //   as customizable style objects - essentially treated the same way
    customizeStyles : function (customElement, styleNameOrCSSObject) {

        if (customElement === "margin") {
            this.setMargin(parseInt(styleNameOrCSSObject));
        }
        else if (customElement === "fontSize") {
            this.setFontSize(parseInt(styleNameOrCSSObject));
        }
        else {
            this.customizer.setCustomStyle(customElement, styleNameOrCSSObject);
        }
        this.paginateContentDocument();
    },

    setFontSize : function (fontSize) {

        if (fontSize !== this.viewerModel.get("fontSize")) {
            this.viewerModel.set("fontSize", fontSize);
            this.paginateContentDocument();    
        }
    },

    setMargin : function (margin) {

        if (margin !== this.viewerModel.get("currentMargin")) {
            this.viewerModel.set("currentMargin", margin);
            this.paginateContentDocument();
        }
    },

    setSyntheticLayout : function (isSynthetic) {
    
        // Rationale: Only toggle the layout if a change is required        
        if (isSynthetic !== this.viewerModel.get("syntheticLayout")) {

            this.viewerModel.set("syntheticLayout", isSynthetic);
            this.pages.toggleTwoUp(isSynthetic, this.spineItemModel.get("firstPageIsOffset"));
            this.paginateContentDocument();
            this.viewerModel.get("syntheticLayout") ? this.spineDivider.show() : this.spineDivider.hide();
            this.trigger("layoutChanged", isSynthetic);
        }
    },

    nextPage : function () {

        if (!this.pages.onLastPage()) {

            var isSynthetic = this.viewerModel.get("syntheticLayout");
            this.pages.nextPage(isSynthetic);
            this.showCurrentPages();

            // Trigger events
            this.trigger("atNextPage");
            this.pages.onLastPage() ? this.trigger("atLastPage") : undefined;
        } 
        else {
            this.trigger("atLastPage");
        }
    },

    previousPage : function () {

        if (!this.pages.onFirstPage()) {

            var isSynthetic = this.viewerModel.get("syntheticLayout");
            this.pages.prevPage(isSynthetic);
            this.showCurrentPages();

            // Trigger events
            this.trigger("atPreviousPage");
            this.pages.onFirstPage() ? this.trigger("atFirstPage") : undefined; 
        }
        else {
            this.trigger("atFirstPage");
        }
    },

	// ------------------------------------------------------------------------------------ //
	//  PRIVATE GETTERS FOR VIEW                                                            //
	// ------------------------------------------------------------------------------------ //    

	getFlowingWrapper : function () {
		return this.el;
	},

	getReadiumFlowingContent : function () {
		return $(this.el).children()[0];
	},

    // REFACTORING CANDIDATE: That's a lot of chaining right there. Too much. 
	getEpubContentDocument : function () {
		return $($($(this.el).children()[0]).contents()[0]).children()[0];
	},

	// ------------------------------------------------------------------------------------ //
	//  PRIVATE EVENT HANDLERS                               								//
	// ------------------------------------------------------------------------------------ //

	keydownHandler : function (e) {

        if (e.which == 39) {
            this.trigger("keydown-right");
        }
                        
        if (e.which == 37) {
            this.trigger("keydown-left");
        }
    },

    linkClickHandler : function (e) {

        this.trigger("epubLinkClicked", e);
    },

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS AND UTILITY METHODS                                               //
	// ------------------------------------------------------------------------------------ //

    // Rationale: The "paginator" model uses the scrollWidth of the paginated xhtml content document in order
    //   to calculate the number of pages (given the current screen size etc.). It appears that 
    //   the scroll width property is either buggy, unreliable, or changes by small amounts between the time the content
    //   document is paginated and when it is used. Regardless of the cause, the scroll width is understated, which causes
    //   the number of pages to be understated. As a result, the last page of a content document is often not shown when 
    //   a user moves to the last page of the content document. This method recalculates the number of pages for the current
    //   scroll width of the content document. 
    updatePageNumber : function () {
        
        var recalculatedNumberOfPages;
        var epubContentDocument = this.getEpubContentDocument();
        var isSyntheticLayout = this.viewerModel.get("syntheticLayout");
        var currScrollWidth = epubContentDocument.scrollWidth;
        var lastScrollWidth = this.reflowablePaginator.get("lastScrollWidth");

        if (lastScrollWidth !== currScrollWidth) {
            recalculatedNumberOfPages = this.reflowablePaginator.calcNumPages(epubContentDocument, isSyntheticLayout);
            this.pages.set("numberOfPages", recalculatedNumberOfPages);
            this.reflowablePaginator.set("lastScrollWidth", currScrollWidth);
        }
    },

	// Rationale: This method delegates the pagination of a content document to the reflowable layout model
	paginateContentDocument : function () {

		var pageInfo = this.reflowablePaginator.paginateContentDocument(
			this.viewerModel.get("syntheticLayout"),
			this.offsetDirection(),
			this.getEpubContentDocument(),
			this.getReadiumFlowingContent(),
			this.getFlowingWrapper(),
			this.spineItemModel.get("firstPageIsOffset"),
			this.pages.get("currentPages"),
			this.spineItemModel.get("pageProgressionDirection"),
			this.viewerModel.get("currentMargin"),
			this.viewerModel.get("fontSize")
		);

		this.pages.set("numberOfPages", pageInfo[0]);
        this.viewerModel.get("syntheticLayout") ? this.spineDivider.show() : this.spineDivider.hide();
        this.redrawAnnotations();
        this.pages.resetCurrentPages();
		this.showCurrentPages();
	},

	initializeContentDocument : function () {

		this.reflowableLayout.initializeContentDocument(
			this.getEpubContentDocument(),
			this.getReadiumFlowingContent(), 
			this.linkClickHandler, 
			this, 
			this.keydownHandler,
            this.bindings
		);
	},

    showPageByElement : function (element) {

        var pageNumber = this.reflowableElementsInfo.getElemPageNumber(
            element, 
            this.offsetDirection(), 
            this.reflowablePaginator.page_width, 
            this.reflowablePaginator.gap_width,
            this.getEpubContentDocument());

        if (pageNumber > 0) {

            this.pages.goToPage(pageNumber, this.viewerModel.get("syntheticLayout"), this.spineItemModel.get("firstPageIsOffset"));
            this.showCurrentPages();
        }
        else {
            // Throw an exception here 
        }
    },

    showCurrentPages : function () {

        var currentPageNumber;
        this.hideContent();
        currentPageNumber = this.reflowablePaginator.accountForOffset(
            this.getReadiumFlowingContent(),
            this.viewerModel.get("syntheticLayout"),
            this.spineItemModel.get("firstPageIsOffset"),
            this.pages.get("currentPages"),
            this.spineItemModel.get("pageProgressionDirection")
        );
        this.moveViewportToPage(currentPageNumber);
        this.showContent();
        this.trigger("displayedContentChanged");
    },

    moveViewportToPage : function (pageNumber) {

        var offset = this.calcPageOffset(pageNumber).toString() + "px";
        $(this.getEpubContentDocument()).css(this.offsetDirection(), "-" + offset);
        
        // if (this.viewerModel.get("twoUp") == false || 
        //     (this.viewerModel.get("twoUp") && page % 2 === 1)) {
        //         // when we change the page, we have to tell MO to update its position
        //         // this.mediaOverlayController.reflowPageChanged();
        // }
    },

	hideContent : function () {
		$(this.getFlowingWrapper()).css("opacity", "0");
	},

	showContent : function () {
		$(this.getFlowingWrapper()).css("opacity", "1");
	},

	calcPageOffset : function (pageNumber) {
		return (pageNumber - 1) * (this.reflowablePaginator.page_width + this.reflowablePaginator.gap_width);
	},

    redrawAnnotations : function () {

        if (this.annotations) {
            this.annotations.redraw();
        }
    },

	offsetDirection : function () {

		// Rationale: If this book does right to left pagination we need to set the
		//   offset on the right
		if (this.spineItemModel.get("pageProgressionDirection") === "rtl") {
			return "right";
		}
		else {
			return "left";
		}
	}
});
    EpubReflowable.ReflowableCustomizer = Backbone.Model.extend({

    initialize : function (attributes, options) {

        this.$parentEl = $(this.get("parentElement"));
        this.set("customBorder", new EpubReflowable.ReflowableCustomBorder({ targetElement : this.get("readiumFlowingContent") }));
        this.set("customTheme", new EpubReflowable.ReflowableCustomTheme({ iframeElement : this.get("readiumFlowingContent") }));
    },

    // ----- PUBLIC INTERFACE -------------------------------------------------------------------

    setCustomStyle : function (customProperty, styleNameOrCSS) {

        if (customProperty === "reflowable-epub-border" || customProperty === "epub-border") {
            this.get("customBorder").setCurrentStyle(styleNameOrCSS);
        }
        else if (customProperty === "reflowable-spine-divider" || customProperty === "spine-divider") {
            this.get("spineDividerStyleView").setCurrentStyle(styleNameOrCSS);
        }
        else if (customProperty === "reflowable-page-border" || customProperty === "page-border") {
            this.get("customBorder").setCurrentStyle(styleNameOrCSS);
            this.get("spineDividerStyleView").setCurrentStyle(styleNameOrCSS);
        }
        else if (customProperty === "reflowable-page-theme") {
            this.get("customTheme").setCurrentStyle(styleNameOrCSS);
        }
        else if (customProperty === "alt-style-tag") {
            this.get("customTheme").setAlternateStyleTag(styleNameOrCSS, this.get("epubContentDocument"));
        }
    }

    // ----- PRIVATE HELPERS -------------------------------------------------------------------
});
    EpubReflowable.ReflowableCustomBorder = Backbone.Model.extend({

    // ------ PUBLIC INTERFACE --------------------------------------------------------------

    initialize : function (attributes, options) {

        this.$element = $(this.get("targetElement"));
        this.currentStyle = {};

        if (this.get("customStyle")) {
            this.setCurrentStyle(this.get("customStyle"));
        }
        else {
            this.setCurrentStyle("none");
        }
    },

    setCurrentStyle : function (styleNameOrCSSObject) {

        var borderStyle;
        // Rationale: If it's a string, we assume that the user specified one of the default names
        if (typeof styleNameOrCSSObject === "string") {

            borderStyle = this.getDefaultBorderStyle(styleNameOrCSSObject);

            if (borderStyle !== undefined) {
                this.currentStyle = borderStyle;
                this.renderCurrentStyle();
            }
        }
        // Rationale: At this point, we're just assuming that the CSS provided is correct. Validation of some sort might be desirable 
        //   at some point; hard to say. 
        else if (typeof styleNameOrCSSObject === "object") {

            borderStyle = this.addRequiredPositionCSS(styleNameOrCSSObject);
            this.currentStyle = borderStyle;
            this.renderCurrentStyle();
        }
    },

    // ------ PRIVATE HELPERS --------------------------------------------------------------

    renderCurrentStyle : function () {

        this.$element.attr("style", "");
        this.$element.css(this.currentStyle);
    },

    getDefaultBorderStyle : function (defaultName) {

        var defaultCSS;
        if (defaultName === "box-shadow") {
            return this.addRequiredPositionCSS({ "box-shadow" : "0 0 5px 5px rgba(80, 80, 80, 0.5)" });
        }
        else if (defaultName == "none") {
            return this.addRequiredPositionCSS({});
        }
        else {
            return undefined;
        }
    },

    addRequiredPositionCSS : function (customCSS) {

        var positionCSS = {
            "position" : "relative",
            "z-index" : "0",
            "top" : "0px",
            "left" : "0px",
            "width" : "100%",
            "height" : "100%"
        };

        // Rationale: The underscore.js extend method will combine two (or more) objects. However, any properties in the second
        //   object will overwrite the same properties in the first object. This is desired, as the position properties must be 
        //   specified as defined in this view. 
        var customCSSWithPositionCSS = _.extend(customCSS, positionCSS);
        return customCSSWithPositionCSS;
    }
});
    EpubReflowable.ReflowableSpineDividerView = Backbone.View.extend({

    el : "<div class='reflowing-spine-divider'></div>",

    // ------ PUBLIC INTERFACE --------------------------------------------------------------

    initialize : function (options) {

        this.currentStyle = {};

        if (options && options.customStyle) {
            this.setCurrentStyle(options.customStyle);
        }
        else {
            this.setCurrentStyle("none");
        }
    },  

    render : function () {

        this.renderCurrentStyle();
        return this.el;
    },

    setCurrentStyle : function (styleNameOrCSSObject) {

        var spineStyle;
        // Rationale: If it's a string, we assume that the user specified one of the default names
        if (typeof styleNameOrCSSObject === "string") {

            spineStyle = this.getDefaultSpineStyle(styleNameOrCSSObject);

            if (spineStyle !== undefined) {
                this.currentStyle = spineStyle;
                this.renderCurrentStyle();
            }
        }
        // Rationale: At this point, we're just assuming that the CSS provided is correct. Validation of some sort might be desirable 
        //   at some point; hard to say. 
        else if (typeof styleNameOrCSSObject === "object") {

            spineStyle = this.addRequiredPositionCSS(styleNameOrCSSObject);
            this.currentStyle = spineStyle;
            this.renderCurrentStyle();
        }
    },

    hide : function () {
        this.$el.hide();
    },

    show : function () {
        this.$el.show();
    },

    // ------ PRIVATE HELPERS --------------------------------------------------------------

    renderCurrentStyle : function () {

        this.$el.attr("style", "");
        this.$el.css(this.currentStyle);
    },

    getDefaultSpineStyle : function (defaultName) {

        var defaultCSS;
        if (defaultName === "box-shadow") {
            return this.addRequiredPositionCSS({
                "width" : "1px",
                "height" : "93%",
                "top" : "3%",
                "box-shadow" : "0 0 5px 5px rgba(80, 80, 80, 0.5)" 
            });
        }
        else if (defaultName === "none") {
            return this.addRequiredPositionCSS({});
        }
        else {
            return undefined;
        }
    },

    addRequiredPositionCSS : function (customCSS) {

        var top = customCSS.top ? customCSS.top : "0px";
        var positionCSS = {
            "position" : "absolute",
            "z-index" : "2",
            "left" : "50%",
            "top" : top
        };

        // Rationale: The underscore.js extend method will combine two (or more) objects. However, any properties in the second
        //   object will overwrite the same properties in the first object. This is desired, as the position properties must be 
        //   specified as defined in this view. 
        var customCSSWithPositionCSS = _.extend(customCSS, positionCSS);
        return customCSSWithPositionCSS;
    }
});
    
// TODO: Need to check that if alternate styles are defined for night, they are respected
EpubReflowable.ReflowableCustomTheme = Backbone.Model.extend({

    // ------ PUBLIC INTERFACE --------------------------------------------------------------

    initialize : function (attributes, options) {

        this.currentStyle = {};
    },

    setCurrentStyle : function (styleNameOrCSSObject) {

        var themeStyle;
        // Rationale: If it's a string, we assume that the user specified one of the default names
        if (typeof styleNameOrCSSObject === "string") {

            themeStyle = this.getDefaultThemeStyle(styleNameOrCSSObject);

            if (themeStyle !== undefined) {

                this.currentStyle = themeStyle;
                this.renderCurrentStyle();
            }
        }
        // Rationale: At this point, we're just assuming that the CSS provided is correct. Validation of some sort might be desirable 
        //   at some point; hard to say. 
        else if (typeof styleNameOrCSSObject === "object") {

            themeStyle = styleNameOrCSSObject;
            this.currentStyle = themeStyle;
            this.renderCurrentStyle();
        }
    },

    // Description: Activates a style set for the ePub, based on the currently selected theme. At present, 
    //   only the day-night alternate tags are available as an option.  
    setAlternateStyleTag : function (themeName, epubContentDocument) {

        var selector = new EpubReflowable.AlternateStyleTagSelector();        
        if (themeName === "night") {
            selector.activateAlternateStyleSet(["night"], epubContentDocument);
        }
        else if (themeName === "day" || themeName === "none") {
            selector.activateAlternateStyleSet(["day"], epubContentDocument);
        }
    },

    // ------ PRIVATE HELPERS --------------------------------------------------------------

    renderCurrentStyle : function () {

        $(this.getContentDocumentHTML()).attr("style", "");
        $(this.getContentDocumentHTML()).css(this.currentStyle);
    },

    getDefaultThemeStyle : function (defaultName) {

        if (defaultName === "none") {
            return {
                "background-color": "white",
                "color": "black",
                "mo-color": "#777"
            };
        }
        else if (defaultName === "vancouver") {
            return {
                "background-color": "#DDD",
                "color": "#576b96",
                "mo-color": "#777"
            };   
        }
        else if (defaultName === "night") {
            return {
                "background-color": "#141414",
                "color": "white",
                "mo-color": "#666"
            };
        }
        else if (defaultName === "ballard") {
            return {
                "background-color": "#576b96",
                "color": "#DDD",
                "mo-color": "#888"
            };
        }
        else {
            return undefined;
        }
    },

    getContentDocumentHTML : function () {

        return $("body", this.get("iframeElement").contentDocument)[0];
    }
});

    var reflowableView = new EpubReflowable.ReflowablePaginationView({
        spineItem : spineObject,
        viewerSettings : viewerSettingsObject,
        contentDocumentCFIs : CFIAnnotations,
        bindings : bindings
    });

    // Description: The public interface
    return {

        render : function (goToLastPage, hashFragmentId) {
            return reflowableView.render(goToLastPage, hashFragmentId);
        },
        nextPage : function () {
            return reflowableView.nextPage();
        },
        previousPage : function () {
            return reflowableView.previousPage();
        },
        showPageByHashFragment : function (hashFragmentId) {
            return reflowableView.showPageByElementId(hashFragmentId);
        },
        showPageByNumber : function (pageNumber) {
            return reflowableView.showPageByNumber(pageNumber);
        },
        showPageByCFI : function (CFI) {
            return reflowableView.showPageByCFI(CFI);
        },
        onFirstPage : function () {
            return reflowableView.pages.onFirstPage();
        },
        onLastPage : function () {
            return reflowableView.pages.onLastPage();
        },
        showPagesView : function () {
            return reflowableView.showView();
        },
        hidePagesView : function () {
            return reflowableView.hideView();
        },
        numberOfPages : function () {
            return reflowableView.pages.get("numberOfPages");
        },
        currentPage : function () {
            return reflowableView.pages.get("currentPages");
        },
        setSyntheticLayout : function (isSynthetic) {
            return reflowableView.setSyntheticLayout(isSynthetic);
        },
        on : function (eventName, callback, callbackContext) {
            return reflowableView.on(eventName, callback, callbackContext);
        },
        off : function (eventName, callback) {
            return reflowableView.off(eventName, callback);
        },
        resizeContent : function () {
            return reflowableView.paginateContentDocument();
        },
        customize : function (customElement, styleNameOrCSSObject) {
            reflowableView.customizeStyles(customElement, styleNameOrCSSObject);
            return this;
        }
    };
};
