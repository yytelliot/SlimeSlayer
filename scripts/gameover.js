window.onload = function() {

    const dbRefQuests = firebase.database().ref('quests');
    const dbRefScores = firebase.database().ref('scores');
    const dbRefLogin = firebase.database().ref('login');

    const score = parseInt(localStorage.getItem('score'));
    const passed = (localStorage.getItem('passed') === 'true');
    const bosskill = (localStorage.getItem('bosskill') === 'true');
    const userid = localStorage.getItem('userid');
    const questid = localStorage.getItem('questid');

    // console.log(userid);
    // console.log(score);

    if (passed) {
        document.body.style.backgroundImage = "url('bg/splashbg.jpg')";
        document.getElementById('logo').src = "banners/questSuccess.png"
        document.getElementById('playerscore').innerHTML = `Your score: ${score*100}`
        if (bosskill == true) {
            document.getElementById('playerscore').innerHTML = `<span id="bosskilled" class="w3-text-amber">Boss defeated! </span> Your score: ${score*100}`
        }
    }
    else {
        document.getElementById('logo').src = "banners/questFail.png"
        document.getElementById('playerscore').innerHTML = `Your score: ${score*100}`
    }

    // pretty much same code as leaderboard.js
    dbRefScores.child(questid).orderByValue().on('value', snap => {

        let studentArr = [];
        let scoreArr = [];

        snap.forEach(e => {
            if (e.key != "max") {
                studentArr.push(e.key);
                scoreArr.push(e.val());
            }
        });

        stuentArr = studentArr.reverse();
        scoreArr = scoreArr.reverse();
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
