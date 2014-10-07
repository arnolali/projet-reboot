gen.prototype.askErase_ = function() {
  var self = this;
  console.log(self.app.focusedObj);
  var construct = {
  	text: self.text,
  	obj: self.app.focusedObj
  }
  var html = Mustache.render( self.app.templates.erase, construct );

  self.dom.form.append( html );
};

gen.prototype.erase_ = function() {
  var self = this;

  self.removeObjByIdFromArray_( self.app.focusedObj.meta.id, self.ad.elems );
  self.app.focusedObj.dom.layer.remove();
  self.app.focusedObj.dom.elem.remove();
  self.app.focusedObj = null;
  self.setFocus_();

  self.dom.form.find('.ask-erase').remove();
};

gen.prototype.updateEraseIcon_ = function() {
	var self = this;

	if( self.app.focusedObj !== null ) {
		self.dom.askErase.removeClass('disabled');
	} else {
		self.dom.askErase.addClass('disabled');
	}
}