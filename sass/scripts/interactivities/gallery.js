/*=== Update Gallery ==============================================*/
gen.prototype.updateGallery_ = function( obj, deleted ) {
  var self = this;

  console.log(deleted);
  if( deleted ) {
    self.updateGalleryChildrenDeleted_( obj, deleted );
  }

  self.updateGalleryObj_( obj );
  self.updateGalleryPager_( obj );
  self.updateGalleryDimensions_( obj );
  self.updateGalleryChildren_( obj );
};

gen.prototype.updateGalleryChildrenDeleted_ = function( gallery, deleted ) {
  var self = this;
  console.log(deleted);
  if( deleted.meta.type === 'gallery-pager' ) {
    gallery.exist.pager = false;
    gallery.auto.pager = false;
    gallery.canHave.pager = true;
  }
};

/*=== Update Gallery Obj ==============================================*/
gen.prototype.updateGalleryObj_ = function( gallery ) {
  var self = this;

  gallery.ImagesNbr = gallery.elems.length;
  gallery.reference = gallery.elems[0];

  if( gallery.exist.pager ) {
    gallery.ImagesNbr--;
    gallery.reference = gallery.elems[1];
  }
};

/*=== Update Gallery Pager ==============================================*/
gen.prototype.updateGalleryPager_ = function( obj ) {
  var self = this;
  var gallery = obj ? obj : self.app.focusedObj;

  if( !gallery.exist.pager && gallery.ImagesNbr >= 2 && gallery.auto.pager ) {
    self.createGalleryPager_( gallery );
    gallery.exist.pager = true;
  }

  if( gallery.exist.pager ) {
    var pager = self.getObjById_( gallery.meta.id + '-pager', gallery.elems );
    pager.bullets = gallery.ImagesNbr;

    if( pager.bullets <= 1 ) {
      gallery.exist.pager = false;
      self.erase_( pager );
    } else {
      self.updateGalleryPagerTheme_( pager );
    }
  }
};

/*=== Update Gallery Dimensions ==============================================*/
gen.prototype.updateGalleryDimensions_ = function( gallery ) {
  var self = this;

  setTimeout(function() {
    self.updateStyle_(gallery, {
      width:  gallery.reference.style.width,
      height: gallery.reference.style.height
    });
  }, 0)
  
};

/*=== Update Gallery Children ==============================================*/
gen.prototype.updateGalleryChildren_ = function( gallery ) {
  var self = this;
  var skip = 0;
  if( gallery.exist.pager ) {
    skip = 1;
  }

  setTimeout(function() {
    for(var x=0; x<gallery.ImagesNbr; x++) {
      var obj = gallery.elems[x + skip];
      var order = gallery.ImagesNbr - parseInt( obj.style.zIndex );
      var left = gallery.style.width * order;

      console.log( gallery.elems[x + skip].meta.name, parseInt( obj.style.zIndex )  );

      self.updateStyle_( obj, {
        top:  0,
        left: left
      });

      if( obj.meta.type === 'image' ) {
        self.updateReadonly_( {position: true}, obj );
        obj.dom.elem.draggable( 'disable' );
      }
    }
  }, 0)
};

/*=== Create Gallery Pager ==============================================*/
gen.prototype.createGalleryPager_ = function( gallery ) {
  var self = this;

  var obj = {
    meta: {
      type: 'gallery-pager',
      id: gallery.meta.id + '-pager',
      parent: gallery.meta.id,
      name: self.text.pager
    }
  };

  self.createElem_( obj, {
    insert: "prepend",
    callback: "setGalleryPagerDefaultPosition_"
  });
};

/*=== Set Gallery Pager Default Position ==============================================*/
gen.prototype.setGalleryPagerDefaultPosition_ = function( obj ) {
  var self = this;
  setTimeout(function() {
    self.alignElem_( 'vertical-bottom', obj);
    self.alignElem_( 'horizontal-middle', obj);
  }, 0)
  
};

/*=== Update Gallery Pager Theme ==============================================*/
gen.prototype.updateGalleryPagerTheme_ = function( pager ) {
  var self = this;

  if(pager.theme.colorsSensible) {
    $.extend( pager.theme.colors, self.getColors_() );
  };

  self.updateStyle_( pager, {
    width: (pager.style.fontSize + 4) * pager.bullets,
    height: pager.style.fontSize
  });

  var constructor = {
    height: pager.style.height,
    padding: pager.style.padding,
    radius: (pager.style.height + pager.style.padding * 2) / 2,
    bullets: []
  };

  for(var x=0; x<pager.bullets; x++) {
    var bullet = {
      size: pager.style.fontSize,
      color: pager.theme.colors.no1
    }
    if(pager.selected === x) {
      bullet.color = pager.theme.colors.no0;
    }
    constructor.bullets.push( bullet );
  }

  self.updateLayerPreview_( pager );

  var html = Mustache.render( self.app.templates[pager.theme.template], constructor );
  pager.dom.elem.find('.elem__container').html( html );
};

/*=== Update Gallery Children When Leaving ==============================================*/
gen.prototype.updateGalleryChildrenWhenLeaving_ = function( obj ) {
  var self = this;

  console.log('updateGalleryChildrenWhenLeaving_', obj.meta.name);
  self.updateReadonly_( {position: false}, obj );
  obj.dom.elem.draggable( 'enable' );
};