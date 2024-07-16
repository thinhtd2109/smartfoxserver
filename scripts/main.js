let sfs = null;
let currentGameStarted = false;
let invitationsQueue = [];
let currentInvitation = null;

function init() {
    console.log("Application Started.");

    let config = {};
    config.host = "127.0.0.1";
    config.port = 8080;
    config.zone = "TictactoeZones";
    config.debug = true;

    sfs = new SFS2X.SmartFox(config);

    sfs.logger.level = SFS2X.LogLevel.DEBUG;

    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
    // Xử lý sự kiện khi tham gia phòng thất bại (RoomJoinError)
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this)

    // Xử lý sự kiện phòng đã đầy
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoin, this);

    sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);

    sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, onExtensionResponse, this);

    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

    sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, onUserEnterRoom, this);

    sfs.addEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, onUserCountChange, this);

    sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage, this);
}

function onUserEnterRoom(event) {
    console.log('test')
    alert("<em>User " + event.user.name + " (" + event.user.id + ") entered the room</em>");
    populateUsersList();

}

function onSendPublicMessageBtClick(event)
{
	var isSent = sfs.send(new SFS2X.PublicMessageRequest($("#message-input").val()));

	if (isSent)
		$("#message-input").val("");
}


function onPublicMessage(event) {
    var sender = (event.sender.isItMe ? "You" : event.sender.name);
    chatMessage(`<span class="message-sender">${sender}</span>: ${event.message}`);
}

function chatMessage(text) {
    $("#chat-box").append(`<div class="message sent">
                             ${text}
                        </div>`);

        
}

function onLogin(event) {
    populateRoomsList();
}

function onRoomSelected(event) {
    if (sfs.lastJoinedRoom == null || event.id != sfs.lastJoinedRoom.id)
        sfs.send(new SFS2X.JoinRoomRequest(event.id));
        populateRoomsList()
}

function getRoomList() {
    let rooms = sfs.roomManager.getRoomList();
    return rooms;
}

function onConnectionLost(evtParams) {
    enableButton("#loginBtn", false);
    enableButton("#logoutBtn", false);
    enableButton("#disconnectBt", false);
    enableButton("#connectBt", true);

    let reason = evtParams.reason;
	
	if (reason != SFS2X.Utils.ClientDisconnectionReason.MANUAL)
	{
		if (reason == SFS2X.Utils.ClientDisconnectionReason.IDLE)
			console.log("A disconnection occurred due to inactivity");
		else if (reason == SFS2X.Utils.ClientDisconnectionReason.KICK)
			console.log("You have been kicked by the moderator");
		else if (reason == SFS2X.Utils.ClientDisconnectionReason.BAN)
			console.log("You have been banned by the moderator");
		else
			console.log("A disconnection occurred due to unknown reason; please check the server log");
	}
	else
	{
		// Manual disconnection is usually ignored
	}
}

function login() {
    var username = document.getElementById("userName").value;
    var password = document.getElementById("password").value;
    var params = new SFS2X.SFSObject();
    let isSent = sfs.send(new SFS2X.LoginRequest(username));
    if (!isSent) return;
    enableButton('#logoutBtn', true)
    enableButton('#loginBtn', false);
    enableButton("#connectBt", true);

    enableButton("#userName", false);
    enableButton('#password', false);

    enableButton("#disconnectBt", false);
    enableButton("#connectBt", false);

    params.putText("username", username);
    params.putText("password", password);
    sfs.send(new SFS2X.ExtensionRequest("login", params));
}

function logout() {
    let isSent = sfs.send(new SFS2X.LogoutRequest());

    if (!isSent) return;

    enableButton('#logoutBtn', false);
    enableButton('#loginBtn', true);

    enableButton("#userName", true);
    enableButton('#password', true);
    enableButton("#disconnectBt", true);

    $("#user-list-group").empty()
    $("#list-group").empty()

    $("#userName").val("");
    $("#password").val("");


}

function onConnectBtClick() {
    sfs.connect();
    console.log('Connected')
    enableButton("#connectBt", false);
    enableButton("#disconnectBt", true);
    enableButton("#enterJoinRoom", true);
    enableButton("#loginBtn", true);
}

function onDisconnectBtClick() {
    // Disconnect from SFS
    sfs.disconnect();

    // Disable button
    enableButton("#disconnectBt", false);
    enableButton("#connectBt", true);
    enableButton("#enterJoinRoom", false);
    enableButton("#loginBtn", false);
}

function onRoomJoin(event) {
    populateUsersList()
}

function onUserCountChange(event)
{
	// For example code simplicity we rebuild the full roomlist instead of just updating the specific item
	populateRoomsList();
}

function populateRoomsList() {
    let roomsRaw = sfs.roomManager.getRoomList();
    let roomList = [];
    
    for (let r in roomsRaw) {
        let room = roomsRaw[r];
        roomList.push(`
            <a href="#" onclick="onRoomSelected({ id: ${room._id}, name: '${room.name.toString()}' })" id="room" class="list-group-item list-group-item-action">${room.name}</a><p class='itemSub'>Users: ${room._userCount}/${room.maxUsers}</p>`);
    }
    $("#list-group").empty()
    $("#list-group").append(roomList.join(','))
}

function populateUsersList() {
    var source = [];

    if (sfs.lastJoinedRoom != null) {
        
        var users = sfs.lastJoinedRoom.getUserList();
        $("#user-list-group").empty()
        for (var u in users) {
            var user = users[u];

            source.push(`<a href="#" id="room" class="list-group-item list-group-item-action"><strong>${user.name}</strong> ${user.isItMe ? "(you)" : ""}</a>`)
        }
    }

    // Populate list
    $("#user-list-group").append(source.join(','))
}

function onRoomJoinError(event) {
    // if (event.errorCode === SFS2X.ErrorCodes.ROOM_DOES_NOT_EXIST) {
    //     let roomInput = document.getElementById('roomInput').value;
    //     let roomName = "Room" + roomInput;

    //     let roomSettings = new SFS2X.Entities.RoomSettings(roomName);
    //     roomSettings.maxUsers = 2; // Số lượng người chơi tối đa trong phòng

    //     // Gửi yêu cầu tạo phòng mới
    //     let createRoomRequest = new SFS2X.CreateRoomRequest(roomSettings, true, null);
    //     sfs.send(createRoomRequest);

    //     // Sau khi tạo phòng, thử tham gia lại
    //     sfs.send(new SFS2X.JoinRoomRequest(roomName));
    // }
}

function setupGameListeners() {
    document.querySelectorAll('.cell').forEach((cell) => {
        cell.addEventListener('click', () => {
            const position = cell.dataset.position;
            placeMark(position);
        });
    });
}

function onExtensionResponse(event) {
    const { cmd, params } = event;
    console.log(cmd)
    if (cmd === "login") {
        console.log({
            success: params.getBool('success'),
            message: params.getText('message'),
            userInfo: {
                username: params.getSFSObject('userInfo').getText('username'),
                password: params.getSFSObject('userInfo').getText('password')
            }
        })

    }
}

function generateUniqueString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function onConnection(event) {
    const randomString = generateUniqueString(10);

    //sfs.send(new SFS2X.LoginRequest(randomString, "", null, "TictactoeZones"));
    if (event.success) {

        setupGameListeners(); // Thiết lập lắng nghe sự kiện cho game
    } else {
        console.log("Connection failed!");
    }
}

function placeMark(position) {
    // Send position to server or handle gameplay logic
    // Example: sendMoveToServer(position);
}

function sendMoveToServer(position) {
    // Create and send ExtensionRequest to server
    const params = new SFS2X.SFSObject();
    params.putInt("position", position);
    sfs.send(new SFS2X.ExtensionRequest("move", params));
}

// function joinRoom() {
//     let roomInput = document.getElementById('roomInput').value;

//     if (roomInput.trim() === '') {
//         alert('Please enter a room number.');
//         return;
//     }
//     let roomName = "Room" + roomInput;

//     let request = new SFS2X.JoinRoomRequest(roomName);

//     // Gửi yêu cầu tham gia vào phòng
//     let result = sfs.send(request);
//     console.log(result)
// }


function enableButton(id, doEnable) {
    $(id).prop('disabled', !doEnable);
}
