Accounts.onCreateUser(function (options, user) {
	// create an empty profile that we will use later to add the photo
	user.profile = {};
	return user;
});

Meteor.users.deny({
	insert: function () { return true; },
	update: function (userId, doc, fieldNames) {
		var photo = sf.getFiles('photo');
		if(!photo)
			return true;

		var previousPhoto = doc.profile.photo;
		if(previousPhoto) {
			Meteor.defer(function () {
				sf.rm(previousPhoto);
			});
		}

		// we remove the local log file because it is now saved in the user
		sf.cleanSfCollection(userId, 'photo');
		return false;
	},
	remove: function () { return true; }
});

// if you like use methods as me
Meteor.methods({
	editUserPhoto: function () {
		// this method is not using but serves as a replacement update in users deny
		var userId = this.userId;
		if(!userId)
			throw new Meteor.Error(401, 'no user');

		var photo = sf.getFiles('photo');
		if(!photo)
			throw new Meteor.Error(401, 'first upload the image');

		var previousPhoto = Meteor.user().profile.photo;
		if(previousPhoto) {
			Meteor.defer(function () {
				sf.rm(previousPhoto);
			});
		}

		// we remove the local log file because it is now saved in the user
		sf.cleanSfCollection(userId, 'photo');
		Meteor.users.update(userId, {
			'$set': {
				profile: {
					photo: photo
				}
			}
		});
	},
	editUserLikes: function (nameId) {
		var userId = this.userId;
		if(!userId)
			throw new Meteor.Error(401, 'no user');

		var likes = sf.getFiles('likes');
		if(!likes)
			throw new Meteor.Error(401, 'no files to upload');

		if(nameId)
			var only = _.findWhere(likes, {'nameId': nameId})

		var previousLikes = Meteor.user().profile.likes;
		if(previousLikes) {
			if(previousLikes.length === 3)
				throw new Meteor.Error(401, 'already have the maximum number of files, delete some and upload new');
			if(!nameId && (previousLikes.length + likes.length) > 3)
				throw new Meteor.Error(401, 'have too many files to upload, delete some');

			var push = nameId ? only: {'$each': likes};
			if(!push)
				throw new Meteor.Error(401, 'is not found a file with that name');

			Meteor.users.update(userId, {
				'$push': {
					'profile.likes': push
				}
			});
		} else {
			var set = nameId ? [only]: likes;
			Meteor.users.update(userId, {
				'$set': {
					'profile.likes': set
				}
			});
		}

		sf.cleanSfCollection(userId, 'likes', only);
	},
	deleteLikeFile: function (file) {
		var userId = this.userId;
		if(!userId)
			throw new Meteor.Error(401, 'no user');

		var nameId = file.nameId;
		if(!nameId)
			throw new Meteor.Error(401, 'enter the nameId');

		var likes = Meteor.user().profile.likes;
		if(!likes)
			throw new Meteor.Error(401, 'no files to remove');

		if(likes) {
			Meteor.users.update(userId, {
				'$pull': {
					'profile.likes': {'nameId': nameId}
				}
			});
			// the only thing required on file is: nameId
			Meteor.defer(function () {
				sf.rm(file);
			});
		}
	}
});