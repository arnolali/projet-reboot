/*=== Update Link Theme ==================================================*/
gen.prototype.updateLinkTheme_ = function( icon ) {
  var self = this;
  var obj = self.app.focusedObj;

  var theme = obj.dom.options.find('.theme-selection');
  var currentIcon = theme.find('.selected');

  currentIcon.removeClass('selected');

  if(icon) {
    icon.addClass('selected');
  }
  
  obj.settings.theme = icon.data( 'value' );

  self.updateLinkColors_( obj );
};

/*=== Update Link Layer Preview ==========================================*/
gen.prototype.updateLinkColors_ = function( obj ) {
  var self = this;
  var colors = null;
  var backgroundColor = 'transparent';
  var backgroundImage = 'none';

  if(obj.settings.theme === "light") {
    colors = {front: '#575756', back: '#ffffff'};
  } else if(obj.settings.theme === "dark") {
    colors = {front: '#ffffff', back: '#575756'};
  } else if(obj.settings.theme === "free") {
    var front = self.dom.colors.find('.front').css('background-color');
    var back = self.dom.colors.find('.back').css('background-color');
    colors = {front: front, back: back};
  } 

  if(colors !== null) {
    var icon = Mustache.render( self.app.templates.icons.link, colors );
    backgroundImage = svgToBase64( icon );
    obj.dom.elem.removeClass('empty');
  } else {
    backgroundColor = obj.settings.color.rgba;
    obj.dom.elem.addClass('empty');
  }

  self.updateStyle_(obj, {
    backgroundColor: backgroundColor,
    backgroundImage: backgroundImage
  });
};