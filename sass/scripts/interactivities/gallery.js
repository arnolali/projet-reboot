gen.prototype.createGallery_ = function( obj ) {
  var self = this;
  
};

gen.prototype.updateGallery_ = function( obj ) {
  var self = this;

  self.updateGalleryDimensions_( obj, obj.elems[0] );
  self.updateGalleryChildrenPosition_( obj );

  if( obj.elems.length <= 1 ) {
    if( obj.exist.pager ) {
      var pagerId =  obj.meta.id + '-pager';
      var obj = self.getObjById_( obj, pagerId );


      self.erase_( obj );
    }
  }
  if(!obj.exist.pager && obj.elems.length >= 2) {
    obj.exist.pager = true;
    self.createGalleryPager_( obj );
  }
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
      console.log('readonly');
      self.updateReadonly_( {position: true}, obj );
      obj.dom.elem.draggable( 'disable' );
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