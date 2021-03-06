function detectOs() {
    var os = "Windows";
    if (navigator.appVersion.indexOf("Mac") !== -1) os = "Mac";
    return os;
};

function detectBrowser() {
    var ua = navigator.userAgent, tem, 
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if( /trident/i.test( M[1] ) ) {
        tem =  /\brv[ :]+(\d+)/g.exec( ua ) || [];
        return 'IE ' + ( tem[1] || '' );
    }
    if( M[1] === 'Chrome' ){
        tem = ua.match(/\bOPR\/(\d+)/)
        if( tem!= null ) return 'Opera ' + tem[1];
    }
    M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if(( tem = ua.match( /version\/(\d+)/i ) ) != null ) M.splice( 1, 1, tem[1] );
    return M;
};

function capitaliseFirstLetter( string ) {
    return string.charAt(0).toUpperCase() + string.slice(1); // ex: "simon" = "Simon"
};

function uniqueId() {
    return Math.round( new Date().getTime() + ( Math.random() * 100 ) );
};

function getImgFromInput( input, callback ) {
    if(inputContainImg( input )) {
        var file = input.prop("files")[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            $("<img/>").attr("src", e.target.result).load(function() {
                var img = {
                    width: this.width,
                    height: this.height,
                    base64: e.target.result
                }
                callback( img );
            });
        }
        reader.readAsDataURL(file);
    } else {
        callback( false );
    }
};

function inputContainImg( input ) {
    var file = input[0].files[0];
    var type = file.type;
    if(type === "image/gif" || type === "image/jpeg" || type === "image/jpg" || type === "image/png") {
        return true;
    } else {
        return false;
    }
};

function svgToBase64( svg ) {
    var base64 = 'data:image/svg+xml;base64,' + btoa( svg );
    return base64;
};

function hyphensToCamelCase( string ) {
    var camelCased = string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    return camelCased; // ex: "gallery-pager" = "gelleryPager"
};

function colorsStrToArray( string ) {
    return string.split(/(?:,(?=#)|,(?=r))+/); // ex: "rgba(0,0,0,.75), #000000" = ["rgba(0,0,0,.75)", "#000000"]
};

function cleanFilename( file ) {
    var point = file.lastIndexOf('.');
    var name = file.slice( 0, point );
    name = name.replace(/_/g, ' ');
    return name;  // ex: "file_1.jpg" = "file 1"
};

function getDomainFromUrl( url ) {
    var domain = url;
    var matches = url.match( /^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i );
    if( matches && matches[1] ) {
        domain = matches && matches[1];
    }
    return domain; // ex: "http://www.site.ca/section?param1=test" = "site.ca"  
};

function addHttpIfMissing( url ) {
    if( !/^https?:\/\//i.test( url ) ) {
        url = 'http://' + url;
    }
    return url; // ex: "rds.ca" = "http://rds.ca"
};