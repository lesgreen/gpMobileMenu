/*
 * 	 gpMobileMenu 
 * 	 @author Les Green
 * 	 Copyright (C) 2013 Grasshopperpebbles.com.
 *   Version 0.5
 * 
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.

 *   Demo and Documentation can be found at:   
 *   http://www.grasshopperpebbles.com
 *   
 */

;(function($) {
	$.fn.extend({
        gpMobileMenu: function(options) { 
        	opts = $.extend({}, $.gpMenu.defaults, options);
			return this.each(function() {
				new $.gpMenu(this, opts);
			});
        }
    });	

$.gpMenu = function(obj, opts) {
	var $this = $(obj);
	if (opts.jquery_mobile) {
		$('body').page();
	}
	if (opts.menu_items_url) {
		doAjax('GET', opts.menu_items_url, '', '', doCreate);
	} else {
		doCreate(opts.menu_items);	
	}
	
	function doCreate(data) {
		var a = $('<a></a>').attr({'id': 'gp-mobile-menu-icon', 'data-theme': opts.icon_data_theme, 'data-corners': 'false', 'data-shadow': 'false', 'data-iconshadow': 'false'})
							.addClass('ui-btn-up-'+opts.icon_data_theme);
		if (opts.icon_position == 'left') {
			$this.prepend($(a).addClass('ui-btn-left'));
		} else {
			$this.append($(a).addClass('ui-btn-right'));
		}
		
		if (opts.jquery_mobile) {
			$('#gp-mobile-menu-icon').button();
		}
		var div = $('<div></div>').attr({'id': 'gp-mobile-menu-cntnr', 'role': 'main', 'data-role': 'content'}).addClass('ui-content gp-mobile-menu-cntnr ' + getPositionClass())
		
		$(div).append(getMenuContainer);
		if (opts.mode == 'above-content') {
			$('body').append($(div));
		} else if (opts.mode == 'split-view') {
			if (opts.jquery_mobile) {
				$('.ui-page-active').wrapInner('<div class="gp-mobile-menu-main-content ui-content" />');
				$('.ui-page-active').prepend($(div));
				//$('#gp-mobile-menu-items').listview();
			} else {
				$('body').wrapInner('<div class="gp-mobile-menu-main-content ui-content" />');
				$('body').prepend($(div));
			}
		} else if (opts.mode == 'slide') {
			$('#'+opts.menu_cntnr).replaceWith($(div));
			//$('.gp-mobile-menu-slide-cntnr').hide();
		}
		var tf = loadMenu(data);
		setIconClickEvent();
	};
	
	function getMenuContainer() {
		return $('<div></div>').addClass('gp-mobile-menu-wrapper').append(
					$('<ul></ul>').attr({'id': 'gp-mobile-menu-items', 'data-role': 'listview', 'data-inset': opts.menu_inset, 'data-mini': opts.menu_mini, 'data-corners': opts.menu_corners, 'data-theme': opts.menu_data_theme, 'data-dividertheme': opts.data_divider_theme})
					.addClass('gp-mobile-menu-items')
			);
	};
	
	function loadMenu(data) {
		cnt = data.length;
		var li, tf_ajax;
		$.each(data, function(i, itm){
			li = $('<li></li>');
			if (itm.isDivider) $(li).attr('data-role', 'list-divider');
			$(li).append(getMenuItem(itm)).appendTo($('#gp-mobile-menu-items'));
		});
		
		if (opts.menu_mini) {
			$('#gp-mobile-menu-items').addClass('ui-mini');	
		}
		if (opts.jquery_mobile) {
			$('#gp-mobile-menu-items').listview();
		}
		
		return true;
	};
	
	
	function getMenuItem(itm) {
		if (!itm.label) return;
		var a = $('<a></a>').html(itm.label);
		if (itm.callFunc) {
			a = setFunctionClickEvent($(a), itm);
		} else if (itm.ajaxCall) {
			a = setAjaxCallClickEvent($(a), itm);
		} else if (itm.subMenu) {
			//$(a).data('sub', itm.sub);
			a = setSubMenuClickEvent($(a), itm);
		} else if (itm.url) {
			var tf_ajax = (itm.dataAjax) ? itm.dataAjax : false;
			$(a).attr({'href': itm.url, 'data-ajax': tf_ajax}).html(itm.label);
		}
		return $(a);
	};
	
	function setFunctionClickEvent(a, itm) {
		$(a).bind('click', function(){
			var fn = itm.callFunc;
			if (itm.params) {
				var pVal = '';
				$.each(itm.params, function(j, prm) {
					pVal += prm.param + ",";
				});
				pVal = pVal.substr(0, pVal.length-1);
				var ar = pVal.split(','); 
				window[fn](ar);
			} else {
				window[fn]();
			}
			return false;
		});
		return $(a);
	};
	
	function setAjaxCallClickEvent(a, itm) {
		if (itm.url && itm.ajaxCallSuccess) {
			$(a).bind('click', function(){
				//var d = (itm.params) ? itm.params : '';
				var s = itm.ajaxCallSuccess;
				doAjax('GET', itm.url, '', '', window[s]);
				return false;
			});
		}
		return $(a);
	};
	
	function setIconClickEvent() {
		$('.gp-mobile-menu-cntnr').hide();
		$("#gp-mobile-menu-icon").bind( "click", function(event, ui) {
			if ($('.gp-mobile-menu-cntnr').is(':hidden') == true) {
				if (opts.mode == 'above-content') {
					$('.gp-mobile-menu-cntnr').show();
				} else if (opts.mode == 'split-view') {
					var w = $('.gp-mobile-menu-cntnr').outerWidth();
					if (opts.animate_transition) {
						$('.gp-mobile-menu-cntnr').animate({
							opacity: 1,
							width: 'toggle'
							}, 'slow', function() {
							// Animation complete.
						});
						$('.gp-mobile-menu-main-content').animate({
							left: w+'px'
							}, 'slow', function() {
							// Animation complete.
						});
						
					} else {
						$('.gp-mobile-menu-main-content').css('left', w+'px');
						$('.gp-mobile-menu-cntnr').show();
					}
				} else if (opts.mode == 'slide') {
					$('.gp-mobile-menu-cntnr').animate({
						opacity: 1,
						height: 'toggle'
						}, 'slow', function() {
						// Animation complete.
					});
				}
				//
			} else {
				if (opts.mode == 'above-content') {
					$('.gp-mobile-menu-cntnr').hide();
				} else if (opts.mode == 'split-view') {
					if (opts.animate_transition) {
						$('.gp-mobile-menu-cntnr').animate({
							opacity: 0,
							width: 0
							}, 'slow', function() {
							// Animation complete.
						});
						$('.gp-mobile-menu-main-content').animate({
							left: 0
							}, 'slow', function() {
							// Animation complete.
						});
					} else {
						$('.gp-mobile-menu-main-content').css('left', '0');
						$('.gp-mobile-menu-cntnr').hide();
					}
				} else if (opts.mode == 'slide') {
					$('.gp-mobile-menu-cntnr').animate({
						opacity: 0,
						height:0
						}, 'slow', function() {
						// Animation complete.
					});
				}
			}
		});
	/*	$(".ui-header-menu").bind( "click", function(event, ui) {
			hMenu = $(this).parent().siblings('div.header-menu-cntnr');
			//var sp = $(this).children('span').children('span')[1];
			if ($(hMenu).is(':hidden') == true) {
				$(hMenu).show();
				//$("a.header-menu-btn").attr('data-icon', 'arrow-u');
				//$(sp).removeClass('ui-icon-arrow-d').addClass('ui-icon-arrow-u');
			} else {
				$(hMenu).hide();
				//$("a.header-menu-btn").attr('data-icon', 'arrow-d');
				//$(sp).removeClass('ui-icon-arrow-u').addClass('ui-icon-arrow-d');
			}
		});*/
	};
	
	function setSubMenuClickEvent(a, itm) {
		$(a).bind('click', function(){
			var li = $(this).parent().parent().parent();
			var sub = $(li).children('.gp-mobile-menu-items-sub');
			if (sub.length == 0) {
				sub = loadSubMenu(itm.subMenu, $(li));
				$(li).append($(sub));
				if (opts.jquery_mobile) $(sub).listview();
				$(sub).hide();
			} 
			if ($(sub).is(':hidden') == true) {
				$(sub).show();
			} else {
				$(sub).hide();
			}
		});
		return $(a);
	};
	
	function loadSubMenu(data, el) {
		var li;
		var ul = $('<ul></ul>').attr({'data-role': 'listview', 'data-inset': opts.menu_inset, 'data-mini': opts.menu_mini, 'data-corners': opts.menu_corners, 'data-theme': opts.sub_menu_data_theme, 'data-dividertheme': opts.data_divider_theme})
							.addClass('gp-mobile-menu-items-sub')
		$.each(data, function(i, itm){
			li = $('<li></li>');
			if (itm.isDivider) $(li).attr('data-role', 'list-divider');
			$(li).append(getMenuItem(itm)).appendTo($(ul));
		});
		
		if (opts.menu_mini) {
			$(ul).addClass('ui-mini');	
		}
		return $(ul);
	};
	
	function getPositionClass() {
		if (opts.mode == 'above-content') {
			return 'menu-cntnr-above-content';
		} else if (opts.mode == 'split-view') {
			return 'menu-cntnr-split-view';
		} else if (opts.mode == 'slide') {
			return 'menu-cntnr-slide';
		} else {
			return;
		}
	};
	
	function doAjax(t, u, d, fnBefore, fnSuccess) {
        $.ajax({
            type: t,
            url: u,
            data: d,
            dataType: 'json',
            beforeSend: fnBefore, //function(){$("#loading").show("fast");}, //show loading just when link is clicked
            //complete: function(){ $("#loading").hide("fast");}, //stop showing loading when the process is complete
            success: fnSuccess,
            error: showError
         }); //close $.ajax(
    };
   
    function showError(XMLHttpRequest, textStatus, errorThrown) {
        alert(textStatus);
    };
			
};

$.gpMenu.defaults = {
	mode: 'above-content', // split-view, slide
	icon_data_theme: 'd',
	menu_data_theme: 'a',
	//sub_menu_data_theme: 'c',
	menu_data_divider_theme: 'b',
	menu_inset: 'true',
	menu_mini: 'true',
	menu_corners: 'false',
	icon_position: 'left', // or right;
	menu_cntnr: '', // used slide
	menu_items: '', //{url, label, isDvider, callFunc, params, subMenu, dataAjax, ajaxCall, ajaxCallSuccess
	menu_items_url: '',
	animate_transition: false,
	jquery_mobile: true
	// side menu container. convert to mobile
	// MobileAccodianSplitView
};

})(jQuery);		   