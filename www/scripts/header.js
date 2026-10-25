const logOut = document.getElementById("logOut")
logOut.addEventListener("click", onclick => {
    if (onclick) {
        location.replace("../index.html")
        localStorage.clear();
    }
})