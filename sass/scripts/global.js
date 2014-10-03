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
    self.updateElemStyle_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-setting', function() {
    self.updateElemSetting_( $(this) );
  });
};

/*=== Set Options Input Value ==========================================*/
gen.prototype.setOptionsInputValue_ = function( prop ) {
  var self = this;
  var obj = self.app.focusedObj;
  var input = obj.dom.options.find( '[data-prop="' + prop + '"]' );

  input.val( obj.style[prop] );
};

/*=== Update Elem Style ==========================================*/
gen.prototype.updateElemStyle_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var linked = input.data('linked');
  var rawValue = self.forceTypePerProp_( prop, input.val() );
  var value = rawValue.value;
  var unit = rawValue.unit;
  var obj = self.getObjById_( options.data('id') );
  var style = {};

  style[prop] = value;

  self.updateObjStyle_( obj, style );
  obj.dom.elem.css(prop, (value + unit) );
  if(linked) {
    self.updateLinkedStyle_( obj, linked, value);
  }
};

/*=== Update Linked Style ==========================================*/
gen.prototype.updateLinkedStyle_ = function( obj, prop, value ) {
  var self = this;
  var rawValue = self.forceTypePerProp_( prop, value );
  value = rawValue.value;
  var unit = rawValue.unit;
  var input = obj.dom.options.find( '[data-prop="' + prop + '"]' );
  var style = {};

  style[prop] = value;

  if(input) {
    self.updateObjStyle_( obj, style );
    input.val( value );
    obj.dom.elem.css(prop, (value + unit) );
  }
};

/*=== Update Elem Setting ==========================================*/
gen.prototype.updateElemSetting_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var obj = self.getObjById_( options.data('id') );

  obj.settings[prop] = input.val();
};

/*=== Force Type Per Prop ==========================================*/
gen.prototype.forceTypePerProp_ = function( prop, value ) {
  var self = this;
  var unit = "";

  if( $.inArray( prop, self.props.int ) !== -1 ) {
    value = parseInt( value );
    unit = "px";
  }
  return {'value': value, 'unit': unit};
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

gen.prototype.updateGallery_ = function( parent ) {
  var self = this;

  for(var x=0; x<parent.elems.length; x++) {
    var obj = parent.elems[x];
    var reference = parent.elems[0];

    var left = reference.style.width * x;
    self.updateObjStyle_(obj, {
      top:  0,
      left: left
    });

    obj.dom.elem.css({
      top:  obj.style.top + 'px',
      left: obj.style.left + 'px'
    }).draggable( 'disable' );
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
  
  self.updateObjStyle_( obj, position );
  self.updateElemInputPos_( obj );
  obj.dom.elem.css({
    top: position.top + 'px',
    left: position.left + 'px'
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
  $.get( self.path.templates + "_interactivities/" + interactivity + ".mustache", function(r) { 
    self.app.templates[ interactivity ] = r; 
  });
};

/*=== Get Interactivity Options Template ====================================*/
gen.prototype.getInteractivityOptionsTemplate_ = function( interactivity ) {
  var self = this;
  $.get( self.path.templates + "_options/" + interactivity + ".mustache", function(r) { 
    self.app.templates.options[ interactivity ] = r; 
  });
};

/*=== Get Interactivity Settings ==========================================*/
gen.prototype.getInteractivitySettings_ = function( interactivity ) {
  var self = this;
  $.getJSON( self.path.settings + interactivity + ".json", function(r) { 
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
        'top': $(this).position().top,
        'left': $(this).position().left
      });
      self.updateElemInputPos_( obj );
    },
    stop: function() {
      self.updateObjStyle_( obj, {
        'top': $(this).position().top,
        'left': $(this).position().left
      });
      self.updateElemInputPos_( obj );
      self.setFocus_( obj );
    }
  });
};

/*=== Init Elem Drag ==========================================*/
gen.prototype.updateElemInputPos_ = function( obj ) {
  var self = this;
  var input = {
    top: obj.dom.options.find('[data-prop="top"]'),
    left: obj.dom.options.find('[data-prop="left"]')
  };

  if(input.top) {
    input.top.val( obj.style.top );
  }
  if(input.left) {
    input.left.val( obj.style.left );
  }
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

/*=== Update Background-image on Elem =============================*/
gen.prototype.getImgFormInput_ = function( input ) {
  var self = this;
  getImgFromInput( input, function( img ) {
    self.updateObjImg_( input, img );
  });
};

/*=== Update Obj Img =============================*/
gen.prototype.updateObjImg_ = function( input, img ) {
  var self = this;
  var elem = input.closest('[data-id]');
  var obj = self.getObjById_( elem.data('id') );

  self.updateObjStyle_( obj, {
    'width':  img.width,
    'height': img.height,
    'backgroundImage': img.base64
  });

  self.updateElemImg_( obj );
  self.updateLayerImg_( obj );
  self.updateOptionsImg_( obj );
};

/*=== Update Elem Img =============================*/
gen.prototype.updateElemImg_ = function( obj ) {
  var self = this;
  var bg = obj.dom.elem.find('.ad-elem__bg');
  var name = obj.dom.elem.find('.ad-elem__bg__name');
  var input = obj.dom.elem.find('.js-dropzone');

  obj.dom.elem.css({
    'width':  obj.style.width,
    'height': obj.style.height
  }).removeClass('can-drop');

  bg.css({
    'background-color': 'none',
    'background-image': 'url("' + obj.style.backgroundImage + '")'
  });

  name.remove();
};

/*=== Update Layer Img =============================*/
gen.prototype.updateLayerImg_ = function( obj ) {
  var self = this;
  var preview = obj.dom.layer.find('.layer__preview');

  preview.css({
    'background-image': 'url("' + obj.style.backgroundImage + '"), url("' + self.path.images + 'ad-window-tile.png")'
  });
};

/*=== Update Options Img =============================*/
gen.prototype.updateOptionsImg_ = function( obj ) {
  var self = this;

  self.setOptionsInputValue_( 'width' );
  self.setOptionsInputValue_( 'height' );
};

/*=== Update Obj Style =============================*/
gen.prototype.updateObjStyle_ = function( obj, style ) {
  var self = this;
  if( obj && style) {
    $.extend( obj.style, style);
  }
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

//@prepros-append _partials/lock.js
//@prepros-append _partials/opacity.js
//@prepros-append _partials/link.js