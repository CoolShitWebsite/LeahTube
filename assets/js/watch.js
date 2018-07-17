let video, currentVideo;

video = $('video');
audio = $('video audio');
media = {
	v: video,
	a: audio
};
video[0].onplay  = function() { audio[0].play(); if(audio[0].currentTime!==video[0].currentTime) audio[0].currentTime = video[0].currentTime  }
video[0].onpause = function() { audio[0].pause(); }
video[0].onseeking  = function() { audio[0].currentTime = video[0].currentTime }


nonDashFormats = ["5", "6", "18", "22", "34", "35", "37", "38", "43", "44", "45", "46"];
const formats = {
	'4320': {
		VP9: 272,
		H264: 138
	},
	'2160': {
		VP9_HDR_HFR: 337,
		VP9_HFR: 	 315,
		VP9: 		 313,
		H264:		 266
	},
	'1440': {
		VP9_HDR_HFR: 336,
		VP9_HFR: 	 308,
		VP9: 		 271,
		H264:		 264
	},
	'1080': {
		VP9_HDR_HFR: 335,
		VP9_HFR:     303,
		H264_HFR:    299,
		VP9:         248,
		H264:        137
	},
	'720': {
		VP9_HDR_HFR: 334,
		VP9_HFR:     302,
		H264_HFR:    298,
		VP9:         247,
		H264:        136,
		NON_DASH:     22
	},
	'480': {
		VP9_HDR_HFR: 333,
		VP9:         244,
		H264:        135
	},
	'360': {
		VP9_HDR_HFR: 332,
		VP9:         243,
		H264:        134,
		MP4A:         18,
		VORBIS:       43
	},
	'240': {
		VP9_HDR_HFR: 331,
		VP9:         242,
		H264:        133
	},
	'180': {
		NON_DASH:     36
	},
	'144': {
		VP9_HDR_HFR: 330,
		VP9:         278,
		H264:        160,
		NON_DASH:     17
	},
	audio: {
		OPUS_160: 251,
		VORBIS:   171,
		AAC_128:  140,
		OPUS_64:  250,
		OPUS_48:  249,
		AAC_48:  139
	}
}

$(document).ready(async function(){
	v = getAllUrlParams().v;
	if (typeof v==='undefined') return M.toast({html: 'YouTube URL Missing!'});
	//Server = `https://you-link.herokuapp.com/?url=https://www.youtube.com/watch?v=${v}`;
	Server = `https://ytdlscraper.glitch.me?v=${v}`;
	Video = await $.getJSON(Server);
	//return console.log(Video);
	$('#titleRow h4').append(Video.title);
	Videos = Video.formats;
	if (Videos.length===0) return M.toast({html: 'Invalid YouTube URL!'});
	Videos.sort(function(a,b) {return b.height - a.height;} ); 
	for (i = 0; i < Videos.length; i++) {
		vid = Videos[i];
		goTo = '#sources',
		key = (vid.height||'audio');
		//if (nonDashFormats.indexOf(vid.format_id)===-1) continue;
		if (key==='audio') goTo = '#tracks';
		console.log(goTo,key);
		//console.log(vid);
		type = getKeyByValue(formats[key], parseInt(vid.format_id));
		str = (vid.height) ? `${vid.height}p-${type}`:type;
		$(goTo).append(`<li class="${vid.height}-${type}" data-id="${i}"><a onclick="change(${i})">${str}</a></li>`);
	}
	preferred = ['720-VP9', 'OPUS_160'];
	//$("li[class*='-H264']").hide();
	M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
	
	try {
		vID = parseInt($(`li[class*='${preferred[0]}']`).attr('data-id'))
		aID = parseInt($(`li[class*='${preferred[1]}']`).attr('data-id'))
		video.attr('src', Videos[vID].url);
		audio.attr('src', Videos[aID].url);
		video[0].play();
	}catch(E){}
});

function change(id){
	vid = Videos[id];
	key = (vid.height) ? 'v':'a';
	//return console.log(key);
	currentTime = video[0].currentTime;
	paused = media[key][0].paused;
	media[key].attr('src', Videos[id].url);
	if (key==='v' && vid.acodec!=='none') {audio[0].muted=true;$('a[data-target="tracks"]').fadeOut();}
	if (vid.acodec==='none') {audio[0].muted=false;$('a[data-target="tracks"]').fadeIn();}
	if (!vid.acodec) {audio[0].muted=false;}
	video[0].pause();
	audio[0].pause();
	video[0].currentTime = currentTime;
	audio[0].currentTime = currentTime;
	if (paused===false) {video[0].play();audio[0].play();}
}




//from https://www.sitepoint.com/get-url-parameters-with-javascript/
function getAllUrlParams(url) {
	var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
	var obj = {};
	// if query string exists
	if (queryString) {
		// stuff after # is not part of query string, so get rid of it
		queryString = queryString.split('#')[0];
		var arr = queryString.split('&');
		for (var i = 0; i < arr.length; i++) {
			var a = arr[i].split('=');
			var paramNum = undefined;
			var paramName = a[0].replace(/\[\d*\]/, function(v) {
				paramNum = v.slice(1, -1);
				return '';
			});
			// set parameter value (use 'true' if empty)
			var paramValue = typeof(a[1]) === 'undefined' ? true : a[1];
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

//from https://stackoverflow.com/a/28191966
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
