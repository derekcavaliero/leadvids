;(function ( $, window, document, undefined ) {

    /**
     * As of this moment - we only really support Vimeo and YouTube.
     * Will look into Wistia, Brightcove, JWPlayer, etc...
     *
     */

    var pluginName = 'leadvids',
        defaults = {

            provider: {
                type: '',
                id: '',         // Portal ID, Marketo Account ID etc...
                host: ''      // Used only for Marketo - becuase each account has its own unique script src.
            },

            formId: '',

            freepass: false,
            freepassButtonClass: '',
            freepassLimit: 3,
            freepassText: 'Skip this time',

            overlayHeader: 'Want to continue watching?',
            overlayText: '',

            submitButtonClass: '',

            thankYouText: 'Thank you! Enjoy the video!',
            threshold: 25,
            thresholdUnit: '%',  // % or s (for seconds)

        };


    function Leadvid( element, options ) {

        this.element = $( element );

        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( true, {}, defaults, $.fn[pluginName].defaults, options );

        /*
         * Options overrides via HTML5 data attributes.
         */
        if ( this.element.data('leadvid-form-id') )
            this.options.formId = this.element.data('leadvid-form-id');

        if ( this.element.data('leadvid-threshold') )
            this.options.threshold = parseInt( this.element.data('leadvid-threshold') );

        if ( this.element.data('leadvid-threshold-unit') )
            this.options.thresholdUnit = this.element.data('leadvid-threshold-unit');

        if ( this.element.data('leadvid-freepass') === false || this.element.data('leadvid-freepass') === true )
            this.options.freepass = this.element.data('leadvid-freepass');

        this._defaults = defaults;
        this._name = pluginName;

        this.init();

    }

    Leadvid.prototype = {

        init: function () {

            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options

            this._video = this.parseVideo();
            this._iframeId = [this._video.type, this._video.id, this.options.formId].join('-');

            this.decorateIframe();
            this.loadForm();

            if ( this._video.type )
                this.loadPlayerApi();

        },

        parseVideo: function() {

            var src = $( '<a>', {
                            href: this.element.attr('src')
                        })[0];


            var newSrc = src.href;

            var id = false;
            var type = false;
            var embedParams = {};

            if ( src.host.indexOf('vimeo') > -1 ) {

                id = src.pathname.replace('/video/', '');
                type = 'vimeo';
                embedParams = {
                    byline: 0,
                    title: 0,
                    portrait: 0
                };

            } else if ( src.host.indexOf('youtube') > -1 ) {

                id = src.pathname.replace('/embed/', '');
                type = 'youtube';
                embedParams = {
                    enablejsapi: 1,
                    disablekb: 1,
                    modestbranding: 1
                };

            }

            if ( !$.isEmptyObject(embedParams) ) {

                //console.log('should make it here');

                for (var key in embedParams) {
                    if ( !embedParams.hasOwnProperty(key) ) continue;

                    if ( src.search && src.search.indexOf(key + '=' + embedParams[key]) > -1 )
                        delete embedParams[key];
                }

                if ( !$.isEmptyObject(embedParams) || !src.search ) {
                    embedParams = $.param(embedParams);
                    newSrc += ( src.search ) ? '&' + embedParams : '?' + embedParams;
                }

            }

            return {
                id: id,
                type: type,
                src: ( newSrc !== src.href ) ? newSrc : false
            };

        },

        decorateIframe: function() {

            var _this = this;

            this.element.attr('id', this._iframeId);

            if ( this._video.src )
                this.element.attr('src', this._video.src);

            var freepassHtml = ( this.options.freepass && this.getRemainingFreepasses() > 0 ) ?
                '<div class="leadvid__freepass">' +
                    '<button class="leadvid__button ' + this.options.freepassButtonClass + '" type="button">' +
                        this.options.freepassText + ' <small>(' + this.getRemainingFreepasses() + ' remaining)</small>' +
                    '</button>' +
                '</div>' : '';

            $(
    			'<aside class="leadvid__overlay" role="dialog" tabindex="-1" aria-labeledby="leadvid__label--' + this._iframeId + '">' +
    				'<div class="leadvid__content" role="document">' +
                        '<div class="leadvid__header" id="leadvid__label--' + this._iframeId + '">' + this.options.overlayHeader + '</div>' +
                        this.options.overlayText +
                    '</div>' +
    				'<div class="leadvid__form" id="leadvid__form--' + this._iframeId + '"></div>' +
                    freepassHtml +
    			'</aside>'
    		).insertAfter( this.element );

            this._overlay = this.element
                                .siblings('.leadvid__overlay')
                                    .on('click', 'button.leadvid__button', function(event) {
                                        _this.removeOverlay( true );
                                    });

        },

        loadForm: function() {

            var _this = this;
            var formTarget = '#leadvid__form--' + _this._iframeId;

            switch ( this.options.provider.type ) {

                case 'hubspot':

                    hbspt.forms.create({
                        portalId: _this.options.provider.id,
                        formId: _this.options.formId,
                        target: formTarget,
                        formInstanceId: _this._iframeId,
                        groupErrors: false,
                        css: '',
                        cssRequired: '',
                        submitButtonClass: _this.options.submitButtonClass,
                        inlineMsg: 'The video will resume in a moment.',
                        onFormReady: function($form) {
                            $form.find( '.hubspot-link__container' ).remove();
                        },
                        onFormSubmit: function($form) {
                            $('#leadvid__form--' + _this._iframeId).find( '.submitted-message' ).remove();
                            _this.removeOverlay();
                        }
                    });

                break;

                case 'marketo':

                    $( formTarget ).append( '<form id="mktoForm_' + _this._iframeId + '"></form>' );
                    MktoForms2.loadForm( _this.options.provider.host, _this.options.provider.id, _this.options.formId, function(form) {

                        form.render( $('#mktoForm_' + _this._iframeId) );

                        form.onSuccess(function(values, followUpUrl) {
                            form.getFormElem().hide();
                            _this.removeOverlay();
                            return false;
                        });

                    });

                break;

            }

        },

        loadPlayerApi: function() {

            var _this = this;
            var scriptSrc = false;
            var setupAfterLoad = false;

            switch ( this._video.type ) {
                case 'vimeo':

                    if ( !window.Vimeo ) {
                        scriptSrc = '//player.vimeo.com/api/player.js';
                        setupAfterLoad = true;
                    } else {
                        _this.setupPlayerAPI();
                    }

                break;

                case 'youtube':
                    if ( !window.YT ) {
                        scriptSrc = '//www.youtube.com/iframe_api';
                    }
                    window.onYouTubeIframeAPIReady = function(){
                        _this.setupPlayerAPI();
                    };
                break;
            }

            if ( scriptSrc ) {
                $.getScript( scriptSrc, function( data, textStatus, jqxhr ) {
                    if ( setupAfterLoad )
                        _this.setupPlayerAPI();
                });
            }

        },

        setupPlayerAPI: function() {

            var _this = this;
            var showForm = false;

            if ( _this.checkStorage() )
                return; // If the video form has already been submitted - we don't need to setup listeners.

            switch ( this._video.type ) {

                case 'vimeo':

                    this.Player = new Vimeo.Player(this.element);

                    this.Player.on('timeupdate', function(data, id) {

                        if ( _this.checkStorage() )
                            return;

                        var percent = data.percent * 100;

                        if ( _this.options.thresholdUnit == '%' && ( percent >= _this.options.threshold ) )
                            showForm = true;

                        if ( _this.options.thresholdUnit == 's' && ( data.seconds >= _this.options.threshold ) )
                            showForm = true;

                        if ( showForm ) {
                            this.pause().then(function() {
                                _this.showOverlay();
                            });
                        }

                    });

                break;

                case 'youtube':

                    this.Player = new YT.Player(_this._iframeId, {
                        events: {
                            'onStateChange': function( event ) {
                                console.log( _this.Player.getDuration() );
                            }
                        }
                    });

                break;

            }

        },

        getStorage: function() {
            return localStorage.getItem( 'leadvids' ) ? JSON.parse( localStorage.getItem( 'leadvids' ) ) : false;
        },

        checkStorage: function() {

            var storage = this.getStorage();

            if ( !storage || !storage[this._video.type] )
                return false;

            return ( storage[this._video.type].indexOf( this._video.id ) > -1 ) ? true : false;

        },

        updateStorage: function(freepass) {

            var freepass = typeof freepass !== 'undefined' ? freepass : false;

            var storage = this.getStorage() || {};

            if ( storage[this._video.type] ) {
                if ( storage[this._video.type].indexOf( this._video.id ) === -1 )
                    storage[this._video.type].push( this._video.id );
            } else {
                storage[this._video.type] = [this._video.id];
            }

            if ( freepass ) {
                if ( storage.freepass ) {
                    if ( storage.freepass.indexOf( this._video.id ) === -1 )
                        storage.freepass.push( this._video.id );
                } else {
                    storage.freepass = [this._video.id];
                }
            }

            localStorage.setItem( 'leadvids', JSON.stringify( storage ) );

        },

        getRemainingFreepasses: function() {

            var storage = this.getStorage();
            var remaining = this.options.freepassLimit;

            if ( storage && storage.freepass ) {
                remaining += -(storage.freepass.length);
            }

            return remaining;

        },

        showOverlay: function() {

            if ( this._overlay.hasClass('active') )
                return;

            this.exitFullscreen();
            this._overlay.addClass('active');

        },

        exitFullscreen: function() {

            if ( document.exitFullscreen ) {
                document.exitFullscreen();
            } else if ( document.mozCancelFullScreen ) {
                document.mozCancelFullScreen();
            } else if ( document.webkitExitFullscreen ) {
                document.webkitExitFullscreen();
            }

        },

        removeOverlay: function(freepass) {

            var freepass = typeof freepass !== 'undefined' ? freepass : false;

            var _this = this;

            _this.updateStorage(freepass);

            _this._overlay.find( '.leadvid__form' ).hide();
            _this._overlay.find( '.leadvid__freepass' ).remove();

            _this._overlay.addClass('success').find( '.leadvid__header' ).html( _this.options.thankYouText );

            setTimeout(function() {

                _this._overlay.removeClass('active');

                if ( _this._video.type == 'vimeo' )
                    _this.Player.play();

            }, 1500);

        }

    };

    $.fn[pluginName] = function ( options ) {
        if ( $(window).innerWidth() >= 768 ) {
            return this.each(function () {
                if ( !$.data( this, 'plugin_' + pluginName ) ) {
                    $.data( this, 'plugin_' + pluginName, new Leadvid( this, options ) );
                }
            });
        }
    }

})( jQuery, window, document );
