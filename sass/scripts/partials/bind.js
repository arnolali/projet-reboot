//=== BIND START =====================================================
gen.prototype.bindEvents_ = function() {
  var self = this;

  $(document).on('keydown', function(e) {
    self.updateKeyPressed_( e );
  });

  $(document).on('keyup', function() {
    self.updateKeyPressed_();
  });

  $(document).on('dragover', function() {
    clearTimeout(window.timer);
    self.detectDragOver_( true );
  });

  $(document).on('dragleave drop', function() {
    window.timer = setTimeout(function() {
      self.detectDragOver_( false );
    }, 200);
  });

  self.dom.form.on('keypress', function(e) {
    self.verifyEnter_( e );
  });

  self.dom.interactivitiesToolbar.on('click', '.js-create-ad-elem', function() {
    self.createElemByType_( $(this) );
  });

  self.dom.layers.on('click', '.js-toggle-layer-visibility', function() {
    self.toggleVisibility_( $(this).closest('.layer') );
  });

  self.dom.layers.on('click', function() {
    self.setFocus_();
  });

  self.dom.layers.on('click', '.layer', function(e) {
    e.stopImmediatePropagation();
    self.updateLayerFocus_( $(this) );
  });

  self.dom.lock.on('click', function(e) {
    e.stopImmediatePropagation();
    self.toggleLockElem_();
  });

  self.dom.opacity.on('change', function() {
    self.updateElemOpacity_();
  });

  self.dom.askErase.on('click', function() {
    self.askErase_();
  });

  self.dom.form.on('click', '.js-erase', function() {
    self.erase_();
  });

  self.dom.colorsFlip.on('click', function() {
    self.colorsFlip_();
  });

  self.dom.form.on('click', '.js-close-popup', function() {
    self.closePopup_( $(this).closest('.popup') );
  });

  self.dom.adContent.on('change', '.js-dropzone', function() {
    self.getImgFormInput_( $(this) );
  });

  self.dom.elemOptions.on('click', '.js-change-theme', function() {
    self.updateThemeIcon_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-style', function() {
    self.updateStyleAccordingToOptionsInput_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-elem-setting', function() {
    self.updateElemSetting_( $(this) );
  });

  self.dom.elemOptions.on('change', '.js-update-obj-url', function() {
    self.updateObjUrl_( $(this) );
  });

  self.dom.elemOptions.on('click', '.js-align-elem', function() {
    self.alignElem_( $(this).data('position') );
  });
};