window.onload = function() {

    // get session info
    const username = localStorage.getItem('username');
    const userid = localStorage.getItem('userid');
    console.log(username);

    if (userid === null) {
        document.getElementById("session-expire").innerHTML = `
            <h1>Session expired, please login</h1>
        `
    }
    else {
        const dbRefQuests = firebase.database().ref('quests');
        const dbRefScores = firebase.database().ref('scores');
        const dbRefLogin = firebase.database().ref('login');

        
        // enable display if teacher
        dbRefLogin.once('value').then(snap => {
            if (snap.child(userid + "/isTeacher").val() == true) {
                document.getElementById("teacher").style.display = "block";
                document.getElementById("session-expire").style.display = "none";
            }
            else (
                document.body.innerHTML = `
                    <div class="w3-container">
                        <h1>Authorised access only</h1>
                    </div>
               `
            )
        })

        document.getElementById("welcome").innerHTML = `
            <h1>Welcome, ${username}</h1>
        `;

        
        // refresh list of quizzes
        function refreshList() {
            document.getElementById("quiz-select").innerHTML = `
            <optgroup label="Quiz selection">
                    <option value="null">Select a quiz</option>

            </optgroup>`

            dbRefQuests.once('value', snap => {
                document.getElementById("active-quests").innerHTML = `
                Active quizzes: ${snap.numChildren()}
            `
            })

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
    
        // list students when a quiz is selected
        document.getElementById("quiz-select").onchange = () => {
            
            let quizId = document.getElementById("quiz-select").value;

            if (quizId != "null") {

                let max = 0;

                // quiz type and header query
                dbRefQuests.child(quizId).once('value').then(snap => {

                    // quiz type
                    let quizType = snap.child("type").val();

                    if (quizType != null) {
                        document.getElementById("quiz-type").innerHTML = `
                            Quiz Type: ${snap.child("type").val()}`
                    }
                    else {
                        document.getElementById("quiz-type").innerHTML = `
                            Quiz Type: `
                    }

                    // create header
                    document.getElementById("scoretable").innerHTML = `
                        <tr class="w3-blue-grey">
                            <th>Index</th>
                            <th>Name</th>
                            <th>Score (Max: ${snap.child("questions").val()})</th>
                        </tr>`;
                    max = snap.child("questions").val();
                })



                dbRefLogin.orderByChild("index").once('value').then(snap => {
                    snap.forEach( i => {
                        if (!i.child("isTeacher").val()) {

                            dbRefScores.child(quizId + "/" +i.key).once('value').then(snap => {
                                let newContent = document.createElement('tr');
                                let passing = max/2;
                                let score = snap.val();

                                // checks for colour change of score (pass/fail/nc)
                                if (snap.val() == null) {
                                    newContent.innerHTML = `
                                        <td>${i.child("index").val()}</td>
                                        <td>${i.child("name").val()}</td>
                                        <td class="w3-text-blue">Not Completed</td>
                                        `
                                }
                                else if (snap.val() >= 0 && score >= passing ) {
                                    newContent.innerHTML = `
                                        <td>${i.child("index").val()}</td>
                                        <td>${i.child("name").val()}</td>
                                        <td>${snap.val()}</td>
                                    `
                                }
                                else if (snap.val() >= 0 && score < passing ) {
                                    newContent.innerHTML = `
                                        <td>${i.child("index").val()}</td>
                                        <td>${i.child("name").val()}</td>
                                        <td class="w3-text-red">${snap.val()}</td>
                                    `
                                }
                                else {
                                    newContent.innerHTML = `
                                        <td>${i.child("index").val()}</td>
                                        <td>${i.child("name").val()}</td>
                                        <td class="w3-text-blue">Not Completed</td>
                                    `
                                }
                                document.getElementById("scoretable").appendChild(newContent);  
                                })
                                

                            
                        }
                    })
                })
            }
            else {
                document.getElementById("scoretable").innerHTML = `
                        <tr class="w3-blue-grey">
                            <th>Index</th>
                            <th>Name</th>
                            <th>Score (Max: 0)</th>
                        </tr>`;
            }
        }

        // delete selected quest button
        document.getElementById("quest-delete").onclick = () => {
            let quizId = document.getElementById("quiz-select").value;
            if (quizId != "null") {
                if (confirm("Are you sure you want to delete this quiz?")) {
                    dbRefQuests.child(quizId).remove();
                    dbRefScores.child(quizId).remove();
                    document.getElementById("scoretable").innerHTML = `
                            <tr class="w3-blue-grey">
                                <th>Index</th>
                                <th>Name</th>
                                <th>Score</th>
                            </tr>`;
                    refreshList();
                }
            }
        }


        // event listners and stuff for pop-up menu (display box when clicked)
        document.getElementById("open-makequiz").addEventListener('click', () => {
            document.getElementById("makequiz").style.display = "block"
        })
        document.getElementById("close-makequiz").addEventListener('click', () => {
            document.getElementById("makequiz").style.display = "none"
        })

        document.getElementById("open-makeacc").addEventListener('click', () => {
            document.getElementById("makeacc").style.display = "block"
        })
        document.getElementById("close-makeacc").addEventListener('click', () => {
            document.getElementById("makeacc").style.display = "none"
        })

        // make quiz button
        document.getElementById("submit-makequiz").onclick = () => {
            let quizName = document.getElementById("quiz-name").value;
            let quizSubject = document.getElementById("quiz-subject").value;
            let quizQty = parseInt(document.getElementById("quiz-qty").value);
            let quizId = generateID();
            let quizDate = Date.now();
            if (quizName != "" && !Number.isNaN(quizQty) && quizQty <= 100 && quizQty >= 1) {
                dbRefQuests.child(quizId).set({
                    name: quizName,
                    type: quizSubject,
                    questions: quizQty,
                    date: quizDate
                });

                dbRefScores.child(quizId + "/max").set(quizQty);

                // dbRefLogin.once('value').then(snap => {snap.forEach(i => {
                //     if (i.val().index != 0) {
                //         dbRefScores.child(quizId + '/' + i.key).set(-1)
                //     }
                // }) })
                alert(quizName + " quiz set!");
                refreshList();
            }
        }


        // make account button
        document.getElementById("submit-makeacc").onclick = () => {
            let studentId = document.getElementById("student-id").value;
            let studentName = document.getElementById("student-name").value;
            let studentPass = document.getElementById("student-password").value;

            // checks for empty field
            if (studentId != "" && studentName != "" && studentPass != "") {

                let first = studentId.charAt(0);
                let last = studentId.charAt(studentId.length-1);
                let numbers = studentId.slice(1,8);
                
                // ID validation (9 characters, capital letters first and last, only numbers in between)
                if (studentId.length == 9 && /[A-Z]/.test(first) && /[A-Z]/.test(last)
                && numbers.length == 7 && numbers.match(/[0-9]+/)) {

                    dbRefLogin.once('value').then(snap => {

                        // check if student has been entered before
                        unique = !snap.hasChild(studentId);
                        if (unique) {

                            // create new student in db
                            dbRefLogin.child(studentId).set({
                                name: studentName,
                                password: studentPass,
                                isTeacher: false,

                            })

                            // rearrange index number by name
                            dbRefLogin.orderByChild("name").once('value').then(snap => {

                                let index = 1;
                    
                                snap.forEach(e => {
                                    if (e.child("isTeacher").val() != true) {
                                        dbRefLogin.child(e.key + "/index").set(index);
                                        index++;
                                    }
                                });
                            })

                            alert(studentId + " registered successfully!");
                        }
                        else {
                            alert(studentId + " has already been registered");
                        }

                    })
                }
                else {
                    alert("Please enter a valid NRIC number. (Remember to capitalize first and last letters!)");
                }

            }

        }

        function getRandom(min, max) {
            return Math.floor( Math.random() * (max - min + 1)) + min;
        }

        // generate UUID for quiz
        function generateID() {
            let idlength = 8;
            let timestamp = Date.now();
            let ts = timestamp.toString();
            let parts = ts.split("").reverse();
            let id = "";
            for( let i = 0; i < idlength; i++ ) {
                var index = getRandom(0, parts.length - 1);
                id += parts[index];	 
            }
            
            return id;
        }
    }

}
    
    
