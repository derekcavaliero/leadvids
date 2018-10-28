/*! 
 * leadvids v1.0.0
 * https://github.com/derekcavaliero/leadvids
 * 
 * Copyright (c) 2018 Derek Cavaliero @ WebMechanix
 * 
 * Date: 2018-10-27 21:52:46 EDT 
 */
!function($, window, document, undefined) {
    function Leadvid(element, options) {
        this.element = $(element), this.options = $.extend(!0, {}, defaults, $.fn[pluginName].defaults, options), 
        this.element.data("leadvid-form-id") && (this.options.formId = this.element.data("leadvid-form-id")), 
        this.element.data("leadvid-threshold") && (this.options.threshold = parseInt(this.element.data("leadvid-threshold"))), 
        this.element.data("leadvid-threshold-unit") && (this.options.thresholdUnit = this.element.data("leadvid-threshold-unit")), 
        this.element.data("leadvid-freepass") !== !1 && this.element.data("leadvid-freepass") !== !0 || (this.options.freepass = this.element.data("leadvid-freepass")), 
        this._defaults = defaults, this._name = pluginName, this.init();
    }
    var pluginName = "leadvids", defaults = {
        provider: {
            type: "",
            id: "",
            host: ""
        },
        formId: "",
        freepass: !1,
        freepassButtonClass: "",
        freepassLimit: 3,
        freepassText: "Skip this time",
        overlayHeader: "Want to continue watching?",
        overlayText: "",
        submitButtonClass: "",
        thankYouText: "Thank you! Enjoy the video!",
        threshold: 25,
        thresholdUnit: "%"
    };
    Leadvid.prototype = {
        init: function() {
            this._video = this.parseVideo(), this._iframeId = [ this._video.type, this._video.id, this.options.formId ].join("-"), 
            this.decorateIframe(), this.loadForm(), this._video.type && this.loadPlayerApi();
        },
        parseVideo: function() {
            var src = $("<a>", {
                href: this.element.attr("src")
            })[0], newSrc = src.href, id = !1, type = !1, embedParams = {};
            if (src.host.indexOf("vimeo") > -1 ? (id = src.pathname.replace("/video/", ""), 
            type = "vimeo", embedParams = {
                byline: 0,
                title: 0,
                portrait: 0
            }) : src.host.indexOf("youtube") > -1 && (id = src.pathname.replace("/embed/", ""), 
            type = "youtube", embedParams = {
                enablejsapi: 1,
                disablekb: 1,
                modestbranding: 1
            }), !$.isEmptyObject(embedParams)) {
                for (var key in embedParams) embedParams.hasOwnProperty(key) && src.search && src.search.indexOf(key + "=" + embedParams[key]) > -1 && delete embedParams[key];
                $.isEmptyObject(embedParams) && src.search || (embedParams = $.param(embedParams), 
                newSrc += src.search ? "&" + embedParams : "?" + embedParams);
            }
            return {
                id: id,
                type: type,
                src: newSrc !== src.href && newSrc
            };
        },
        decorateIframe: function() {
            var _this = this;
            this.element.attr("id", this._iframeId), this._video.src && this.element.attr("src", this._video.src);
            var freepassHtml = this.options.freepass && this.getRemainingFreepasses() > 0 ? '<div class="leadvid__freepass"><button class="leadvid__button ' + this.options.freepassButtonClass + '" type="button">' + this.options.freepassText + " <small>(" + this.getRemainingFreepasses() + " remaining)</small></button></div>" : "";
            $('<aside class="leadvid__overlay" role="dialog" tabindex="-1" aria-labeledby="leadvid__label--' + this._iframeId + '"><div class="leadvid__content" role="document"><div class="leadvid__header" id="leadvid__label--' + this._iframeId + '">' + this.options.overlayHeader + "</div>" + this.options.overlayText + '</div><div class="leadvid__form" id="leadvid__form--' + this._iframeId + '"></div>' + freepassHtml + "</aside>").insertAfter(this.element), 
            this._overlay = this.element.siblings(".leadvid__overlay").on("click", "button.leadvid__button", function(event) {
                _this.removeOverlay(!0);
            });
        },
        loadForm: function() {
            var _this = this, formTarget = "#leadvid__form--" + _this._iframeId;
            switch (this.options.provider.type) {
              case "hubspot":
                hbspt.forms.create({
                    portalId: _this.options.provider.id,
                    formId: _this.options.formId,
                    target: formTarget,
                    formInstanceId: _this._iframeId,
                    groupErrors: !1,
                    css: "",
                    cssRequired: "",
                    submitButtonClass: _this.options.submitButtonClass,
                    inlineMsg: "The video will resume in a moment.",
                    onFormReady: function($form) {
                        $form.find(".hubspot-link__container").remove();
                    },
                    onFormSubmit: function($form) {
                        $("#leadvid__form--" + _this._iframeId).find(".submitted-message").remove(), _this.removeOverlay();
                    }
                });
                break;

              case "marketo":
                $(formTarget).append('<form id="mktoForm_' + _this._iframeId + '"></form>'), MktoForms2.loadForm(_this.options.provider.host, _this.options.provider.id, _this.options.formId, function(form) {
                    form.render($("#mktoForm_" + _this._iframeId)), form.onSuccess(function(values, followUpUrl) {
                        return form.getFormElem().hide(), _this.removeOverlay(), !1;
                    });
                });
            }
        },
        loadPlayerApi: function() {
            var _this = this, scriptSrc = !1, setupAfterLoad = !1;
            switch (this._video.type) {
              case "vimeo":
                window.Vimeo ? _this.setupPlayerAPI() : (scriptSrc = "//player.vimeo.com/api/player.js", 
                setupAfterLoad = !0);
                break;

              case "youtube":
                window.YT || (scriptSrc = "//www.youtube.com/iframe_api"), window.onYouTubeIframeAPIReady = function() {
                    _this.setupPlayerAPI();
                };
            }
            scriptSrc && $.getScript(scriptSrc, function(data, textStatus, jqxhr) {
                setupAfterLoad && _this.setupPlayerAPI();
            });
        },
        setupPlayerAPI: function() {
            var _this = this, showForm = !1;
            if (!_this.checkStorage()) switch (this._video.type) {
              case "vimeo":
                this.Player = new Vimeo.Player(this.element), this.Player.on("timeupdate", function(data, id) {
                    if (!_this.checkStorage()) {
                        var percent = 100 * data.percent;
                        "%" == _this.options.thresholdUnit && percent >= _this.options.threshold && (showForm = !0), 
                        "s" == _this.options.thresholdUnit && data.seconds >= _this.options.threshold && (showForm = !0), 
                        showForm && this.pause().then(function() {
                            _this.showOverlay();
                        });
                    }
                });
                break;

              case "youtube":
                this.Player = new YT.Player(_this._iframeId, {
                    events: {
                        onStateChange: function(event) {
                            console.log(_this.Player.getDuration());
                        }
                    }
                });
            }
        },
        getStorage: function() {
            return !!localStorage.getItem("leadvids") && JSON.parse(localStorage.getItem("leadvids"));
        },
        checkStorage: function() {
            var storage = this.getStorage();
            return !(!storage || !storage[this._video.type]) && storage[this._video.type].indexOf(this._video.id) > -1;
        },
        updateStorage: function(freepass) {
            var freepass = "undefined" != typeof freepass && freepass, storage = this.getStorage() || {};
            storage[this._video.type] ? storage[this._video.type].indexOf(this._video.id) === -1 && storage[this._video.type].push(this._video.id) : storage[this._video.type] = [ this._video.id ], 
            freepass && (storage.freepass ? storage.freepass.indexOf(this._video.id) === -1 && storage.freepass.push(this._video.id) : storage.freepass = [ this._video.id ]), 
            localStorage.setItem("leadvids", JSON.stringify(storage));
        },
        getRemainingFreepasses: function() {
            var storage = this.getStorage(), remaining = this.options.freepassLimit;
            return storage && storage.freepass && (remaining += -storage.freepass.length), remaining;
        },
        showOverlay: function() {
            this._overlay.hasClass("active") || (this.exitFullscreen(), this._overlay.addClass("active"));
        },
        exitFullscreen: function() {
            document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
        },
        removeOverlay: function(freepass) {
            var freepass = "undefined" != typeof freepass && freepass, _this = this;
            _this.updateStorage(freepass), _this._overlay.find(".leadvid__form").hide(), _this._overlay.find(".leadvid__freepass").remove(), 
            _this._overlay.addClass("success").find(".leadvid__header").html(_this.options.thankYouText), 
            setTimeout(function() {
                _this._overlay.removeClass("active"), "vimeo" == _this._video.type && _this.Player.play();
            }, 1500);
        }
    }, $.fn[pluginName] = function(options) {
        if ($(window).innerWidth() >= 768) return this.each(function() {
            $.data(this, "plugin_" + pluginName) || $.data(this, "plugin_" + pluginName, new Leadvid(this, options));
        });
    };
}(jQuery, window, document);