// JavaScript Document
var _g = globals = {};
var gen = gen || {};  //Évite d'overwritter des plugins s'il y en a

gen = function(defaultApp, root, defaultAd) {
  var self = this;
  self.path = { // Path permettant d'accèder aux divers fichiers externes utilisés.
    root:       root,
    data:       root + "data/",
    settings:   root + "public/data/settings/",
    images:     root + 'public/images/',
    libs:       root + "app/libraries/",
    templates:  root + 'app/templates/',
    temps:      root + 'temps/'
  }

  self.app = {
    templates: {},
    idPer: {},
    keyPressed: {
      ctrl: false
    }
  }
  $.extend(self.app, defaultApp);

  self.ad = {
    elems: []
  }
  $.extend(self.ad, defaultAd);

  $.when( //Télécharge tous les json externes nécessaires
    $.getJSON( self.path.data + self.app.culture + "/text.json", function(r) { self.text = r; } ),
    $.get( self.path.templates + "_interactivities/basic.mustache", function(r) { self.app.templates.basic = r; } ),
    $.get( self.path.templates + "_partials/layer.mustache", function(r) { self.app.templates.layer = r; } )
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
    adContent: $('.ad-window__content'),
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
};

/*=== Init Layer Sortable ==========================================*/
gen.prototype.initLayersSortable_ = function() {
  var self = this;
  self.dom.layers.sortable({
    axis: "y",
    opacity: 0.5,
    revert: 0,
    stop: function(event, ui) {
      var id = ui.item.data('obj');
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
    self.initIdPerInteractivity_( interactivity );
  }
};

/*=== Get Interactivity Template ==========================================*/
gen.prototype.getInteractivityTemplate_ = function(interactivity) {
  var self = this;
  $.get( self.path.templates + "_interactivities/" + interactivity + ".mustache", function(r) { 
    self.app.templates[interactivity] = r; 
  });
};

/*=== Init Id Per Interactivity ==========================================*/
gen.prototype.initIdPerInteractivity_ = function(interactivity) {
  var self = this;
  self.app.idPer[interactivity] = 0;
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
    instance: type,
    nbr: self.app.idPer[type],
    id: id,
    name: name,
    visibility: 'visible',
    locked: false,
    style: {
      top:  0,
      left: 0,
      width:  70,
      height: 70,
      opacity: 1
    },
    dom: {}
  }

  self.updateIdPerInteractivity_( type );
  self.ad.elems.push( obj );
  self.setAdElemHtml_( obj );
  self.setLayerElemHtml_( obj );
  self.setFocus_( obj );
};

gen.prototype.updateIdPerInteractivity_ = function( interactivity ) {
  var self = this;
  self.app.idPer[interactivity] = self.app.idPer[interactivity] + 1;
};

/*=== Set Ad Elem ==========================================*/
gen.prototype.setAdElemHtml_ = function( obj ) {
  var self = this;
  var template = Mustache.render( self.app.templates.basic, obj );
  var html = $(template).append( self.app.templates[obj.instance] );
  
  self.dom.adContent.append( html );
  obj.dom.elem = self.dom.adContent.find('[data-obj="' + obj.id + '"]');

  self.initAdElemDrag_( obj );
};

gen.prototype.initAdElemDrag_ = function( obj ) {
  var self = this;
  obj.dom.elem.draggable({
    containment: "parent",
    start: function() {
      self.setFocus_( obj );
    },
    stop: function() {
      self.updateObjStyle_( obj, {
        'top': $(this).position().top,
        'left': $(this).position().left
      });
      self.setFocus_( obj );
    }
  });
};

gen.prototype.setLayerElemHtml_ = function( obj ) {
  var self = this;
  var html = Mustache.render( self.app.templates.layer, obj );

  self.dom.layers.prepend( html );
  obj.dom.layer = self.dom.layers.find('[data-obj="' + obj.id + '"]');

  self.initLayerDrag_( obj );
};

gen.prototype.initLayerDrag_ = function( obj ) {
  var self = this;
  obj.dom.layer.draggable({
    connectToSortable: self.dom.layers,
    containment: "parent"
  });
  self.dom.layers.sortable( "refresh" );
};

gen.prototype.updateLayersZindex = function() {
  var self = this;
  var layersArr = self.dom.layers.sortable('toArray', {attribute: 'data-obj'}).reverse();

  for(var x=0; x<layersArr.length; x++) {
    var obj = self.getObjByProp_( layersArr[x] );
    self.updateObjStyle_( obj, {'zIndex': x} );
    obj.dom.elem.css('zIndex', x);
  }
};

gen.prototype.toggleVisibility_ = function( elem ) {
  var self = this;
  var id = elem.data('obj');
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

  if( obj ) {
    self.app.focusedObj = obj;
    console.log(obj.dom.layer);
    obj.dom.elem.addClass('focus');
    obj.dom.layer.addClass('focus');
  } else {
    self.app.focusedObj = null
  }

  self.updateLockIcon_();
  self.updateOpacityValue_();
};

gen.prototype.updateLayerFocus_ = function( layer ) {
  var self = this;
  var id = layer.data( "obj" );
  var obj = self.getObjByProp_( id );

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

gen.prototype.updateObjStyle_ = function( obj, style ) {
  var self = this;
  $.extend( obj.style, style);
};

gen.prototype.getObjByProp_ = function( id ) {
  var self = this;
  var result = self.ad.elems.filter(function( obj ) {
    return obj.id == id;
  });

  return result[0];
};

gen.prototype.updateKeyPressed_ = function( e ) {
  var self = this;
  console.log(e);
  if(e) {
    if(e.which === 17) {
      self.app.keyPressed.ctrl = true;
      console.log('ctrl');
    }
  
  } else {
    self.app.keyPressed.ctrl = false;
  }
};