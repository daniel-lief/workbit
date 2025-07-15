import * as cb from "https://platinumblock.github.io/chillbase/chillbase.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVUe-NLwbFjPZSxFslfuUl4X-2Hzllo84",
  authDomain: "job-application-tracker-1e28f.firebaseapp.com",
  projectId: "job-application-tracker-1e28f",
  storageBucket: "job-application-tracker-1e28f.firebasestorage.app",
  messagingSenderId: "578567576764",
  appId: "1:578567576764:web:8d2c498ea3601c2cf284b9"
};

function getRandomInt(n) {
  return Math.floor(Math.random() * n) + 1;
}

document.getElementById("signinButton").addEventListener("click", signin);

async function signin(){
    document.getElementById("signinError").style.display = "none";
    var realusername = document.getElementById("signinUsername").value;
    var realpassword = document.getElementById("signinPassword").value;
    var confirmpassword = document.getElementById("signinConfirmPassword").value;
    if(realpassword != confirmpassword){
        document.getElementById("signinError").innerHTML = "The passwords do not match.";
        setTimeout(() => {
            document.getElementById("signinError").style.display = "block";
        }, 50);
        return;
    }
    var users = await cb.getCollection("users");
    for(var user of users.keys()){
        var realUser = users.get(user);
        if(realusername == realUser.username){
            document.getElementById("signinError").innerHTML = "The username you entered is already taken.";
            setTimeout(() => {
                document.getElementById("signinError").style.display = "block";
            }, 50);
            return;
        }
    }
    var userID = getRandomInt(100000);
    await cb.setDocument(userID.toString(), {username:realusername, password:realpassword, applications:""}, "users");
    localStorage.setItem("currentUser", userID);
    localStorage.setItem("currentUserName", realusername);
    window.location.href = "dashboard.html";
}

cb.start(firebaseConfig);