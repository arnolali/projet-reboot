/*=== Update Link Theme ==================================================*/
gen.prototype.updateLinkTheme_ = function( icon ) {
  var self = this;
  var options = icon.closest('.options');
  var id = options.data('id');
  var obj = self.getObjById_( id );
  var parent = icon.closest('.theme-selection');
  var currentIcon = parent.find('.selected');

  currentIcon.removeClass('selected');
  icon.addClass('selected');

  obj.dom.elem.removeClass( 'theme-' + obj.settings.theme );
  obj.settings.theme = icon.data( 'value' );
  obj.dom.elem.addClass( 'theme-' + obj.settings.theme );

  self.updateLinkLayerPreview_( obj );
};

/*=== Update Link Layer Preview ==========================================*/
gen.prototype.updateLinkLayerPreview_ = function( obj ) {
  var self = this;
  var preview = obj.dom.layer.find('.layer__wrapper:first .layer__preview');
  if(obj.settings.theme === "light") {
    preview.css('background-image', 'url(public/images/icons/link-light.svg), url(public/images/ad-window-tile.png)');
  } else if(obj.settings.theme === "dark") {
    preview.css('background-image', 'url(public/images/icons/link-dark.svg), url(public/images/ad-window-tile.png)');
  } else {
    preview.css('background-image', 'url(), url(public/images/ad-window-tile.png)');
  }
};