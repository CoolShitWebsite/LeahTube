URLRegex = /.+?youtu(be\.com|\.be)\/(watch\?v\=)?([A-Za-z0-9_\-]{11,})/gi;
$(document).ready(async function(){

});

Domain = window.location.origin;
if (Domain==='https://coolshitwebsite.github.io') Domain = 'https://coolshitwebsite.github.io/LeahTube/';

$('#urlnav form').submit(function( event ) {
	event.preventDefault();
	matches = URLRegex.exec($('#urlnav form input').val());
	if (matches===null) return M.toast({html: 'Invalid YouTube URL!'});
	console.log(matches);
	id = matches[3];
	//window.location.href=`${window.location.origin}/watch?v=${id}`
	window.location.href=`${Domain}/watch?v=${id}`
});

$('#searchnav form').submit(function( event ) {
	event.preventDefault();
	q = $('#searchnav form input').val();
	window.location.href=`${Domain}/search?q=${q}`
	
});

