gen.prototype.colorsFlip_ = function() {
  var self = this;
  var input = self.dom.colors.find('.input-color');
  input.toggleClass('front back');

  self.updateColorsRelated_(); 
};

/*=== Init Color Input ==========================================*/
gen.prototype.initColorInput_ = function( interactivity ) {
  var self = this;
  $('.input-color').colpick({
    layout:'rgbhsbhex',
    color:'ffffff',
    onSubmit:function(hsb,hex,rgb,el) {
      $(el).css('background-color', '#' + hex);
      $(el).colpickHide();

      self.updateColorsRelated_();
    },
  });
};

gen.prototype.updateColorsRelated_ = function() {
  var self = this;
  if( self.app.focusedObj.theme && self.app.focusedObj.theme.colorsSensible ) {
    var colors = self.getColors_();
    self.updateTheme_({
      colors: colors
    });
    console.log( colors );
  } 
};

gen.prototype.getColors_ = function() {
  var self = this;
  var colors = {
    no0: self.dom.colors.find('.front').css('background-color'), 
    no1: self.dom.colors.find('.back').css('background-color')
  };
  return colors;
};

gen.prototype.colorsArraytoObj_ = function( arr ) {
  var self = this;
  var obj = {}

  for(var x=0; x<arr.length; x++) {
    obj['no' + x] = arr[x];
  }

  return obj;
}