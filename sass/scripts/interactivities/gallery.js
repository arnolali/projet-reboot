gen.prototype.updateGallery_ = function( parent ) {
  var self = this;

  self.updateGalleryDimensions_( parent, parent.elems[0] );
  self.updateGalleryChildrenPosition_( parent );
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

    obj.dom.elem.draggable( 'disable' );
  }
};