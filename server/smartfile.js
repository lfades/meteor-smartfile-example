sf = new SmartFile();

sf.configure({
	key: "XXXXXXXXXXXX",
	password: "XXXXXXXXXXXX",
	basePath: "test"/*,
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
	},
	likes: {
		ext: ['jpg', 'png'],
		size: 300000,
		multiple: 3
	},
	/*
	multiple: true // IS OK

	photo: {
		ext: ['jpg', 'png'] // IS OK
	}
	*/
});

Meteor.publish('smartfile', function () {
	if(this.userId)
		return sf.collection.find({'user': this.userId});
	return [];
});