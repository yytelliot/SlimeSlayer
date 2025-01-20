window.onload = function() {

    const dbRefQuests = firebase.database().ref('quests');
    const dbRefScores = firebase.database().ref('scores');
    const dbRefLogin = firebase.database().ref('login');

    // dbRefLogin.once('value').then(snap => {
    //     snap.forEach(id => {

    //         if (!id.child("isTeacher").val()) {
    //             console.log(id.key)
    //             dbRefLogin.child(id.key + "/score").set(0)
    //         }
        
    //     });
    // });
    


    // dbRefLogin.once('value').then(snap => {
    //     snap.forEach(e => {
    //         let userId = e.key;
    //         if (!snap.child("isTeacher")) {
    //             let scores = 0;
    //             dbRefScores.once('value').then(snap => {
    //                 console.log("hi")

    //             })
    //         }
    //     })
    // }) 

    function refreshList() {
        document.getElementById("quiz-select").innerHTML = `
        <optgroup label="Quiz selection">
                <option value="null">Select a quiz</option>

        </optgroup>`

        dbRefQuests.orderByChild("date").once('value').then(snap => {
            snap.forEach( i => {
                // create new option for each quest
                let newContent = document.createElement('option');
                newContent.innerHTML = `${i.val().name}`
                newContent.value = `${i.key}`
                document.getElementById("quiz-select").appendChild(newContent);
            })
        })

    }

    refreshList();

    document.getElementById("quiz-select").onchange = () => {

        document.getElementById("scoretable").innerHTML = `
            <tr id="scoreheader" class="w3-teal">
                <th>Name</th>
                <th>Score</th>
            </tr>`
        
        let quizId = document.getElementById("quiz-select").value;

        dbRefScores.child(quizId).orderByValue().on('value', snap => {

            let studentArr = [];
            let scoreArr = [];
    
            // fill arrays
            snap.forEach(e => {
                if (e.key != "max") {
                    studentArr.push(e.key);
                    scoreArr.push(e.val());
                }
            });
    
            // sort by descending
            stuentArr = studentArr.reverse();
            scoreArr = scoreArr.reverse();

            // only populate with top 5 scores
            for (let i = 0; i < 5; i++) {
                dbRefLogin.child(studentArr[i] + "/name").on('value', snap => {
                    document.getElementById("tablediv").style.display = "block";
                    let newContent = document.createElement('tr');
                    if (snap.val() != null) {
                        newContent.innerHTML = `
                            <td>${snap.val()}</td>
                            <td>${scoreArr[i]*100}</td>`
                    }
                    document.getElementById("scoretable").appendChild(newContent);
                })
            }
        })
        
    }





}