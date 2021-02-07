const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
// Trigger When User Being Created
exports.newUserSignup = functions.auth.user().onCreate(user => {
   return admin.firestore().collection('users').doc(user.uid).set({
       email : user.email ,
       upvotedOn : [] ,
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
//Upvoting Function
exports.upvote = functions.https.onCall(async (data , context) => {
    if(!context.auth) {
        throw  new functions.https.HttpsError(
            'unauthenticated',
            'unauthenticated user'
        );
    }
//    Get Ref For User And Requested Doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);
//    Check User Hasn't Already Upvoted The Request
    const doc = await user.get();
        if(doc.data().upvotedOn.includes(data.id)){
            throw  new functions.https.HttpsError(
                'failed-precondition' ,
                'You Can Only Upvote Once'
            );
        }
        //    Update User Upvoted Array
        await user.update({
            upvotedOn:[...doc.data().upvotedOn , data.id] ,
        }).then(() => {
            return request.update({
                upvote: admin.firestore.FieldValue.increment(1)
            })
        });
});
// Firestore Triggers
exports.logActivites = functions.firestore.document('/{collection}/{id}').onCreate
((snap , context) =>{
    console.log(snap);
    const  collection = context.params.collection;
    const  id = context.params.id;
    const activites = admin.firestore().collection('activites');
    if(collection == 'requests'){
        return activites.add({text: "New Request Has Been Added"});
    }
    if (collection == 'users'){
        return activites.add({text: "New User Has Been Created"});
    }
    return  null;
})