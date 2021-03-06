var confWindow = args.getParam(0);
var content = confWindow.window('content');

confWindow.window('dialog', true).window('stylesheet', '/usr/share/css/gconf/categories/users.css');

var form = $.w.entryContainer().appendTo(content);

var usersList = $.w.list().addClass('userslist').appendTo(form);

var addButton = $.w.button('Ajouter').click(function() {
	createUserFn();
});
usersList.list('addButton', addButton);
var removeButton = $.w.button('Supprimer');
usersList.list('addButton', removeButton);

var editUser = $.w.container().addClass('edituser').appendTo(form);
var editUser_name_container = $.w.container().appendTo(editUser);
var editUser_picture = $('<img />', { src: new W.Icon('stock/person'), 'class': 'userpicture' }).appendTo(editUser_name_container);
var editUser_name = $.w.label();
var editUser_name_title = $('<h2></h2>').append(editUser_name).appendTo(editUser_name_container);
var editUser_username = $.w.label().appendTo(editUser);
var editUser_email = $.w.label().appendTo(editUser);
editUser.append('<br />');
var editUser_disabled = $.w.label().appendTo(editUser);
var editUser_authorizations = $.w.label().appendTo(editUser);
editUser.append('<br />');
var editUser_password_container = $.w.container().appendTo(editUser);
$('<strong></strong>').html('Connection options').appendTo(editUser_password_container);
var editUser_password = $.w.label().appendTo(editUser_password_container);

var editables = {
	'realname': {
		element: editUser_name,
		container: editUser_name_container,
		label: 'Display name: ',
		onEdit: function(user, realname) {
			if (realname == user.get('realname')) {
				return;
			}
			
			if (!user.set('realname', realname)) {
				W.Error.trigger('Cannot change the display name of "'+user.get('username')+'"');
				return;
			}
			
			confWindow.window('loading', true);
			
			user.sync(new W.Callback(function() {
				confWindow.window('loading', false);
			}, function(response) {
				confWindow.window('loading', false);
				response.triggerError('Cannot edit user "'+user.get('username')+'"');
			}));
		}
	},
	'username': {
		element: editUser_username,
		label: 'Username: ',
		onEdit: function(user, username) {
			if (username == user.get('username')) {
				return;
			}
			
			if (!user.set('username', username)) {
				W.Error.trigger('Cannot change the username of "'+user.get('username')+'"');
				return;
			}
			
			confWindow.window('loading', true);
			
			user.sync(new W.Callback(function() {
				confWindow.window('loading', false);
			}, function(response) {
				confWindow.window('loading', false);
				response.triggerError('Cannot edit user "'+user.get('username')+'"');
			}));
		}
	},
	'email': {
		element: editUser_email,
		label: 'E-mail: ',
		onEdit: function(user, email) {
			if (email == user.get('email')) {
				return;
			}
			
			if (!user.set('email', email)) {
				W.Error.trigger('Cannot change the e-mail of "'+user.get('username')+'"');
				return;
			}
			
			confWindow.window('loading', true);
			
			user.sync(new W.Callback(function() {
				confWindow.window('loading', false);
			}, function(response) {
				confWindow.window('loading', false);
				response.triggerError('Cannot edit user "'+user.get('username')+'"');
			}));
		}
	},
	'disabled': {
		element: editUser_disabled,
		type: 'boolean',
		label: 'Account disabled: ',
		multiEdit: true,
		onEdit: function(users, value) {
			users.each(function() {
				if (!this.set('disabled', value)) {
					W.Error.trigger('Cannot enable or disable user "'+user.get('username')+'"');
					return false;
				}
			});
			
			confWindow.window('loading', true);

			var calls = [];
			users.each(function() {
				var call = this.sync([function() {}, function() {}]);

				calls.push(call);
			});

			var group = Webos.Observable.group(calls);
			group.one('success', function() {
				confWindow.window('loading', false);
			});
			group.oneEach('error', function(data) {
				confWindow.window('loading', false);
				data.result.triggerError('Cannot edit selected users');
			});
		}
	},
	'authorizations': {
		element: editUser_authorizations,
		type: 'authorizations',
		label: 'Permissions: ',
		multiEdit: true,
		onEdit: function(users, selection) {
			confWindow.window('loading', true);

			var showAuthSelector = function showAuthSelector(auth, callback) {
				var editAuthorizationsWindow = $.w.window.dialog({
					title: 'Editing permissions',
					parentWindow: confWindow,
					resizable: false
				});
				
				var form = $.w.entryContainer().appendTo(editAuthorizationsWindow.window('content'));
				
				var entries = {};
				for (var i = 0; i < W.Authorizations.all.length; i++) {
					var checked = false;
					if (auth.can(W.Authorizations.all[i])) {
						checked = true;
					}
					
					entries[W.Authorizations.all[i]] = $.w.checkButton(W.Authorizations.all[i], checked).appendTo(form);
				}
				
				var buttonContainer = $.w.buttonContainer().appendTo(form);
				$.webos.button('Cancel').click(function() {
					editAuthorizationsWindow.window('close');
				}).appendTo(buttonContainer);
				$.webos.button('Submit', true).appendTo(buttonContainer);
				
				form.submit(function() {
					var authorizations = [];
					for (var authorization in entries) {
						if (entries[authorization].checkButton('value')) {
							authorizations.push(authorization);
						}
					}
					
					editAuthorizationsWindow.window('close');
					
					auth.set(authorizations);
					
					callback(auth);
				});
				
				editAuthorizationsWindow.window('open');
			};

			var setAuthToUsers = function(auth) {
				var calls = [];
				users.each(function() {
					var call = this.setAuthorizations(auth, [function() {}, function() {}]);

					calls.push(call);
				});

				var group = Webos.Observable.group(calls);
				group.one('success', function() {
					confWindow.window('loading', false);
				});
				group.oneEach('error', function(data) {
					confWindow.window('loading', false);
					data.result.triggerError('Cannot change users permissions');
				});
			};

			var auth = new Webos.Authorizations();
			if (selection == 'select') { //Autorisations specifiques
				users.item(0).authorizations([function(auth) {
					confWindow.window('loading', false);
					showAuthSelector(auth, function(auth) {
						confWindow.window('loading', true);
						setAuthToUsers(auth);
					});
				}, function() {
					confWindow.window('loading', false);
					showAuthSelector(auth, function(auth) {
						confWindow.window('loading', true);
						setAuthToUsers(auth);
					});
				}]);
			} else {
				auth.model(selection);

				setAuthToUsers(auth);
			}
		},
		choices: {
			'user': 'Limited user',
			'admin': 'Administrator',
			'guest': 'Guest',
			'select': 'Custom...'
		}
	},
	'password': {
		element: editUser_password,
		container: editUser_password_container,
		type: 'password',
		label: 'Password: ',
		onShowEdit: function(user) {
			var editPasswordWindow = $.w.window.dialog({
				title: 'Change password',
				parentWindow: confWindow,
				resizable: false
			});
			
			var form = $.w.entryContainer().appendTo(editPasswordWindow.window('content'));
			
			var actualPassword = $.w.passwordEntry('Current password: ').appendTo(form);
			var newPassword = $.w.passwordEntry('New password: ').appendTo(form);
			$.w.label('Password strength: ').appendTo(form);
			var passwordPowerIndicator = $.webos.progressbar().appendTo(form);
			var verifNewPassword = $.w.passwordEntry('Confirm password: ').appendTo(form);
			
			var buttonContainer = $.w.buttonContainer().appendTo(form);
			$.webos.button('Cancel').click(function() {
				editPasswordWindow.window('close');
			}).appendTo(buttonContainer);
			var applyButton = $.webos.button('Submit', true).button('disabled', true).appendTo(buttonContainer);
			
			newPassword.keyup(function() {
				var passwordPower = Webos.User.evalPasswordPower(newPassword.passwordEntry('value'));
				passwordPowerIndicator.progressbar('value', passwordPower);
			});
			
			var checkFormFn = function() {
				var valid = true;
				
				var passwordPower = Webos.User.evalPasswordPower(newPassword.passwordEntry('value'));
				if (passwordPower == 0) {
					valid = false;
				}
				
				if (newPassword.passwordEntry('value') !== verifNewPassword.passwordEntry('value')) {
					valid = false;
				}
				
				return valid;
			};
			form.keyup(function() {
				if (checkFormFn() !== true) {
					applyButton.button('disabled', true);
				} else {
					applyButton.button('disabled', false);
				}
			}).submit(function() {
				if (checkFormFn() !== true) {
					return;
				}
				
				editPasswordWindow.window('close');
				confWindow.window('loading', true);
				
				user.setPassword(actualPassword.passwordEntry('value'), newPassword.passwordEntry('value'), new W.Callback(function() {
					confWindow.window('loading', false);
				}, function(response) {
					confWindow.window('loading', false);
					response.triggerError('Cannot change password of "'+user.get('username')+'"');
				}));
			});
			
			editPasswordWindow.window('open');
			return false;
		}
	}
};

var usersBeingEdited = null, $editAreas = $();
var enableUserEditFn = function(users) {
	if (users.length == 0) {
		disableUserEditFn();
		return;
	}

	editUser.show();

	var collection = new Webos.Collection(users);

	if (usersBeingEdited) {
		usersBeingEdited.unbind('update.user_editing.users.gconf');
	}

	$editAreas.remove();
	$editAreas = $();

	collection.bind('update.user_editing.users.gconf', function() {
		enableUserEditFn(users);
	});

	usersBeingEdited = collection;
	
	for (var key in editables) {
		(function(key, editable) {
			var editButton, editEntry, editArea = $.w.entryContainer();

			var container = editable.container || editable.element;
			if (editable.multiEdit != true && collection.length() > 1) {
				container.hide();
				return;
			} else {
				container.show();
			}

			switch(editable.type) {
				case 'password':
					editButton = $.w.button('Edit');
					editEntry = $.w.passwordEntry(editable.label);
					editEntry.append($.w.button('Submit', true));
					break;
				case 'authorizations':
					editEntry = $.w.selectButton(editable.label, editable.choices).bind('change', function() {
						editArea.submit();
					}).selectButton('value', 'select');
					editEntry.append($.w.button('Submit', true));
					editButton = $.w.button('Edit');

					if (collection.length() == 1) {
						collection.item(0).authorizations(new W.Callback(function(auth) {
							var model = auth.model();
							editEntry.selectButton('value', auth.model());
							editButton.button('option', 'label', editable.choices[auth.model()]);
						}));
					}
					break;
				case 'boolean':
					var usersEnabled;
					collection.each(function() {
						if (typeof usersEnabled == 'undefined') {
							usersEnabled = this.get(key);
						} else if (usersEnabled !== null && usersEnabled != this.get(key)) {
							usersEnabled = null;
						}
					});

					var label = 'Edit';
					if (usersEnabled === true) {
						label = 'Yes';
					} else if (usersEnabled === false) {
						label = 'No';
					}

					editButton = $.w.button(label);
					editEntry = $.w.checkButton(editable.label).checkButton('value', usersEnabled);
					editEntry.append($.w.button('Submit', true));
					break;
				case 'varchar':
				default:
					var label = 'Edit', entryValue = '';
					if (collection.length() == 1) {
						label = collection.item(0).get(key) || 'Vide';
						entryValue = collection.item(0).get(key) || '';
					}

					editButton = $.w.button(label);
					editEntry = $.w.textEntry(editable.label).textEntry('value', entryValue);
					editEntry.append($.w.button('Submit', true));
			}

			editArea.append(editEntry);
			
			var argUsers = (editable.multiEdit != true) ? collection.item(0) : collection;

			editButton.click(function() {
				if (typeof editable.onShowEdit != 'undefined' && !editable.onShowEdit(argUsers)) {
					return;
				}
				
				editable.element.hide();
				editArea.show();
				editArea.find('input').focus();
			});
			
			editArea.submit(function() {
				var newValue;
				switch(editable.type) {
					case 'password':
						newValue = editEntry.passwordEntry('value');
						break;
					case 'authorizations':
						newValue = editEntry.selectButton('value');
						editButton.html(editable.choices[newValue]);
						break;
					case 'boolean':
						newValue = editEntry.checkButton('value');
						editButton.text((newValue) ? 'Yes' : 'No');
						break;
					case 'varchar':
					default:
						newValue = editEntry.textEntry('value');
						editButton.text(newValue || 'Empty');
				}
				
				editable.element.show();
				editArea.hide();
				
				editable.onEdit(argUsers, newValue);
			});
			
			editable.element.html(editable.label).append(editButton);
			editArea.hide();
			editable.element.after(editArea);
			$editAreas = $editAreas.add(editArea);
		})(key, editables[key]);
	}
};

var disableUserEditFn = function() {
	editUser.hide();
	if (usersBeingEdited) {
		usersBeingEdited.unbind('update.user_editing.users.gconf');
	}
	userBeingEdited = null;
};

var createUserFn = function() {
	var createUserWindow = $.w.window.dialog({
		title: 'Create a new user',
		parentWindow: confWindow,
		resizable: false
	});

	var form = $.w.entryContainer().appendTo(createUserWindow.window('content'));

	var checkFormFns = [];
	var checkFormFn = function() {
		for (var i = 0; i < checkFormFns.length; i++) {
			if (checkFormFns[i]() == false) {
				return false;
			}
		}
		return true;
	};
	
	var entries = {};
	
	for (var key in editables) {
		(function(key, editable) {
			var editEntry;
			switch(editable.type) {
				case 'password':
					editEntry = $.w.label();
					var newPassword = $.w.passwordEntry('New password: ').appendTo(editEntry);
					$.w.label('Password strength: ').appendTo(editEntry);
					var passwordPowerIndicator = $.webos.progressbar().appendTo(editEntry);
					var verifNewPassword = $.w.passwordEntry('Confirm password: ').appendTo(editEntry);
					
					newPassword.keyup(function() {
						var passwordPower = Webos.User.evalPasswordPower(newPassword.passwordEntry('value'));
						passwordPowerIndicator.progressbar('value', passwordPower);
					});
					
					checkFormFns.push(function() {
						if (Webos.User.evalPasswordPower(newPassword.passwordEntry('value')) == 0) {
							return false;
						}
						
						if (newPassword.passwordEntry('value') != verifNewPassword.passwordEntry('value')) {
							return false;
						}
					});
					
					entries[key] = newPassword;
					break;
				case 'boolean':
					editEntry = $.w.checkButton(editable.label);
					entries[key] = editEntry;
					break;
				case 'authorizations':
					editEntry = $.w.selectButton(editable.label, editable.choices);
					entries[key] = editEntry;
					break;
				case 'varchar':
				default:
					editEntry = $.w.textEntry(editable.label);
					checkFormFns.push(function() {
						if (editEntry.textEntry('value').length == 0) {
							return false;
						}
					});
					entries[key] = editEntry;
			}
			
			form.append(editEntry);
		})(key, editables[key]);
	}
	
	var buttonContainer = $.w.buttonContainer().appendTo(form);
	$.webos.button('Cancel').click(function() {
		createUserWindow.window('close');
	}).appendTo(buttonContainer);
	var applyButton = $.webos.button('Submit', true).button('disabled', true).appendTo(buttonContainer);
	
	form.keyup(function() {
		if (checkFormFn() !== true) {
			applyButton.button('disabled', true);
		} else {
			applyButton.button('disabled', false);
		}
	}).submit(function() {
		if (checkFormFn() !== true) {
			return;
		}
		
		var data = {
			'username': entries.username.textEntry('value'),
			'realname': entries.realname.textEntry('value'),
			'password': entries.password.passwordEntry('value'),
			'email': entries.email.textEntry('value'),
			'disabled': entries.disabled.checkButton('value')
		};
		
		var authObject = W.Authorizations.models[entries.authorizations.selectButton('value')];
		if (typeof authObject == 'undefined') {
			authObject = {};
		}
		var auth = new W.Authorizations(authObject);
		
		createUserWindow.window('loading', true);
		
		W.User.create(data, auth, new W.Callback(function() {
			createUserWindow.window('close');
			refreshUsersListFn();
		}, function(response) {
			createUserWindow.window('loading', false);
			response.triggerError();
		}));
	});
	
	createUserWindow.window('open');
};

var refreshUsersListFn = function() {
	disableUserEditFn();
	usersList.list('content').empty();
	confWindow.window('loading', true);
	W.User.list(new W.Callback(function(list) {
		for (var id in list) {
			(function(user) {
				var item = $.w.listItem();

				item.data('user.users_list.users.gconf', user);

				item.bind('listitemselect listitemunselect', function() {
					var selectedUsers = [];
					usersList.list('selection').each(function() {
						selectedUsers.push($(this).data('user.users_list.users.gconf'));
					});

					enableUserEditFn(selectedUsers);
				}).appendTo(usersList.list('content'));
				
				var column = item.listItem('column');
				
				$('<img />', { src: new W.Icon('stock/person'), 'class': 'userpicture' }).appendTo(column);
				var realname = $('<strong></strong>').text(user.get('realname')).appendTo(column);
				column.append('<br />');
				var username = $('<em></em>').text(user.get('username')).appendTo(column);
				
				user.unbind('update.users_list.users.gconf remove.users_list.users.gconf');
				user.bind('update.users_list.users.gconf', function(data) {
					switch (data.key) {
						case 'realname':
							realname.text(data.value);
							break;
						case 'username':
							username.text(data.value);
							break;
						case 'disabled':
							item.toggleClass('userdisabled', data.value);
							break;
					}
				});
				user.bind('remove.users_list.users.gconf', function() {
					if (item.listItem('active')) {
						disableUserEditFn();
						removeButton.unbind('click');
					}
					
					item.remove();
				});

				item.toggleClass('userdisabled', user.get('disabled'));
				
				if (user.isLogged()) {
					item.listItem('active', true);
				}
			})(list[id]);
		}

		removeButton.click(function() {
			var msg;
			if (!usersBeingEdited || usersBeingEdited.length() == 0) {
				return;
			} else if (usersBeingEdited.length() == 1) {
				var user = usersBeingEdited.item(0);
				msg = 'Do you really want to delete the user <em>'+user.get('username')+'</em>?';
			} else {
				msg = 'Do you really want to delete '+usersBeingEdited.length()+' selected users?';
			}

			var confirm = $.w.window.confirm({
				parentWindow: confWindow,
				label: msg,
				confirm: function() {
					confWindow.window('loading', true);

					var calls = [];
					usersBeingEdited.each(function() {
						var call = this.remove([function() {}, function() {}]);

						calls.push(call);
					});

					var group = Webos.Observable.group(calls);
					group.one('success', function() {
						confWindow.window('loading', false);
					});
					group.oneEach('error', function(data) {
						confWindow.window('loading', false);
						data.result.triggerError('Cannot delete selected users');
					});
				}
			});
			confirm.window('open');
		});
		
		confWindow.window('loading', false);
	}, function(response) {
		form.hide().after('<p>Cannot retrieve users list.</p>');
		confWindow.window('loading', false);
		response.triggerError('Cannot retrieve users list');
	}));
};

refreshUsersListFn();