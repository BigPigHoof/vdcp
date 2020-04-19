// 登录
function login() {
	var configParam = {
        logParam: 1,
        tlsParam: 1,
        proxyParam: 1,
        serviceSecurityParam: 1,
        iptServiceConfigParam:	1,
        localAddress: 1,
        filePathInfo: 1,
        dpiInfo: 1,
        networkInfo: 1,
        ipCallSwitch:0,
        confCtrlParam:1,
        sendDataSwitch:1,
        baseInfoParam:1,
        frameParam:1,
        visibleInfo:1
    }
    var callback = function(){}
	tsdkClient.setConfigParam(configParam, callback);
	
	var tsdkAppInfoParam = {
        "clientType": 0,
        "productName": "SoftClient on Desktop",
        "deviceSn": "1",
        "supportAudioAndVideoCall": 1,
        "supportAudioAndVideoConf": 1,
        "supportDataConf": 1,
        "supportCtd": 0,
        "supportIm": 0,
        "supportRichMediaMessage": 0,
        "supportEnterpriseAddressBook": 0,
        "useUiPlugin": 1,
        "isWsInvokeMode": 1

    };
    var callbacks = function (res) { }
    tsdkClient.init(tsdkAppInfoParam, (res)=>{
        if(res.result == 0) {
            console.log("init success!")
        }
    });
	console.log(isNoLogin)
	var userName =   localStorage.getItem('smcHcUri');
	var password =  localStorage.getItem('smcHcPwd');
	var serverAddr = '192.168.3.201';
	var serverPort = '5061';
	var tsdkLoginParam = {
		"userId": 1,
		"authType": 0,
		"userName": userName,//SC上分配的预定义节点
		"password": password,
		"userTiket": "1",
		"serverType": 2,//SMC服务器
		"serverVersion": "",
		"serverAddr": serverAddr,//SMC服务器地址
		"serverPort": parseInt(serverPort)  // 5061
	};
	var callbacks = function (res) {
		console.log(res)
	}
	console.debug('login begin');
	tsdkClient.login(tsdkLoginParam, callbacks);
	
	console.debug('login ret:' + callbacks);
	passwd = "";
	proxyPassword = "";
	proxyParam ="";
	
	// document.getElementById("call").style.display = "block";
}
function openNewBlank() {
	var serverAddr = document.getElementById("svr_addr").value;
	window.open("https://" + serverAddr + "/portal/getSimpleParameter.action?cpuClass=undefined&uuid=1604433569&languageId=1&joinType=1&joinId=1&number=1&selectJoinType=3&user_name=1")
}
// 修改密码
function modifyPassword(){
	var oldPasswd = document.getElementById("oldPasswd").value;
	var newPasswd = document.getElementById("newPasswd").value;
	var modifyPassword = {
		newPassword : newPasswd,
		oldPassword : oldPasswd,
	}
	tsdkClient.modifyPassword(modifyPassword,()=>{});
}

//call start 发起呼叫
let call_Id = 0;
function startCall(){
	console.log(isNoLogin)
	if (isNoLogin) {
		var isVideoCall = 0;
		var calleeNum = document.getElementById("callee_num").value;
		if (document.getElementById("isVideoCall").checked) {
			isVideoCall = 1;
		}
		tsdkClient.startCall(calleeNum, isVideoCall, function (data) {
			call_Id = data.param.callId
			if (data.result) {
				document.getElementById("callState").innerHTML = "call state: make call";
			}
		});
	}else {
		alert("please login first!")
	} 
}
// 接听呼叫
function acceptCall(){
	var callId = callInComingId;
	call_Id = callInComingId;
	console.log(callId)
	// var isVideo = document.getElementById("isVideoCall").checked;
	var callbacks = function () { };
	tsdkClient.acceptCall(callId, isVideo, callbacks);
}
// 结束呼叫
function endCall(){
	var callId = call_Id;
	if(call_Id == 0) {
		callId = callInComingId
	}
	var callbacks = function () { };
	tsdkClient.endCall(callId, callbacks);
	call_Id = 0;
}
// 闭音麦克风
function muteMic(bMute){;
	var callId = call_Id;
	var isMute = parseInt(bMute);
	var callbacks = function () { };
	tsdkClient.muteMic(callId, isMute, callbacks)
}
// 打开关闭扬声器
function muteSpeaker(bMute){;
	var callId = call_Id;
	var isMute = parseInt(bMute);
	var callbacks = function () { };
	tsdkClient.muteSpeaker(callId, isMute, callbacks)
}
// 二次拨号
function DTMF(dmtfNo){
	console.log(call_Id)
	var callId = call_Id;
	var tone = parseInt(dmtfNo);
	var callback = function () { };
	tsdkClient.sendDtmf(callId, tone, callback);
}

// 视频控制
function videoControl(num) {
	var callId = call_Id;
	var object = parseInt(document.querySelector('input[id="videoControl"]:checked').value);
	var videoControl = {
		operation: num,
		object: object,
		isSync: 1
	}
	var callback = function () {};
	tsdkClient.videoControl(videoControl, callId, callback);
}

// 设置视频窗口属性
function setVideoRender() {
	var callId = call_Id
	var callback = function () {};

	var videoRender = {
		renderType: parseInt(document.getElementById("cloudvc_set_renderType").value),
		displayType: parseInt(document.getElementById("cloudvc_set_displayType").value),
		mirrorType: parseInt(document.getElementById("cloudvc_set_mirrorType").value)
	}
	tsdkClient.setVideoRender(callId, videoRender, callback);
} 

// 开始播放音频文件
var playHandle;
function startPlayMedia(){
	var mediaFilePath = document.getElementById("media_file_path").value;
	if(playHandle != null) {
		alert("Please do not repeat clicks!!")
	}else {
		tsdkClient.startPlayMedia(0, mediaFilePath,function(data){
			if(data.result == 0){
				 playHandle = data.param.playHandle;
			}
		});	
	}	
}
// 停止播放音频文件
function stopPlayMedia(){
	if(playHandle == null) {
		alert("Audio file not playing!")
	}else{
		var callback = function () { };
		tsdkClient.stopPlayMedia(playHandle, callback);	
		playHandle = null;
	}	
}
// 添加视频
function addVideo(){
	var callId = call_Id;
	var callbacks = function () { };

	tsdkClient.addVideo(callId, callbacks);	
}
// 删除视频
function delVideo(){
	var callId = call_Id;
	var callbacks = function () { };

	tsdkClient.delVideo(callId, callbacks);
}
// 响应添加视频请求
function replyAddVideo(accept){
	var callId = call_Id;
	var callbacks = function () { };

	tsdkClient.replyAddVideo(accept, callId, callbacks);	
}

//call end

// 主动加入会议
function joinInstanceConf() {
	var joinNumber = 0;
	var confTypeObj = document.getElementById("instance_conf_type");
	var isVideoJoin = parseInt(confTypeObj.options[confTypeObj.selectedIndex].value);
	var confId = document.getElementById("conferenceId").value;
	var accessNumber = document.getElementById("accessNumber").value;
	var confPassword = document.getElementById("confPasswd").value;
	var TsdkConfJoinParam = { 
		confId: confId, 
		accessNumber: accessNumber, 
		confPassword: confPassword
	}

	tsdkClient.joinConference(joinNumber, isVideoJoin, TsdkConfJoinParam, function callback(ret) {
		console.info("join conference callback")
	});
	confPasswd = "";
	joinConfParam = "";
}

var handle;
// 拒绝会议来电
function rejectConference() {  
	var	callId = callInComingId
	var callbacks = function () { };
	tsdkClient.endCall(callId, callbacks);
	call_Id = 0;
}

// 离开会议
function leaveConference() {  
	if(handle) {
		var confHandle = handle
		tsdkClient.leaveConference(confHandle, function callback(ret) {});
	}else{
		alert("The conference handle does not exist")
	}
}

// 结束会议
function endConference() {  
	if(handle) {
		var confHandle = handle
		tsdkClient.endConference(confHandle, function callback(ret) {});
	}else{
		alert("The conference handle does not exist")
	}
}

// Éý¼¶»áÒé
// function upgradeConference() {  
// 	if(handle) {
// 		var confHandle = handle
// 		var upgradeParam = {
// 			groupUri: ""
// 		}
// 		tsdkClient.upgradeConference(confHandle, upgradeParam, function callback(ret) {});
// 	}else{
// 		alert("The conference handle does not exist")
// 	}
// }

// ÊÇ·ñËø¶¨»áÒé
function lockConference() {  
	if(handle) {
		var confHandle = handle
		var lockConfTypeObj = document.getElementById("Lock_conf_type");
		var lockConf = parseInt(lockConfTypeObj.options[lockConfTypeObj.selectedIndex].value);
		tsdkClient.lockConference(confHandle, lockConf, function callback(ret) {});
	}else{
		alert("The conference handle does not exist")
	}
}

// 添加与会者
function addAttendee() {
	var confHandle = handle
	var AttendeeList = document.getElementById("addAttendee_list").value;
	if (handle == undefined) {
		alert("Meeting has not yet started");
		return;
	} else if (AttendeeList == null || AttendeeList == "") {
		alert("attendee number is empty");
		return;
	}
	
	var AttendeeListArray = AttendeeList.split(",");
	var AttendeeLists = new Array();
	for (var i = 0; i < AttendeeListArray.length; i++) {
		AttendeeLists[i] = { number: AttendeeListArray[i], name: AttendeeListArray[i], role: 0 };
	}
	var addAttendeesInfo = {
		attendeeNum: parseInt(document.getElementById("addAttendee_num").value),
		attendeeList: AttendeeLists
	}
	tsdkClient.addAttendee(confHandle,addAttendeesInfo,(ret) => {});
}

// 重播与会者
function redialAttendee() {  
	var confHandle = handle;
	var attendee = document.getElementById("redialAttendee").value
	tsdkClient.redialAttendee(confHandle, attendee, (ret) => {});
}

// 挂断与会者
function hangUpAttendee() {  
	var confHandle = handle;
	var attendee = document.getElementById("hangUpAttendee").value
	tsdkClient.hangUpAttendee(confHandle, attendee, (ret) => {});
}

// 删除与会者
function removeAttendee() {  
	var confHandle = handle;
	var attendee = document.getElementById("removeAttendee").value
	tsdkClient.removeAttendee(confHandle, attendee, (ret) => {});
}

// 闭音与会者
function muteAttendee() {  
	var confHandle = handle
	var attendee = document.getElementById("muteAttendee").value
	var isMuteObj = document.getElementById("is_Mute");
	var isMute = parseInt(isMuteObj.options[isMuteObj.selectedIndex].value);
	tsdkClient.muteAttendee(confHandle, attendee,isMute, function callback(ret) {});
}

// 举手
function setHandup() {  
	var confHandle = handle
	var isHandupObj = document.getElementById("set_hand_up");
	var isHandup = parseInt(isHandupObj.options[isHandupObj.selectedIndex].value);
	var attendee = document.getElementById("setHandup").value
	tsdkClient.setHandup(confHandle, isHandup, attendee, function callback(ret) {});
}
// 申请发言
// function requestSpeaking() {  
// 	var confHandle = handle
// 	var isCancelObj = document.getElementById("is_cancel");
// 	var isCancel = parseInt(isCancelObj.options[isCancelObj.selectedIndex].value);
// 	tsdkClient.requestSpeaking(confHandle, isCancel, function callback(ret) {});
// }

// 观看指定与会者
function watchAttendee() {
	var confHandle = handle
	var watchAttendeeList = document.getElementById("watch_Attendee_list").value;
	if (handle == undefined) {
		alert("Meeting has not yet started");
		return;
	} else if (watchAttendeeList == null || watchAttendeeList == "") {
		alert("attendee number is empty");
		return;
	}
	
	var watchAttendeeListArray = watchAttendeeList.split(",");
	var watchAttendeeLists = new Array();
	for (var i = 0; i < watchAttendeeListArray.length; i++) {
		watchAttendeeLists[i] = { number: watchAttendeeListArray[i], name: watchAttendeeListArray[i], role: 0 };
	}
	var watchAttendeeInfo = {
		watchAttendeeNum: parseInt(document.getElementById("watch_Attendee_Num").value),
		watchAttendeeList: watchAttendeeLists
	}
	tsdkClient.watchAttendee(confHandle,watchAttendeeInfo,(ret) => {});
}

// 是否广播与会者
function broadcastAttendee() {  
	var confHandle = handle
	var attendee = document.getElementById("broadcastAttendee").value
	var isBroadcastObj = document.getElementById("is_Broadcast");
	var isBroadcast = parseInt(isBroadcastObj.options[isBroadcastObj.selectedIndex].value);
	tsdkClient.broadcastAttendee(confHandle, attendee,isBroadcast, function callback(ret) {});
}

// 申请主席权限
function requestChairman() {  
	var confHandle = handle;
	var password = document.getElementById("requestChairman").value
	tsdkClient.requestChairman(confHandle, password, (ret) => {});
}

// 释放主席权限
function releaseChairman() {  
	var confHandle = handle;
	tsdkClient.releaseChairman(confHandle, (ret) => {});
}

// 延长会议
function postponeConference() {  
	var confHandle = handle;
	var time = parseInt(document.getElementById("postponeConference").value);
	tsdkClient.postponeConference(confHandle, time, (ret) => {});
}

// 加入数据会议
function joinDataConference() {  
	var confHandle = handle;
	tsdkClient.joinDataConference(confHandle, (ret) => {});
}

// 设置会议录播
function setRecordBroadcast() {  
	var confHandle = handle;
	var recordBroadcast = 0;
	tsdkClient.setRecordBroadcast(confHandle, recordBroadcast, (ret) => {});
}

// 设置会议直播
function setLiveBroadcast() {  
	var confHandle = handle;
	var liveBroadcast = 0;
	tsdkClient.setLiveBroadcast(confHandle, liveBroadcast, (ret) => {});
}

// 注销
function logout() {
	var callbacks = function () { };
	tsdkClient.logout(callbacks);
	// tsdkClient.uninit(callbacks);
	//change UI to login
	document.getElementById("login").style.display = "block";
	document.getElementById("call").style.display = "none";
}

// 匿名加入会议
function joinAnonymousConf() {
	var userName = document.getElementById("user_name").value;
	var confRandom = document.getElementById("random").value;
	var serverAddress = document.getElementById("site_url").value;
	var confPassword = document.getElementById("anony_passwd").value;
	var confId = document.getElementById("anony_conf_id").value;
	var userId = document.getElementById("user_ID").value;
	var serverPort = document.getElementById("anony_svr_port").value;
	var anonymousConfParam = {
		authType: 1,
		random: confRandom || 0,
		confPassword: confPassword,
		confId: confId,
		displayName: userName,
		serverAddr: serverAddress,
		userId: parseInt(userId),
		serverPort: parseInt(serverPort),
	}
	tsdkClient.joinConferenceByAnonymous(anonymousConfParam, function callback(ret) {
		alert("joinConferenceByAnonymous call back" + JSON.stringify(ret))
	});
	confPassword = "";
	anonymousConfParam = "";
}

//UI plugin
// 设置按钮状态
function uiPluginSetButtonState() {  
	var button = parseInt(document.getElementById("ui_plugin_set_button").value);
	var isOff = parseInt(document.getElementById("ui_plugin_button_state").value);
	tsdkClient.uiPluginSetButtonState(button, isOff, (data)=>{});
}
// ui插件设置窗口大小相对位置
function setConfNativeWndPosition() {
	var uiWndLeftTopX = document.getElementById("ui_window_left_top_x").value;
	var uiWndLeftTopY = document.getElementById("ui_window_left_top_y").value;
	var wndSizeAbsPosParam = {
		frameHwnd: 1,
		hasWndSize : 1,
		width : 0,
		height : 0,
		hasRelativePos: 1,
		leftTopX : parseInt(uiWndLeftTopX),
		leftTopY : parseInt(uiWndLeftTopY),
	}
	tsdkClient.uiPluginSetWindowSizeRelativePos(wndSizeAbsPosParam, (data)=>{});	
}
// 设置延时时间刻度
function uiPluginSetDelayTimeScale() {  
	var delayTimeScale = parseInt(document.getElementById("uiPlugin_set_delay_timeScale"));
	tsdkClient.uiPluginSetDelayTimeScale(delayTimeScale, (data)=>{});
}
//  是否显示小窗口
function uiPluginShowSmallWindow() {
	tsdkClient.uiPluginShowSmallWindow((data)=>{});	
}
// 显示标注工具栏
function uiPluginShowAnnotationTool() {
	tsdkClient.uiPluginShowAnnotationTool((data)=>{});	
}
// 设置显示窗口标题
function uiPluginSetWindowTitle() {
	var uiWndTitle = document.getElementById("ui_window_title").value;
	var windowTitle = {
		title: uiWndTitle,
		confId: ""
	}
	tsdkClient.uiPluginSetWindowTitle(windowTitle,(data)=>{});	
}
