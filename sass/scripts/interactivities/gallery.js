gen.prototype.updateGallery_ = function( obj ) {
  var self = this;

  obj.ImagesNbr = obj.elems.length;
  obj.reference = obj.elems[0];
  if( obj.exist.pager ) {
    obj.ImagesNbr--;
    obj.reference = obj.elems[1];
  }

  self.updateGalleryDimensions_( obj );
  self.updateGalleryChildrenPosition_( obj );
  self.updateGalleryPager_( obj );
};

gen.prototype.updateGalleryDimensions_ = function( gallery ) {
  var self = this;

  self.updateStyle_(gallery, {
    width:  gallery.reference.style.width,
    height: gallery.reference.style.height
  });
};

gen.prototype.updateGalleryChildrenPosition_ = function( gallery ) {
  var self = this;
  var skip = 0;
  if( gallery.exist.pager ) {
    skip = 1;
  }

  for(var x=0; x<gallery.ImagesNbr; x++) {
    var obj = gallery.elems[x + skip];
    var left = gallery.style.width * ( gallery.ImagesNbr - 1 - ( parseInt( obj.style.zIndex ) - skip ) );

    self.updateStyle_( obj, {
      top:  0,
      left: left
    });

    if(obj.meta.type === 'image') {
      self.updateReadonly_( {position: true}, obj );
      obj.dom.elem.draggable( 'disable' );
    }
  }
};

gen.prototype.updateGalleryPager_ = function( obj ) {
  var self = this;
  var gallery = obj ? obj : self.app.focusedObj;

  if(!gallery.exist.pager && gallery.ImagesNbr >= 2) {
    self.createGalleryPager_( gallery );
    gallery.exist.pager = true;
  }

  if(gallery.exist.pager) {
    var pager = self.getObjById_( gallery.meta.id + '-pager', gallery.elems );
    pager.bullets = gallery.ImagesNbr;

    if(pager.bullets <= 1) {
      gallery.exist.pager = false;
      self.erase_( pager );
    } else {
      self.updateGalleryPagerTheme_( pager );
    }
  }
};

gen.prototype.createGalleryPager_ = function( gallery ) {
  var self = this;

  var obj = {
    meta: {
      type: 'gallery-pager',
      id: gallery.meta.id + '-pager',
      parent: gallery.meta.id,
      name: self.text.pager
    }
  };

  self.createElem_( obj, {
    insert: "prepend",
    callback: "setGalleryPagerDefaultPosition_"
  });
};

gen.prototype.setGalleryPagerDefaultPosition_ = function( obj ) {
  var self = this;
  setTimeout(function() {
    self.alignElem_( 'vertical-bottom', obj);
    self.alignElem_( 'horizontal-middle', obj);
  }, 0)
  
};

gen.prototype.updateGalleryPagerTheme_ = function( pager ) {
  var self = this;
  self.updateStyle_( pager, {
    width: (pager.style.fontSize + 4) * pager.bullets,
    height: pager.style.fontSize
  });

  var constructor = {
    height: pager.style.height,
    padding: pager.style.padding,
    radius: (pager.style.height + pager.style.padding * 2) / 2,
    bullets: []
  };

  for(var x=0; x<pager.bullets; x++) {
    var bullet = {
      size: pager.style.fontSize,
      color: pager.theme.colors.no1
    }
    if(pager.selected === x) {
      bullet.color = pager.theme.colors.no0;
    }
    constructor.bullets.push( bullet );
  }

  var html = Mustache.render( self.app.templates[pager.theme.template], constructor );
  pager.dom.elem.find('.elem__container').html( html );
};