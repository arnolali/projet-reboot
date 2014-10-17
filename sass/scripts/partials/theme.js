/*=== Update Theme Icon ==========================================*/
gen.prototype.updateThemeIcon_ = function( newThemeSelected ) {
  var self = this;
  var themes = self.app.focusedObj.dom.options.find('.themes');
  var currentThemeSelected = themes.find('.selected');

  currentThemeSelected.removeClass('selected');
  if(newThemeSelected) {
    newThemeSelected.addClass('selected');

    var theme = self.getIconThemeData_( newThemeSelected );
    self.updateTheme_( theme );
  }
}

/*=== Get Icon Theme =============================================*/
gen.prototype.getIconThemeData_ = function( icon ) {
  var self = this;
  var theme = {
    template: null,
    colors: null,
    colorsSensible: false
  };

  if( icon.attr('data-template') ) {
    theme.template = icon.data( 'template' );
  }

  if( icon.attr('data-colorsSensible') ) {
    theme.colorsSensible = true;
  }

  if( icon.attr('data-colors') ) {
    var colorsArr = colorsStrToArray( icon.data( 'colors' ) );
    theme.colors = self.colorsArraytoObj_( colorsArr );
  } else {
    theme.colors = self.getColors_();
  }
  
  return theme;
};

/*=== Update Theme ==================================================*/
gen.prototype.updateTheme_ = function( theme, obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;

  self.updateObjTheme_( obj, theme );
  self.updateElemTheme_( obj );
};

/*=== Update Obj Theme =============================================*/
gen.prototype.updateObjTheme_ = function( obj, theme ) {
  var self = this;
  $.extend( obj.theme, theme);
};

/*=== Update Elem Theme  ==========================================*/
gen.prototype.updateElemTheme_ = function( obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;
  var backgroundColor = 'transparent';
  var backgroundImage = 'none';
  var functionName = 'update' + hyphensToCamelCase( capitaliseFirstLetter( obj.meta.type ) ) + 'Theme_';
  
  if( typeof self[ functionName ] === 'function' ) { // Update via function
    self[ functionName ]( obj );
  } else if( obj.theme.template && obj.theme.template !== null ) { // Update template image
    var icon = Mustache.render( self.app.templates.icons[obj.theme.template], obj.theme.colors );
    obj.dom.elem.removeClass('empty');

    self.updateStyle_(obj, {
      backgroundColor: 'transparent',
      backgroundImage: svgToBase64( icon )
    });
  } else { // Reset empty look
    obj.dom.elem.addClass('empty');

    self.updateStyle_(obj, {
      backgroundColor: obj.settings.color.rgba,
      backgroundImage: 'none'
    });
  }
};