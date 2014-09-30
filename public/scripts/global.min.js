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
  }

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
  }
  $.extend(self.app, defaultApp);

  self.ad = {
    elems: []
  }
  $.extend(self.ad, defaultAd);

  self.props = {
    int: ["top", "left", "width", "height", "zIndex"] 
  }

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
  }
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
    }, 200)
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

  self.dom.lock.on('click', function() {
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

gen.prototype.setOptionsInputValue_ = function( prop ) {
  var self = this;
  var obj = self.app.focusedObj;
  var input = obj.dom.options.find( '[data-prop="' + prop + '"]' );

  input.val( obj.style[prop] );
};

gen.prototype.updateElemStyle_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var linked = input.data('linked');
  var rawValue = self.forceTypePerProp_( prop, input.val() );
  var value = rawValue.value;
  var unit = rawValue.unit;
  var obj = self.getObjByProp_( options.data('id') );
  var style = {};

  style[prop] = value;

  self.updateObjStyle_( obj, style );
  obj.dom.elem.css(prop, (value + unit) );
  if(linked) {
    self.updateLinked_( obj, linked, value);
  }
};

gen.prototype.updateLinked_ = function( obj, prop, value ) {
  var self = this;
  var rawValue = self.forceTypePerProp_( prop, value );
  var value = rawValue.value;
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

gen.prototype.updateElemSetting_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var obj = self.getObjByProp_( options.data('id') );

  obj.settings[prop] = input.val();
};

gen.prototype.forceTypePerProp_ = function( prop, value ) {
  var self = this;
  var unit = "";

  if( $.inArray( prop, self.props.int ) !== -1 ) {
    value = parseInt( value );
    unit = "px";
  }
  return {'value': value, 'unit': unit};
};

gen.prototype.updateLinkTheme_ = function( icon ) {
  var self = this;
  var options = icon.closest('.options');
  var id = options.data('id');
  var obj = self.getObjByProp_( id );
  var parent = icon.closest('.theme-selection');
  var currentIcon = parent.find('.selected');

  currentIcon.removeClass('selected');
  icon.addClass('selected');

  obj.dom.elem.removeClass( 'theme-' + obj.settings.theme );
  obj.settings.theme = icon.data( 'value' );
  obj.dom.elem.addClass( 'theme-' + obj.settings.theme );

  self.updateLinkLayerPreview_( obj );
};

gen.prototype.updateLinkLayerPreview_ = function( obj ) {
  var self = this;
  var preview = obj.dom.layer.find('.layer__wrapper:first .layer__preview');
  if(obj.settings.theme === "light") {
    preview.css('background-image', 'url(public/images/icons/link-light.svg), url(public/images/ad-window-tile.png)');
  } else if(obj.settings.theme === "dark") {
    preview.css('background-image', 'url(public/images/icons/link-dark.svg), url(public/images/ad-window-tile.png)');
  } else {
    preview.css('background-image', 'url(), url(public/images/ad-window-tile.png)');
  }
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
    handle: 'div',
    items: 'li',
    toleranceElement: '> div',
    forcePlaceholderSize: true,
    helper: "clone",
    opacity: 0.5,
    revert: 0,
    tolerance: 'pointer',
      toleranceElement: '> div',
      expandOnHover: 700,
    stop: function(event, ui) {
      var id = ui.item.data('id');
      var obj = self.getObjByProp_( id );
      console.log(obj);
      self.setFocus_( obj );
      self.updateLayersZindex();
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
  var type = btn.data('instance');
  var id = "ad-" + type + "-" + self.app.idPer[type];
  var name = self.text[ type ] + " " + self.app.idPer[type];

  var obj = {
    meta: {
      instance: type,
      id: id,
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
    settings: {},
    dom: {}
  }

  $.extend( obj.style, self.app.settings[ type ].style );
  $.extend( obj.settings, self.app.settings[ type ].settings );

  self.updateIdPerInteractivity_( type );
  self.ad.elems.push( obj );
  self.setAdElemHtml_( obj );
  self.setLayerElemHtml_( obj );
  self.setOptionsHtml_( obj );
  self.setFocus_( obj );
};

gen.prototype.updateIdPerInteractivity_ = function( interactivity ) {
  var self = this;
  self.app.idPer[ interactivity ] = self.app.idPer[ interactivity ] + 1;
};

/*=== Set Ad Elem ==========================================*/
gen.prototype.setAdElemHtml_ = function( obj ) {
  var self = this;
  var template = Mustache.render( self.app.templates.basic, obj );
  var html = $(template).append( self.app.templates[ obj.meta.instance ] );
  
  self.dom.adContent.append( html );
  obj.dom.elem = self.dom.adContent.find('[data-id="' + obj.meta.id + '"]');

  self.initAdElemDrag_( obj );
};

gen.prototype.initAdElemDrag_ = function( obj ) {
  var self = this;
  obj.dom.elem.draggable({
    containment: "parent",
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

gen.prototype.updateElemInputPos_ = function( obj ) {
  var self = this;
  var input = {
    top: obj.dom.options.find('[data-prop="top"]'),
    left: obj.dom.options.find('[data-prop="left"]')
  }

  if(input.top) {
    input.top.val( obj.style.top );
  }
  if(input.left) {
    input.left.val( obj.style.left );
  }
};

gen.prototype.setLayerElemHtml_ = function( obj ) {
  var self = this;
  var html = Mustache.render( self.app.templates.layer, obj );

  self.dom.layers.prepend( html );
  obj.dom.layer = self.dom.layers.find('[data-id="' + obj.meta.id + '"]');
};

gen.prototype.setOptionsHtml_ = function( obj ) {
  var self = this;
  var construct = {
    elem: obj,
    text: self.text
  }

  var html = Mustache.render( self.app.templates.options[ obj.meta.instance ], construct, {
    position: self.app.templates.options.partials.position,
    dimensions: self.app.templates.options.partials.dimensions
  });

  self.dom.elemOptions.append( html );
  self.dom.options = self.dom.elemOptions.find('[data-id="' + obj.meta.id + '"]');
};


gen.prototype.updateLayersZindex = function() {
  var self = this;
  var layersArr = self.dom.layers.sortable('toArray', {attribute: 'data-id'}).reverse();

  for(var x=0; x<layersArr.length; x++) {
    var obj = self.getObjByProp_( layersArr[x] );
    self.updateObjStyle_( obj, {'zIndex': x} );
    obj.dom.elem.css('zIndex', x);
  }
};

gen.prototype.toggleVisibility_ = function( elem ) {
  var self = this;
  var id = elem.data('id');
  var obj = self.getObjByProp_( id );

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
    self.app.focusedObj = null
  }

  self.updateLockIcon_();
  self.updateOpacityValue_();
};

gen.prototype.updateLayerFocus_ = function( layer ) {
  var self = this;
  var id = layer.data( "id" );
  var obj = self.getObjByProp_( id );
  console.log(layer);

  self.setFocus_( obj );
};

gen.prototype.toggleLockElem_ = function() {
  var self = this;

  if(self.app.focusedObj.locked === false) {
    self.app.focusedObj.locked = true;
    self.app.focusedObj.dom.elem.addClass( 'locked' ).draggable( 'disable' );
    self.app.focusedObj.dom.layer.addClass( 'locked' );
  } else {
    self.app.focusedObj.locked = false;
    self.app.focusedObj.dom.elem.removeClass( 'locked' ).draggable( 'enable' );
    self.app.focusedObj.dom.layer.removeClass( 'locked' );
  }

  self.updateLockIcon_();
};

gen.prototype.updateLockIcon_ = function() {
  var self = this;

  if(self.app.focusedObj === null) {
    self.dom.lock.closest('.layers__lock').addClass('disabled');
  } else {
    self.dom.lock.closest('.layers__lock').removeClass('disabled');

    if(self.app.focusedObj.locked === true) {
      self.dom.lock.addClass('active');
    } else {
      self.dom.lock.removeClass('active');
    }
  }
};

gen.prototype.updateElemOpacity_ = function() {
  var self = this;
  var opacity = self.dom.opacity.val() / 100;

  self.updateObjStyle_( self.app.focusedObj, {'opacity': opacity} );
  self.app.focusedObj.dom.elem.css('opacity', opacity);
};

gen.prototype.updateOpacityValue_ = function() {
  var self = this;
  if(self.app.focusedObj === null) {
    self.dom.opacity.closest('.layers__opacity').addClass('disabled');
  } else {
    self.dom.opacity.closest('.layers__opacity').removeClass('disabled');

    var opacity = self.app.focusedObj.style.opacity * 100;
    self.dom.opacity.val( opacity );
  }
};

/*=== Update Background-image on Elem =============================*/
gen.prototype.getImgFormInput_ = function( input ) {
  var self = this;
  getImgFromInput( input, function( img ) {
    self.updateObjImg_( input, img );
  });
};

gen.prototype.updateObjImg_ = function( input, img ) {
  var self = this;
  var elem = input.closest('[data-id]');
  var obj = self.getObjByProp_( elem.data('id') );

  self.updateObjStyle_( obj, {
    'width':  img.width,
    'height': img.height,
    'backgroundImage': img.base64
  });

  self.updateElemImg_( obj );
  self.updateLayerImg_( obj );
  self.updateOptionsImg_( obj );
};

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

gen.prototype.updateLayerImg_ = function( obj ) {
  var self = this;
  var preview = obj.dom.layer.find('.layer__preview');

  preview.css({
    'background-image': 'url("' + obj.style.backgroundImage + '"), url("' + self.path.images + 'ad-window-tile.png")'
  });
};

gen.prototype.updateOptionsImg_ = function( obj ) {
  var self = this;

  self.setOptionsInputValue_( 'width' );
  self.setOptionsInputValue_( 'height' );
};

gen.prototype.updateObjStyle_ = function( obj, style ) {
  var self = this;
  console.log(obj);
  $.extend( obj.style, style);
};

gen.prototype.getObjByProp_ = function( id ) {
  var self = this;
  var result = self.ad.elems.filter(function( obj ) {
    return obj.meta.id == id;
  });

  return result[0];
};

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