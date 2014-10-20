// JavaScript Document
var _g = globals = {};
var gen = gen || {};  //Évite d'overwritter des plugins s'il y en a

gen = function(defaultApp, root, defaultAd) {
  var self = this;
  self.path = { // Path permettant d'accèder aux divers fichiers externes utilisés.
    root:       root,
    data:       root + "data/",
    settings:   root + "data/settings/",
    images:     root + 'public/images/',
    libs:       root + "app/libraries/",
    templates:  root + 'app/templates/',
    temps:      root + 'temps/'
  };

  self.app = {
    templates: {
      options: {
        partials: {}
      },
      icons: {},
      previews: {}
    },
    idPer: {},
    dragover: false,
    keyPressed: {
      ctrl: false
    },
    settings: {}
  };
  $.extend(self.app, defaultApp);

  self.ad = {
    elems: []
  };
  $.extend(self.ad, defaultAd);

  self.props = {
    int: ["top", "left", "width", "height", "fontSize", "padding"] 
  };

  $.when( // Télécharge tous les json externes nécessaires
    $.getJSON( self.path.data + self.app.culture + "/text.json", function(r) { self.text = r; } ),
    $.get( self.path.templates + "interactivities/basic.mustache", function(r) { self.app.templates.basic = r; } ),
    $.get( self.path.templates + "interactivities/partials/gallery-pager.mustache", function(r) { self.app.templates.galleryPager = r; } ),
    $.get( self.path.templates + "interactivities/partials/gallery-pager-transparent.mustache", function(r) { self.app.templates.galleryPagerTransparent = r; } ),
    $.get( self.path.templates + "previews/gallery-pager.mustache", function(r) { self.app.templates.previews.galleryPager = r; } ),
    $.get( self.path.templates + "partials/layer.mustache", function(r) { self.app.templates.layer = r; } ),
    $.get( self.path.templates + "partials/erase.mustache", function(r) { self.app.templates.erase = r; } ),
    $.get( self.path.templates + "/options/partials/position.mustache", function(r) { self.app.templates.options.partials.position = r; } ),
    $.get( self.path.templates + "/options/partials/dimensions.mustache", function(r) { self.app.templates.options.partials.dimensions = r; } ),
    $.get( self.path.templates + "/options/partials/href.mustache", function(r) { self.app.templates.options.partials.href = r; } ),
    $.get( self.path.templates + "/options/partials/theme.mustache", function(r) { self.app.templates.options.partials.theme = r; } ),
    $.get( self.path.templates + "/icons/link.mustache", function(r) { self.app.templates.icons.link = r; } )
  ).then(function() { // Ensuite initialise la page
    //--- functions -----------------
    self.map_();
    self.init_();
    self.bindEvents_();
  });
};

//=== MAP START =====================================================
gen.prototype.map_ = function() {
  var self = this;
  self.dom = {
    b: $('body'),
    form: $('.form'),
    adContent: $('.ad-window__content'),
    elemOptions: $('.elem-options'),
    interactivitiesToolbar: $('.interactivities-toolbar'),
    layers: $('.layers__list'),
    lock: $('.js-lock-elem'),
    askErase: $('.js-askErase'),
    opacity: $('.js-opacity-elem'),
    colors: $('.colors'),
    colorsFlip: $('.js-colors-flip')
  };
};

//=== INIT START =====================================================
gen.prototype.init_ = function() {
  var self = this;

  self.detectOs_();
  self.detectBrowser_();
  self.isAdblockActive_();
  self.initInteractivitiesRelated_();
  self.initLayersSortable_();
  self.initDragElemOptions_();
  self.initColorInput_();
};

//=== BIND START =====================================================
gen.prototype.bindEvents_ = function() {
  var self = this;

  $(document).on('keydown', function(e) {
    self.updateKeyPressed_( e );
  });

  $(document).on('keyup', function() {
    self.updateKeyPressed_();
  });

  $(document).on('dragover', function() {
    clearTimeout(window.timer);
    self.detectDragOver_( true );
  });

  $(document).on('dragleave drop', function() {
    window.timer = setTimeout(function() {
      self.detectDragOver_( false );
    }, 200);
  });

  self.dom.form.on('keypress', function(e) {
    self.verifyEnter_( e );
  });

  self.dom.interactivitiesToolbar.on('click', '.js-create-ad-elem', function() {
    self.createElemByType_( $(this) );
  });

  self.dom.layers.on('click', '.js-toggle-layer-visibility', function() {
    self.toggleVisibility_( $(this).closest('.layer') );
  });

  self.dom.layers.on('click', function() {
    self.setFocus_();
  });

  self.dom.layers.on('click', '.layer', function(e) {
    e.stopImmediatePropagation();
    self.updateLayerFocus_( $(this) );
  });

  self.dom.lock.on('click', function(e) {
    e.stopImmediatePropagation();
    self.toggleLockElem_();
  });

  self.dom.opacity.on('change', function() {
    self.updateElemOpacity_();
  });

  self.dom.askErase.on('click', function() {
    self.askErase_();
  });

  self.dom.form.on('click', '.js-erase', function() {
    self.erase_();
  });

  self.dom.colorsFlip.on('click', function() {
    self.colorsFlip_();
  });

  self.dom.form.on('click', '.js-close-popup', function() {
    self.closePopup_( $(this).closest('.popup') );
  });

  self.dom.adContent.on('change', '.js-dropzone', function() {
    self.getImgFormInput_( $(this) );
  });

  self.dom.elemOptions.on('click', '.js-change-theme', function() {
    self.updateThemeIcon_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-style', function() {
    self.updateStyleAccordingToOptionsInput_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-setting', function() {
    self.updateElemSetting_( $(this) );
  });

  self.dom.elemOptions.on('click', '.js-align-elem', function() {
    self.alignElem_( $(this).data('position') );
  });
};

gen.prototype.closePopup_ = function( popup ) {
  var self = this;
  popup.remove();
};

/*=== Update Elem Setting ==========================================*/
gen.prototype.updateElemSetting_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var obj = self.getObjById_( options.data('id') );

  obj.settings[prop] = input.val();
};

/*=== Detect Drag over App ==========================================*/
gen.prototype.initDragElemOptions_ = function() {
  var self = this;
  self.dom.elemOptions.draggable({
    containment: "parent",
    handle: ".elem-options__handle"
  });
};

/*=== Detect Drag over App ==========================================*/
gen.prototype.detectDragOver_ = function( e ) {
  var self = this;
  if(e) {
    self.app.dragover = true;
    self.dom.b.addClass('dragover');
  } else {
    self.app.dragover = false;
    self.dom.b.removeClass('dragover');
  }
};

/*=== Init Interactivity Related ==========================================*/
gen.prototype.initInteractivitiesRelated_ = function() {
  var self = this;

  for(var x=0; x<self.app.settings.interactivities.length; x++) {
    var interactivity = self.app.settings.interactivities[x];

    self.getInteractivityTemplate_( interactivity );
    self.getInteractivityOptionsTemplate_( interactivity );
    self.getInteractivitySettings_( interactivity );
    self.initIdPerInteractivity_( interactivity );
  }
};

/*=== Get Interactivity Template ==========================================*/
gen.prototype.getInteractivityTemplate_ = function( interactivity ) {
  var self = this;
  $.get( self.path.templates + "interactivities/" + interactivity + ".mustache")
  .done(function(r) { 
    self.app.templates[ interactivity ] = r; 
  });
};

/*=== Get Interactivity Options Template ====================================*/
gen.prototype.getInteractivityOptionsTemplate_ = function( interactivity ) {
  var self = this;
  $.get( self.path.templates + "options/" + interactivity + ".mustache" )
  .done(function(r) { 
    self.app.templates.options[ interactivity ] = r; 
    if( interactivity === 'gallery' ) {
      $.get( self.path.templates + "options/" + interactivity + "-pager.mustache" ).done(function(r) { 
        self.app.templates.options[ interactivity + '-pager' ] = r; 
      });
    }
  });
};

/*=== Get Interactivity Settings ==========================================*/
gen.prototype.getInteractivitySettings_ = function( interactivity ) {
  var self = this;
  $.getJSON( self.path.settings + interactivity + ".json")
  .done(function(r) { 
    self.app.settings[ interactivity ] = r; 
    if( interactivity === 'gallery' ) {
      $.getJSON( self.path.settings + interactivity + "-pager.json").done(function(r) { 
        self.app.settings[ interactivity + '-pager' ] = r; 
      });
    }
  });
};

/*=== Init Id Per Interactivity ==========================================*/
gen.prototype.initIdPerInteractivity_ = function( interactivity ) {
  var self = this;
  self.app.idPer[ interactivity ] = 0;
};

/*=== Is Adblock Active ==========================================*/
gen.prototype.isAdblockActive_ = function() {
  var self = this;
  self.app.adblock = window.canRunAds === undefined ? true : false;
};

/*=== Detect Os ==========================================*/
gen.prototype.detectOs_ = function() {
  var self = this;
  self.app.os = detectOs();
};

/*=== Detect Browser ==========================================*/
gen.prototype.detectBrowser_ = function() {
  var self = this;
  self.app.browser = detectBrowser()[0];
};

/*=== Create Elem By Type ==========================================*/
gen.prototype.createElemByType_ = function( btn ) {
  var self = this;
  var type = btn.data('type');
  var name = self.text[ type ] + " " + self.app.idPer[type];
  var elemText = typeof self.text.cta[ type ] !== 'undefined' ? self.text.cta[ type ] : name; 
  var obj = {
    meta: {
      type: type,
      id: "ad-" + type + "-" + self.app.idPer[type],
      name: name
    },
    text: {
      elem: elemText
    }
  }

  self.createElem_( obj );
};

/*=== Create Elem ==========================================*/
gen.prototype.createElem_ = function( presets, options ) {
  var self = this;
  var settings = {
    insert: "append"
  };
  if(options) {
    $.extend(settings, options);
  };
  var obj = self.createElemObj_( presets, settings );

  self.setElemHtml_( obj, settings );
  self.setLayerHtml_( obj );
  self.setOptionsHtml_( obj );
  self.setFocus_( obj );

  var functionName = 'create' + capitaliseFirstLetter( obj.meta.type ) + '_';
  if( typeof self[ functionName ] === 'function') {
    self[ functionName ]( obj );
  } 
};

/*=== Create Elem Obj ==========================================*/
gen.prototype.createElemObj_ = function( presets, settings ) {
  var self = this;
  var obj = {
    meta: {
      type: null,
      id: null,
      parent: null,
    },
    visibility: 'visible',
    locked: false,
    text: {
      elem: self.text.element,
      layer: self.text.layer,
    },
    style: {
      top:  0,
      left: 0,
      opacity: 1
    },
    override: {
      style: {}
    },
    settings: {},
    dom: {},
    elems: []
  };

  if(presets) {
    $.extend( true, obj, presets );
  }
  if(obj.meta.type !== null) {
    $.extend( true, obj, self.app.settings[ obj.meta.type ] );
  }

  $.extend( true, obj, obj.initial );

  var parent = self.ad;
  if( obj.meta.parent !== null ) {
    parent = self.getObjById_( obj.meta.parent );
  }

  if( settings.insert === "append" ) {
    parent.elems.push( obj );
  } else {
    parent.elems.unshift( obj );
  }

  self.updateIdPerInteractivity_( obj.meta.type );

  if( settings.callback ) {
    self[settings.callback]( obj );
  }

  return obj;
};

/*=== Update Id Per Interactivity ==========================================*/
gen.prototype.updateIdPerInteractivity_ = function( interactivity ) {
  var self = this;
  self.app.idPer[ interactivity ] = self.app.idPer[ interactivity ] + 1;
};

/*=== Set Elem HTML ==========================================*/
gen.prototype.setElemHtml_ = function( obj, settings ) {
  var self = this;
  var template = Mustache.render( self.app.templates.basic, obj );
  var html = $(template).append( self.app.templates[ obj.meta.type ] );
  var parent = self.dom.adContent;
  if( obj.meta.parent !== null ) {
    parent = self.getObjById_( obj.meta.parent );
    parent = parent.dom.elem;
  }
  if( settings.insert === "append" ) {
    parent.append( html );
  } else {
    parent.prepend( html );
  }
  
  obj.dom.elem = parent.find('[data-id="' + obj.meta.id + '"]');

  self.initAdElemDrag_( obj );
};

/*=== Init Elem Drag ==========================================*/
gen.prototype.initAdElemDrag_ = function( obj ) {
  var self = this;
  obj.dom.elem.draggable({
    start: function() {
      self.setFocus_( obj );
    },
    drag: function() {
      self.updateObjStyle_( obj, {
        'top':  $(this).position().top,
        'left': $(this).position().left
      });
      self.setOptionsInputValue_( 'top' );
      self.setOptionsInputValue_( 'left' );
    },
    stop: function() {
      self.updateStyle_( obj, {
        top:  $(this).position().top,
        left: $(this).position().left
      })
      self.setFocus_( obj );
    }
  });
};

/*=== Set Options HTML ==========================================*/
gen.prototype.setOptionsHtml_ = function( obj ) {
  var self = this;
  var construct = {
    elem: obj,
    text: self.text
  };

  var html = Mustache.render( self.app.templates.options[ obj.meta.type ], construct, {
    theme: self.app.templates.options.partials.theme,
    align: self.app.templates.options.partials.align,
    position: self.app.templates.options.partials.position,
    dimensions: self.app.templates.options.partials.dimensions
  });

  self.dom.elemOptions.append( html );
  self.dom.options = self.dom.elemOptions.find('[data-id="' + obj.meta.id + '"]');
};

/*=== Verify if Parent Can Receive Children ======================================*/
gen.prototype.verifyIfParentCanReceiveChildren_ = function( item, parent ) {
  var self = this;

  if(parent) {
    var type = self.app.focusedObj.meta.type;
    var accept = null;
    if(typeof parent.data( 'accept' ) !== 'undefined') {
      accept = parent.data( 'accept' );
    }

    if( type && accept && accept.indexOf( type ) !== -1 ) {
      parent.removeClass('no-children');
      return true;
    } else {
      parent.addClass('no-children');
      return false;
    }
  } else {
    return true;
  }
};

/*=== Update Position According To Parent ======================================*/
gen.prototype.updatePositionAccordingToParent_ = function( obj ) {
  var self = this;
  var parentPosition = {
    top:  0,
    left: 0
  };

  var parent = self.getObjById_( obj.meta.parent );
  if(parent) {
    parentPosition = {
      top:  parent.style.top,
      left: parent.style.left
    };
  }

  var position = {
    top:  self.getElemAbsolutePosition_( obj ).top - parentPosition.top,
    left: self.getElemAbsolutePosition_( obj ).left - parentPosition.left
  };

  self.updateStyle_(obj, {
    top:  position.top,
    left: position.left
  });
};

/*=== Get Elem Absolute Position ==========================================*/
gen.prototype.getElemAbsolutePosition_ = function( obj ) {
  var self = this;
  var position = {
    top:  obj.dom.elem.offset().top - self.dom.adContent.offset().top,
    left: obj.dom.elem.offset().left - self.dom.adContent.offset().left
  };
  return position;
};

/*=== Toggle Visibility =====================================*/
gen.prototype.toggleVisibility_ = function( elem ) {
  var self = this;
  var id = elem.data('id');
  var obj = self.getObjById_( id );

  if(obj.visibility === "visible") {
    obj.visibility = 'hidden';
    obj.dom.layer.addClass('layer--invisible');
    obj.dom.elem.css('display', 'none');
  } else {
    obj.visibility = 'visible';
    obj.dom.layer.removeClass('layer--invisible');
    obj.dom.elem.css('display', 'block');
  }
};

/*=== Set Focus =====================================*/
gen.prototype.setFocus_ = function( obj ) {
  var self = this;

  //console.log("%cFocus: " + obj.meta.id, "background: yellow;")
  self.dom.adContent.find('.focus').removeClass('focus');
  self.dom.layers.find('.focus').removeClass('focus');
  self.dom.elemOptions.find('.focus').removeClass('focus');

  if( obj ) {
    self.app.focusedObj = obj;
    obj.dom.elem.addClass('focus');
    obj.dom.layer = $('.layer[data-id="'+ obj.meta.id +'"]');
    obj.dom.layer.addClass('focus');
    obj.dom.options = $('.options[data-id="'+ obj.meta.id +'"]');
    obj.dom.options.addClass('focus');
  } else {
    self.app.focusedObj = null;
  }

  self.updateEraseIcon_();
  self.updateLockIcon_();
  self.updateOpacityValue_();
};

/*=== Get Obj By Id =============================*/
gen.prototype.getObjById_ = function( id, array ) {
  var self = this;
  if(!array) array = self.ad.elems;

  for(var x=0; x<array.length; x++ ) {
    if( typeof( array[x] ) === 'object' ) {
      if( array[x].meta.id === id ) {
        return array[x];
      } 
    
      var found = self.getObjById_( id, array[x].elems );
      if (found) return found;
    }  
  }
};

/*=== Remove Obj by Id From Array =============================*/
gen.prototype.removeObjByIdFromArray_ = function( id, array ) {
  var self = this;
  if(!array) array = self.ad.elems;

  for(var x=0; x<array.length; x++ ) {
    if( typeof( array[x] ) === 'object' ) {
      if( array[x].meta.id === id ) {
        array.splice(x,1);
        return false;
      }

      var found = self.removeObjByIdFromArray_( id, array[x].elems );
      if (found) return found;
    } 
  }
};

/*=== Update Style According to Options Input =========================*/
gen.prototype.updateStyleAccordingToOptionsInput_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var value = self.normalizeValueForObj_( prop, input.val() );
  var obj = self.getObjById_( options.data('id') ); 
  var linked = input.data('linked');
  var callback = input.data('callback');
  var style = {};


  style[prop] = value;
  if(linked) {
    style[linked] = self.value;
  }
  self.updateStyle_( obj, style);

  if(callback) {
    self[callback]( obj );
  }
};

/*=== Update Prop =============================*/
gen.prototype.updateStyle_ = function( obj, style ) {
  var self = this;

  /* Garder ligne/commentaire si dessous pour débugage */
  //console.table( [$.extend( {}, {'objet': obj.meta.name}, style)] );

  self.updateObjStyle_(obj, style);
  for(var property in style) {
    var cssValue = self.normalizeValueForCss_( property, style[property] );
    obj.dom.elem.css( property, cssValue );
    self.setOptionsInputValue_( property, obj );

    if(property === 'backgroundImage') {
      self.updateLayerPreview_( obj );
    }
  }
};

/*=== Update Obj Style =============================*/
gen.prototype.updateObjStyle_ = function( obj, style ) {
  var self = this;
  if( obj && style) {
    $.extend( obj.style, style);
  }
};

/*=== Normalize Value For Css ==========================================*/
gen.prototype.normalizeValueForObj_ = function( prop, value ) {
  var self = this;

  if( $.inArray( prop, self.props.int ) !== -1 ) {
    value = parseInt( value );
  }
  return value;
};

/*=== Normalize Value For Css ==========================================*/
gen.prototype.normalizeValueForCss_ = function( prop, value ) {
  var self = this;

  if( $.inArray( prop, self.props.int ) !== -1 ) {
    value = value + "px";
  } else if(prop === "backgroundImage") {
    value = 'url(' + value + ')';
  }
  return value;
};

/*=== Set Options Input Value ==========================================*/
gen.prototype.setOptionsInputValue_ = function( prop, obj ) {
  var self = this;
  obj = typeof obj !== 'undefined' ? obj : self.app.focusedObj;

  if( obj.dom.options ) {
    var input = obj.dom.options.find( '[data-prop="' + prop + '"]' );
    if(input) {
      input.val( obj.style[prop] );
    }
  }
};

gen.prototype.updateReadonly_ = function( props, obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;

  $.extend( obj.readonly, props);

  for(var property in props) {
    var input = obj.dom.options.find('.row.' + property);
    if(input) {
      if(props[ property ] === true) {
        input.addClass('disabled');
      } else {
        input.removeClass('disabled');
      }
    }
  }
};

//@prepros-append partials/shortcuts.js
//@prepros-append partials/layers.js
//@prepros-append partials/erase.js
//@prepros-append partials/align.js
//@prepros-append partials/lock.js
//@prepros-append partials/opacity.js
//@prepros-append partials/colors.js
//@prepros-append partials/theme.js

//@prepros-append interactivities/image.js
//@prepros-append interactivities/gallery.js