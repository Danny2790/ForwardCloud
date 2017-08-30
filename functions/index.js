const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./forward-19374-firebase-adminsdk-x6yti-e734378e0d.json");

admin.initializeApp({
	credential : admin.credential.cert(serviceAccount),
	databaseURL: "https://forward-19374.firebaseio.com"
});
console.log("serviceAccount : " + serviceAccount);

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!" + serviceAccount);
});

exports.sendCommentNotification  = functions.database.ref('/comments/{postId}/{commentId}').onWrite(event =>{
	const commentId = event.params.commentId;
	const postId = event.params.postId;
	const feedRefPath = '/feeds/' + postId;
	const commentRefPath = '/comments' +  commentId;
 	const postRef = admin.database().ref(feedRefPath);
 	const commentRef = admin.database().ref(commentRefPath);
 	const commentUser = event.data.val();

 	console.log(' commentUser name ' + commentUser.userName);

 	// notification message : sender commented on your post
 	commentRef.once("value").then(function(snapshot){
 		
 		console.log( ' userName ' + snapshot.child('userName').val());
 	});

 	postRef.once("value").then(function(snapshot){
 		console.log(' email ' + snapshot.child("userInfo").child('email').val());
 	});
 	
	console.log(" postId  :" + postId);
	console.log(" comment  :" + commentId);
	console.log(" data : " + event.data);
	console.log(" data first : " + event.data[0]);
});
