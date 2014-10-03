/*=== Update Elem Opacity =====================================*/
gen.prototype.updateElemOpacity_ = function() {
  var self = this;
  var opacity = self.dom.opacity.val() / 100;

  self.updateObjStyle_( self.app.focusedObj, {'opacity': opacity} );
  self.app.focusedObj.dom.elem.css('opacity', opacity);
};

/*=== Update Opacity Value =====================================*/
gen.prototype.updateOpacityValue_ = function() {
  var self = this;
  if(self.app.focusedObj === null || self.app.focusedObj.locked === true || self.app.focusedObj.override.locked === true) {
    self.dom.opacity.closest('.layers__opacity').addClass('disabled');
  } else {
    self.dom.opacity.closest('.layers__opacity').removeClass('disabled');

    var opacity = self.app.focusedObj.style.opacity * 100;
    self.dom.opacity.val( opacity );
  }
};