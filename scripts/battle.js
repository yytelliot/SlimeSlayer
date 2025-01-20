

// turns is the no. of qns
// enemies is the number of qns left to pass
// playerhp is the number of qns before failure
// bosshp is half the total number of qns

window.onload = function() {
    userid = localStorage.getItem('userid');
    questid = localStorage.getItem('questid');
    console.log(userid);
    console.log(questid);
    localStorage.setItem('bosskill','false');
    
    let timeoutDisplay;
    let turns, type, enemies, enemiesleft, bosshp, bosshpleft
    let points = 0;
    let bossfight = false;

    const dbRefQuests = firebase.database().ref('quests');
    const dbRefScores = firebase.database().ref('scores');
    const dbRefLogin = firebase.database().ref('login');

    // info button
    document.getElementById("info").addEventListener('click', () => {
        document.getElementById("popup").style.display = "block"
    })

    document.getElementById("home").addEventListener('click', () => {
        document.getElementById("popup").style.display = "none"
    })

    // generate random number between and inclusive of min, max
    function getRandom(min,max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // add event listener
    function addButtonEventListeners() {
        document.querySelectorAll(".wrong").forEach(function(i) {
            i.addEventListener('click', wrongAnsSelected);
        })

        document.querySelector(".correct").addEventListener ('click', correctAnsSelected);
    }

    // remove event listener
    function removeButtonEventListeners() {
        document.querySelectorAll(".wrong").forEach(function(i) {
            i.removeEventListener('click', wrongAnsSelected);
        })

        document.querySelector(".correct").removeEventListener ('click', correctAnsSelected)
    }

    // clear button class assignments
    function resetClassList() {
        document.querySelector('#option1').classList.remove("correct");
        document.querySelector('#option2').classList.remove("correct");
        document.querySelector('#option3').classList.remove("correct");

        document.querySelector('#option1').classList.add("wrong");
        document.querySelector('#option2').classList.add("wrong");
        document.querySelector('#option3').classList.add("wrong");
    }

    function checkBoss() {
        if (enemiesleft === 0) { 

            enemiesleft = -1;

            clearTimeoutDisplay();

            document.getElementById("result").classList.add("w3-amber");
            document.getElementById("result").innerHTML = "WARNING: BOSS FIGHT";
            timeoutDisplay = setTimeout(() => {document.getElementById("result").innerHTML = "";}, 3000);

            document.getElementById("quest-header").innerHTML = "Boss Fight!";
            document.getElementById("monsterimg").src = "enemy/slimeboss.png";
            document.getElementById("monsterimg").style.height = "220px";
            document.getElementById("remaininghp").style.width = "100%";
            document.getElementById("enemycount").innerHTML = `Boss HP: ${bosshp}`

            bossfight = true;
        }
    }

    // generates wrong answers
    function genWrongAns(correctAns,type) {
        let ans1, ans2, ans3;

        // addition
        if (type === 1) {
            ans1 = getRandom(1,200);
            ans2 = getRandom(1,200);
            ans3 = getRandom(1,200);
        }

        // subtraction
        if (type === 2) {
            ans1 = getRandom(1,100);
            ans2 = getRandom(1,100);
            ans3 = getRandom(1,100);
        }

        // multiplication
        if (type === 3) {
            ans1 = getRandom(1,100);
            ans2 = getRandom(1,100);
            ans3 = getRandom(1,100);
        }

        // division
        if (type === 4) {
            ans1 = getRandom(1,10);
            ans2 = getRandom(1,10);
            ans3 = getRandom(1,10);
        }

        if (ans1 === ans2 || ans2 === ans3 || ans3 === ans1 ||
            ans1 === correctAns || ans2 === correctAns || ans3 === correctAns) {
            genWrongAns(correctAns,type)
        }
        else {
            document.querySelector('#option1').innerHTML=ans1;
            document.querySelector('#option2').innerHTML=ans2;
            document.querySelector('#option3').innerHTML=ans3;
        }
    }

   
    // refresh question
    function nextQn() {
        turns--;
        document.getElementById("turns").innerHTML = `Turns left to complete quest: ${turns}`;

        if (turns <= 0) {

            // disable buttons
            document.querySelectorAll(".wrong").forEach(function(i) {
                i.removeEventListener('click',correctAnsSelected);
                i.removeEventListener('click',wrongAnsSelected);
            })
            document.querySelectorAll(".correct").forEach(function(i) {
                i.removeEventListener('click',correctAnsSelected);
                i.removeEventListener('click',wrongAnsSelected);
            })

            resetClassList();
            clearTimeoutDisplay();

            if (enemiesleft <= 0) {
                document.getElementById("result").classList.add("w3-blue");
                document.getElementById("result").innerHTML = "Quest complete!";

                localStorage.setItem('passed','true');

                if (bosshpleft <= 0) {
                    localStorage.setItem('bosskill','true');
                }
                else {
                    localStorage.setItem('bosskill','false');
                }

            }
            else {
                document.getElementById("result").classList.add("w3-red");
                document.getElementById("result").innerHTML = "Quest failed!";

                localStorage.setItem('passed','false');
            }

            localStorage.setItem('score',points);

            dbRefLogin.child(userid).once('value', snap => {
                if (!snap.child("isTeacher").val()) {
                    dbRefScores.child(questid + "/" + userid).once('value', snap => {
                        if (points > snap.val()) {
                            dbRefScores.child(questid + "/" + userid).set(points);
                        }
                        setTimeout(() => {window.location.replace("gameover.html") ;}, 2000);
                    })
                }
                else {
                    setTimeout(() => {window.location.replace("gameover.html") ;}, 2000);
                }
            })
        }

        else {
            checkBoss();
            console.log("next!");

            // refresh event listener
            removeButtonEventListeners();

            // clear correct
            resetClassList();
            

            if (type == 0) {
                question(getRandom(1,4));
            }
            else {
                question(type);
            }

        }

    }

    function setTimeoutDisplay() {
        timeoutDisplay = setTimeout(() => {document.getElementById("result").innerHTML = "";}, 1500);
    }

    function clearTimeoutDisplay() {
        clearTimeout(timeoutDisplay);
        document.getElementById("result").classList.remove("w3-text-white");
        document.getElementById("result").classList.remove("w3-green");
        document.getElementById("result").classList.remove("w3-grey");
        document.getElementById("result").classList.remove("w3-amber");
    }

    // correct answer
    function correctAnsSelected() {

        clearTimeoutDisplay();
        document.getElementById("result").classList.add("w3-green");
        document.getElementById("result").innerHTML = "Hit!";
        setTimeoutDisplay();
    
        if (bossfight === true) {
            bosshpleft -= 100;
            document.getElementById("enemycount").innerHTML = `Boss HP: ${bosshpleft}`;
            document.getElementById("remaininghp").style.width = `${bosshpleft/bosshp*100}%`;
        }
        else {
            enemiesleft--;
            document.getElementById("enemycount").innerHTML = `enemies left: ${enemiesleft}`;
            document.getElementById("remaininghp").style.width = `${enemiesleft/enemies*100}%`;
        }
        points++;
        nextQn();
    }

    //wrong answer
    function wrongAnsSelected() {
        clearTimeoutDisplay();
        document.getElementById("result").classList.add("w3-text-white");
        document.getElementById("result").classList.add("w3-grey");
        document.getElementById("result").innerHTML = "Miss!";
        setTimeoutDisplay();
        nextQn();
    }


    // game
    function question(type) {
        let ans = 0;
        if (type === 1) {
            // generate random numbers
            let num1 = getRandom(1,100);
            let num2 = getRandom(1,100);

            // put random numbers in question displayed
            document.getElementById("qn").innerHTML=`You have ${num1} apples. You recieve ${num2} more. How many apples do you have?`;

            // calculate correct answer and generate wrong answers
            ans = num1 + num2;
            genWrongAns(ans,type);
            console.log(ans);
        }

        if (type === 2) {
            // generate random numbers
            let num1 = getRandom(1,100);
            let num2 = getRandom(1,num1);

            // put random numbers in question displayed
            document.getElementById("qn").innerHTML=`You have ${num1} oranges. You give away ${num2}. How many oranges do you have?`;


            // calculate correct answer and generate wrong answers
            ans = num1 - num2;
            genWrongAns(ans,type);
            console.log(ans);
        }

        if (type === 3) {
            let num1 = getRandom(1,10);
            let num2 = getRandom(1,10);

            document.getElementById("qn").innerHTML=`You have ${num1} boxes of ${num2} fruits. How many fruits do you have in total?`;

            ans = num1 * num2;
            genWrongAns(ans,type);
            console.log(ans);
        }

        if (type === 4) {
            let num2 = getRandom(1,10);
            ans = getRandom(1,10);
            let num1 = ans * num2;

            document.getElementById("qn").innerHTML=`You share ${num1} fruits among ${num2} friends. How many does each friend get?`;
            genWrongAns(ans,type);
            console.log(ans);
        }

        // set correct answer as random option
        let correctOpt = getRandom(1,3);
        document.querySelector(`#option${correctOpt}`).innerHTML=`${ans}`;

        // assign correct button
        let correctButton = document.querySelector(`#option${correctOpt}`);
        correctButton.classList.remove("wrong");
        correctButton.classList.add("correct");

        addButtonEventListeners();

    }

    // game start
    dbRefQuests.child(questid).once('value').then(snap => {
        console.log(snap.val());
        turns = snap.child("questions").val();
        enemies = Math.round(turns/2);
        enemiesleft = Math.round(turns/2);
        bosshp = (turns-enemies)*100;
        bosshpleft = (turns-enemies)*100
        switch (snap.child("type").val()) {
            case "Mix":
                type = 0;
                break;
            case "Addition":
                type = 1;
                break;
            case "Subtraction":
                type = 2;
                break;
            case "Multiplication":
                type = 3;
                break;
            case "Division":
                type = 4;
                break;
        }
        console.log(type);

        // set display enemy count and turns
        document.getElementById("enemycount").innerHTML = `enemies left: ${enemiesleft}`
        document.getElementById("turns").innerHTML = `Turns left to complete quest: ${turns}`

        if (type == 0) {
            question(getRandom(1,4));
        }
        else {
            question(type);
        }
    });



}
