$('.main-btns .card').hover(function () {
    $(this).find('h1').addClass('main-btns-hovered');
}, function () {
    $(this).find('h1').removeClass('main-btns-hovered');
});

Type = '';

Icon = {url: 'fa-globe', search: 'fa-search' };

$('.main-btns .card').click(function(){
	Type = $(this).attr('btn');
	$('.main-bar .label-icon i').removeAttr('class').addClass(`fas ${Icon[Type]}`);
});

$('.main-bar').fadeIn();
$('.main-branding').fadeIn();

YouTubeURI = '(?:youtube\\.com\/(?:[^\\/]+\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/ ]{11})';
//$('.main-bar input').attr('pattern', YouTubeURI);
YouTubeRegex = new RegExp(YouTubeURI, 'i');
$('.main-bar form').submit(function(e){
	e.preventDefault();
	url = $('.main-bar input').val();
	r = YouTubeRegex.exec(url);
	if (r===null){
		M.toast({html: '<b>Invalid URL.</b>'})
	}
	id = r[1];
	window.location.href=window.location.origin+'/watch?v='+id;
});