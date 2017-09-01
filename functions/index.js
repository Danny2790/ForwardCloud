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
 	const tokenPath = '/notificationTokens/' + commentUser.userId;
 	const tokenRef = admin.database().ref(tokenPath);

 	// const getDevicetokenPromise = admin.database().ref(tokenPath).once('value');

 	// return Promise.all([getDevicetokenPromise]).then(results =>{
 	// 	const tokensSnapshot = results[0];
 	// 	console.log(' token ' + tokensSnapshot);
 	// 	console.log('token from child  ' + tokensSnapshot.child('token').val());
 
 	// });

 	tokenRef.once("value").then(function(snapshot){

 		const token = snapshot.child('token').val();
 		console.log( ' token value ' + token);

 		const payload = {
	      	notification: {
	        title: 'You have a new Comment!',
	        body: commentUser.userName + ` commented on your post.`
      		}
    	};

    	return admin.messaging().sendToDevice(token, payload).then(response =>{
    	 	response.results.forEach((result, index) => {
    			console.log('response ' + response);
    			console.log(' result.error ' + result.error);
    			console.log(' result.success ' + result.success);
       		});
    	});

 	});

 	console.log(' commentUser name ' + commentUser.userName);

 	// notification message : sender commented on your post
 	// commentRef.once("value").then(function(snapshot){

 	// 	console.log( ' userName ' + snapshot.child('userName').val());
 	// });

 	postRef.once("value").then(function(snapshot){
 		console.log(' email ' + snapshot.child("userInfo").child('email').val());
 	});
 	
	console.log(" postId  :" + postId);
	console.log(" comment  :" + commentId);
	console.log(" data : " + event.data);
	console.log(" data first : " + event.data[0]);
});
