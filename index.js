var userID = localStorage.getItem("currentUser");
if(userID == null || userID == "null"){

}else{
    window.location.href = "dashboard.html";
}

document.getElementById("video").playbackRate = 2;