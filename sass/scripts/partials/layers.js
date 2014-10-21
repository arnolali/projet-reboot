/*=== Init Layer Sortable ==========================================*/
gen.prototype.initLayersSortable_ = function() {
  var self = this;
  self.dom.layers.nestedSortable({
    items: 'li:not(.pin)',
    toleranceElement: '> div',
    opacity: 0.5,
    revert: 0,
    tolerance: 'pointer',
    placeholder: 'layer__placeholder',
    doNotClear: true,
    stop: function(event, ui) {
      var id = ui.item.data( 'id' );
      var obj = self.getObjById_( id );

      self.setFocus_( obj );
      self.updateLayer_( obj );
      self.updateLayersZindex_( self.dom.layers );
    },
    isAllowed: function(item, parent) {
      return self.verifyIfParentCanReceiveChildren_( item, parent );
    }
  });
};

gen.prototype.updateLayer_ = function( obj ) {
  var self = this;
  var obj = obj ? obj : self.app.focusedObj;
  var parentId = obj.dom.layer.parent().closest( 'li' ).data( 'id' );
  var parent = null;
  if( parentId ) {
  	parent = self.getObjById_( parentId );
  }

  if(parent === null) { // À la racine
  	if(obj.meta.parent !== parent) { // Était dans un élément et reviens à la racine
  		parent = self.getObjById_( obj.meta.parent );
  		var previousParent = parent;

  		var functionExitParent = 'update' + capitaliseFirstLetter( previousParent.meta.type ) + 'ChildrenWhenLeaving_';
        if( typeof self[ functionExitParent ] === 'function') {
          self[ functionExitParent ]( obj );
        }

  		obj.meta.parent = null;
  		self.updateLayerParent_( obj, null );

  		var updateParent = 'update' + capitaliseFirstLetter( previousParent.meta.type ) + '_';
  		console.log(updateParent, previousParent);
        if( typeof self[ updateParent ] === 'function') {
          self[ updateParent ]( previousParent );
        }
  	} else { // Change de position, mais reste à la racine

  	}
  } else { // Dans un élément
  	if( obj.meta.parent !== parent.meta.id ) { // Change d'élément

  		if( obj.meta.parent !== null) {
  			var functionExitParent = 'update' + capitaliseFirstLetter( parent.meta.type ) + 'ChildrenWhenLeaving_';
        if( typeof self[ functionExitParent ] === 'function') {
          self[ functionExitParent ]( obj );
        }
  		}
  		
  		obj.meta.parent = parent.meta.id;
  		self.updateLayerParent_( obj, parent );

  		var functionEnterParent = 'update' + capitaliseFirstLetter( parent.meta.type ) + '_';
        if( typeof self[ functionEnterParent ] === 'function') {
          self[ functionEnterParent ]( parent );
        } 
	} else { // Change de position, mais reste dans le même élément
	    var functionUpdateParentChildren = 'update' + capitaliseFirstLetter( parent.meta.type ) + 'Children_';
	    console.log("Change de position, mais reste dans le même élément", functionUpdateParentChildren);
      if( typeof self[ functionUpdateParentChildren ] === 'function') {
        self[ functionUpdateParentChildren ]( parent );
      } 
    }
  }
};

gen.prototype.updateLayerParent_ = function( obj, parent ) {
	var self = this;

	self.removeObjByIdFromArray_( obj.meta.id );
	if( parent === null ) {
		parent = self.ad;
		self.dom.adContent.append( obj.dom.elem );
	} else {

		if( parent.settings.container ) {
			parent.dom.elem.find( '.' + parent.settings.container ).append( obj.dom.elem );
		} else {
			parent.dom.elem.append( obj.dom.elem );
		}
		
	}
    parent.elems.push( obj );
    self.updatePositionAccordingToParent_( obj );
};

/*=== Update Layers Z-Index =====================================*/
gen.prototype.updateLayersZindex_ = function( ol ) {
  var self = this;
  var parent = null;
  var liNbr = ol.children('li').length;

  for(var x=0; x<liNbr; x++) {
    var li = ol.children('li')[x];
    var id = $(li).data('id');
    var obj = self.getObjById_( id );

    if(x === 0) {
      if( obj.meta.parent !== null ) {
        parent = self.getObjById_( obj.meta.parent );
      }
    }

    self.updateStyle_(obj, {
      zIndex: liNbr - x
    });

    if( obj.elems.length ) {
      self.updateLayersZindex_( $(li).children('ol') );
    }
  }

  if(parent !== null) {
    var functionName = 'update' + capitaliseFirstLetter( parent.meta.type ) + 'ChildrenPosition_';
    if( typeof self[ functionName ] === 'function') {
      self[ functionName ]( parent );
    }
  }
};

/*=== Set Layer HTML ==========================================*/
gen.prototype.setLayerHtml_ = function( obj ) {
  var self = this;
  var html = Mustache.render( self.app.templates.layer, obj );
  var parent = obj.meta.parent === null ? self.dom.layers : self.getObjById_( obj.meta.parent );
  if( obj.meta.parent !== null ) {
    parent = parent.dom.layer.children('ol');
  }

  var z = 0;
  if( parent.children('li').length ) {
    var reference = parent.children('li').eq(0);
    var referenceObj = self.getObjById_( reference.data('id') );
    z = parseInt( referenceObj.style.zIndex ) + 1;
  }

  self.updateStyle_( obj, {
    zIndex: z
  });

  parent.prepend( html );

  obj.dom.layer = parent.find('[data-id="' + obj.meta.id + '"]');
  self.updateLayerPreview_( obj );
  self.dom.layers.sortable( 'refresh' );
};


/*=== Update Layer Focus =====================================*/
gen.prototype.updateLayerFocus_ = function( layer ) {
  var self = this;
  var id = layer.data( "id" );
  var obj = self.getObjById_( id );

  self.setFocus_( obj );
};

gen.prototype.updateLayerPreview_ = function( obj ) {
  var self = this;
  var preview = null;

  if( obj.settings.layer.preview ) {
    preview = self.customLayerPreview_( obj );
  } else if( obj.style.backgroundImage ) {
    preview = obj.style.backgroundImage;
  }

  obj.dom.layer.find('.layer__preview').css({
    'background-image': 'url("' + preview + '"), url("' + self.path.images + 'ad-window-tile.png")'
  });
};

gen.prototype.customLayerPreview_ = function( obj ) {
  var self = this;
  var svg = Mustache.render( self.app.templates.previews[obj.settings.layer.preview], obj.theme.colors );
  var preview = svgToBase64( svg );
  return preview;
};

gen.prototype.updateLayerDataAttr_ = function( obj ) {
  var self = this;

  for (var key in obj.data) {
    obj.dom.layer.data( key, obj.data[key] );
  }
}