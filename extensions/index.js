function ExtensionServer() {
    this.init = function() {
        addRequestHandler('login', handleLogin)
        addEventHandler(SFSEventType.USER_LOGIN, onUserLogin);
        this.trace("MyExtension initialized!");
    };

    this.destroy = function() {
        this.trace("MyExtension destroyed!");
    };

  
}

function onUserLogin(evtParams) {
    // process
    var username = evtParams.userName;
    var password = evtParams.password;
    var zone = evtParams.zone;
    
    // You can add your own authentication logic here
    // For demonstration, let's assume all logins are successful
    
    var user = evtParams.session.user;
    if (user) {
        // Login successful
        evtParams.authenticated = true;
    } else {
        // Login failed
        evtParams.authenticated = false;
        evtParams.errorMessage = "Login failed. Please check your credentials.";
    }
}

function handleLogin(params, sender) {
    var username = params.getText('username');
    var password = params.getText('password');

    var response = new SFSObject();
    var userInfo = new SFSObject();

    // -- Xử lý validate database 

    // -- 


    // Kiểm tra tên người dùng và mật khẩu
    if (username && password) {
        userInfo.putText("username", username);
        userInfo.putText("password", password);
        response.putBool("success", true);
        response.putText("message", "Login Successfully")
        response.putSFSObject("userInfo", userInfo)
    } else {
        response.putBool("success", false);
        response.putText("message", "Invalid username or password!")
    }

    send("login", response, [sender]);
}


function init() {
    var extension = new ExtensionServer();
    extension.init();
    return extension;
}

function destroy(extension) {
    extension.destroy();
}
