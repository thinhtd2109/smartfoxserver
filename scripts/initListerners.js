$(document).ready(function() {
    $("#disconnectBt").prop('disabled', true);
    $("#enterJoinRoom").prop('disabled', true);
    $("#loginBtn").prop('disabled', true);
    $("#logoutBtn").prop('disabled', true);

    $("#connectBt").click(onConnectBtClick);
    $("#disconnectBt").click(onDisconnectBtClick);

    $("#sendMgsBtn").click(onSendPublicMessageBtClick);
})