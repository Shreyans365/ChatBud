const urlParams = new URLSearchParams(location.search);
const username = urlParams.get('username');
const password = urlParams.get('password');
const socket = io();

if (username != "root" || password != "!@#$%^&*()") {
    alert("Wrong Password!!");
    window.location.replace("/login");
}

socket.emit("data", setData);


function setData(users, rooms) {
    document.getElementById("numusers").innerHTML = `Number of active users: ${users}`;
    document.getElementById("numrooms").innerHTML = `Number of open rooms: ${rooms}`;
} 