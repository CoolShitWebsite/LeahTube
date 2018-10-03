PrefModal = `
<div id="leah-prefs" class="modal modal-fixed-footer">
	<a class="modal-close btn-flat" style="position:absolute;top:0;right:0;z-index:100;"><i class="fas fa-times"></i></a>
	<div class="modal-content row">
		<div class="col s12">
			<h4 class="center-align">Preferences</h4>
			<div class="divider"></div>
		</div>
		<div class="col s12 spacer"><h5>Display</h5></div>
		<!-- Dark Theme -->
		<div class="col s8">Enable Dark Theme</div>
		<div class="col s4"><div class="switch right"><label><input id="DarkTheme" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div>
		<!-- Related Videos -->
		<!--<div class="col s8">Show Related Videos</div>
		<div class="col s4"><div class="switch right"><label><input id="RelatedVideos" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div> -->
		<!-- Debug -->
		<div class="col s8">Show Debug Box</div>
		<div class="col s4"><div class="switch right"><label><input id="DebugBox" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div>
		
		<div class="col s12 spacer"><h5>Playback</h5></div>
		<!-- Select Resolution -->
		<div style="min-height: 36px;line-height: 36px;" class="col s8">Default Video Quality</div>
		<div style="min-height: 36px;line-height: 36px;" class="col s4"><a id="PrefQualityBtn" class="vibrant dropdown-trigger btn right" href="#" data-target="PrefQuality">Highest</a></div>
		<ul id="PrefQuality" class="dropdown-content">
			<li><a qual="high" href="#!">Highest</a></li>
			<li><a qual="2160" href="#!">4K</a></li>
			<li><a qual="1440" href="#!">2K</a></li>
			<li><a qual="1080" href="#!">1080p</a></li>
			<li><a qual="720" href="#!">720p</a></li>
			<li><a qual="480" href="#!">480p</a></li>
			<li><a qual="360" href="#!">360p</a></li>
			<li><a qual="240" href="#!">240p</a></li>
			<li><a qual="144" href="#!">144p</a></li>
		</ul>
		<div class="col s12 spacer"></div>
		<!-- Video Autoplay -->
		<div class="col s8">Autoplay Video</div>
		<div class="col s4"><div class="switch right"><label><input id="AutoPlay" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div>
		<!-- Prefer AVC -->
		<div class="col s8">Prefer AVC Codec</div>
		<div class="col s4"><div class="switch right"><label><input id="PreferAVC" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div>
		<!-- Show Audio Changer 
		<div class="col s8">Show Audio Switch</div>
		<div class="col s4"><div class="switch right"><label><input id="AudioToggle" type="checkbox"><span class="lever"></span></label></div></div>
		<div class="col s12 spacer"></div> -->
		
	</div>
	<span style="position:absolute;bottom:1rem;left:25%;right:25%;z-index:100;text-align:center;">LeahTube v3.0.0</span>
</div>
`;
$('html').append(PrefModal);
PrefModal = M.Modal.init($('#leah-prefs')[0]);
ResDropDown = M.Dropdown.init($('#PrefQualityBtn')[0], {closeOnClick: true, hover: true});

DefaultPrefs = {
	DarkTheme: false,
	RelatedVideos: false,
	DebugBox: false,
	PrefQuality: '720',
	AutoPlay: false,
	PreferAVC: false,
	AudioToggle: false
};

var Config;
if (typeof localStorage.LeahTube==='undefined') {
	Config = JSON.parse(JSON.stringify(DefaultPrefs));
} else {
	Config = {...JSON.parse(JSON.stringify(DefaultPrefs)), ...JSON.parse(localStorage.LeahTube)};
}

Save = () => localStorage.LeahTube = JSON.stringify(Config);


// Dark Theme
$('#DarkTheme').on('change',function(){
	switch (this.checked){
		case true:
		Config.DarkTheme = true;
		$('html').addClass('dark');
		Save();
		break;
		case false:
		Config.DarkTheme = false;
		$('html').removeClass('dark');
		Save();
		break;
	}
});

// Enable Debug
$('#DebugBox').on('change',function(){
	Config.DebugBox = this.checked;
	Save();
});

// Enable Autoplay
$('#AutoPlay').on('change',function(){
	Config.AutoPlay = this.checked;
	Save();
});

// Switch to AVC Codec over VP9
$('#PreferAVC').on('change',function(){
	Config.PreferAVC = this.checked;
	Save();
});



// Resolution Picker.
$('#PrefQuality li a').click(function(d){
	$('#PrefQualityBtn').text($(this).text());
	Config.PrefQuality = $(this).attr('qual');
	Save();
	ResDropDown.close();
});





// Main
if (Config.AutoPlay && Config.AutoPlay===true) {$('#AutoPlay')[0].checked=true;}
if (Config.PreferAVC && Config.PreferAVC===true) {$('#PreferAVC')[0].checked=true;}
if (Config.DarkTheme && Config.DarkTheme===true) {$('html').addClass('dark');$('#DarkTheme')[0].checked=true;}
if (Config.DebugBox && Config.DebugBox===true) {$('.progress-debug').show();$('#DebugBox')[0].checked=true;};
if (Config.AudioToggle && Config.AudioToggle===true) {$('.audio-btn').fadeIn();$('#AudioToggle')[0].checked=true;};
$('#PrefQualityBtn').text($(`#PrefQuality li a[qual=${Config.PrefQuality}]`).text());