

const chatForm = document.getElementById("chat-form");
// const urlParams = new URLSearchParams(location.search);
// const username = urlParams.get('name');
// const room = urlParams.get('room');
// const regex = /^[a-zA-Z]+$/;
// if (username == "" || room == "" || !regex.test(username) || parseInt(room) === NaN || parseInt(room) < 0 || parseInt(room) > 999) {
//     alert("Username or Room number Invalid \n 1. Username should be less than 20 characters. \n 2. Room number should be between 0 and 999");
//     window.location.replace("/");
// }

document.getElementById("room-number").innerHTML = `${room}`;
const socket = io();
var users = [];

socket.emit('joinRoom', { username, room});

socket.on('userExists', () => {
    alert("Username taken!");
    window.location.replace("/");
})

socket.on('usersList', ({users}) => {
    console.log(users);
    changeUsersList(users);
})

socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);
})

socket.on('disconnect', () => {
    window.location.replace("/");
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;
    socket.emit('chatMessage', message, outputMessage);
    document.getElementById("msg").value = "";
})

function changeUsersList(users) {
    const myDiv = document.getElementById('users-list');
    myDiv.innerHTML = "";
    const h1 = document.createElement('h1');
    h1.setAttribute("id", "users-heading");
    h1.innerHTML = "USERS";
    myDiv.appendChild(h1);
    for (var i=0;i<users.length;i++) {
        const newP = document.createElement('p');
        newP.innerHTML = `${users[i]}`;
        newP.setAttribute("id", "users-p");
        myDiv.appendChild(newP);
    }
}

function outputMessage(message) {
    const div = document.createElement('div');
    if (message.user == username) {
        div.classList.add("user");
    }
    else if (message.user == "Admin") {
        div.classList.add("admin");
    }
    else {
        div.classList.add("other");
    }
    div.innerHTML = `<p class="userP">${message.user}</p><p class="textP">${message.text}</p><p class="timeP">${message.time}</p>`;
    document.getElementById("messageFeed").appendChild(div);
    const br = document.createElement("br");
    document.getElementById("messageFeed").appendChild(br);
    const messageFeed = document.getElementById("messageFeed");
    messageFeed.scrollTop = messageFeed.scrollHeight;
}