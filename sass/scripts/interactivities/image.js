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

  $.extend( obj, obj.populate, true );
  self.updateLayerDataAttr_( obj );

  elem.removeClass('empty');

  self.updateStyle_( obj, {
    width:  img.width,
    height: img.height,
    backgroundColor: "transparent",
    backgroundImage: img.base64
  });
};