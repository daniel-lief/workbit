function signOut(){
    localStorage.setItem("currentUser", "null"); // average javascript behavior
    window.location.href = "signin.html";
}

document.getElementById("headerSignOut").addEventListener("click", signOut);