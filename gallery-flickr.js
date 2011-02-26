YUI.add('gallery-flickr', function(Y){
  Y.Flickr = (function() {    
    /* private functions */
    function processResult(result) {
      /*
          Process the raw YQL results into something more usable
      */

      // something went wrong with the YQL query
      if(result.error || !result.query) {
        alert('YQL query error :( (' + result.error.description + ')');
        return;
      }

      // YQL query was ok, but no results were returned
      if(!result.query.results) {
        alert('No results :(');
        return;
      }

      // We got some results!  Process them and spit them back in a nicer format
      var i,
          len,
          photos = result.query.results.photo,
          output = [];

      for(i=0, len=photos.length; i<len; i++) {
        output.push(toLinkAndURL(photos[i]));
      }

      return output;
    }

    function toLinkAndURL(obj, size) {
      /*
          Convert Flickr-style object to a more useful object with contructed URL paths
      */

      /*
          Example obj:
          {
            farm: "6"
            id: "5432124345"
            isfamily: "0"
            isfriend: "0"
            ispublic: "1"
            owner: "53364079@N06"
            secret: "cc49b7fd81"
            server: "5178"
            title: "DSCN6514"
          }

          Sizes:
          s	small square 75x75
          t	thumbnail, 100 on longest side
          m	small, 240 on longest side
          -	medium, 500 on longest side
          z	medium 640, 640 on longest side
          b	large, 1024 on longest side*
          o	original image, either a jpg, gif or png, depending on source format


          Example output:
          {
            "img": "http://farm5.static.flickr.com/4098/5432793708_ed4d12e02c_s.jpg",
            "imgLarge": "http://farm5.static.flickr.com/4098/5432793708_ed4d12e02c_z.jpg",
            "url": "http://www.flickr.com/photos/12428584@N02/5432793708",
            "title": "Foo"
          ]
      */

      if(!obj) return;
      if(!size) size = 's';

      return {'img': 'http://farm' + obj.farm + '.static.flickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '_' + size + '.jpg',
              'imgLarge': 'http://farm' + obj.farm + '.static.flickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '_z.jpg',
              'url': 'http://www.flickr.com/photos/' + obj.owner + '/' + obj.id,
              'title': obj.title};
    }

    /* public functions */
    function get(config, callback) {
      /*
          Make a Flickr YQL query based on the config

          Example config:
          config = {
            search: 'search string',
            lat: 'latitude',
            lon: 'longitude',
            getRecent: true,
            results: 20
          }

          Credit for the geo/woeid lookup example: http://925html.com/code/photos-around-you/
      */

      config = config || {};

      var query,
          results = config.results || 25,
          searchQuery,
          geoQuery,
          sortQuery; 

      // build portions of the YQL query
      searchQuery = (config.search) ? 'text="' + config.search + '"' : '';
      geoQuery = (config.lat && config.lon) ? ' and woe_id in (select place.woeid from flickr.places where lat=' + config.lat + ' and lon=' + config.lon + ') and radius_units="mi"' : '';
      sortQuery = (config.getRecent) ? ' and sort="date-posted-desc"' : ' and sort="interestingness-desc"';

      // construct a full YQL query
      if(searchQuery) {
        query = 'select * from flickr.photos.search(' + results + ') where ' + searchQuery + geoQuery + sortQuery;
      } else if(!searchQuery && geoQuery) {
        query = 'select * from flickr.photos.search(' + results + ') where ' + geoQuery.substr(5, geoQuery.length - 5) + sortQuery;
      } else {
        // default: lookup from the Recent table
        query = 'select * from flickr.photos.recent(' + results + ')';
      }

      //console.log(query);

      // make the query!
      Y.YQL(query, function(result){
        callback(processResult(result));
      }); 
    }

    return {
      get: get
    }
  })();
}, '1.0', {requires: ['yql']});