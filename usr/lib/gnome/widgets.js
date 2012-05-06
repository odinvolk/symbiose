/**
 * Widgets pour l'interface GNOME.
 * @author Simon Ser <contact@simonser.fr.nf>
 * @version 1.0
 * @since 2.0
 */

//Window
var windowProperties = $.webos.extend(containerProperties, {
	options: {
		title: 'Fen&ecirc;tre',
		icon: undefined,
		_components: {},
		_dimentions: {},
		_position: {},
		_scroll: [],
		_focus: undefined,
		closeable: true,
		maximizable: true,
		hideable: true,
		opened: false,
		parentWindow: [],
		childWindow: []
	},
	_name: 'window',
	_create: function() {
		var that = this;
		
		this.options.states = {};
		for (var i = 0; i < $.webos.window.states.length; i++) {
			this.options.states[$.webos.window.states[i][0]] = false;			
		}
		
		if (typeof this.options.parentWindow != 'undefined' && this.options.parentWindow.length > 0) {
			this.options.parentWindow.window('option', 'childWindow', this.element);
			this.options._components.button = this.options.parentWindow.window('button');
			this.options._components.icon = $('<img />');
		} else {
			this.options._components.button = $('<span></span>', {
				'class': 'window-button'
			})
				.click(function() {
					that.hideOrShowOrToForeground();
				})
				.hide();
			
			this.options._components.icon = $('<img />', {
				alt: 'icon'
			}).prependTo(this.options._components.button);
			
			$.webos.window.setButtonsBorder();
		}
		
		this._setOption('icon', this.options.icon);
		
		if (this.options.resizable == false) {
			this.options.maximizable = false;
		}
		
		if (typeof this.options.stylesheet != 'undefined') {
			this.stylesheet(this.options.stylesheet);
		}
		
		var windowContents = this.element.html();
		
		this.element
			.empty()
			.css('position', 'absolute')
			.mousedown(function() {
				that.toForeground();
			})
			.focus(function(event) {
				that._focus = $(event.target);
			})
			.hide();
		
		this.options._components.header = $('<div></div>', { 'class': 'header' }).appendTo(this.element);
		
		var headerTop = $('<div></div>').addClass('top').appendTo(this.options._components.header);
		
		this.options._components.controllers = {};
		var controllers = $('<div></div>', { 'class': 'controllers' }).appendTo(headerTop);
		
		this.options._components.controllers.close = $('<span></span>', {
			'class': 'close'
		})
			.click(function() {
				that.close();
			})
			.appendTo(controllers);
		
		this.options._components.controllers.hide = $('<span></span>', {
			'class': 'hide'
		})
			.click(function() {
				that.hide();
			})
			.appendTo(controllers);
		
		this.options._components.controllers.maximize = $('<span></span>', {
			'class': 'maximize'
		})
			.click(function() {
				that.minimizeOrMaximize();
			})
			.appendTo(controllers);
		
		if(this.options.closeable == false) {
			this.closeable(false);
		}
		
		if(this.options.hideable == false) {
			this.hideable(false);
		}
		
		if(this.options.maximizable == false) {
			this.maximizable(false);
		}
		
		this.options._components.title = $('<div></div>', {
			'class': 'title'
		})
			.dblclick(function() {
				that.minimizeOrMaximize();
			})
			.appendTo(headerTop);
		
		this.options._components.specificHeader = $('<div></div>', { 'class': 'header-specific' }).appendTo(this.options._components.header);
		
		this.options._content = $('<div></div>', {
			'class': 'content'
		})
			.html(windowContents)
			.appendTo(this.element);
		
		if (this.options.width != undefined) {
			this.setWidth(this.options.width);
		}
		if (this.options.height != undefined) {
			this.setHeight(this.options.height);
		}
		
		if (typeof this.options.workspace == 'undefined') {
			this.options.workspace = SWorkspace.getCurrent();
		}
		
		this.draggable(true);
		
		this._setOption('resizable', (typeof this.options.resizable == 'undefined') ? true : this.options.resizable);
	},
	_setTitle: function(title) {
		var applyGradientToTitle = function(title, max) {
			if (max > title.length) {
				max = title.length;
			}
			
			var newTitleArray = title.split('', max);
			
			for (var i = 0; i < max; i++) {
				if (i >= max - $.webos.window.windowsTitleGradientLength) {
					var no = max - i;
					var opacity = 1 / $.webos.window.windowsTitleGradientLength  * no;
					newTitleArray[i] = '<span style="opacity: '+opacity+';">'+newTitleArray[i]+'</span>';
				}
			}
			return newTitleArray.join('');
		};
		
		this.options._components.title.html(title);
		var titleClone = this.options._components.title.clone().css('display', 'inline').insertAfter(this.options._components.title);
		if (titleClone.width() > this.options._components.title.innerWidth()) {
			while (titleClone.innerWidth() > this.options._components.title.innerWidth() && titleClone.html().length > 0) {
				titleClone.html(titleClone.html().substr(0, titleClone.html().length - 1));
			}
			var nbrCaracters = titleClone.html().length - 1;
			this.options._components.title.html(applyGradientToTitle(titleClone.text(), nbrCaracters));
		}
		titleClone.remove();
		
		if (typeof this.options.parentWindow == 'undefined' || this.options.parentWindow.length == 0) {
			var buttonIcon = this.options._components.button.children('img').clone();
			var iconWidth = 17;
			this.options._components.button.html(title);
			var buttonClone = this.options._components.button.clone().css('width', 'auto').insertAfter(this.options._components.button);
			if (buttonClone.width() + iconWidth > this.options._components.button.innerWidth()) {
				while (buttonClone.width() + iconWidth > this.options._components.button.innerWidth() && buttonClone.html().length > 0) {
					buttonClone.html(buttonClone.html().substr(0, buttonClone.html().length - 1)); 
				}
				var nbrCaracters = buttonClone.html().length - 1;
				this.options._components.button.html(applyGradientToTitle(buttonClone.text(), nbrCaracters));
			}
			buttonIcon.prependTo(this.options._components.button);
			buttonClone.remove();
		}
		
		this.options.title = title;
	},
	_update: function(key, value) {
		switch(key) {
			case 'icon':
				this.options.icon = SIcon.toIcon(value);
				this.options._components.icon.attr('src', this.options.icon);
				break;
			case 'title':
				this._setTitle(value);
				break;
			case 'resizable':
				this.resizable(value);
				break;
			case 'stylesheet':
				this.stylesheet(value);
				break;
		}
	},
	open: function() {
		var that = this;
		
		if (this.is('opened')) {
			return;
		}
		
		if (this._trigger('beforeopen', { type: 'beforeopen' }, { window: this.element }) === false) {
			return;
		}
		
		this.element.appendTo('#desktop');
		if (typeof this.options.parentWindow == 'undefined' || this.options.parentWindow.length == 0) {
			this.options._components.button.appendTo($.webos.window.buttons);
		}
		
		this.element.fadeIn('fast', function() {
			that.toForeground(); //On met la fenetre en avant-plan
			that._trigger('afteropen', { type: 'afteropen' }, { window: that.element }); //On declanche l'evenement correspondant
		});
		
		if (this.options.maximized == true) {
			this.maximize();
		}
		
		if (this.options.top != undefined) {
			this.options._content.css('top', this.options.top);
		}
		if (this.options.left != undefined) {
			this.options._content.css('left', this.options.left);
		}
		
		if (typeof this.options.top == 'undefined' && typeof this.options.left == 'undefined') { //Si on ne fournit pas la position, on centre la fenetre
			this.center(); //On la centre si l'on a pas definit sa position
		}
		
		if (typeof this.options.parentWindow == 'undefined' || this.options.parentWindow.length == 0) {
			this.options._components.button.fadeIn('fast');
		}
		
		this.option('title', this.options.title);
		this._trigger('open', { type: 'open' }, { window: this.element });
		this.options.states.opened = true;
		this._defineDimentions(); //On stocke en memoire ses dimentions
	},
	close: function() {
		var that = this;
		
		if (this.is('closed')) {
			return;
		}
		
		if(this._trigger('beforeclose', { type: 'beforeclose' }, { window: this.element }) === false) {
			return;
		}
		
		this.element.addClass('closing');
		
		this._trigger('close', { type: 'close' }, { window: this.element });
		this.options.states.opened = false;
		
		if (typeof this.options.childWindow != 'undefined' && this.options.childWindow.length > 0) {
			this.options.childWindow.window('close');
			this.options.childWindow = [];
		}
		
		if (typeof this.options.parentWindow != 'undefined' && this.options.parentWindow.length > 0) {
			this.options.parentWindow.window('option', 'childWindow', []);
		}
		
		this.element.fadeOut('fast', function() {
			that._trigger('afterclose', { type: 'afterclose' }, { window: that.element });
			$(this).removeClass('closing');
			$(this).detach();
			if (typeof $.webos.window.getActive() != 'undefined') {
				$.webos.window.getActive().window('toForeground');
			}
		});
		if (typeof this.options.parentWindow == 'undefined' || this.options.parentWindow.length == 0) {
			this.options._components.button.fadeOut('fast', function() {
				$(this).detach();
			});
		}
	},
	maximize: function() {
		if (this.is('maximized')) {
			return;
		}
		
		if (!this.options.maximizable) {
			return;
		}
		
		this._defineDimentions();
		
		var maxHeight = $('#desktop').height();
		var maxWidth = $('#desktop').width();
		
		this.element.animate({
			width: maxWidth,
			height: maxHeight,
			top: 0,
			left: 0
		}, 'fast');
		
		var that = this;
		var element = this.element;
		
		this.options._content.addClass('animating').animate({
			width: maxWidth,
			height: (maxHeight - that.options._components.header.height())
		}, 'fast', function() {
			element
				.addClass('maximized')
				.removeClass('animating');
			
			that._trigger('maximize', { type: 'maximize' }, { window: that.element });
			that.options.states.maximized = true;
			that._trigger('resize', { type: 'resize' }, { window: that.element });
		});
		this.element
			.draggable('disable')
			.resizable('disable')
			.children('.title-window').css('cursor','auto');
	},
	minimize: function() {
		if (this.is('minimized')) {
			return;
		}
		
		if (this.options.maximizable == true) {
			var dimentions = this.options._dimentions;
			var position = this.options._position;
			
			var that = this;
			
			this.options._content.animate({
				width: dimentions.width,
				height: (that.options._dimentions.height - that.options._components.header.height())
			}, 'fast');
			
			this.element.addClass('animating').animate({
				width: dimentions.width,
				height: dimentions.height,
				top: position.top,
				left: position.left
			}, 'fast', function() {
				that._defineDimentions();
				$(this)
					.removeClass('animating')
					.removeClass('maximized');
				
				that._trigger('minimize', { type: 'minimize' }, { window: that.element });
				that.options.states.maximized = false;
				that._trigger('resize', { type: 'resize' }, { window: that.element });
			});
			
			this.element
				.draggable('enable')
				.resizable('enable')
				.children('.title-window').css('cursor','move');
		}
	},
	minimizeOrMaximize: function() {
		if (this.is('maximized')) {
			this.minimize();
		} else {
			this.maximize();
		}
	},
	hide: function() {
		if (this.is('hidden')) {
			return;
		}
		
		this._defineDimentions();
		
		var buttonBarPosition = this.options._components.button.offset();
		
		var that = this;
		
		this.element
			.addClass('hidden-window')
			.removeClass('bg-window')
			.animate({
				opacity: 0,
				width: 0,
				height: 0,
				top: buttonBarPosition.top,
				left: buttonBarPosition.left
			}, {
				duration: 'fast',
				complete: function() {
					$(this).css('display','none');
					that.toBackground();
					var activeWindow = $.webos.window.getActive();
					if (typeof activeWindow != 'undefined') {
						activeWindow.window('toForeground');
					}
					that._trigger('hide', { type: 'hide' }, { window: that.element });
					that.options.states.hidden = true;
				},
				queue: false
			});
		
		if (typeof this.options.childWindow != 'undefined' && this.options.childWindow.length > 0 && this.options.childWindow.is(':visible:not(:animated)')) {
			this.options.childWindow.window('hide');
		}
		if (typeof this.options.parentWindow != 'undefined' && this.options.parentWindow.length > 0 && this.options.parentWindow.is(':visible:not(:animated)')) {
			this.options.parentWindow.window('hide');
		}
	},
	show: function() {
		if (this.is('visible')) {
			return;
		}
		
		if (typeof this.options.parentWindow != 'undefined' && this.options.parentWindow.length > 0 && this.options.parentWindow.is(':hidden:not(:animated)')) {
			this.options.parentWindow.window('show');
		}
		
		var position, dimentions;
		if (this.element.is('.maximized')) {
			position = { top: 0, left: 0 };
			dimentions = { height: $('#desktop').height(), width: $('#desktop').width() };
		} else {
			position = this.options._position;
			dimentions = this.options._dimentions;
		}
		
		var that = this;
		
		this.element
			.css('display','block')
			.removeClass('hidden-window')
			.animate({
				opacity: 1,
				width: dimentions.width,
				height: dimentions.height,
				top: position.top,
				left: position.left
			}, {
				duration: 'fast',
				complete: function() {
					that._trigger('show', { type: 'show' }, { window: that.element });
					that.options.states.hidden = false;
				},
				queue: false
			});

		this.toForeground();
		
		if (typeof this.options.childWindow != 'undefined' && typeof this.options.childWindow.length > 0 && this.options.childWindow.is(':hidden:not(:animated)')) {
			this.options.childWindow.window('show');
		}
	},
	hideOrShow: function() {
		if (this.is('hidden')) {
			this.show();
		} else {
			this.hide();
		}
	},
	toForeground: function() {
		$.webos.window.allToBackGroundExcluding(this.element);
		
		if (this.is('foreground')) {
			return;
		}
		
		this.element.css('z-index', $.webos.window.requestZIndex());
		this._restoreScrolls();
		this._restoreFocus();
		this.element.removeClass('bg-window');
		this._trigger('toforeground', { type: 'toforeground' }, { window: this.element });
		this.options.states.foreground = true;
		
		if (!this.options._components.button.is('.window-button-active')) {
			this.options._components.button.addClass('window-button-active');
		}
		if (typeof this.options.childWindow != 'undefined' && this.options.childWindow.length > 0) {
			this.options.childWindow.window('toForeground');
		}
	},
	toBackground: function() {
		if (this.is('background')) {
			return;
		}
		
		this.element.addClass('bg-window');
		this.options._components.button.removeClass('window-button-active');
		this._trigger('tobackground', { type: 'tobackground' }, { window: this.element });
		this.options.states.foreground = false;
	},
	hideOrShowOrToForeground: function() {
		if (this.is('visible')) {
			if (this.is('background')) {
				this.toForeground();
			} else {
				this.hide();
			}
		} else {
			this.show();
		}
	},
	is: function(state) {
		if (typeof this.options.states[state] != 'undefined') {
			return this.options.states[state];
		} else {
			for (var i = 0; i < $.webos.window.states.length; i++) {
				if ($.webos.window.states[i][1] == state) {
					return !this.options.states[$.webos.window.states[i][0]];
				}
			}
		}
		
		return false;
	},
	_defineDimentions: function() {
		if (this.is('maximized')) {
			return;
		}
		
		this.options._dimentions = {};
		this.options._dimentions.width = this.element.width();
		this.options._dimentions.height = this.element.height();
		this.options._position = this.element.position();
		
		this.options._scroll = [];
		var that = this;
		var saveScrollsFn = function() {
			if (this.scrollHeight > $(this).height()) {
				that.options._scroll.push({
					'object': $(this),
					'value': this.scrollHeight
				});
			}
		};
		this.options._content.each(saveScrollsFn);
		this.options._content.children().each(saveScrollsFn);
	},
	dimentions: function() {
		return this.options._dimentions;
	},
	position: function() {
		return this.options._position;
	},
	_restoreScrolls: function() {
		for(var i = 0; i < this.options._scroll.length; i++) {
			var scrollData = this.options._scroll[i];
			scrollData.object.scrollTo(scrollData.value);
		}
	},
	_restoreFocus: function() {
		if (typeof this.options._focus != 'undefined') {
			this.options._focus.focus();
		}
	},
	button: function() {
		return this.options._components.button;
	},
	header: function() {
		return this.options._components.specificHeader;
	},
	center: function() {
		var dimentions = {
			top: ($('#desktop').height() - this.element.outerHeight()) / 2,
			left: ($('#desktop').width() - this.element.outerWidth()) / 2
		};
		dimentions.top = (dimentions.top < 0) ? 0 : dimentions.top;
		dimentions.left = (dimentions.left < 0) ? 0 : dimentions.left;
		this.element.css('top', dimentions.top);
		this.element.css('left', dimentions.left);
	},
	setWidth: function(width) {
		this.element.width(width);
		this.options._content.width(this.element.innerWidth());
	},
	setHeight: function(height) {
		this.options._content.height(height);
	},
	loading: function(value) {
		if (value) {
			if (this.is('loading')) {
				return;
			}
			
			var width = this.options._content.width();
			var height = this.options._content.height();
			this.options._content
				.hide()
				.removeClass('content');
			
			this.options._loadingContent = $('<div></div>', { 'class': 'content loading cursor-wait' })
				.width(width)
				.height(height)
				.css('min-height', '50px')
				.css('min-width', '50px')
				.insertAfter(this.options._content);
			
			if (this.options.resizable) {
				this.element.resizable('option', 'alsoResize', this.options._loadingContent);
			}
			
			this._trigger('loadingstart');
			this.options.states.loading = true;
		} else {
			if (this.is('ready')) {
				return;
			}
			
			this.options._loadingContent.remove();
			delete this.options._loadingContent;
			this.options._content
				.show()
				.addClass('content');
			
			if (this.options.resizable) {
				this.element
					.css('width', 'auto')
					.css('height', 'auto')
					.resizable('option', 'alsoResize', this.options._content);
			}
			
			this._trigger('loadingstop');
			this.options.states.loading = false;
		}
	},
	resizable: function(value) {
		this.options.resizable = (value) ? true : false;
		if (!this.options.resizable && this.options.maximizable) {
			this.maximizable(false);
		}
		
		if (this.options.resizable) {
			var that = this;
			var content = this.options._content;
			
			this.element.resizable({
				alsoResize: content,
				minWidth: 200,
				minHeight: 150,
				handles: 'all',
				stop: function() {
					that._defineDimentions();
					that._setTitle(that.options.title);
				}
			});
		} else {
			this.element.resizable('destroy');
		}
	},
	draggable: function() {
		var that = this;
		
		this.element.draggable({
			handle: this.options._components.header,
			cancel: '.controllers, .header-specific ul > *',
			scroll: false,
			containment: [- $('#desktop').width(), $('#desktop').offset().top, 2 * $('#desktop').width(), $('#desktop').offset().top + 2 * $('#desktop').height()],
			snap: '#desktop',
			snapMode: 'inner',
			start: function(event, ui) {
				
			},
			drag: function(event, ui) {
				
			}
		});
		
		if (!STheme.current.animations()) {
			this.element.draggable({
				addClasses: false,
				helper: function() {
					return $('<div></div>', { 'class': 'webos-window-manip-helper' })
						.height(that.element.height())
						.width(that.element.width())
						.css('top', that.element.css('top'))
						.css('left', that.element.css('left'));
				}
			}).bind('dragstop', function(e, ui) {
				if (!that.element.is(e.target)) {
					return;
				}
				
				that.element
					.css('top', $(ui.helper).css('top'))
					.css('left', $(ui.helper).css('left'));
			});
		}
		
		this.element.bind('dragstop', function(e, ui) {
			if (!that.element.is(e.target)) {
				return;
			}
			
			if (that.element.offset().left + that.element.width() < 0) {
				that.element.css('left', 0);
			}
			if (that.element.offset().left > $('#desktop').width()) {
				that.element.css('left', $('#desktop').width() - that.element.width());
			}
			if (that.element.offset().top + 3 > $('#desktop').innerHeight() + $('#desktop').offset().top) {
				var topPos = $('#desktop').height() - that.element.outerHeight();
				if (topPos < 0) {
					topPos = 0;
				}
				that.element.css('top', topPos);
			}
			that._defineDimentions();
		});
	},
	workspace: function(workspace) {
		if (typeof workspace != 'undefined') {
			this.options.workspace = workspace;
		} else {
			return this.options.workspace;
		}
	},
	closeable: function(value) {
		if (typeof value == 'undefined') {
			return this.options.closeable;
		} else {
			this.options.closeable = (value) ? true : false;
			if (this.options.closeable) {
				this.element.removeClass('not-closeable');
			} else {
				this.element.addClass('not-closeable');
			}
		}
	},
	hideable: function(value) {
		if (typeof value == 'undefined') {
			return this.options.hideable;
		} else {
			this.options.hideable = (value) ? true : false;
			if (this.options.hideable) {
				this.element.removeClass('not-hideable');
			} else {
				this.element.addClass('not-hideable');
			}
		}
	},
	maximizable: function(value) {
		if (typeof value == 'undefined') {
			return this.options.maximizable;
		} else {
			this.options.maximizable = (value) ? true : false;
			if (this.options.maximizable) {
				this.element.removeClass('not-maximizable');
			} else {
				this.element.addClass('not-maximizable');
			}
		}
	},
	stylesheet: function(stylesheet) {
		if (typeof stylesheet == 'undefined') {
			return this.options.stylesheet;
		} else {
			new W.Stylesheet(stylesheet, this.selector());
		}
	}
});
$.webos.widget('window', windowProperties);

$.webos.window = function(options) {
	return $('<div></div>').window(options);
};

$.webos.window.states = [
	['opened', 'closed'],
	['foreground', 'background'],
	['hidden', 'visible'],
	['maximized', 'minimized'],
	['loading', 'ready']
];

$.webos.window.buttons = $('<ul></ul>', { id: 'windows-buttons' });

$.webos.window.about = function(opts) {
	//Options par defaut
	var defaults = {
		parentWindow: $.webos.window.getActive(),
		name: 'Programme',
		version: '',
		description: '',
		author: 'la communaut&eacute;'
	};
	
	//On complete les options fournies
	var options = $.extend(defaults, opts);
	
	var aboutWindow = $.webos.window({
		parentWindow: options.parentWindow,
		title: '&Agrave; propos de '+options.name,
		icon: options.icon,
		resizable: false,
		hideable: false,
		width: 400,
		stylesheet: 'usr/share/css/gnome/aboutwindow.css'
	});
	
	var windowContent = aboutWindow.window('content');
	
	if (typeof options.icon != 'undefined') {
		$('<img />', { 'class': 'icon' })
			.attr('src', SIcon.toIcon(options.icon).realpath(64))
			.appendTo(windowContent);
	}
	
	$('<h2></h2>')
		.html(options.name+' '+options.version)
		.appendTo(windowContent);
	
	$.webos.label(options.description).appendTo(windowContent);
	
	$.webos.label('D&eacute;velopp&eacute; par '+options.author)
		.addClass('detail')
		.appendTo(windowContent);
	
	if (typeof options.website != 'undefined') {
		$('<a></a>', { href: options.website })
			.html('Site Web de '+options.name)
			.appendTo(windowContent);
	}
	
	var buttons = $.webos.buttonContainer().appendTo(windowContent);
	
	$.webos.button('Fermer')
		.click(function() {
			aboutWindow.window('close');
		})
		.appendTo(buttons);
	
	return aboutWindow;
};

$.webos.window.dialog = function(opts) {
	var dialog = $.webos.window(opts);
	
	dialog.window('content').css('padding', '5px');
	
	return dialog;
};

$.webos.window.confirm = function(opts) {
	var defaults = {
		title: 'Confirmation',
		label: '&Ecirc;tes-vous s&ucirc;r de vouloir effectuer cette action ?',
		cancel: function() {},
		confirm: function() {},
		cancelLabel: 'Annuler',
		confirmLabel: 'Valider'
	};
	
	var options = $.extend(defaults, opts);
	
	var confirm = $.webos.window.dialog({
		title: options.title,
		parentWindow: options.parentWindow,
		resizable: false,
		hideable: false,
		width: 450
	});
	
	var form = $.w.entryContainer().appendTo(confirm.window('content'));
	
	$.w.image(new SIcon('actions/help')).css('float', 'left').appendTo(form);
	$('<strong></strong>').html(options.label).appendTo(form);
	
	var buttonContainer = $.w.buttonContainer().css('clear', 'both').appendTo(form);
	$.w.button(options.cancelLabel).click(function() {
		confirm.window('close');
		options.cancel();
	}).appendTo(buttonContainer);
	$.w.button(options.confirmLabel, true).appendTo(buttonContainer);
	
	form.submit(function() {
		confirm.window('close');
		options.confirm();
	});
	
	return confirm;
};

//Nombre de caracteres qui seront en degrade si le titre d'une fenetre est trop long
$.webos.window.windowsTitleGradientLength = 5;

$.webos.window.zIndexRange = [1005, 5000];
$.webos.window.currentZIndex = $.webos.window.zIndexRange[0];
$.webos.window.requestZIndex = function() {
	var nextZIndex = $.webos.window.currentZIndex + 1;
	
	if (nextZIndex > $.webos.window.zIndexRange[1]) {
		var diff = nextZIndex - $.webos.window.zIndexRange[0];
		$.webos.window.getWindows().each(function() {
			var thisZIndex = parseInt($(this).css('z-index'));
			if (thisZIndex > $.webos.window.zIndexRange[0]) {
				$(this).css('z-index', thisZIndex - diff);
			}
		});
		nextZIndex -= diff;
	}
	
	$.webos.window.currentZIndex = nextZIndex;
	return nextZIndex;
};

$.webos.window.hideAll = function() { //Cacher toutes les fenetres
	var list = SWorkspace.getCurrent().getWindows();
	for(var i = 0; i < list.length; i++) {
		list[i].window('hide');
	}
};
$.webos.window.showAll = function() { //Afficher toutes les fenetres
	var list = SWorkspace.getCurrent().getWindows();
	for(var i = 0; i < list.length; i++) {
		list[i].window('show');
	}
};
$.webos.window.hideOrShowAll = function() { //Afficher ou cacher ttes les fenetres
	var list = SWorkspace.getCurrent().getWindows();
	for(var i = 0; i < list.length; i++) {
		list[i].window('hideOrShow');
	}
};
$.webos.window.getActive = function() { //Recuperer la fenetre active
	if ($.webos.window.getWindows().filter(':visible').length > 0) {
		var visibleWindows = $.webos.window.getWindows().filter(':visible');
		var activeWindow, activeWindowZIndex = $.webos.window.zIndexRange[0];
		visibleWindows.each(function() {
			var thisWindowZIndex = parseInt($(this).css('z-index'));
			if (typeof activeWindow == 'undefined' || activeWindowZIndex < thisWindowZIndex) {
				activeWindow = $(this);
				activeWindowZIndex = thisWindowZIndex;
			}
		});
		return activeWindow;
	} else {
		return;
	}
};
$.webos.window.allToBackground = function() { //Envoyer toutes les fenetres a l'arriere-plan
	var list = SWorkspace.getCurrent().getWindows();
	for(var i = 0; i < list.length; i++) {
		list[i].window('toBackground');
	}
};
$.webos.window.allToBackGroundExcluding = function(excludedWindow) { //Envoyer ttes les fenetres a l'arriere-plan sauf la fenetre specifiee
	var list = SWorkspace.getCurrent().getWindows();
	for(var i = 0; i < list.length; i++) {
		if (list[i].window('id') != excludedWindow.window('id')) {
			list[i].window('toBackground');
		}
	}
};
$.webos.window.setButtonsBorder = function() { //Definir le bord des boutons des fenetres
	$.webos.window.buttons.children('.window-button-last').removeClass('window-button-last');
	$.webos.window.buttons.children('.window-button:visible').last().addClass('window-button-last');
};
$.webos.window.getWindows = function() { //Recuperer TOUTES les fenetres (tous espaces de travail confondus)
	return $('#desktop').children('.webos-window').not('.closing');
};
$.webos.window.getWindowById = function(id) { //Recuperer une fenetre a aprtir de son ID
	var list = $.webos.window.getWindows();
	for(var i = 0; i < list.length; i++) {
		if (list[i].window('option','id') == id) {
			return list[i];
		}
	}
};

//WindowHeader
var windowHeaderProperties = $.webos.extend(containerProperties, {
	_name: 'windowheader'
});
$.webos.widget('windowHeader', windowHeaderProperties);

//WindowHeaderMenu
var windowHeaderMenuProperties = $.webos.extend(windowHeaderProperties, {
	_name: 'menuwindowheader'
});
$.webos.widget('menuWindowHeader', windowHeaderMenuProperties);

$.webos.menuWindowHeader = function() {
	return $('<ul></ul>').menuWindowHeader();
};

//WindowHeaderMenuItem
var menuWindowHeaderItemProperties = $.webos.extend(containerProperties, {
	_name: 'menuwindowheaderitem',
	options: {
		label: ''
	},
	_create: function() {
		this.options._components.label = $('<a></a>', { href: '#' }).html(this.options.label).appendTo(this.element);
		this.options._content = $('<ul></ul>').appendTo(this.element);
	},
	label: function() {
		return this.options._components.label;
	}
});
$.webos.widget('menuWindowHeaderItem', menuWindowHeaderItemProperties);

$.webos.menuWindowHeaderItem = function(label) {
	return $('<li></li>').menuWindowHeaderItem({
		label: label
	});
};

//ToolbarWindowHeader
var toolbarWindowHeaderProperties = $.webos.extend(windowHeaderProperties, {
	_name: 'toolbarwindowheader'
});
$.webos.widget('toolbarWindowHeader', toolbarWindowHeaderProperties);

$.webos.toolbarWindowHeader = function() {
	return $('<ul></ul>').toolbarWindowHeader();
};

//ToolbarWindowHeaderItem
var toolbarWindowHeaderItemProperties = $.webos.extend(containerProperties, {
	_name: 'toolbarwindowheaderitem',
	options: {
		active: false
	},
	_create: function() {
		if (typeof this.options.label != 'undefined' && this.options.label != '') {
			this._setLabel(this.options.label);
		}
		
		if (typeof this.options.icon != 'undefined') {
			this._setIcon(this.options.icon);
		}
		
		this.active(this.options.active);
	},
	_setIcon: function(src) {
		if (typeof this.options._components.icon == 'undefined') {
			this.options._components.icon = $('<img />', { alt: '' }).prependTo(this.element);
		}
		this.options._components.icon.attr('src', src);
	},
	_setLabel: function(text) {
		if (typeof this.options._components.label == 'undefined') {
			this.options._components.label = $('<span></span>').appendTo(this.element);
		}
		this.options._components.label.html(text);
	},
	active: function(value) {
		if (typeof value == 'undefined') {
			return this.options.active;
		} else {
			this.options.active = (value) ? true : false;
			if (this.options.active) {
				this.element.addClass('active');
			} else {
				this.element.removeClass('active');
			}
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'icon':
				this._setIcon(value);
				break;
			case 'label':
				this._setLabel(value);
				break;
			case 'active':
				this.active(value);
				break;
		}
	}
});
$.webos.widget('toolbarWindowHeaderItem', toolbarWindowHeaderItemProperties);

$.webos.toolbarWindowHeaderItem = function(label, icon) {
	return $('<li></li>').toolbarWindowHeaderItem({
		label: label,
		icon: icon
	});
};

//WindowHeaderSearch
$.webos.widget('windowHeaderSearch', searchEntryProperties);

$.webos.windowHeaderSearch = function() {
	return $('<li></li>').windowHeaderSearch();
};

//ButtonWindowHeader
var buttonWindowHeaderProperties = $.webos.extend(windowHeaderProperties, {
	_name: 'buttonwindowheader'
});
$.webos.widget('buttonWindowHeader', buttonWindowHeaderProperties);

$.webos.buttonWindowHeader = function() {
	return $('<ul></ul>').buttonWindowHeader();
};

//ButtonWindowHeaderItem
var buttonWindowHeaderItemProperties = $.webos.extend(containerProperties, {
	_name: 'buttonwindowheaderitem',
	_create: function() {
		if (typeof this.options.icon == 'undefined') {
			this.options.icon = '';
		}
		
		this.options._components.separator = $('<div></div>')
			.addClass('buttonwindowheaderseparator')
			.appendTo(this.element);
		this.options._components.icon = $('<img />', { alt: '' })
			.attr('src', this.options.icon)
			.appendTo(this.element);
		this.element.append('<br />');
		this.options._content = $('<span></span>')
			.html(this.options.label)
			.appendTo(this.element);
		
		var that = this;
		
		this.element.click(function() {
			that.select();
		});
	},
	icon: function() {
		return this.options._components.icon;
	},
	select: function() {
		if (!this.element.is('.active')) {
			this.element.parent('ul').children('li.active').removeClass('active').trigger('unselect');
			this.element.addClass('active').trigger('update').trigger('select');
			this._trigger('select');
		}
	}
});
$.webos.widget('buttonWindowHeaderItem', buttonWindowHeaderItemProperties);

$.webos.buttonWindowHeaderItem = function(label, icon) {
	return $('<li></li>').buttonWindowHeaderItem({
		label: label,
		icon: icon
	});
};

//ContextMenu
var contextMenuProperties = $.webos.extend(containerProperties, {
	options: {
		target: undefined,
		disabled: false
	},
	_name: 'contextmenu',
	_create: function() {
		if (typeof this.options.target != 'undefined') {
			this._setTarget(this.options.target);
		}
	},
	_setTarget: function(target) {
		var that = this;
		
		this.element.appendTo(W.UserInterface.current.element);
		
		this.element.hide();
		
		target.bind('contextmenu', function(e) {
			if (that.options.disabled) {
				return false;
			}
			
			var clickFn = function() {
				that.element.fadeOut('fast');
			};
			
			var childContextmenuOpened = false;
			$('ul.webos-contextmenu').each(function() {
				if ($(this).is(':visible')) {
					var childTarget = $(this).contextMenu('option', 'target');
					if (target.is(childTarget)) {
						$(this).hide();
					} else if (target.find(childTarget).length > 0) {
						childContextmenuOpened = true;
					} else {
						$(this).hide();
					}
				}
			});
			
			if (childContextmenuOpened) {
				return false;
			}

			var y = e.pageY;
			var x = e.pageX;
			
			that.element.show();

			var maxY = y + that.element.height();
			var maxX = x + that.element.width();
			
			if(maxY > $(document).height()) { // Si le curseur est en bas de page, on remonte le menu contextuel
				y = y - that.element.height();
			}

			if(maxX > $(document).width()) { // Si le curseur est trop a droite, on le decale a gauche
				x = x - that.element.width();
			}
			
			// Afficher le menu
			$(document).unbind('click', clickFn);
			that.element.hide().css({ top: y, left: x }).fadeIn('fast');
			
			// Hover events
			that.element.find('a').hover(function() {
				that.element.find('li.hover').removeClass('hover');
				$(this).parent().addClass('hover');
			}, function() {
				that.element.find('li.hover').removeClass('hover');
			});
			
			// When items are selected
			var itemSelect = function(event) {
				clickFn();
				event.preventDefault();
			};
			that.element.find('a').unbind('click', itemSelect);
			that.element.find('li:not(.disabled) a').click(itemSelect);
			
			// Hide bindings
			setTimeout(function() { // Delay for Mozilla
				$(document).one('click', clickFn);
			}, 0);
		});
		
		// Disable text selection
		if( $.browser.mozilla ) {
			this.element.each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
		} else if( $.browser.msie ) {
			this.element.each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
		} else {
			this.element.each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
		}
		
		target.add('ul.webos-contextmenu').bind('contextmenu', function(event) {
			event.preventDefault();
		});
		
		this.options.target = target;
	},
	destroy: function() {
		if (typeof this.options.target != 'undefined') {
			this.options.target.unbind('contextmenu');
		}
	}
});
$.webos.widget('contextMenu', contextMenuProperties);

$.webos.contextMenu = function(target) {
	return $('<ul></ul>').contextMenu({
		target: target
	});
};

//ContextMenuItem
var contextMenuItemProperties = $.webos.extend(containerProperties, {
	options: {
		label: '',
		disabled: false,
		separator: false
	},
	_name: 'contextmenu-item',
	_create: function() {
		var that = this;
		
		this.options._content = $('<a></a>', { href: '#' }).appendTo(this.element);
		this.options._components.childs = $('<ul></ul>').appendTo(this.element);
		
		this.content().click(function() {
			if (that.options.disabled) {
				return false;
			}
		});
		
		this._setLabel(this.options.label);
		this.disabled(this.options.disabled);
		this.separator(this.options.separator);
	},
	_update: function(key, value) {
		switch (key) {
			case 'label':
				this._setLabel(value);
				break;
			case 'disabled':
				this.disabled(value);
				break;
			case 'separator':
				this.separator(value);
				break;
		}
	},
	_setLabel: function(label) {
		this.content().html(label);
	},
	disabled: function(value) {
		if (typeof value != 'undefined') {
			value = (value) ? true : false;
			this.options.disabled = value;
		} else {
			return this.options.value;
		}
	},
	separator: function(value) {
		if (typeof value != 'undefined') {
			value = (value) ? true : false;
			this.options.separator = value;
			if (value) {
				this.element.addClass('separator');
			} else {
				this.element.removeClass('separator');
			}
		} else {
			return this.options.separator;
		}
	},
	childs: function() {
		return this._components.childs;
	}
});
$.webos.widget('contextMenuItem', contextMenuItemProperties);

$.webos.contextMenuItem = function(label, separator) {
	return $('<li></li>').contextMenuItem({
		label: label,
		separator: separator
	});
};