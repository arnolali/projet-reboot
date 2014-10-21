gen.prototype.updateObjUrl_ = function( input ) {
  var self = this;
  var options = input.closest('.options');
  var prop = input.data('prop');
  var obj = self.getObjById_( options.data('id') );
  var url = addHttpIfMissing( input.val() );
  obj.url = url;
  obj.meta.name = capitaliseFirstLetter( getDomainFromUrl( url ) );
  
  self.updateLayerName_( obj );
};