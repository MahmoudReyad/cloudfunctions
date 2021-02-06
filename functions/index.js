const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
// Trigger When User Being Created
exports.newUserSignup = functions.auth.user().onCreate(user => {
   return admin.firestore().collection('users').doc(user.uid).set({
       email : user.email ,
       upVote : [] ,
   });
});

// Trigger When User Being Deleted
exports.userDeleted  = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
   return  doc.delete();
});

// Adding New Request
exports.addRequest = functions.https.onCall((data , context) => {
    if(!context.auth) {
      throw  new functions.https.HttpsError(
          'unauthenticated' ,
          'unauthenticated user'
      );
    }else if (data.text.length > 30) {
        throw  new functions.https.HttpsError(
            'invalid-argument' ,
            'The Requset Length Should Be 30 Or Less'
        )
    }else  {
        return admin.firestore().collection('requests').add(
            {
                text : data.text ,
                upvote : 0,
            }
        )
    }
});