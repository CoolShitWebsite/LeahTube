const URLRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

Domain = window.location.origin;
if (Domain==='https://coolshitwebsite.github.io') Domain = 'https://coolshitwebsite.github.io/LeahTube/';

$(document).ready(async function(){
	q = getAllUrlParams().q;
	let page = (getAllUrlParams().p||1);
	if (typeof q==='undefined') return M.toast({html: 'Search Query Missing!'});
	Server = `https://youtube-scrape.glitch.me/api/search?q=${q}&page=${page}`;
	Results = await $.getJSON(Server);
	Results = Results.results;
	//return console.log(Results);
	//if (Videos[0].error===true) return M.toast({html: 'Invalid YouTube URL!'});
	for (i = 0; i < Results.length; i++) {
		str = makeCard(Results[i]);
		if (str!==false) $('#searchRow').append(str);
	}
});

function makeCard(obj){
	let {video: {title, url, duration, snippet, upload_date, views}, uploader: {username} } = obj;
	if (duration==='Playlist') return false;
	id = URLRegex.exec(url);
	//console.log(url, id);
	id = id[1];
	//return;
	return `
	<div class="col s12">
	<div class="card horizontal" onclick="window.location.href='${Domain}/watch?v=${id}'">
		<div class="card-image"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg"></div>
		<div class="card-stacked">
			<div class="card-content">
				<span class="card-title">${title}</span>
				<p>${snippet}</p>
			</div>
			<div class="card-action">
				<a><i class="material-icons left">av_timer</i>${duration}</a>
				<a><i class="material-icons left">remove_red_eye</i>${views}</a>
				<a><i class="material-icons left">person</i>${username}</a>
				<a><i class="material-icons left">date_range</i>${upload_date}</a>
			</div>
		</div>
	</div>
</div>`
}

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