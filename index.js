const path = require('path')
const express= require('express');
const mysql = require('mysql');
const http = require('http');
const socketio = require('socket.io')
const moment = require('moment')
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {getCurrentUser, userJoin} = require('./users');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/chat", (req, res) => {
    res.render("chat");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/admin", (req,res) => {
    res.render("admin");
})

function makePacket(str1, str2) {
    const packet = {user: str1, text: str2, time: moment().format('h:mm a')};
    return packet;
}

function EmitUsersInRoom(room) {
    const query = `SELECT username,room FROM users WHERE room = ${room}`;
    db.query(query, (err, result) => {
        if (err) {
            return [];
        }
        else {
            const resultArray = JSON.parse(JSON.stringify(result));
            const users = resultArray.map((row) => {
                console.log(room, row.room);
                if (row.room == room) {
                    return row.username;
                }
                else {
                    return null;
                }
            })
            console.log(users);
            io.sockets.in(room).emit('usersList', {users});
        }
    })
}

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Mysql625@db',
    database : 'chatapp'
})

db.connect();

io.on('connection', (socket) => {

    let Username;
    let Room;

    socket.on("data", (callback) => {
        var numUsers;
        var numRooms;
        const query1 = "SELECT COUNT(DISTINCT room) as cntr, COUNT(DISTINCT user_no) as cntu FROM users";
        db.query(query1, (err, result) => {
            const resultArray = JSON.parse(JSON.stringify(result));
            numRooms = resultArray[0].cntr;
            numUsers = resultArray[0].cntu;
            callback(numUsers, numRooms);
        });
    })

    socket.on('joinRoom', ({username, room}) => {

        //const user = userJoin(socket.id, username, room);
        db.query(`SELECT * FROM users WHERE username = "${username}" AND room = ${room}`, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                if (result.length != 0) {
                    socket.emit('userExists');
                }
            }
        });

        db.query(`INSERT INTO users(socket_id, username, room) VALUES("${socket.id}", "${username}", ${room})`, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("User inserted into table");
            }
        })

        Username = username;
        Room = room;

        socket.join(room);
        //Welcome message to new user!
        socket.emit('message', makePacket("Admin", "Welcome to the Chat!"));
        //Broadcast to everyone else that new user has joined!
        socket.broadcast.to(room).emit('message', makePacket("Admin", `${username} has joined the chat!`));
        EmitUsersInRoom(room);
    });

    //Listen for chatMessage 
    socket.on('chatMessage', (message, outputMessage) => {
        socket.broadcast.to(Room).emit('message', makePacket(Username, message));
        outputMessage(makePacket(Username,message));
    })

    //When a user disconnects!
    socket.on('disconnect', () => {
        console.log(socket.id);
        db.query(`DELETE FROM users WHERE socket_id = "${socket.id}"`, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("User deleted from table!");
            }
        })
        socket.broadcast.to(Room).emit('message', makePacket("Admin", `${Username} has left the chat!`));
        EmitUsersInRoom(Room);
        socket.disconnect();
    })
})



server.listen(3000, () => {
    console.log("Server is running on port 3000!");
})
