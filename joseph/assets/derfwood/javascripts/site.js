$(document).ready(function() {
	
	if($.support.opacity) {	
		$('.app_store').hover(function() {
			$('a', this).stop(true, true).animate({ opacity: 1.0 }, 300);
		}, function() {
			$('a', this).stop(true, true).animate({ opacity: 0 }, 300);
		});
	}
	
	var screenshots = $('div.screenshots');
	
	screenshots.find('a').fancybox({
		'speedIn' : 400, 
		'speedOut' : 400, 
		'overlayShow' : false,
		'padding' : 8,
		'centerOnScroll' : true
	});
	
	screenshots.find('li').hover(function() {
		$('span', this).stop(true, true).css({ opacity: 0.6 }).fadeToggle(300);
	});

});