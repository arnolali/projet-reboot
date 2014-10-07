/*=== Update Key Pressed =============================*/
gen.prototype.updateKeyPressed_ = function( e ) {
  var self = this;

  if(e) {
    if(e.which === 17) { // ctrl
      self.app.keyPressed.ctrl = true;
      console.log('ctrl');
    }

    if(e.target.nodeName !== 'INPUT' || e.target.nodeName !== 'TEXTAREA') {
      if(e.which === 88) { // x
        self.colorsFlip_();
      }
    }
  } else {
    self.app.keyPressed.ctrl = false;
  }
};

/*=== Verify Enter ==========================================*/
gen.prototype.verifyEnter_ = function( e ) {
  var self = this;
  if(e.keyCode == 13) {
    e.preventDefault();
    $(':focus').blur();
  }
};