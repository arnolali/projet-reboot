/*=== Toggle Lock Elem =====================================*/
gen.prototype.toggleLockElem_ = function() {
  var self = this;

  self.app.focusedObj.locked = self.app.focusedObj.locked === false ? true : false;

  console.log( self.app.focusedObj.locked );
  self.lockHtml_( self.app.focusedObj );

  self.updateLockIcon_();
  self.setFocus_( self.app.focusedObj );
};

/*=== Lock Html =====================================*/
gen.prototype.lockHtml_ = function( obj ) {
  var self = this;

  if(obj.override.locked) {
    obj.dom.elem.addClass( 'locked' ).draggable( 'disable' );
    obj.dom.layer.addClass( 'locked-parent' );
  } else if(obj.locked) {
    obj.dom.elem.addClass( 'locked' ).draggable( 'disable' );
    obj.dom.layer.addClass( 'locked' );
  } else {
    obj.dom.elem.removeClass( 'locked' ).draggable( 'enable' );
    obj.dom.layer.removeClass( 'locked locked-parent' );
  }

  for(var x=0; x<obj.elems.length; x++) {
    obj.elems[x].override.locked = obj.locked;
    self.lockHtml_( obj.elems[x] );
  }
  
};

/*=== Update Lock Icon =====================================*/
gen.prototype.updateLockIcon_ = function() {
  var self = this;

  if(self.app.focusedObj === null || self.app.focusedObj.override.locked === true) {
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