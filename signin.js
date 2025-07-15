import * as cb from "https://platinumblock.github.io/chillbase/chillbase.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVUe-NLwbFjPZSxFslfuUl4X-2Hzllo84",
  authDomain: "job-application-tracker-1e28f.firebaseapp.com",
  projectId: "job-application-tracker-1e28f",
  storageBucket: "job-application-tracker-1e28f.firebasestorage.app",
  messagingSenderId: "578567576764",
  appId: "1:578567576764:web:8d2c498ea3601c2cf284b9"
};

document.getElementById("signinButton").addEventListener("click", signin);

async function signin(){
    document.getElementById("signinError").style.display = "none";
    var username = document.getElementById("signinUsername").value;
    var password = document.getElementById("signinPassword").value;
    var users = await cb.getCollection("users");
    for(var user of users.keys()){
        var realUser = users.get(user);
        if(username == realUser.username){
            if(password == realUser.password){
                localStorage.setItem("currentUser", user);
                localStorage.setItem("currentUserName", username);
                window.location.href = "dashboard.html";
            }else{
                document.getElementById("signinError").innerHTML = "The password you entered was incorrect.";
                setTimeout(() => {
                    document.getElementById("signinError").style.display = "block";
                }, 50);
            }
            return;
        }
    }
    document.getElementById("signinError").innerHTML = "The username you entered does not have an account.";
    setTimeout(() => {
        document.getElementById("signinError").style.display = "block";
    }, 50);
}

cb.start(firebaseConfig);