gen.prototype.createGallery_ = function( obj ) {
  var self = this;
  
};

gen.prototype.updateGallery_ = function( obj ) {
  var self = this;
  

  console.log('update gallery', obj);

  self.updateGalleryDimensions_( obj, obj.elems[0] );
  self.updateGalleryChildrenPosition_( obj );
  self.updateGalleryPager_( obj );
  
};

gen.prototype.updateGalleryDimensions_ = function( gallery, obj ) {
  var self = this;

  self.updateStyle_(gallery, {
    width:  obj.style.width,
    height: obj.style.height
  });
};

gen.prototype.updateGalleryChildrenPosition_ = function( gallery ) {
  var self = this;

  for(var x=0; x<gallery.elems.length; x++) {
    var obj = gallery.elems[x];
    var left = gallery.style.width * x;

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

gen.prototype.updateGalleryPager_ = function( gallery ) {
  var self = this;

  var imagesNbr = gallery.elems.length;
  if(gallery.exist.pager) {
    imagesNbr--;
  }

  if(!gallery.exist.pager && imagesNbr >= 2) {
    self.createGalleryPager_( gallery );
    gallery.exist.pager = true;
  }

  if(gallery.exist.pager) {
    var pager = self.getObjById_( gallery.meta.id + '-pager', gallery.elems );

    if(imagesNbr <= 1) {
      gallery.exist.pager = false;
      self.erase_( pager );
    } else {
      self.updateStyle_( pager, {
        width: (pager.style.fontSize + 4) * imagesNbr
      });
      self.updateGalleryPagerBullets_( pager, imagesNbr );
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

  self.createElem_( obj );
};

gen.prototype.updateGalleryPagerBullets_ = function( pager, nbr ) {
  var self = this;
  var html = "";
  for(var x=0; x<nbr; x++) {
    html += Mustache.render( self.app.templates.galleryBullet);
  }
  pager.dom.elem.html( html );
};