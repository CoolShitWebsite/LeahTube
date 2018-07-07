let video, currentVideo;

$(document).ready(async function(){
	v = getAllUrlParams().v;
	if (typeof v==='undefined') return M.toast({html: 'YouTube URL Missing!'});
	Server = `https://you-link.herokuapp.com/?url=https://www.youtube.com/watch?v=${v}`;
	Videos = await $.getJSON(Server);
	if (Videos[0].error===true) return M.toast({html: 'Invalid YouTube URL!'});
	for (i = 0; i < Videos.length; i++) {
		vid = Videos[i];
		mime = /video\/(\w+);/gi.exec(vid.type)[1];
		str = `${vid.quality.capitalize()} (${mime.toUpperCase()})`;
		$('.dropdown-content').append(`<li><a onclick="change(${i})">${str}</a></li>`);
	}
	M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {coverTrigger:false});
	preferred = 'hd720';
	i = Videos.findIndex(x => x.id === preferred);
	if (i===-1) i = 0;
	video = $('video');
	video.attr('src', Videos[i].url);
	currentVideo = i;
	video[0].play();
});

function change(id){
	currentTime = video[0].currentTime;
	paused = video[0].paused;
	video.attr('src', Videos[id].url);
	video[0].currentTime = currentTime;
	if (paused===false) video[0].play();
}




//from https://www.sitepoint.com/get-url-parameters-with-javascript/
function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      //paramName = paramName.toLowerCase();
      //paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

//from https://stackoverflow.com/a/3291856
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}