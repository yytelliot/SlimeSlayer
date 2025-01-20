window.onload = function() {
    const userid = localStorage.getItem("userid");

    const dbRefQuests = firebase.database().ref('quests');
    // const dbRefLogin = firebase.database().ref('login');
    const dbRefScores = firebase.database().ref('scores');



    dbRefQuests.orderByChild("date").once('value').then(snap => {

        // populate quest container with quests
        document.getElementById("qContainer").innerHTML = "";
        snap.forEach( i => {

            dbRefScores.on('value', snap => {
                score = snap.child(i.key + "/" + userid).val();
                max = snap.child(i.key + "/max").val();
                let newContent = document.createElement('div');
                console.log(score);

                // list questions if no score
                if (score == null) {

                    newContent.innerHTML = `
                        <div class="w3-third">
                            <div id="${i.key}" class="quest w3-center w3-margin w3-yellow w3-card">
                                <h1 class="w3-grey w3-text-white cursive silver">Slay <span class="gold">${i.child("questions").val()}</span> slimes</h1>
                                <div class="quest-name">${i.child("name").val()}</div>                
                            </div>
                        </div>`
                }

                // mark complete if passed
                else if (score >= max/2) {

                    newContent.innerHTML = `
                        <div class="w3-third">
                            <div id="${i.key}" class="quest w3-center w3-margin w3-yellow w3-card">
                                <h1 class="w3-blue cursive silver">Quest Complete!</h1>
                                <div class="quest-name">${i.child("name").val()}</div>                
                            </div>
                        </div>`
                }

                // mark failed if failed
                else {
                
                    newContent.innerHTML = `
                        <div class="w3-third">
                            <div id="${i.key}" class="quest w3-center w3-margin w3-yellow w3-card">
                                <h1 class="w3-red cursive silver">Quest Failed!</h1>
                                <div class="quest-name">${i.child("name").val()}</div>                
                            </div>
                        </div>`
                }

                // list quests and make clickable
                document.getElementById("qContainer").appendChild(newContent);
                document.querySelectorAll(".quest").forEach(function(i) {
                    // console.log(i);
                    i.addEventListener('click', battle);
                });
            })

            // DEBUG
            // console.log(e.child("name").val());
            // console.log(e.key);

            //creat new div for each quest

        });

        // save quest id to local storage so battle.html knows which quiz to load
        function battle() {
            localStorage.setItem('questid',this.id);
            location.href = "battle.html";
        }

    });


}