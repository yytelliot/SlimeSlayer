window.onload = function() {
    const userid = localStorage.getItem("userid");
    const username = localStorage.getItem('username');

    document.getElementById("studentName").innerHTML = username;
    document.getElementById("quest-btn").onclick = () => {
        location.href = "selection.html"
    }

    if (userid === null) {
        window.location.replace("login.html");
    }
    // else if (quests !== null) {
    //     document.getElementById("main").style.display = "block";
    //     document.getElementById("questNum").innerHTML = quests
    // }
    else {
        const dbRefQuests = firebase.database().ref('quests');

        dbRefQuests.once('value', snap => {
            localStorage.setItem('quests',snap.numChildren())
            document.getElementById("main").style.display = "block";
            document.getElementById("questNum").innerHTML = snap.numChildren()
        })
    }   

}