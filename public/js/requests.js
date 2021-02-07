var vue = new Vue({
    el: '#app',
    data: {
        requests: []
    } ,methods: {
        upvoteRequest(id) {
            const upvote = firebase.functions().httpsCallable('upvote');
            upvote({id}).catch(error => {
               console.log(error.message);
            });
        }
    } , mounted() {
        const ref = firebase.firestore().collection('requests').orderBy('upvote' , 'desc');
        ref.onSnapshot(snapshot => {
            let requests = [];
            snapshot.forEach(doc => {
                requests.push({...doc.data() , id: doc.id});
                console.log(requests);
            });
            this.requests = requests;
        })
    }
});
