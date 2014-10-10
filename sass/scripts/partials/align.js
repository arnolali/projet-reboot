gen.prototype.alignElem_ = function( position ) {
  var self = this;
  var obj = self.app.focusedObj;
  var max = {
    top:  self.ad.format.h,
    left: self.ad.format.w
  }
  var pos = {
    top:  obj.style.top,
    left: obj.style.left
  }

  if( obj.meta.parent !== null ) {
    var parent = self.getObjById_( obj.meta.parent );
    var max = {
      top:  parent.style.height,
      left: parent.style.width
    }
  }  

  if(position === 'vertical-top') {
    pos.top = 0;
  } else if(position === 'vertical-middle') {
    pos.top = max.top / 2 - obj.style.height / 2;
  } else if(position === 'vertical-bottom') {
    pos.top = max.top - obj.style.height;
  } else if(position === 'horizontal-left') {
    pos.left = 0;
  } else if(position === 'horizontal-middle') {
    pos.left = max.left / 2 - obj.style.width / 2;
  } else if(position === 'horizontal-right') {
    pos.left = max.left - obj.style.width;
  } 

  self.updateStyle_( obj, pos );
};