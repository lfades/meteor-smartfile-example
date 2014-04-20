Meteor.users.deny({
	insert: function () { return true; },
	update: function (userId, doc, fieldNames, otro) {
		var photo = sf.getFiles('photo');
		if(!photo)
			return true;

		var previousPhoto = doc.profile.photo;
		if(previousPhoto) {
			Meteor.defer(function () {
				sf.rm(previousPhoto.nameId);
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
		var userId = this.userId;
		if(!userId)
			throw new Meteor.Error(401, 'no user');

		var photo = sf.getFiles('photo');
		if(!photo)
			throw new Meteor.Error(401, 'first upload the image');

		var previousPhoto = Meteor.user().profile.photo;
		if(previousPhoto) {
			Meteor.defer(function () {
				sf.rm(previousPhoto.nameId);
			});
		}

		// we remove the local log file because it is now saved in the user
		sf.cleanSfCollection(userId, 'photo');
		Meteor.users.update(userId, {
			'$set': {
				'profile.photo': photo
			}
		});
	}
});

sf = new SmartFile();

sf.configure({
	key: "XXXXXXXXXXX",
	password: "XXXXXXXXXXX",
	basePath: "prueba"/*,
	fileNameId: function (fileName) {
		// you can change the nameId here
		// the filename has no extension
		return fileName;
	}*/
});

sf.allow = function (options) {
	// you can use this.userId
	return true;
};

sf.onUpload = function (result, options) {
	//result is the smartfile api JSON response
	console.log("File uploaded to " + result[0].path);
};

sf.onUploadFail = function (error, options) {
	console.log("SmartFile returned error", error.statusCode, error.detail);
};

sf.fileControllers({
	photo: {
		ext: ['jpg', 'png'],
		path: '', // optional, path of storage of the upload relative to basePath
		size: 300000, // 300 Kb - default is 2 Mb
		allow: function (options) {
			// you can use this.userId
			return true;
		}
	}
	/* 
	photo: {
		ext: ['jpg', 'png'] // IS OK
	}
	*/
});

Meteor.publish('smartfile', function() {
	if(this.userId)
		return sf.collection.find({'user': this.userId});
	return [];
});