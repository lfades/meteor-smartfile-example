sf = new SmartFile({
	publicRootUrl: "https://file.ac/U1hRCXwFVQA/"
});

// I recommend you open the console to see logs

Meteor.subscribe('smartfile');

Template.smartfile.events({
	'change input[type=file]': function (e) {
		var file = e.target.files[0];
		if(file) {
			sf.preview(file, function(data) {
				if(data) {
					$('#preview-images').append('<img src="' + data.src + '"> ' + data.width +'x' + data.height + ' ' + data.size + ' ' + data.type + ' ' + data.name + '<br>');
					// controller only save a file, upload more than one file erases the previous
					sf.upload(file, 'photo', function (error, res) {
						if(error) {
							console.log("error uploading the file", error);
							$('#preview-images').html('');
							return;
						}
						console.log("File uploaded, the path is:" + sf.resolvePublic(res.nameId));
					});
				}
			});
		}
		/* the above is the same as this 

			// sf.preview only works with images
			sf.preview(file, function(data) {
				if(data)
					$('#preview-images').append('<img src="' + data.src + '"> ' + data.width +'x' + data.height + ' ' + data.size + ' ' + data.type + ' ' + data.name + '<br>');
			});

			sf.upload(file, function (error, res) {
				if(error) {
					console.log("error uploading the file", error);
					return;
				}
				console.log("File uploaded, the path is:" + sf.resolvePublic(res.nameId));
			});
		*/
	},
	'click #save': function (e) {
		if(Meteor.userId()) {
			var file = sf.getFiles('photo');
			// when you save the file, the previous file is deleted from user
			Meteor.users.update(Meteor.userId(), {
				'$set': {
					'profile.photo': file
				}
			}, function (error) {
				console.log(error || 'file saved in the user profile');
			});

			/*
			Meteor.call('editUserPhoto', function (error) {
				console.log(error || 'file saved in the user profile');
			});
			*/
		}
	}
});

Template.smartfile.helpers({
	photo: function () {
		if(Meteor.user()) {
			var photo = Meteor.user().profile && Meteor.user().profile.photo;
			// you can use in template {{ sfPath photo.nameId }} - is the same
			if(photo)
				return sf.resolvePublic(photo && photo.nameId);
		}
	}
});