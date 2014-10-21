gen.prototype.askErase_ = function( obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;

  var construct = {
  	text: self.text,
  	obj: obj
  }
  var html = Mustache.render( self.app.templates.erase, construct );

  self.dom.form.append( html );
};

gen.prototype.erase_ = function( obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;
  if(obj !== null) {
    if(obj.meta.parent !== null) {
      var parent = self.getObjById_( obj.meta.parent );
      var functionName = 'update' + capitaliseFirstLetter( parent.meta.type ) + '_';
    }
    
    self.removeObjByIdFromArray_( obj.meta.id, self.ad.elems );
    obj.dom.layer.remove();
    obj.dom.elem.remove();
    obj.dom.options.remove();
    self.app.focusedObj = null;
    self.setFocus_();

    if( parent && typeof self[ functionName ] === 'function' ) {
      self[ functionName ]( parent );
    }
  }

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