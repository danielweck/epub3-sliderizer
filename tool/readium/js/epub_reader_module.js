var EpubReaderModule = function(readerBoundElement, epubSpineInfo, viewerSettings, packageDocumentDOM, renderStrategy) {

    var EpubReader = {};

    // Rationale: The order of these matters
    EpubReader.LoadStrategy = Backbone.Model.extend({

    defaults : {
        "numFixedPagesPerView" : 100
    },

    initialize : function (attributes, options) {},

    // Description: This method chooses the appropriate page view to load for individual 
    //   spine items, and sections of the spine. 
    loadSpineItems : function (viewerSettings, annotations, bindings) {

        var spineIndex;
        var currSpineItem;
        var currFixedSpineItems = [];
        var nextSpineItem;
        var pagesViews = [];
        var currPageView;
        var nextSpineItem;
        for (spineIndex = 0; spineIndex <= this.get("spineInfo").length - 1; spineIndex++) {

            currSpineItem = this.get("spineInfo")[spineIndex];

            // A fixed layout spine item
            if (currSpineItem.isFixedLayout) {

                currFixedSpineItems.push(currSpineItem);

                // Check how many fixed pages have been added for the next view
                if (currFixedSpineItems.length === this.get("numFixedPagesPerView")) {

                    currPageView = this.loadFixedPagesView(currFixedSpineItems, viewerSettings);
                    pagesViews.push(currPageView);
                    currFixedSpineItems = [];
                    continue;
                }

                nextSpineItem = this.get("spineInfo")[spineIndex + 1];
                if (nextSpineItem) {

                    if (!nextSpineItem.isFixedLayout) {

                        currPageView = this.loadFixedPagesView(currFixedSpineItems, viewerSettings);
                        pagesViews.push(currPageView);
                        currFixedSpineItems = [];
                    }
                }
                else {
                    currPageView = this.loadFixedPagesView(currFixedSpineItems, viewerSettings);
                    pagesViews.push(currPageView);
                    currFixedSpineItems = [];
                }
            }
            // A scrolling spine item 
            else if (currSpineItem.shouldScroll) {

                // Load the scrolling pages view
            }
            // A reflowable spine item
            else {
                currPageView = this.loadReflowablePagesView(currSpineItem, viewerSettings, annotations, bindings);
                pagesViews.push(currPageView);
            }
        }

        return pagesViews;
    },

    loadReflowablePagesView : function (spineItem, viewerSettings, annotations, bindings) {

        var view = new EpubReflowableModule(
            spineItem,
            viewerSettings, 
            annotations, 
            bindings
            );

        var pagesViewInfo = {
            pagesView : view, 
            spineIndexes : [spineItem.spineIndex],
            isRendered : false,
            type : "reflowable"
        };

        return pagesViewInfo;
    },

    loadFixedPagesView : function (spineItemList, viewerSettings) {

        var view = new EpubFixedModule(
            spineItemList,
            viewerSettings
        );

        var spineIndexes = [];
        _.each(spineItemList, function (spineItem) {
            spineIndexes.push(spineItem.spineIndex)
        });

        var pagesViewInfo = {
            pagesView : view, 
            spineIndexes : spineIndexes,
            isRendered : false,
            type : "fixed"
        };

        return pagesViewInfo;
    }
});
    EpubReader.EpubReader = Backbone.Model.extend({

    defaults : function () { 
        return {
            "loadedPagesViews" : [],
            "currentPagesViewIndex" : 0,
            "pagesViewEventList" : []
        };
    },

    initialize : function (attributes, options) {

        var spineInfo = this.get("spineInfo");
        this.set("spine", spineInfo.spine);
        this.set("bindings", spineInfo.bindings);
        this.set("annotations", spineInfo.annotations);
        this.get("viewerSettings").customStyles = [];

        this.loadStrategy = new EpubReader.LoadStrategy({ spineInfo : this.get("spine")});
        this.cfi = new EpubCFIModule();
    },

    // ------------------------------------------------------------------------------------ //  
    //  "PUBLIC" INTERFACE                                                                  //
    // ------------------------------------------------------------------------------------ //  

    // Description: This method chooses the appropriate page view to load for individual 
    //   spine items, and sections of the spine. 
    loadSpineItems : function () {

        var pagesViews = this.loadStrategy.loadSpineItems(this.get("viewerSettings"), this.get("annotations"), this.get("bindings"));
        this.set("loadedPagesViews", pagesViews);

        if (this.get("renderStrategy") === "eager") {
            this.eagerRenderStrategy();    
        }
        else if (this.get("renderStrategy") === "lazy") {
            this.trigger("epubLoaded");
        }
    },

    numberOfLoadedPagesViews : function () {

        return this.get("loadedPagesViews").length;
    },

    hasNextPagesView : function () {

        return this.get("currentPagesViewIndex") < this.numberOfLoadedPagesViews() - 1 ? true : false;
    },

    hasPreviousPagesView : function () {

        return this.get("currentPagesViewIndex") > 0 ? true : false;
    },

    getCurrentPagesView : function () {

        return this.get("loadedPagesViews")[this.get("currentPagesViewIndex")].pagesView;
    },

    renderPagesView : function (pagesViewIndex, callback, callbackContext) {

        var pagesViewInfo;
        var pagesView;
        var that = this;

        if (pagesViewIndex >= 0 && pagesViewIndex < this.numberOfLoadedPagesViews()) {

            this.hideRenderedViews();
            this.set({"currentPagesViewIndex" : pagesViewIndex});
            pagesViewInfo = this.getCurrentPagesViewInfo();
            pagesView = pagesViewInfo.pagesView;

            if (pagesViewInfo.isRendered) {

                pagesView.showPagesView();
                this.applyPreferences(pagesView);
                this.fitCurrentPagesView();
                callback.call(callbackContext, pagesView);
            }
            else {
                
                // Invoke callback when the content document loads
                pagesView.on("contentDocumentLoaded", function (result) {

                    pagesView.showPagesView();
                    that.applyPreferences(pagesView);

                    _.each(that.get("pagesViewEventList"), function (eventInfo) {
                        pagesView.on(eventInfo.eventName, eventInfo.callback, eventInfo.callbackContext);
                    });

                    callback.call(callbackContext, pagesView);
                }, this);

                $(this.get("parentElement")).append(pagesView.render(false, undefined));
                that.setLastRenderSize(pagesViewInfo, $(that.get("parentElement")).height(), $(that.get("parentElement")).width());
                pagesViewInfo.isRendered = true;
            }
        }
    },

    renderNextPagesView : function (callback, callbackContext) {

        var nextPagesViewIndex = this.get("currentPagesViewIndex") + 1;
        this.renderPagesView(nextPagesViewIndex, function (pagesView) {

            pagesView.showPageByNumber(1);
            callback.call(callbackContext);
        }, callbackContext);
    },

    renderPreviousPagesView : function (callback, callbackContext) {

        var previousPagesViewIndex = this.get("currentPagesViewIndex") - 1;
        this.renderPagesView(previousPagesViewIndex, function (pagesView) {

            pagesView.showPageByNumber(pagesView.numberOfPages());
            callback.call(callbackContext);
        }, callbackContext);
    },

    attachEventHandler : function (eventName, callback, callbackContext) {

        // Rationale: Maintain a list of the callbacks, which need to be attached when pages views are loaded
        this.get("pagesViewEventList").push({
            eventName : eventName,
            callback : callback,
            callbackContext : callbackContext
        });

        // Attach the event handler to each current pages view
        _.each(this.get("loadedPagesViews"), function (pagesViewInfo) {
            pagesViewInfo.pagesView.on(eventName, callback, callbackContext);
        }, this);
    },

    removeEventHandler : function (eventName) {

        var that = this;
        // Find index of events
        var indexOfEventsToRemove = [];
        _.each(this.get("pagesViewEventList"), function (pagesViewEvent, index) {

            if (pagesViewEvent.eventName === eventName) {
                indexOfEventsToRemove.push(index);
            }
        });

        // Remove them in reverse order, so each index is still valid
        indexOfEventsToRemove.reverse();
        _.each(indexOfEventsToRemove, function (indexToRemove) {
            that.get("pagesViewEventList").splice(indexToRemove, 1);
        });

        // Remove event handlers on views
        _.each(this.get("loadedPagesViews"), function (pagesViewInfo) {
            pagesViewInfo.pagesView.off(eventName);
        }, this);
    },

    // REFACTORING CANDIDATE: For consistency, it might make more sense if each of the page sets kept track
    //   of their own last size and made the decision as to whether to resize or not. Or maybe that doesn't make
    //   sense.... something to think about. 
    fitCurrentPagesView : function () {

        var readerElementHeight = this.get("parentElement").height();
        var readerElementWidth = this.get("parentElement").width();

        var currPagesViewInfo = this.getCurrentPagesViewInfo();
        var heightIsDifferent = currPagesViewInfo.lastRenderHeight !== readerElementHeight ? true : false;
        var widthIsDifferent = currPagesViewInfo.lastRenderWidth !== readerElementWidth ? true : false;

        if (heightIsDifferent || widthIsDifferent) {
            this.setLastRenderSize(currPagesViewInfo, readerElementHeight, readerElementWidth);
            currPagesViewInfo.pagesView.resizeContent();
        }
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    eagerRenderStrategy : function () {

        var that = this;
        var numPagesViewsToLoad = this.get("loadedPagesViews").length;
        
        _.each(this.get("loadedPagesViews"), function (pagesViewInfo) {

            pagesViewInfo.pagesView.on("contentDocumentLoaded", function (viewElement) { 

                pagesViewInfo.isRendered = true;
                pagesViewInfo.pagesView.hidePagesView();

                numPagesViewsToLoad = numPagesViewsToLoad - 1; 
                if (numPagesViewsToLoad === 0) {
                    that.trigger("epubLoaded");
                }

                // Attach list of event handlers
                _.each(that.get("pagesViewEventList"), function (eventInfo) {
                    pagesViewInfo.pagesView.on(eventInfo.eventName, eventInfo.callback, eventInfo.callbackContext);
                });
            });
            
            // This will cause the pages view to try to retrieve its resources
            $(that.get("parentElement")).append(pagesViewInfo.pagesView.render(false, undefined));
            that.setLastRenderSize(pagesViewInfo, $(that.get("parentElement")).height(), $(that.get("parentElement")).width());
        });

        setTimeout(function () { 
            
            if (numPagesViewsToLoad != 0) {
                // throw an exception
            }

        }, 1000);
    },

    getCurrentPagesViewInfo : function () {

        return this.get("loadedPagesViews")[this.get("currentPagesViewIndex")];
    },

    hideRenderedViews : function () {

        _.each(this.get("loadedPagesViews"), function (pagesViewInfo) {

            if (pagesViewInfo.isRendered) {
                pagesViewInfo.pagesView.hidePagesView();
            }
        });
    },

    // REFACTORING CANDIDATE: The each method is causing numPages and currentPage to be hoisted into the global
    //   namespace, I believe. Bad bad. Check this.
    calculatePageNumberInfo : function () {

        var that = this;
        var numPages = 0;
        var currentPage;
        _.each(this.get("loadedPagesViews"), function (pagesViewInfo) {

            // Calculate current page number
            if (that.getCurrentPagesView() === pagesViewInfo.pagesView) {
                currentPage = numPages + pagesViewInfo.pagesView.currentPage()[0];
            }

            // Sum up number of pages
            if (pagesViewInfo.isRendered) {
                numPages += pagesViewInfo.pagesView.numberOfPages();
            }
        });

        return { 
            numPages : numPages,
            currentPage : currentPage
        };
    },

    // REFACTORING CANDIDATE: This method should be replaced when the epub reader api is changed to have an 
    //   instantiated epub module passed to it. 
    findSpineIndex : function (contentDocumentHref) {

        var contentDocHref = contentDocumentHref;
        var foundSpineItem;

        foundSpineItem = _.find(this.get("spine"), function (spineItem, index) { 

            var uri = new URI(spineItem.contentDocumentURI);
            var filename = uri.filename();
            if (contentDocumentHref.trim() === filename.trim()) {
                return true;
            }
        });

        return foundSpineItem.spineIndex;
    },

    getPagesViewInfo : function (spineIndex) {

        var foundPagesViewInfo = _.find(this.get("loadedPagesViews"), function (currPagesViewInfo, index) {

            var foundSpineIndex = _.find(currPagesViewInfo.spineIndexes, function (currSpineIndex) {
                if (currSpineIndex === spineIndex) {
                    return true;
                }
            });

            // Only checking for null and undefined, as "foundSpineIndex" can be 0, which evaluates as falsy
            if (foundSpineIndex !== undefined && foundSpineIndex !== null) {
                return true;
            }
        });

        return foundPagesViewInfo;
    },

    getPagesViewIndex : function (spineIndex) {

        var foundPagesViewIndex;
        _.find(this.get("loadedPagesViews"), function (currPagesViewInfo, index) {

            var foundSpineIndex = _.find(currPagesViewInfo.spineIndexes, function (currSpineIndex) {
                if (currSpineIndex === spineIndex) {
                    return true;
                }
            });

            // Only checking for null and undefined, as "foundSpineIndex" can be 0, which evaluates as falsy
            if (foundSpineIndex !== undefined && foundSpineIndex !== null) {
                foundPagesViewIndex = index;
                return true;
            }
        });

        return foundPagesViewIndex;
    },

    applyPreferences : function (pagesView) {

        var preferences = this.get("viewerSettings");
        pagesView.setSyntheticLayout(preferences.syntheticLayout);

        // Apply all current preferences to the next page set
        pagesView.customize("margin", preferences.currentMargin + "");
        pagesView.customize("fontSize", preferences.fontSize + "")
        _.each(preferences.customStyles, function (customStyle) {
            pagesView.customize(customStyle.customProperty, customStyle.styleNameOrCSSObject);
        });
    },

    setLastRenderSize : function (pagesViewInfo, height, width) {

        pagesViewInfo.lastRenderHeight = height;
        pagesViewInfo.lastRenderWidth = width;
    }
});
    EpubReader.EpubReaderView = Backbone.View.extend({

    pageSetEvents : {
        "contentDocumentLoaded" : false,
        "epubLinkClicked" : true,
        "atNextPage" : false,
        "atPreviousPage" : false,
        "atFirstPage" : false,
        "atLastPage" : false,
        "layoutChanged" : false,
        "displayedContentChanged" : false
    },

    initialize : function (options) {

        var that = this;
        this.packageDocumentDOM = options.packageDocumentDOM;
        this.reader = new EpubReader.EpubReader({
            spineInfo : options.spineInfo,
            viewerSettings : options.viewerSettings,
            parentElement : options.readerElement,
            renderStrategy : options.renderStrategy
        });
        // Rationale: Propagate the loaded event after all the content documents are loaded
        this.reader.on("epubLoaded", function () {
            that.trigger("epubLoaded");
            // that.$el.css("opacity", "1");
        }, this);
        this.startPropogatingEvents();

        this.readerBoundElement = options.readerElement;
        this.cfi = new EpubCFIModule();
    },

    render : function () {

        // Set the element that this view will be bound to
        $(this.readerBoundElement).css("opacity", "0");
        this.setElement(this.readerBoundElement);
        this.reader.loadSpineItems();
        return this.el;
    },

    // ------------------------ Public interface ------------------------------------------------------------------------

    showSpineItem : function (spineIndex, callback, callbackContext) {

        var that = this;
        var pagesViewIndex = this.reader.getPagesViewIndex(spineIndex);
        this.$el.css("opacity", "0");
        this.reader.renderPagesView(pagesViewIndex, function () {

            var pagesViewInfo = this.reader.getCurrentPagesViewInfo();

            // If the pages view is fixed
            // REFACTORING CANDIDATE: This will cause a displayedContentChanged event to be triggered twice when another show
            //   method calls this to first load the spine item; Part of this method could be extracted and turned into a 
            //   helper to prevent this.
            if (pagesViewInfo.type === "fixed") {
                pageNumber = that.getPageNumber(pagesViewInfo, spineIndex);
                pagesViewInfo.pagesView.showPageByNumber(pageNumber);
            }
            else {
                pagesViewInfo.pagesView.showPageByNumber(1);    
            }
            
            that.$el.css("opacity", "1");
            callback.call(callbackContext);
        }, this);
    },

    // Rationale: As with the CFI library API, it is up to calling code to ensure that the content document CFI component is
    //   is a reference into the content document pointed to by the supplied spine index. 
    showPageByCFI : function (CFI, callback, callbackContext) {

        // Dereference CFI, get the content document href
        var contentDocHref;
        var spineIndex;
        var pagesView;
        try {
            
            contentDocHref = this.cfi.getContentDocHref(CFI, this.packageDocumentDOM);
            spineIndex = this.reader.findSpineIndex(contentDocHref);
            this.showSpineItem(spineIndex, function () {
                pagesView = this.reader.getCurrentPagesView();
                pagesView.showPageByCFI(CFI);
                callback.call(callbackContext);
            }, this);
        }
        catch (error) {
            throw error; 
        }
    },

    showPageByElementId : function (spineIndex, elementId, callback, callbackContext) { 

        // Rationale: Try to locate the element before switching to a new page view try/catch
        this.showSpineItem(spineIndex, function () {
            this.reader.getCurrentPagesView().showPageByHashFragment(elementId);
            callback.call(callbackContext);
        }, this);
    },

    nextPage : function (callback, callbackContext) {

        var that = this;
        var currentPagesView = this.reader.getCurrentPagesView();

        if (currentPagesView.onLastPage()) {

            if (this.reader.hasNextPagesView()) {

                this.$el.css("opacity", "0");
                this.reader.renderNextPagesView(function () {

                    that.$el.css("opacity", "1");
                    that.trigger("atNextPage");
                    callback.call(callbackContext);
                }, this);
            }
            else {
                this.trigger("atLastPage");
                callback.call(callbackContext);
            }
        }
        else {
            currentPagesView.nextPage();
            if (currentPagesView.onLastPage() && !this.reader.hasNextPagesView()) {
                that.trigger("atLastPage");
            }
        }
    },

    previousPage : function (callback, callbackContext) {

        var that = this;
        var currentPagesView = this.reader.getCurrentPagesView();

        if (currentPagesView.onFirstPage()) {

            if (this.reader.hasPreviousPagesView()) {
                
                this.$el.css("opacity", "0");
                this.reader.renderPreviousPagesView(function () {

                    that.$el.css("opacity", "1");
                    that.trigger("atPreviousPage");
                    callback.call(callbackContext);
                }, this);
            }
            else {
                this.trigger("atFirstPage");
                callback.call(callbackContext);
            }
        }
        else {
            currentPagesView.previousPage();
            if (currentPagesView.onFirstPage() && !this.reader.hasPreviousPagesView()) {
                that.trigger("atFirstPage");
            }
        }
    },

    // REFACTORING CANDIDATE: setFontSize and setMargin can be rolled into the custom
    //   proprety infrastructure at some point
    customize : function (customProperty, styleNameOrCSSObject) {

        var currentView;

        // delegate to font size, margin and theme
        if (customProperty === "fontSize") {
            this.setFontSize(parseInt(styleNameOrCSSObject));
        }
        else if (customProperty === "margin") {
            this.setMargin(parseInt(styleNameOrCSSObject));
        }
        else {
            currentView = this.reader.getCurrentPagesView();
            currentView.customize(customProperty, styleNameOrCSSObject);
            this.reader.get("viewerSettings")["customStyles"].push({ 
                "customProperty" : customProperty,
                "styleNameOrCSSObject" : styleNameOrCSSObject
            });
        }
    },

    setFontSize : function (fontSize) {

        var currentView = this.reader.getCurrentPagesView();
        currentView.setFontSize(fontSize);
        this.reader.get("viewerSettings").fontSize = fontSize;
    },

    setMargin : function (margin) {

        var currentView = this.reader.getCurrentPagesView();
        currentView.setMargin(margin);
        this.reader.get("viewerSettings").currentMargin = margin;
    },

    setSyntheticLayout : function (isSynthetic) {

        var currentView = this.reader.getCurrentPagesView();
        currentView.setSyntheticLayout(isSynthetic);
        this.reader.get("viewerSettings").syntheticLayout = isSynthetic;
    },

    getNumberOfPages : function () {

        return this.reader.calculatePageNumberInfo().numPages;
    },

    getCurrentPage : function () {

        return this.reader.calculatePageNumberInfo().currentPage;
    },

    getViewerSettings : function () {

        return this.reader.get("viewerSettings");
    },

    attachEventHandler : function (eventName, callback, callbackContext) {

        // Page set events
        if (this.canHandlePageSetEvent(eventName)) {
            this.reader.attachEventHandler(eventName, callback, callbackContext);
        }
        // Reader events
        else {
            this.on(eventName, callback, callbackContext);
        }
    },

    removeEventHandler : function (eventName) {

        // Page set events
        if (this.canHandlePageSetEvent(eventName)) {
            this.reader.removeEventHandler(eventName, callback, callbackContext);
        }
        // Reader events
        else {
            this.off(eventName);
        }
    },

    // ----------------------- Private Helpers -----------------------------------------------------------

    getSpineIndexFromCFI : function (CFI) {

        try {
            var contentDocumentHref = this.cfi.getContentDocHref(CFI, this.packageDocumentDOM);
            var spineIndex = this.reader.findSpineIndex(contentDocumentHref);
            return spineIndex;
        }
        catch (error) {
            throw error;
        }
    },

    getPageNumber : function (fixedPagesViewInfo, spineIndex) {

        var spineIndexes = fixedPagesViewInfo.spineIndexes;
        var pageNumber = undefined;

        _.each(spineIndexes, function (currSpineIndex, index) {

            if (currSpineIndex === spineIndex) {
                pageNumber = index + 1;
                return true;
            }
        });

        return pageNumber;
    },

    canHandlePageSetEvent : function (eventName) {

        if (this.pageSetEvents[eventName] === true) {
            return true;
        }
        else {
            return false;
        }
    },

    startPropogatingEvents : function () {

        this.reader.attachEventHandler("atNextPage", function () {
            this.trigger("atNextPage");
        }, this);

        this.reader.attachEventHandler("atPreviousPage", function () {
            this.trigger("atPreviousPage");
        }, this);

        this.reader.attachEventHandler("layoutChanged", function (isSynthetic) {
            this.trigger("layoutChanged", isSynthetic);
        }, this);

        this.reader.attachEventHandler("displayedContentChanged", function () {
            this.trigger("displayedContentChanged");
        }, this);        
    }
});

    var epubReaderView = new EpubReader.EpubReaderView({
        readerElement : readerBoundElement,
        spineInfo : epubSpineInfo,
        viewerSettings : viewerSettings,
        packageDocumentDOM : packageDocumentDOM,
        renderStrategy : renderStrategy
    });

    // Description: The public interface
    return {

        render : function () {
            return epubReaderView.render();
        },
        showSpineItem : function (spineIndex, callback, callbackContext) {
            return epubReaderView.showSpineItem(spineIndex, callback, callbackContext);
        },
        showPageByCFI : function (CFI, callback, callbackContext) {
            return epubReaderView.showPageByCFI(CFI, callback, callbackContext);
        },
        showPageByElementId : function (spineIndex, hashFragmentId, callback, callbackContext) {
            return epubReaderView.showPageByElementId(spineIndex, hashFragmentId, callback, callbackContext);
        },
        nextPage : function (callback, callbackContext) {
            return epubReaderView.nextPage(callback, callbackContext);
        },
        previousPage : function (callback, callbackContext) {
            return epubReaderView.previousPage(callback, callbackContext);
        },
        setFontSize : function (fontSize) {
            return epubReaderView.setFontSize(fontSize);
        },
        setMargin : function (margin) {
            return epubReaderView.setMargin(margin);
        },
        setTheme : function (theme) {
            return epubReaderView.setTheme(theme);
        },
        setSyntheticLayout : function (isSynthetic) {
            return epubReaderView.setSyntheticLayout(isSynthetic);
        },
        getNumberOfPages : function () {
            return epubReaderView.getNumberOfPages();
        },
        getCurrentPage : function () {
            return epubReaderView.getCurrentPage();
        },
        on : function (eventName, callback, callbackContext) {
            return epubReaderView.attachEventHandler(eventName, callback, callbackContext);
        },
        off : function (eventName) {
            return epubReaderView.removeEventHandler(eventName);
        },
        getViewerSettings : function () {
            return epubReaderView.getViewerSettings();
        },
        resizeContent : function () {
            return epubReaderView.reader.fitCurrentPagesView();
        },
        customize : function (customProperty, styleNameOrCSS) {
            epubReaderView.customize(customProperty, styleNameOrCSS);
            return this;
        }
    };
};
