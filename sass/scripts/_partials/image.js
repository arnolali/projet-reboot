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

  self.updateStyle_( obj, {
    width:  img.width,
    height: img.height,
    backgroundColor: "transparent",
    backgroundImage: img.base64
  });

  obj.dom.elem.removeClass('can-drop');
  self.updateLayerImg_( obj );
};

/*=== Update Layer Img =============================*/
gen.prototype.updateLayerImg_ = function( obj ) {
  var self = this;
  var preview = obj.dom.layer.find('.layer__preview');

  preview.css({
    'background-image': 'url("' + obj.style.backgroundImage + '"), url("' + self.path.images + 'ad-window-tile.png")'
  });
};