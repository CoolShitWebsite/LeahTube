URLRegex = /.+?youtu(be\.com|\.be)\/(watch\?v\=)?([A-Za-z0-9_\-]{11,})/gi
$(document).ready(async function(){

});

$('#searchnav form').submit(function( event ) {
	event.preventDefault();
	matches = URLRegex.exec($('#searchnav form input').val());
	if (matches===null) return M.toast({html: 'Invalid YouTube URL!'});
	console.log(matches);
	id = matches[3];
	window.location.href=`${window.location.origin}/watch?v=${id}`
});