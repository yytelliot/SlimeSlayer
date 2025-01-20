
console.log("hello world");

// DB login details reference
// const dbRefLogin = firebase.database().ref().child('login');
const dbRefLogin = firebase.database().ref('login');

dbRefLogin.on('value', snap => console.log("firebase initialised!"));

function submit() {
    let userid = document.getElementById("login-name").value;
    let inputPassword = document.getElementById("login-password").value;
    
    let realPassword;
    let isTeacher;
    let username;

    if (userid != "") {
        const userInfo = dbRefLogin.child(userid);
        userInfo.on('value', snap => {
            realPassword = snap.child('password').val();
            isTeacher = snap.child('isTeacher').val();
            username = snap.child('name').val();

            // valid password
            if (realPassword != null && inputPassword == realPassword) {
                localStorage.clear()
                localStorage.setItem('userid',userid);
                localStorage.setItem('username',username);

                if (isTeacher == false) {
                    location.href = "splash.html";
                }

                if (isTeacher == true) {
                    location.href = "teacher.html"
                }
            }
            else {
                document.getElementById("wrong-password").innerHTML = "Invalid username/password";
            }
        });
    }  
    else {
        document.getElementById("wrong-password").innerHTML = "Invalid username/password";
    } 
    //console.log(realPassword);


    
}

// enter key convenience lol
// document.querySelector(".loginput").addEventListener("keyup", function(event) {

//     if (event.key === "Enter") {

//       event.preventDefault();
//       submit();

//     }
// });

document.getElementById("login-btn").onclick = () => submit();