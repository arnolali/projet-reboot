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
      }
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
    int: ["top", "left", "width", "height", "zIndex"] 
  };

  $.when( // Télécharge tous les json externes nécessaires
    $.getJSON( self.path.data + self.app.culture + "/text.json", function(r) { self.text = r; } ),
    $.get( self.path.templates + "_interactivities/basic.mustache", function(r) { self.app.templates.basic = r; } ),
    $.get( self.path.templates + "_partials/layer.mustache", function(r) { self.app.templates.layer = r; } ),
    $.get( self.path.templates + "/_options/_partials/position.mustache", function(r) { self.app.templates.options.partials.position = r; } ),
    $.get( self.path.templates + "/_options/_partials/dimensions.mustache", function(r) { self.app.templates.options.partials.dimensions = r; } )
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
    opacity: $('.js-opacity-elem'),
  };
};

//=== INIT START =====================================================
gen.prototype.init_ = function(pObj) {
  var self = this;

  self.detectOs_();
  self.detectBrowser_();
  self.isAdblockActive_();
  self.initInteractivitiesRelated_();
  self.initLayersSortable_();
  self.initDragElemOptions_();
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

  $(document).on('dragover', function(e) {
    clearTimeout(window.timer);
    self.detectDragOver_( true );
  });

  $(document).on('dragleave drop', function(e) {
    window.timer = setTimeout(function() {
      self.detectDragOver_( false );
    }, 200);
  });

  self.dom.form.on('keypress', function(e) {
    self.verifyEnter_( e );
  });

  self.dom.interactivitiesToolbar.on('click', '.js-create-ad-elem', function() {
    self.createElem_( $(this) );
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

  self.dom.adContent.on('change', '.js-dropzone', function() {
    self.getImgFormInput_( $(this) );
  });

  self.dom.elemOptions.on('click', '.js-change-link-theme', function() {
    self.updateLinkTheme_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-style', function() {
    self.updateStyleAccordingToOptionsInput_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-setting', function() {
    self.updateElemSetting_( $(this) );
  });
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

/*=== Init Layer Sortable ==========================================*/
gen.prototype.initLayersSortable_ = function() {
  var self = this;
  self.dom.layers.nestedSortable({
    items: 'li',
    toleranceElement: '> div',
    opacity: 0.5,
    revert: 0,
    tolerance: 'pointer',
    placeholder: 'layer__placeholder',
    stop: function(event, ui) {
      var id = ui.item.data( 'id' );
      var obj = self.getObjById_( id );
      self.setFocus_( obj );
      self.updateParentWhenReceiveChildren_( obj );
      self.dom.layers.find('.no-children').removeClass('.no-children')
    },
    isAllowed: function(item, parent) {
      return self.verifyIfParentCanReceiveChildren_( item, parent );
    }
  });
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
  $.get( self.path.templates + "_interactivities/" + interactivity + ".mustache")
  .done(function(r) { 
    self.app.templates[ interactivity ] = r; 
  });
};

/*=== Get Interactivity Options Template ====================================*/
gen.prototype.getInteractivityOptionsTemplate_ = function( interactivity ) {
  var self = this;
  $.get( self.path.templates + "_options/" + interactivity + ".mustache" )
  .done(function(r) { 
    self.app.templates.options[ interactivity ] = r; 
  });
};

/*=== Get Interactivity Settings ==========================================*/
gen.prototype.getInteractivitySettings_ = function( interactivity ) {
  var self = this;
  $.getJSON( self.path.settings + interactivity + ".json")
  .done(function(r) { 
    self.app.settings[ interactivity ] = r; 
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

/*=== Create Elem ==========================================*/
gen.prototype.createElem_ = function( btn ) {
  var self = this;
  var type = btn.data('type');
  var id = "ad-" + type + "-" + self.app.idPer[type];
  var name = self.text[ type ] + " " + self.app.idPer[type];

  var obj = {
    meta: {
      type: type,
      id: id,
      parents: null,
    },
    visibility: 'visible',
    locked: false,
    text: {
      elem: self.text.cta[ type ],
      layer: name,
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

  $.extend( obj.style, self.app.settings[ type ].style );
  $.extend( obj.settings, self.app.settings[ type ].settings );

  self.updateIdPerInteractivity_( type );
  self.ad.elems.push( obj );
  self.setElemHtml_( obj );
  self.setLayerHtml_( obj );
  self.setOptionsHtml_( obj );
  self.setFocus_( obj );
};

/*=== Update Id Per Interactivity ==========================================*/
gen.prototype.updateIdPerInteractivity_ = function( interactivity ) {
  var self = this;
  self.app.idPer[ interactivity ] = self.app.idPer[ interactivity ] + 1;
};

/*=== Set Elem HTML ==========================================*/
gen.prototype.setElemHtml_ = function( obj ) {
  var self = this;
  var template = Mustache.render( self.app.templates.basic, obj );
  var html = $(template).append( self.app.templates[ obj.meta.type ] );
  
  self.dom.adContent.append( html );
  obj.dom.elem = self.dom.adContent.find('[data-id="' + obj.meta.id + '"]');

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

/*=== Set Layer HTML ==========================================*/
gen.prototype.setLayerHtml_ = function( obj ) {
  var self = this;
  var html = Mustache.render( self.app.templates.layer, obj );

  self.dom.layers.prepend( html );
  obj.dom.layer = self.dom.layers.find('[data-id="' + obj.meta.id + '"]');
};

/*=== Set Options HTML ==========================================*/
gen.prototype.setOptionsHtml_ = function( obj ) {
  var self = this;
  var construct = {
    elem: obj,
    text: self.text
  };

  var html = Mustache.render( self.app.templates.options[ obj.meta.type ], construct, {
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
    var accept = parent.data('accept');
    var type = self.app.focusedObj.meta.type;

    if( type && accept.indexOf( type ) !== -1 ) {
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

/*=== Update Parent When Receive Children ======================================*/
gen.prototype.updateParentWhenReceiveChildren_ = function( obj ) {
  var self = this;

  if( obj ) {
    var id = obj.dom.layer.parent().closest( 'li' ).data( 'id' );
  
    if(id) {
      var parent = self.getObjById_( id );

      if(obj.meta.parent !== parent.meta.id) {
        obj.meta.parent = parent.meta.id;

        self.removeObjByIdFromArray_( obj.meta.id );
        parent.elems.push( obj );

        self.updatePositionAccordingToParent_( obj );
        parent.dom.elem.append( obj.dom.elem );

        var functionName = 'update' + capitaliseFirstLetter( parent.meta.type ) + '_';
        if( typeof self[ functionName ] === 'function') {
          self[ functionName ]( parent );
        } 
      }
    } else {
      if(obj.meta.parent !== null) {
        obj.meta.parent = null;

        self.removeObjByIdFromArray_( obj.meta.id );
        self.ad.elems.push( obj );

        self.updatePositionAccordingToParent_( obj );
        self.dom.adContent.append( obj.dom.elem );
      }
    }
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

/*=== Update Layers Z-Index =====================================*/
gen.prototype.updateLayersZindex = function() {
  var self = this;
  var layersArr = self.dom.layers.nestedSortable('toArray', {attribute: 'data-id'}).reverse();
  console.log(layersArr);

  for(var x=0; x<layersArr.length; x++) {
    var obj = self.getObjById_( layersArr[x] );
    if( obj ) {
      self.updateObjStyle_( obj, {'zIndex': x} );
      obj.dom.elem.css('zIndex', x);
    }
  }
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

  self.updateLockIcon_();
  self.updateOpacityValue_();
};

/*=== Update Layer Focus =====================================*/
gen.prototype.updateLayerFocus_ = function( layer ) {
  var self = this;
  var id = layer.data( "id" );
  var obj = self.getObjById_( id );
  console.log(layer);

  self.setFocus_( obj );
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
    if( array[x].meta.id === id ) {
      array.splice(x,1);
      return false;
    } else {
      if( array[x].elems) {
        self.removeObjByIdFromArray_( id, array[x] );
      }
    }
  }
};

/*=== Update Style According to Options Input =========================*/
gen.prototype.updateStyleAccordingToOptionsInput_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var value = input.val();
  var obj = self.getObjById_( options.data('id') );
  var prop = input.data('prop');
  var linked = input.data('linked');
  var style = {};

  style[prop] = value;
  if(linked) {
    style[linked] = value;
  }
  self.updateStyle_( obj, style);
};

/*=== Update Key Pressed =============================*/
gen.prototype.updateKeyPressed_ = function( e ) {
  var self = this;

  if(e) {
    if(e.which === 17) {
      self.app.keyPressed.ctrl = true;
      console.log('ctrl');
    }
  } else {
    self.app.keyPressed.ctrl = false;
  }
};

/*=== Verify Enter ==========================================*/
gen.prototype.verifyEnter_ = function( e ) {
  var self = this;
  if(e.keyCode == 13) {
    e.preventDefault();
    $(':focus').blur();
  }
};

/*=== Update Prop =============================*/
gen.prototype.updateStyle_ = function( obj, style ) {
  var self = this;

  console.log('%cUpdate style: ' + obj.meta.id, "background: yellow;");
  console.table([style]);

  self.updateObjStyle_(obj, style);
  for(var property in style) {
    var cssValue = self.normalizeValueForCss_( property, style[property] );
    obj.dom.elem.css(property, cssValue );
    self.setOptionsInputValue_( property, obj );
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

  var input = obj.dom.options.find( '[data-prop="' + prop + '"]' );
  if(input) {
    input.val( obj.style[prop] );
  }
};


//@prepros-append _partials/lock.js
//@prepros-append _partials/opacity.js

//@prepros-append _partials/image.js
//@prepros-append _partials/link.js
//@prepros-append _partials/gallery.js