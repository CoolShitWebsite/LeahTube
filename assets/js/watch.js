Video = {};
DOMLoaded = false;
MetaLoaded = false;

main();
$(document).ready(function(){
	//Materialize Init
	
	DOMLoaded = true;
	if (MetaLoaded===true){
		return startGettingFormats();
	}
});

window.onerror = HandleError;

jQuery.readyException = HandleError;

function HandleError(err) {
	if (err.type && err.type==='error'){
		err = VideoJS.error();
	}
	if (typeof err==='string'){
		err = {
			code: 'JS0',
			reason: err
		};
	}
    $('.video-page').addClass('slide-out-top');
	$('.load-error .error-code-box').html(`<span class="red-text">Error Code:</span> <b class="red-text text-accent-4">${err.code}</b><br>`);
	if (err.message||err.reason) $('.load-error .error-code-box').append(`<span class="orange-text">Message:</span> <b class="orange-text orange-accent-4">${(err.message||err.reason)}</b><br>`);
	setTimeout(function(){
		$('.video-page').css('display', 'none');
		$('.load-error').css('display', 'block');
		$('.load-error').addClass('slide-in-bottom');
	}, 400);
	return;
};

function AddDebugLine(text){
	if ($('.current-line').length) $('.current-line').append('...<b class="green-text">Done!</b>').removeClass('current-line');
	$('.progress-debug').prepend(`<h5 class="current-line">${text}</h5>`);
}

function main(){
	params = getAllUrlParams();
	if (typeof params.v==='string'){
		AddDebugLine('Getting YouTube Metadata');
		$.getJSON('https://api.allorigins.ml/get?url='+encodeURIComponent(`https://www.youtube.com/watch?v=${params.v}`), LoadData);
	} else {
		return HandleError({
			code: 'C0',
			reason: 'There is no Valid Youtube URL!'
		});
	}
}

function LoadData(data){
	AddDebugLine('Compiling and adding to page');
	html = data.contents;
	//$('body').text(html); //debug only
	YT = new DOMParser().parseFromString(html, 'text/html');
	$$ = (s) => jQuery(s, YT);
	Video.title = $$('meta[name="title"]').attr('content');
	Video.author = $$('.yt-user-info').text();
	Video.IsVerified = (($$('.yt-user-info .yt-channel-title-icon-verified').length>0)) ? true : false;
	Video.description = $$('#watch-description-text').html();
	Video.upload_date = new Date($$('meta[itemprop="datePublished"]').attr('content'));
	Video.views = $$('meta[itemprop="interactionCount"]').attr('content');
	Video.ID = GetID();
	Video.Extra = {};
	try {
		Video.Extra.PlayerConfig = JSON.parse($$("script:contains('ytplayer.config')").text().replace(/^.+ytplayer\.config = /gi,'').replace(/;ytplayer\.load = .+$/gi,''));
		Video.Extra.PlayerConfig.args.player_response = JSON.parse(Video.Extra.PlayerConfig.args.player_response);
	}catch(err){console.log(err);};
	
	if (typeof Video.title==='undefined' && typeof Video.description==='undefined' && typeof Video.views==='undefined' && typeof Video.ID==='undefined' && Video.author.length===0) return HandleError({ code: 'C1', reason: 'Invalid Youtube URL!'	});
	
	Video.Formats = {Audio:{}};
	Video.Saveable = {};
	
	$('.meta-head h5').html(Video.title);
	$('.meta-head h6 span').html(Video.views.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	$('.meta-channel .author').text(Video.author);
	if (Video.IsVerified && Video.IsVerified===true) $('.meta-channel .author').append('<i class="fas fa-check-circle light-blue-text"></i>');
	$('.meta-channel .date').text(new Date(Video.upload_date).toLocaleDateString('en-GB',{day: '2-digit', month: 'short', year: 'numeric' }));
	$('.meta-decription').append(Video.description);
	
	MetaLoaded = true;
	if (DOMLoaded===true){
		return startGettingFormats();
	}
}

function startGettingFormats(){
	// Now the Formats
	AddDebugLine('Grabbing Video/Audio Formats');
	
	url = new URL(`https://www.youtube.com/get_video_info?video_id=${Video.ID}`);

	url.searchParams.append('eurl', `https://youtube.googleapis.com/v/${Video.ID}`);
	url.searchParams.append('ps','default');
	url.searchParams.append('gl','US');
	url.searchParams.append('hl',('en'));
	if (Video.Extra.PlayerConfig && Video.Extra.PlayerConfig.sts) url.searchParams.append('sts',Video.Extra.PlayerConfig.sts);
	
	return $.get('https://api.allorigins.ml/get?url='+encodeURIComponent(url), getTokens);
}

function getTokens(data){
	JSKEY = '',
	info = querystring.decode(data.contents);
	if (info.status === 'fail') {
		if (typeof config!=='undefined' && info.errorcode === '150' && config.args) {
			info = config.args;
			info.no_embed_allowed = true;
		} else {
			return HandleError({
				code: 'Y'+info.errorcode,
				reason: info.reason
			});
		}
	}
	AddDebugLine('Cleaning Formats');
	info.formats = parseFormats(info);
	
	html5playerfile = 'https://youtube.com'+Video.Extra.PlayerConfig.assets.js;
	rs = /(?:html5)?player[-_]([a-zA-Z0-9\-_]+)(?:\.js|\/)/.exec(html5playerfile);
	if (rs!==null){
		JSKEY = rs[1];
	}
	// return decodeTokens(tokens);
	AddDebugLine('Retrieving Tokens');
	return $.get('https://api.allorigins.ml/get?url='+encodeURIComponent(html5playerfile), decodeSignatures);
}

function decodeTokens(tokens){
	//console.log(tokens);
	info.formats.forEach((format) => {
		const sig = tokens && format.s ? decipher(tokens, format.s) : null;
		setDownloadURL(format, sig);
	});
	return HandleVideoInfo();
}

function HandleVideoInfo() {
	AddDebugLine('Assigning Formats');
	
	//console.log(info.formats);
	for (i = 0; i < info.formats.length; i++) {
		f = info.formats[i];
		details = /^((video|audio)\/(\w+)); codecs="(.+)\"$/g.exec(f.type);
		mime = details[1],
		format = details[2],
		ftype = details[3],
		codecs = details[4].split(', ');
		
		if (ftype==='3gpp') continue; //3gpp doesnt work in-browser, skip
		
		Format = {
			url: f.url,
		 	 id: f.itag,
			 mime: mime
		};
		
		qual = (f.quality_label||'unknown');
		if (f.quality==='hd720') qual = '720p';
		if (f.quality==='medium') qual = '360p';
		Format.res = qual;
		
		if (typeof Video.Formats[qual]==='undefined') Video.Formats[qual] = {};
		
		if (codecs[0].startsWith('avc')) codecs[0]='avc';
		if (codecs[0].startsWith('vp8')) codecs[0]='vp8';
		if (codecs[0].startsWith('mp4a')) codecs[0]='mp4a';
		mc = codecs[0];
		
		if (format==='video'){
			
			Format.audio = true;
			if (codecs.length===2){
				//video contains both video and audio
				Format.audio = false;
				qual = qual+'_full';
				if (typeof Video.Formats[qual]==='undefined') Video.Formats[qual] = {};
				Format.res = Format.res+' (Full)';
			} else {
				
			}
			Video.Formats[qual][mc] = Format;
			
		} else {
			BitClean = FileSizeClean(f.bitrate, 0)[0];
			Format.res = codecs[0]+' ('+BitClean+')';
			
			Video.Formats.Audio[Format.id] = Format;
		}
		//console.log(format, qual, codecs, ftype);
	}
	delete Video.Formats.unknown;
	
	// Init Quality Selector
	quals = [];
	
	
	ResArray = ['2160p60', '2160p', '1440p60', '1440p', '1080p60', '1080p', '720p60', '720p', '480p', '360p', '240p', '180p', '144p'];
	
	for (i = 0; i < ResArray.length; i++) {
		r = ResArray[i];
		if (!Video.Formats[r]) continue;
		
		prefer = ['vp9', 'vp8', 'avc'];		
		if (Config.PreferAVC&&Config.PreferAVC===true) prefer = ['avc', 'vp9', 'vp8'];
		v = (Video.Formats[r][prefer[0]]||Video.Formats[r][prefer[1]]||Video.Formats[r][prefer[2]]);
		quals.push({label: r, src: v.url, type: v.mime, res: parseInt(r.replace(/p6?0?$/g,''))});
	}
	
	AudArray = Object.keys(Video.Formats.Audio);
	//for (i = 0; i < AudArray.length; i++){
		//r = AudArray[i];
		//console.log(r, Video.Formats.Audio[r]);
		//$('#quality-audio').append(`<li><a onclick="SetAudioRes('${r}')">${Video.Formats.Audio[r].res}</a></li>`);
	//}
	
	$('.current-line').append('...<b class="green-text">Done!</b>').removeClass('current-line');
	$('.progress-debug').prepend(`<h5>Schooch a mooch!</h5>`);
	
	return LoadVideo(quals);
}

function LoadVideo(quals){
	
	VideoURL = PickBestVideo(Video.Formats);
	AudioURL = PickBestAudio(Video.Formats.Audio);
	
	
	Audio = $('#audio');
	Audio.attr('src', AudioURL.url);
	//return;
	VideoJS = videojs('video', {
		controls: true,
		height: '100%',
		width: '100%',
		aspectRatio: '16:9',
		plugins: {
			videoJsResolutionSwitcher: {
				default: Config.PrefQuality,
				dynamicLabel: false
			}
		}
	});
	//VideoJS.on('error', HandleError);
	VideoJS.on('play', function() {Audio[0].play();Audio[0].currentTime=VideoJS.currentTime();});
	VideoJS.on('playing', function() {Audio[0].play();Audio[0].currentTime=VideoJS.currentTime();});
	VideoJS.on('ended', function() {Audio[0].pause();Audio[0].currentTime=0;}); 
	VideoJS.on('seeking', function() {Audio[0].currentTime=VideoJS.currentTime();}); 
	VideoJS.on('pause', function() {Audio[0].pause();}); 
	VideoJS.on('volumechange', function(ev) {Audio[0].volume = VideoJS.volume()});
	$('.vjs-mute-control').on('click', function(){ Audio[0].muted = VideoJS.muted(); }); //mute button
	
	VideoJS.updateSrc(quals);
	$('.progress-debug').slideUp();
	$('#video').slideDown({
		complete: function(){
			$('#video_html5_api').fadeIn();
			if (Config.AutoPlay && Config.AutoPlay===true) VideoJS.play();
		}
	});
}

function parseFormats(info) {
	let formats = [];
	if (info.url_encoded_fmt_stream_map) {
		formats = formats.concat(info.url_encoded_fmt_stream_map.split(','));
	}
	if (info.adaptive_fmts) {
		formats = formats.concat(info.adaptive_fmts.split(','));
	}
	formats = formats.map((format) => querystring.decode(format));
	delete info.url_encoded_fmt_stream_map;
	delete info.adaptive_fmts;
	return formats;
};

function GetID(){
	c = $$('#page').attr('class').split(/\s+/);
	for (i = 0; i < c.length; i++) {
		if (c[i].startsWith('video-')){
			return c[i].split('video-')[1];
		}
	}
}

//partially from https://stackoverflow.com/a/18650828
function FileSizeClean(num, decimals) {
	if (typeof num==='string') num = parseInt(num);
	if(num == 0) return [0, 'B'];
	var k = 1024,
	dm = decimals || 2,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(num) / Math.log(k));
	return [parseFloat((num / Math.pow(k, i)).toFixed(0)),sizes[i]];
}

function PickBestVideo(o){
	wow = (o['4320p60']||o['4320p']||o['2160p60']||o['2160p']||o['1440p60']||o['1440p']||o['1080p60']||o['1080p']||o['720p60']||o['720p']||o['480p']||o['360p']||o['240p']||o['144p']);
	prefer = ['vp9', 'vp8', 'avc'];
	wow2 = (wow[prefer[0]]||wow[prefer[1]]||wow[prefer[2]]);
	return wow2;
}
function PickBestAudio(o){
	wow = (o['251']||o['171']||o['140']||o['250']||o['249']||o['139']);
	return wow;
}

function decodeSignatures(data){
	body = data.contents;
	const jsVarStr = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
	const jsSingleQuoteStr = `'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'`;
	const jsDoubleQuoteStr = `"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"`;
	const jsQuoteStr = `(?:${jsSingleQuoteStr}|${jsDoubleQuoteStr})`;
	const jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`;
	const jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`;
	const jsEmptyStr = `(?:''|"")`;
	const reverseStr = ':function\\(a\\)\\{' +
	'(?:return )?a\\.reverse\\(\\)' +
	'\\}';
	const sliceStr = ':function\\(a,b\\)\\{' +
	'return a\\.slice\\(b\\)' +
	'\\}';
	const spliceStr = ':function\\(a,b\\)\\{' +
	'a\\.splice\\(0,b\\)' +
	'\\}';
	const swapStr = ':function\\(a,b\\)\\{' +
	'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?' +
	'\\}';
	const actionsObjRegexp = new RegExp(
	`var (${jsVarStr})=\\{((?:(?:` +
		jsKeyStr + reverseStr + '|' +
		jsKeyStr + sliceStr   + '|' +
		jsKeyStr + spliceStr  + '|' +
		jsKeyStr + swapStr +
	'),?\\r?\\n?)+)\\};'
	);
	const actionsFuncRegexp = new RegExp(`function(?: ${jsVarStr})?\\(a\\)\\{` +
		`a=a\\.split\\(${jsEmptyStr}\\);\\s*` +
		`((?:(?:a=)?${jsVarStr}` +
		jsPropStr +
		'\\(a,\\d+\\);)+)' +
		`return a\\.join\\(${jsEmptyStr}\\)` +
	'\\}'
	);
	const reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, 'm');
	const sliceRegexp   = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, 'm');
	const spliceRegexp  = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, 'm');
	const swapRegexp    = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, 'm');
	const objResult = actionsObjRegexp.exec(body);
	const funcResult = actionsFuncRegexp.exec(body);
	if (!objResult || !funcResult) { return null; }
	
	const obj      = objResult[1].replace(/\$/g, '\\$');
	const objBody  = objResult[2].replace(/\$/g, '\\$');
	const funcBody = funcResult[1].replace(/\$/g, '\\$');
	
	let result = reverseRegexp.exec(objBody);
	const reverseKey = result && result[1]
		.replace(/\$/g, '\\$')
		.replace(/\$|^'|^"|'$|"$/g, '');
	result = sliceRegexp.exec(objBody);
	const sliceKey = result && result[1]
		.replace(/\$/g, '\\$')
		.replace(/\$|^'|^"|'$|"$/g, '');
	result = spliceRegexp.exec(objBody);
	const spliceKey = result && result[1]
		.replace(/\$/g, '\\$')
		.replace(/\$|^'|^"|'$|"$/g, '');
	result = swapRegexp.exec(objBody);
	const swapKey = result && result[1]
		.replace(/\$/g, '\\$')
		.replace(/\$|^'|^"|'$|"$/g, '');
	
	const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
	const myreg = '(?:a=)?' + obj +
		`(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])` +
		'\\(a,(\\d+)\\)';
	const tokenizeRegexp = new RegExp(myreg, 'g');
	const tokens = [];
	while ((result = tokenizeRegexp.exec(funcBody)) !== null) {
		let key = result[1] || result[2] || result[3];
		switch (key) {
		case swapKey:
			tokens.push('w' + result[4]);
			break;
		case reverseKey:
			tokens.push('r');
			break;
		case sliceKey:
			tokens.push('s' + result[4]);
			break;
		case spliceKey:
			tokens.push('p' + result[4]);
			break;
		}
	}
	return decodeTokens(tokens);
}

function setDownloadURL(format, sig, debug) {
	let decodedUrl;
	if (format.url) {
		decodedUrl = format.url;
	} else {
		if (debug) {
			console.warn('Download url not found for itag ' + format.itag);
		}
		return;
	}
	try {
		decodedUrl = decodeURIComponent(decodedUrl);
	} catch (err) {
		if (debug) {
			console.warn('Could not decode url: ' + err.message);
		}
		return;
	}
	// Make some adjustments to the final url.
	
	/*
	const parsedUrl = new URL(decodedUrl);
	parsedUrl.query = 
	//console.log({parsedUrl: parsedUrl, decodedUrl: decodedUrl});
	// Deleting the `search` part is necessary otherwise changes to
	// `query` won't reflect when running `url.format()`
	let query = parsedUrl.query;
	// This is needed for a speedier download.
	// See https://github.com/fent/node-ytdl-core/issues/127
	query.ratebypass = 'yes';
	if (sig) {
		query.signature = sig;
	}
	*/
	if (decodedUrl.search(/\&ratebypass\=\w+/gi)!==-1){
		decodedUrl = decodedUrl.replace(/\&ratebypass\=\w+/gi, '&ratebypass=yes');
	} else {
		decodedUrl += '&ratebypass=yes';
	}
	if (sig) decodedUrl+= `&signature=${encodeURIComponent(sig)}`;
	
	format.url = decodedUrl;
};

function decipher (tokens, sig){
	sig = sig.split('');
	for (let i = 0, len = tokens.length; i < len; i++) {
		let token = tokens[i], pos;
		switch (token[0]) {
			case 'r':
			sig = sig.reverse();
			break;
			case 'w':
			pos = ~~token.slice(1);
			sig = swapHeadAndPosition(sig, pos);
			break;
			case 's':
			pos = ~~token.slice(1);
			sig = sig.slice(pos);
			break;
			case 'p':
			pos = ~~token.slice(1);
			sig.splice(0, pos);
			break;
		}
	}
	return sig.join('');
};
const swapHeadAndPosition = (arr, position) => {
  const first = arr[0];
  arr[0] = arr[position % arr.length];
  arr[position] = first;
  return arr;
};