/**
 * SDK 版本信息
 * RTC_SDK_VERSION:                              SDK 版本号
 */
const RtcSdkVersion ={
   RTC_SDK_VERSION: "v1.7"
};


/**
 * 配置项
 * RTC_CFG_ICE_ENABLE:                              是否使用ICE ：    true:使用/ false:不使用
 * RTC_CFG_ICE_SERVER_TYPE:                         ICE server 类型： turn/stun
 * RTC_CFG_ICE_IP:                                  ICE server IP: 如果为空，程序中将使用媒体服务器IP
 * RTC_CFG_ICE_SERVER_PORT:                         ICE server 端口
 * RTC_CFG_ICE_SERVER_USERNAME:                     ICE server 用户名
 * RTC_CFG_ICE_SERVER_PASSWORD：                    ICE server 密码
 *
 * RTC_CFG_VER_PTZ:                                 监控摄像头控制标准版本号
 * RTC_CFG_VER_RTSP：                               历史回放媒体RTSP版本号
 */

const RtcConfig = {
    RTC_CFG_ICE_ENABLE: true,
    RTC_CFG_ICE_TYPE: "turn",
    RTC_CFG_ICE_IP:   "",
    RTC_CFG_ICE_PORT: "3478",
    RTC_CFG_ICE_USER: "fritt",
    RTC_CFG_ICE_PWD:  "passwd",

    RTC_CFG_VER_PTZ:  0,
    RTC_CFG_VER_RTSP: "1.0",
};


/**
 * 日志级别
 * RTC_LOG_LEVEL_ALL:                               所有日志
 * RTC_LOG_LEVEL_WARN:                              警告、错误级别日志
 * RTC_LOG_LEVEL_ERROR:                             错误级别日志
 * RTC_LOG_LEVEL_NONE：                             无任何日志
 */
const RtcLogLevel = {
    RTC_LOG_LEVEL_ALL: "rtc_log_level_all",
    RTC_LOG_LEVEL_WARN: "rtc_log_level_warn_error",
    RTC_LOG_LEVEL_ERROR: "rtc_log_level_only_error",
    RTC_LOG_LEVEL_NONE: "rtc_log_level_none"
};


/**
 * 传输类型
 * RTC_TRANSPORT_TYPE_UDP:                         以UDP方式传输
 * RTC_TRANSPORT_TYPE_TCP:                         以TCP方式传输
 */
const RtcTransportType = {

    RTC_TRANSPORT_TYPE_UDP:"UDP",
    RTC_TRANSPORT_TYPE_TCP:"TCP",
};

/**
 * 会话配置对象的Key
 */
const RtcSessionConfigKey = {
    KEY_LOG_LEVEL:                          "logLevel",
    KEY_MEDIA_TRANSPORT_TYPE:               "mediaTransportType"
};

/**
 * 媒体类型
 * RTC_MEDIA_TYPE_NULL:                             无音视频
 * RTC_MEDIA_TYPE_AUDIO:                            音频类型
 * RTC_MEDIA_TYPE_VIDEO:                            视频类型
 * RTC_MEDIA_TYPE_AUDIO_VIDEO：                     音视频类型
 */
const RtcMediaType = {

    RTC_MEDIA_TYPE_NULL:"rtc_media_type_null",
    RTC_MEDIA_TYPE_AUDIO:"rtc_media_type_audio",
    RTC_MEDIA_TYPE_VIDEO:"rtc_media_type_video",
    RTC_MEDIA_TYPE_AUDIO_VIDEO:"rtc_media_type_audio_video",
};

/**
 * 视频媒体质量
 * RTC_VIDEO_QUALITY_QCIF
 * RTC_VIDEO_QUALITY_CIF
 * RTC_VIDEO_QUALITY_4CIF
 * RTC_VIDEO_QUALITY_D1
 * RTC_VIDEO_QUALITY_720P
 * RTC_VIDEO_QUALITY_720P_HQ
 * RTC_VIDEO_QUALITY_1080P
 * RTC_VIDEO_QUALITY_1080P_HQ
 * RTC_VIDEO_QUALITY_1080P_SHQ
 */
const RtcVideoQuality = {

    RTC_VIDEO_QUALITY_QCIF:"QCIF",
    RTC_VIDEO_QUALITY_CIF:"CIF",
    RTC_VIDEO_QUALITY_4CIF:"4CIF",
    RTC_VIDEO_QUALITY_D1:"D1",
    RTC_VIDEO_QUALITY_720P:"720P",
    RTC_VIDEO_QUALITY_720P_HQ:"720P_HQ",
    RTC_VIDEO_QUALITY_1080P:"1080P",
    RTC_VIDEO_QUALITY_1080P_HQ:"1080P_HQ",
    RTC_VIDEO_QUALITY_1080P_SHQ:"1080P_SHQ"
};

/**
 * 视频码率类型
 * RTC_VIDEO_BITRATE_TYPE_CONSTANT
 * RTC_VIDEO_BITRATE_TYPE_VARIABLE
 */
const RtcVideoBitrateType = {

    RTC_VIDEO_BITRATE_TYPE_CONSTANT:"CBR",
    RTC_VIDEO_BITRATE_TYPE_VARIABLE:"VBR",
};

/**
 * 音频媒体质量
 * RTC_AUDIO_QUALITY_HQ_HBR
 * RTC_AUDIO_QUALITY_HQ_MBR
 * RTC_AUDIO_QUALITY_MQ_MBR1
 * RTC_AUDIO_QUALITY_MQ_MBR2
 * RTC_AUDIO_QUALITY_LQ_LBR
 * RTC_AUDIO_QUALITY_LQ_LBR1
 * RTC_AUDIO_QUALITY_LQ_LBR2
 */
const RtcAudioQuality = {
    RTC_AUDIO_QUALITY_HQ_HBR:"HQ_HBR",
    RTC_AUDIO_QUALITY_HQ_MBR:"HQ_MBR",
    RTC_AUDIO_QUALITY_MQ_MBR1:"MQ_MBR1",
    RTC_AUDIO_QUALITY_MQ_MBR2:"MQ_MBR2",
    RTC_AUDIO_QUALITY_LQ_LBR:"LQ_LBR",
    RTC_AUDIO_QUALITY_LQ_LBR1:"LQ_LBR1",
    RTC_AUDIO_QUALITY_LQ_LBR2:"LQ_LBR2"
};

/**
 * 媒体回放控制类型
 * RTC_PLAYBACK_CTRL_PLAY:                             播放
 * RTC_PLAYBACK_CTRL_PAUSE:                            暂停
 * RTC_PLAYBACK_CTRL_TEARDOWN:                         停止
 */
const RtcCamPlaybackCtrlType = {

    RTC_PLAYBACK_CTRL_PLAY:"PLAY",
    RTC_PLAYBACK_CTRL_PAUSE:"PAUSE",
    RTC_PLAYBACK_CTRL_TEARDOWN:"TEARDOWN"
};


/**
 * 媒体回放控制类型
 * RTC_PLAYBACK_CTRL_PLAY:                             播放
 * RTC_PLAYBACK_CTRL_PAUSE:                            暂停
 * RTC_PLAYBACK_CTRL_TEARDOWN:                         停止
 */
const RtcCamPlaybackScale = {
    N_FOUR:     '-4.0',
    N_TWO:      '-2.0',
    N_ONE_:     '-1.0',
    N_HALF_:    '-0.5',
    N_QHALF:    '-0.25',
    P_QHALF:    '0.25',
    P_HALF:     '0.5',
    P_ONE:      '1.0',
    P_TWO:      '2.0',
    P_FOUR:     '4.0'
};

/**
 * 服务类型
 * RTC_SERVICE_TYPE_CAM:                            监控服务
 * RTC_SERVICE_TYPE_LIVE:                           直播服务
 */
const RtcServiceType = {

    RTC_SERVICE_TYPE_CAM:"rtc_service_type_cam",
    RTC_SERVICE_TYPE_LIVE:"rtc_service_type_live"
};

/**
 * 错误类型
 * RTC_ERROR_BAD_PARAMETER_COUNT:                  错误参数个数
 * RTC_ERROR_BAD_PARAMETER_ILLEGAL:                参数类型不合法
 * RTC_ERROR_BAD_PARAMETER_TYPE_NUMBER：           参数不符合数字类型
 * RTC_ERROR_BAD_PARAMETER_TYPE_STRING：           参数不符合字符串类型
 * RTC_ERROR_BAD_PARAMETER_TYPE_OBJECT :           参数不符合对象类型
 * RTC_ERROR_BAD_PARAMETER_TYPE_BOOLEAN：          参数不符合布尔类型
 * RTC_ERROR_BAD_PARAMETER_TYPE_FUNCTION:          参数不符合函数类型
 * RTC_ERROR_BAD_PARAMETER_FORMAT_SERVER：         服务端地址参数格式错误
 */
const RtcErrorType = {
    RTC_ERROR_BAD_PARAMETER_COUNT: "rtc_error_bad_parameter_count",
    RTC_ERROR_BAD_PARAMETER_ILLEGAL: "rtc_error_bad_parameter_type_illegal",
    RTC_ERROR_BAD_PARAMETER_TYPE_NUMBER: "rtc_error_bad_parameter_type_number",
    RTC_ERROR_BAD_PARAMETER_TYPE_STRING: "rtc_error_bad_parameter_type_string",
    RTC_ERROR_BAD_PARAMETER_TYPE_OBJECT: "rtc_error_bad_parameter_type_object",
    RTC_ERROR_BAD_PARAMETER_TYPE_BOOLEAN: "rtc_error_bad_parameter_type_boolean",
    RTC_ERROR_BAD_PARAMETER_TYPE_FUNCTION: "rtc_error_bad_parameter_type_function",
    RTC_ERROR_BAD_PARAMETER_FORMAT_SERVER: "rtc_error_bad_parameter_format_server",
};

/**
 * 事件报错原因
 *
 * RTC_REASON_NORMAL:                             无特殊原因
 * RTC_REASON_PARAMETER_ERROR:                    参数错误
 * RTC_REASON_NO_REMOTE_VIDEO：                   缺少远端视频
 * RTC_REASON_USER_REOPENED：                     远端用户已开启
 * RTC_REASON_WEB_SESSION_CLOSED :                Web会话已关闭
 * RTC_REASON_SERVER_DOWN：                       服务端异常停止
 * RTC_REASON_ROOM_NOT_EXIST:                     直播室不存在
 * RTC_REASON_NOT_IN_LIVE_ROOM:                   不在直播室中
 * RTC_REASON_ALREADY_IN_ROOM:                    已经在直播室中
 * RTC_REASON_ALREADY_REGISTERED:                 该用户已经SIP注册了
 */
const RtcEventReason = {

    RTC_REASON_NORMAL:"rtc_reason_normal",
    RTC_REASON_PARAMETER_ERROR: "rtc_reason_parameter_err",
    RTC_REASON_NO_REMOTE_VIDEO:"rtc_reason_no_remote_video",
    RTC_REASON_USER_REOPENED:"rtc_reason_user_reopened",
    RTC_REASON_WEB_SESSION_CLOSED: "rtc_reason_web_socket_closed",
    RTC_REASON_SERVER_DOWN: "rtc_reason_server_down",
    RTC_REASON_ROOM_NOT_EXIST: "rtc_reason_room_not_exist",
    RTC_REASON_NOT_IN_LIVE_ROOM: "rtc_reason_not_in_live_room",
    RTC_REASON_ALREADY_IN_ROOM: "rtc_reason_already_in_room",
    RTC_REASON_ALREADY_REGISTERED: "rtc_reason_already_registered",
};


/**
 * 事件ID（全局会话事件）
 *
 * RTC_SESSION_INIT_SUCCESS:                      初始化会话成功
 * RTC_SESSION_INIT_FAILED:                       初始化会话失败
 * RTC_SESSION_CONNECTION_FAILED：                会话连接失败
 * RTC_SESSION_DESTROYED :                        会话已销毁
 * RTC_SERVICE_APPLY_SUCCESS：                    服务申请成功
 * RTC_SERVICE_APPLY_FAILED:                      服务申请失败
 * RTC_API_REQUEST_FAILED:                        服务请求失败
 * RTC_QUERY_DEVICE_PERMISSION：                  请求客户允许使用麦克风和摄像头
 * RTC_GRANT_DEVICE_PERMISSION：                  客户已同意使用麦克风和摄像头
 * RTC_CONNECTION_STATUS_UP:                      服务通道状态正常启动
 * RTC_CONNECTION_STATUS_DOWN：                   服务通道状态异常停止
 * RTC_NORMAL_ERROR:                              普通错误
 */
const RtcCommonEventID = {
    RTC_SESSION_INIT_SUCCESS: "rtc_session_init_success",
    RTC_SESSION_INIT_FAILED: "rtc_session_init_failed",
    RTC_SESSION_CONNECTION_FAILED: "rtc_session_connection_failed",
    RTC_SESSION_DESTROYED: "rtc_session_destroyed",

    RTC_SERVICE_APPLY_SUCCESS: "rtc_service_apply_success",
    RTC_SERVICE_APPLY_FAILED: "rtc_service_apply_failed",
    RTC_API_REQUEST_FAILED:"rtc_api_request_failed",

    RTC_QUERY_DEVICE_PERMISSION:"rtc_query_device_permission",
    RTC_GRANT_DEVICE_PERMISSION:"rtc_grant_device_permission",
    RTC_CONNECTION_STATUS_UP: "rtc_connection_status_up",
    RTC_CONNECTION_STATUS_DOWN: "rtc_connection_status_down",

    RTC_NORMAL_ERROR:"rtc_normal_error"

};


/**
 * 事件ID（监控/呼叫事件）
 * RTC_CHANNEL_BUILD_SUCCESS:                  创建服务通道成功
 * RTC_CHANNEL_BUILD_FAILED:                   创建服务通道失败
 * RTC_CHANNEL_LOGIN_SUCCESS:                  登录成功
 * RTC_CHANNEL_LOGOUT_SUCCESS:                 退出登录成功
 * RTC_CHANNEL_LOGIN_FAILED:                   登录失败
 * RTC_CHANNEL_LOCAL_STREAM_INCOMING:          本地流到来
 * RTC_CHANNEL_LOCAL_NO_MICROPHONE:            本地无麦克风
 * RTC_CHANNEL_LOCAL_NO_CAMERA:                本地无摄像头
 * RTC_CHANNEL_LOCAL_NO_MEDIA_DEVICES:         本地无媒体设备
 * RTC_CHANNEL_CALL_OUTGOING:                  呼叫呼出中
 * RTC_CHANNEL_CALL_ACCEPTING:                 呼叫接听中
 * RTC_CHANNEL_CALL_ACCEPTED:                  呼叫已被接听      EventObj: {peerName:远端成员名称}
 * RTC_CHANNEL_CALL_INCOMING:                  呼叫来电          EventObj: {peerName:远端成员名称}
 * RTC_CHANNEL_CALL_DISCONNECT:                通话断开         EventObj: {peerName:远端成员名称}
 * RTC_CHANNEL_CALL_FAIL:                      呼叫失败         EventObj: {peerName:远端成员名称}
 * RTC_CHANNEL_REMOTE_OUTGOING：               远端监控已发出请求
 * RTC_CHANNEL_REMOTE_ACCEPTING :              远端监控等待接受
 * RTC_CHANNEL_REMOTE_ACCEPTED：               远端监控已接受
 * RTC_CHANNEL_REMOTE_CONNECT_FAIL:            远端监控未接通
 * RTC_CHANNEL_REMOTE_DISCONNECT:              远端监控断开
 * RTC_CHANNEL_REMOTE_STREAM_INCOMING:         远端视频流到来
 * RTC_CHANNEL_REMOTE_STREAM_NO_AUDIO:         无远端音频
 * RTC_CHANNEL_REMOTE_STREAM_NO_VIDEO:         无远端视频
 * RTC_CHANNEL_CLOSED:                         通道关闭
 * RTC_CHANNEL_NORMAL_ERROR:                   通道出现错误事件
 */
const RtcCamEventID = {
    RTC_CHANNEL_BUILD_SUCCESS: "rtc_channel_build_success",
    RTC_CHANNEL_BUILD_FAILED: "rtc_channel_build_failed",
    RTC_CHANNEL_LOGIN_SUCCESS: "rtc_channel_login_success",
    RTC_CHANNEL_LOGOUT_SUCCESS: "rtc_channel_logout_success",
    RTC_CHANNEL_LOGIN_FAILED: "rtc_channel_login_failed",
    RTC_CHANNEL_LOCAL_STREAM_INCOMING: "rtc_channel_local_stream_incoming",
    RTC_CHANNEL_LOCAL_NO_MICROPHONE:"rtc_channel_local_no_audio_stream",
    RTC_CHANNEL_LOCAL_NO_CAMERA:"rtc_channel_local_no_video_stream",
    RTC_CHANNEL_LOCAL_NO_MEDIA_DEVICES:"rtc_channel_local_no_media_devices",
    RTC_CHANNEL_CALL_OUTGOING:"rtc_channel_call_outgoing",
    RTC_CHANNEL_CALL_ACCEPTING:"rtc_channel_call_accepting",
    RTC_CHANNEL_CALL_ACCEPTED:"rtc_channel_call_accepted",
    RTC_CHANNEL_CALL_INCOMING:"rtc_channel_call_incoming",
    RTC_CHANNEL_CALL_BUSY:"rtc_channel_call_busy",
    RTC_CHANNEL_CALL_DISCONNECT:"rtc_channel_call_disconnect",
    RTC_CHANNEL_CALL_FAIL:"rtc_channel_call_fail",
    RTC_CHANNEL_REMOTE_OUTGOING:"rtc_channel_remote_outgoing",
    RTC_CHANNEL_REMOTE_ACCEPTING:"rtc_channel_remote_accepting",
    RTC_CHANNEL_REMOTE_ACCEPTED:"rtc_channel_remote_accepted",
    RTC_CHANNEL_REMOTE_CONNECT_FAIL:"rtc_channel_remote_connect_fail",
    RTC_CHANNEL_REMOTE_DISCONNECT:"rtc_channel_remote_disconnect",
    RTC_CHANNEL_REMOTE_STREAM_INCOMING:"rtc_channel_remote_stream_incoming",
    RTC_CHANNEL_REMOTE_STREAM_NO_AUDIO:"rtc_channel_remote_stream_no_audio",
    RTC_CHANNEL_REMOTE_STREAM_NO_VIDEO:"rtc_channel_remote_stream_no_video",
    RTC_CHANNEL_CLOSED:"rtc_channel_closed",
    RTC_CHANNEL_NORMAL_ERROR:"rtc_channel_normal_error"
};


/**
 * 事件ID（直播事件）
 * RTC_CHANNEL_BUILD_SUCCESS:                  创建服务通道成功
 * RTC_CHANNEL_BUILD_FAILED:                   创建服务通道失败
 * RTC_CHANNEL_LOCAL_JOINED_ROOM :             本地已进入直播室
 * RTC_CHANNEL_LOCAL_LEFT_ROOM:                本地已离开直播室
 * RTC_CHANNEL_LOCAL_PUBLISHED:                本地媒体已开启发布
 * RTC_CHANNEL_LOCAL_UNPUBLISHED:              本地媒体已停止发布
 * RTC_CHANNEL_LOCAL_PUBLISH_FAILED:           本地媒体发布失败
 * RTC_CHANNEL_REMOTE_PUBLISHED:               远端成员已开启发布  EventObj:{id:成员ID, display:成员名称}
 * RTC_CHANNEL_REMOTE_UNPUBLISHED：            远端成员已停止发布
 * RTC_CHANNEL_REMOTE_LEFT：                   远端成员已离开
 * RTC_CHANNEL_LOCAL_STREAM_INCOMING：         本地媒体流到达      EventObj: stream 流对象
 * RTC_CHANNEL_LOCAL_NO_MICROPHONE:            本地无麦克风
 * RTC_CHANNEL_LOCAL_NO_CAMERA:                本地无摄像头
 * RTC_CHANNEL_REMOTE_STREAM_INCOMING：        远端媒体流到达      EventObj: stream 流对象
 * RTC_CHANNEL_REMOTE_REJECT_AUDIO：           远端拒绝发送音频
 * RTC_CHANNEL_REMOTE_REJECT_VIDEO:            远端拒绝发送视频
 * RTC_CHANNEL_SUBSCRIBE_SUCCESS:              订阅远端成员成功
 * RTC_CHANNEL_SUBSCRIBE_FAILED:               订阅远端成员失败
 * RTC_CHANNEL_ROOM_DESTROYED:                 直播室已被删除
 * RTC_CHANNEL_CLOSED:                         服务通道已关闭
 */
const RtcLiveEventID = {
    RTC_CHANNEL_BUILD_SUCCESS: "rtc_channel_build_success",
    RTC_CHANNEL_BUILD_FAILED: "rtc_channel_build_failed",
    RTC_CHANNEL_LOCAL_JOINED_ROOM:"rtc_channel_local_joined_room",
    RTC_CHANNEL_LOCAL_LEFT_ROOM:"rtc_channel_local_left_room",
    RTC_CHANNEL_LOCAL_PUBLISHED:"rtc_channel_local_published",
    RTC_CHANNEL_LOCAL_UNPUBLISHED:"rtc_channel_local_unpublished",
    RTC_CHANNEL_LOCAL_PUBLISH_FAILED:"rtc_channel_publish_me_failed",
    RTC_CHANNEL_REMOTE_PUBLISHED:"rtc_channel_remote_publish",
    RTC_CHANNEL_REMOTE_UNPUBLISHED:"rtc_channel_remote_unpublish",
    RTC_CHANNEL_REMOTE_LEFT:"rtc_channel_remote_left",
    RTC_CHANNEL_LOCAL_STREAM_INCOMING: "rtc_channel_local_stream_incoming",
    RTC_CHANNEL_LOCAL_NO_MICROPHONE:"rtc_channel_local_no_audio_stream",
    RTC_CHANNEL_LOCAL_NO_CAMERA:"rtc_channel_local_no_video_stream",
    RTC_CHANNEL_REMOTE_STREAM_INCOMING:"rtc_channel_remote_stream_incoming",
    RTC_CHANNEL_REMOTE_STREAM_LISTEN_NOTIFY:"rtc_channel_remote_stream_listen_notify",
    RTC_CHANNEL_REMOTE_NO_AUDIO_STREAM:"rtc_channel_remote_no_audio_stream",
    RTC_CHANNEL_REMOTE_NO_VIDEO_STREAM:"rtc_channel_remote_no_video_stream",
    RTC_CHANNEL_REMOTE_REJECT_AUDIO: "rtc_channel_remote_reject_audio",
    RTC_CHANNEL_REMOTE_REJECT_VIDEO: "rtc_channel_remote_reject_video",
    RTC_CHANNEL_REMOTE_SUBSTREAM_EVENT: "rtc_channel_substream_event",
    RTC_CHANNEL_SUBSCRIBE_SUCCESS: "rtc_channel_subscribe_success",
    RTC_CHANNEL_SUBSCRIBE_FAILED: "rtc_channel_subscribe_failed",
    RTC_CHANNEL_ROOM_DESTROYED:"rtc_channel_room_destroyed",
    RTC_CHANNEL_CLOSED:"rtc_channel_closed",

};


/**
 * 获取SDK版本号
 * @return {String} SDK 版本号
 * @api private
 */
function rtcGetSdkVersion() {

    return RtcSdkVersion.RTC_SDK_VERSION;
}

/**
 * 初始化会话
 * @param {String} server 服务端地址，格式为   wss://ip:port/ws
 * @param {Function} callback 会话的回调函数，用于应用接受处理会话范畴内的事件
 * @param {Object} config 会话配置信息，见 RtcSessionConfig
 * @return {Object} Session会话实例
 * @api private
 */
function rtcInitSession(server, callback, config) {

    console.debug("====== rtcInitSession ======");
    if(checkServerAddressParamFailed(server) || checkObjectParamFailed(config))
        return null;
    callback =  filteredFuncParam(callback);
    return Session.init(server, callback, config);
}


/**
 * 初始化会话
 * @param {String} transportType 媒体传输类型
 * @api private
 */
function rtcSetMediaTransportType(transportType) {

    console.debug("====== rtcSetMediaTransportType ======");
    if(checkStringParamFailed(transportType))
        return null;
    return Session.setMediaTransportType(transportType);
}


/**
 * 申请服务
 * @param {String} session 全局会话实例
 * @param {String} svcType 服务类型, 见 RtcServiceType
 * @param {function} svcCallback 服务的回调函数，用于应用接受服务的事件
 * @api private
 */
function rtcApplyService(session, svcType, svcCallback) {

    console.debug("====== rtcApplyService ======");
    if(checkObjectParamFailed(session) || checkStringParamFailed(svcType))
        return;

    svcCallback = filteredFuncParam(svcCallback);
    switch(svcType)
    {
        case RtcServiceType.RTC_SERVICE_TYPE_CAM:
            Cam.init(session);
            Cam.createChannel("me", true, null,svcCallback);
            break;
        case RtcServiceType.RTC_SERVICE_TYPE_LIVE:
            Live.init(session);
            Live.createChannel("me",true, svcCallback);
            break;
    }
}

/**
 * 释放服务
 * @param {String} svcType 服务类型, 见 RtcServiceType
 * @api private
 */
function rtcReleaseService(svcType) {

    console.debug("====== rtcReleaseService ======");
    if(checkStringParamFailed(svcType))
        return;
    switch(svcType)
    {
        case RtcServiceType.RTC_SERVICE_TYPE_CAM:
            //todo
            break;
        case RtcServiceType.RTC_SERVICE_TYPE_LIVE:
            Live.destroy();
            break;
    }
}


/**
 * 播放媒体流
 * @param {Object} videoSrc 网页视频元素
 * @param {Object} stream  媒体流对象
 * @api private
 */
function rtcAttachStream(videoSrc, stream)
{
    console.debug("====== rtcAttachStream ======");
    if(checkObjectParamFailed(videoSrc) || checkObjectParamFailed(stream))
        return;
    Mms.attachMediaStream(videoSrc,stream);
}

/**
 * 媒体流播放重定向
 * @param {Object} to 网页视频元素
 * @param {Object} from 网页视频元素
 * @api private
 */
function rtcReAttachStream(to, from)
{
    console.debug("====== rtcReAttachStream ======");
    if(checkObjectParamFailed(to) || checkObjectParamFailed(from))
        return;
    Mms.reattachMediaStream(to,from);
}



/******************************* 监控服务API接口函数开始 **********************************/

/**
 * 用户登录
 * @param {String} userName 用户名
 * @param {String} password 密码
 * @api private
 */
function rtcCamLogin(userName, password)
{
    console.debug("====== rtcCamLogin ======");
    if(checkStringParamFailed(userName) || checkStringParamFailed(password))
        return;
    Cam.login(userName, password);
}

/**
 * 用户退出登录
 * @api private
 */
function rtcCamLogout()
{
    console.debug("====== rtcCamLogout ======");
    Cam.logout();
}

/**
 * 发出呼叫
 * @param {Object} handler 成员句柄
 * @param {String} userName 被叫号码
 * @param {String} mediaType 媒体类型
 * @api private
 */
function rtcCamMakeCall(handler, userName, mediaType)
{
    console.debug("====== rtcCamMakeCall ======");
    if(checkObjectParamFailed(handler) ||
        checkStringParamFailed(userName)||
        checkStringParamFailed(mediaType))
        return;
    Cam.makeCall(handler, userName, mediaType);
}

/**
 * 接听呼叫
 * @param {Object} handler 成员句柄
 * @param {String} mediaType 应答媒体类型
 * @api private
 */
function rtcCamAnswerCall(handler, mediaType)
{
    console.debug("====== rtcCamAnswerCall ======");
    if(checkObjectParamFailed(handler) || checkStringParamFailed(mediaType))
        return;
    Cam.answerCall(handler, mediaType);
}

/**
 * 拒绝接听
 * @param {Object} handler 成员句柄
 * @api private
 */
function rtcCamRejectCall(handler)
{
    console.debug("====== rtcCamRejectCall ======");
    if(checkObjectParamFailed(handler))
        return;
    Cam.rejectCall(handler);
}

/**
 * 挂断通话
 * @param {Object} handler 成员句柄
 * @api private
 */
function rtcCamCloseCall(handler)
{
    console.debug("====== rtcCamCloseCall ======");
    if(checkObjectParamFailed(handler))
        return;
    Cam.closeCall(handler);
}

/**
 * 开启连接远端用户
 * @param {String} userName 用户名
 * @param {String} mediaType 媒体类型
 * @param {Object} playInfo 播放信息
 * {
 *     视频编码统一采用H.264
 *
 *      mediaQuality:
 *      {
 *          video:
 *          {
 *              quality:  RtcVideoQuality  QCIF/CIF/4CIF/D1/720P/720P_HQ/1080P/1080P_HQ/1080P_SHQ
 *
 *                  QCIF      (176x144)  码率(288kbps)       sdp_f: v/2/1/x/y/288 a///
 *                  CIF       (352x288)  码率(576kbps)       sdp_f: v/2/2/x/y/576 a///
 *                  4CIF      (704x576)  码率(1088kbps)      sdp_f: v/2/3/x/y/1088 a///
 *                  D1        (720x576)  码率(1088kbps)      sdp_f: v/2/4/x/y/1088 a///
 *
 *                  720P      (1280x720) 码率(2496kbps)      sdp_f: v/2/5/x/y/2496 a///
 *                  720P_HQ   (1280x720) 码率(3072kbps)      sdp_f: v/2/5/x/y/3072 a///
 *
 *                  1080P     (1920x1080) 码率(4992kbps)     sdp_f: v/2/6/x/y/4992 a///
 *                  1080P_HQ  (1920x1080) 码率(7552kbps)     sdp_f: v/2/6/x/y/7552 a///
 *                  1080P_SHQ (1920x1080) 码率(20000kbps)    sdp_f: v/2/6/x/y/20000 a///
 *
 *
 *              frameRate: (0~99)       对应上面 sdp_f中的x
 *
 *              bitRateType: RtcVideoBitRateType.Constant/Variable:
 *                 Constant: 固定码率， Variable: 可变码率
 *          }
 *
 *
 *          audio:
 *          {
 *              quality: RtcAudioQuality HQ_HBR/HQ_MBR/MQ_MBR1/MQ_MBR2/LQ_LBR/LQ_LBR1/LQ_LBR2
 *
 *                  HQ_HBR：    G711    码率(64kbps) 采样率(8kHz)        sdp_f: v///// a/1/8/1     高质量高码率
 *                  HQ_MBR:     G722.1  码率(48kbps) 采样率(32kHz)       sdp_f: v///// a/4/7/4     较高质量较高码率
 *                  MQ_MBR1:      G722.1  码率(32kbps) 采样率(16kHz)      sdp_f: v///// a/4/6/3    中等质量中等码率
 *                  MQ_MBR2：     G722.1  码率(16kbps)  采样率(8kHz)      sdp_f: v///// a/4/4/1    中等质量较低码率
 *                  LQ_LBR:      G729    码率(8kbps)   采样率(8kHz)      sdp_f: v///// a/3/3/1     低质量低码率
 *                  LQ_LBR1:     G723.1  码率(6.3kbps) 采样率(8kHz)     sdp_f: v///// a/2/2/2      低质量很低码率
 *                  LQ_LBR2:     G723.1  码率(5.3kbps) 采样率(8kHz)     sdp_f: v///// a/2/1/2      低质量超低码率
 *          }
 * }
 *
 * @param {function} chCallback  远端用户通道回调函数
 * @api private
 */
function rtcCamOpenStream(userName, mediaType, playInfo, chCallback)
{
    console.debug("====== rtcCamOpenStream ======");
    if(checkStringParamFailed(userName) || checkStringParamFailed(mediaType) || checkObjectParamFailed(playInfo))
        return;
    chCallback = filteredFuncParam(chCallback);
    let callInfo = {servType: CallServType.ServPlay, mediaType:mediaType, detailInfo:playInfo};
    Cam.createChannel(userName, false, callInfo, chCallback);
}


/**
 * 关闭连接远端用户
 * @param {Object} handler 远端媒体成员句柄
 * @api private
 */
function rtcCamCloseStream(handler)
{
    console.debug("====== rtcCamCloseStream ======");
    if(checkObjectParamFailed(handler))
        return;
    Cam.destroyChannel(handler,false);
}

/**
 * 控制远端摄像头
 * @param {Object} handler 远端媒体成员句柄
 * @param {String} userName  远端用户ID
 * @param {Object} ptzCtrl  控制指令信息
 *
 *   ptzCtrl :
 *   {
 *       pan:        val1,   //水平向左：(-256 ~ -1); 水平向右：（1 ~ 256）； 停止：0
 *       tilt:       val2,   //垂直向上：(-256 ~ -1); 垂直向下：（1 ~ 256）； 停止：0
 *       zoom:       val3,   //变焦缩小：(-16 ~ -1);  变焦放大：（1 ~ 16）； 停止：0
 *       priority:   val4    //优先级
 *   }
 *   注1： val1/2/3 的数值用来控制速率, 如果为0，则停止运动
 *   注2： pan/tilt/zoom中也可只包含其中1个或2个，不包含的项默认设置为停止
 *
 * @api private
 */
function rtcCamPtzControl(handler, userName, ptzCtrl)
{
    console.debug("====== rtcCamPtzControl ======");
    if(checkObjectParamFailed(handler) || checkStringParamFailed(userName)
        || checkObjectParamFailed(ptzCtrl))
        return;
    Cam.ptzControl(handler,userName,ptzCtrl);
}

/**
 * 本地禁麦/禁像
 * @param {String} mediaType  媒体类型
 * @param {Boolean} mute  是否禁麦/禁像  true: 是  false： 否
 * @return {Boolean} 是否设置成功
 * @api private
 */
function rtcCamMuteLocalMedia(mediaType, mute) {
    console.debug("====== rtcCamMuteLocalMedia ======");
    if (checkStringParamFailed(mediaType)
        || checkBooleanParamFailed(mute))
        return false;
    return Cam.muteLocalMedia(mediaType, mute);
}

/**
 * 本地是否已禁麦/禁像
 * @param {String} mediaType  媒体类型
 * @return {Boolean} 是否已禁麦/禁像
 * @api private
 */
function rtcCamIsLocalMediaMuted(mediaType) {
    console.debug("====== rtcCamIsLocalMediaMuted ======");
    if (checkStringParamFailed(mediaType))
        return false;
    return Cam.isLocalMediaMuted(mediaType);
}


/**
 * 收听/取消收听成员媒体
 * @param {Object} handler 远端媒体成员句柄
 * @param {String} mediaType  媒体类型
 * @param {Boolean} listen  是否收听  true: 收听  false： 不收听
 * @return {Boolean} 是否设置成功
 * @api private
 */
function rtcCamListenRemoteMedia(handler, mediaType, listen)
{
    console.debug("====== rtcCamPtzControl ======");
    if(checkObjectParamFailed(handler) || checkStringParamFailed(mediaType)
        || checkBooleanParamFailed(listen))
        return false;
    return Cam.listenRemoteMedia(handler,mediaType,listen);
}


/**
 * 是否正在收听/收看远端音视频
 * @param {String} mediaType  媒体类型
 * @param {Object} handler 远端媒体成员句柄
 * @return {Boolean} 是否已禁麦/禁像
 * @api private
 */
function rtcCamIsRemoteMediaListened(handler, mediaType) {
    console.debug("====== rtcCamIsRemoteMediaListened ======");
    if (checkObjectParamFailed(handler) || checkStringParamFailed(mediaType))
        return false;
    return Cam.isRemoteMediaListened(handler,mediaType);
}

/**
 * 打开录像播放
 * ** 参考 GB28281 Page31 历史视音频的回放 9.8.1 附录K Page 195
 *
 * @param {String} senderId  发送者设备ID （符合GBT28181规范： 中心编码+行业编码+序号+类型编码） //其实就是SIP ID
 * @param {String} mediaType 媒体类型
 * @param {Object} playInfo  请求信息
 *  playInfo:
 *  {
 *      streamSN:           {String}  录制媒体流序列号 （实际上应该是录制媒体文件ID， 总长度不超过20位的字符串，以"1" 开头）
 *      fileUri:            {String}  sdp u行，简洁方式： 摄像头ID+参数(序号)； 普通方式： http://存储设备ID/文件夹/../文件 （见 GBT28281 Page 41  附录F ， 详见IETF RFC 4566-2006 5.5）
 *      startTime:          {Number}  sdp t行  回放起始时间 (t行) （见 GBT28281 Page 41 ，详见 IETF RFC 4566-2006 5.9）
 *      endTime:            {Number}  sdp t行  回放结束时间 (t行) （见 GBT28281 Page 41 ，详见 IETF RFC 4566-2006 5.9）
 *      mediaQuality:       {Object}  媒体质量  见rtcCamOpenStream中的说明
 *  }
 *
 *  示范见GBT28181规范 J.14
 *
 * @param {function} chCallback  远端用户通道回调函数
 * @api private
 */
function rtcCamOpenPlayback(senderId, mediaType, playInfo, chCallback)
{
    console.debug("====== rtcCamOpenPlayback ======");
    if(checkObjectParamFailed(playInfo) || checkStringParamFailed(mediaType) || checkObjectParamFailed(playInfo))
        return;
    chCallback = filteredFuncParam(chCallback);
    let callInfo = {servType: CallServType.ServPlayback, mediaType:mediaType, detailInfo:playInfo};
    Cam.createChannel(senderId, false, callInfo, chCallback);
}

/**
 * 关闭连接远端录像播放
 * @param {Object} handler 远端媒体成员句柄
 * @api private
 */
function rtcCamClosePlayback(handler)
{
    console.debug("====== rtcCamClosePlayback ======");
    if(checkObjectParamFailed(handler))
        return;
    Cam.destroyChannel(handler,false);
}

/**
 * 播放录像控制
 * ** 参考 GB28281 Page31 历史视音频的回放 9.8.3.2   附录B Page78 IETF RFC 2326
 *
 * @param {Object} handler  录像点播通道句柄
 * @param {Object} control  回放控制
 *
 * control:
 *  {
 *      type:   RtcCamPlaybackCtrlType   PLAY/PAUSE/TEARDOWN
 *      scale:  '1.0','2.0' （快进）; -1 -2 -3 (倒放)
 *      startTime: 当type为PLAY时有效， 0：正常从现在开始播放； >0: 随机拖放播放的时间点
 *  }
 *
 * @api private
 */

function rtcCamPlaybackControl(handler, control)
{
    console.debug("====== rtcCamPlaybackControl ======");
    if(checkObjectParamFailed(handler)
        || checkObjectParamFailed(control))
        return;
    return Cam.playbackControl(handler, control);
}



/*******************************  监控服务API接口函数结束 *************************************/


/******************************* 直播服务API接口函数开始 **********************************/

/**
 * 进入直播室
 * @param {Number} roomId 直播室ID
 * @param {String} localName 本地用户显示名
 * @api private
 */
function rtcLiveJoinRoom(roomId, localName)
{
    console.debug("====== rtcLiveJoinRoom ======");
    if(checkNumberParamFailed(roomId) || checkStringParamFailed(localName))
        return;
    Live.joinRoom(roomId, localName);
}

/**
 * 离开直播室
 * @param {Number} roomId 直播室ID
 * @api private
 */
function rtcLiveLeaveRoom(roomId)
{
    console.debug("====== rtcLiveLeaveRoom ======");
    if(checkNumberParamFailed(roomId))
        return;
    Live.leaveRoom(roomId);
}

/**
 * 发布本地的媒体流 默认发布
 * @param {String} mediaType 发布媒体的类型 见 RtcMediaType
 *
 * @api private
 */
function rtcLivePublish(mediaType)
{
    console.debug("====== rtcLivePublish ======");
    if(checkStringParamFailed(mediaType))
        return;
    Live.publishMe(mediaType,null);
}

/**
 * 发布本地的媒体流 指定规格
 * @param {String} mediaType 发布媒体的类型 见 RtcMediaType
 * @param {Object} captureProfile 发布视频的规格
 *                  captureProfile:
 *                    {
 *                        width:    xx,
 *                        height:   xx
 *                    }
 *
 * @api private
 */
function rtcLivePublishWithProfile(mediaType, captureProfile)
{
    console.debug("====== rtcLivePublish ======");
    if(checkStringParamFailed(mediaType)
        || checkObjectParamFailed(captureProfile))
        return;
    Live.publishMe(mediaType, captureProfile);
}

/**
 * 停止发布本地的媒体流
 * @api private
 */
function rtcLiveUnPublish()
{
    console.debug("====== rtcLiveUnPublish ======");
    Live.unpublishMe();
}

/**
 * 订阅远端成员的媒体流
 * @param {Number} memberID 远端成员ID
 * @param {function} callback 成员事件回调函数
 * @api private
 */
function rtcLiveSubscribe(memberID, callback)
{
    console.debug("====== rtcLiveSubscribe ======");
    if(checkNumberParamFailed(memberID))
        return;
    callback = filteredFuncParam(callback);
    Live.createChannel(memberID, false,  callback);
}


/**
 * 取消订阅远端成员的媒体流
 * @param {Object} handler 媒体成员句柄
 * @api private
 */
function rtcLiveUnSubscribe(handler)
{
    console.debug("====== rtcLiveUnSubscribe ======");
    if(checkObjectParamFailed(handler))
        return;
    Live.destroyChannel(handler, false);
}


/**
 * 收听/取消收听远端媒体流
 * @param {Object} handler 媒体成员句柄
 * @param {String} mediaType 媒体类型 :
 *                           收听/取消：RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
 *                           收看/取消：RtcMediaType.RTC_MEDIA_TYPE_VIDEO
 * @param {boolean} listen   true: 收听  false： 不收听
 * @return {boolean} 是否设置成功
 * @api private
 */
function rtcLiveListenRemoteMedia(handler, mediaType, listen)
{
    console.debug("====== rtcLiveListenRemoteMedia ======");
    if(checkObjectParamFailed(handler) || checkStringParamFailed(mediaType) || checkBooleanParamFailed(listen))
        return false;
    return Live.listenRemoteMedia(handler, mediaType, listen);
}

/**
 * 本地静音或禁像/取消静音或取消禁像
 * @param {String} mediaType 媒体类型 :
 *                           静音/取消：RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
 *                           禁像/取消：RtcMediaType.RTC_MEDIA_TYPE_VIDEO
 * @param {Boolean} mute   true: 静音/禁像  false： 取消静音/取消禁像
 * @return {Boolean}  是否设置成功 true:设置成功  false: 设置失败
 * @api private
 */
function rtcLiveMuteLocalMedia(mediaType, mute)
{
    console.debug("====== rtcLiveMuteLocalMedia ======");
    if(checkStringParamFailed(mediaType) || checkBooleanParamFailed(mute))
        return false;
    return Live.muteLocalMedia(mediaType, mute);
}


/**
 * 是否正在收听远端媒体流
 * @param {Object} handler 媒体成员句柄
 * @param {String} mediaType 媒体类型 :
 *                           音频：RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
 *                           视频：RtcMediaType.RTC_MEDIA_TYPE_VIDEO
 * @return {boolean}    true: 正在收听  false： 不在收听
 * @api private
 */
function rtcLiveIsListeningRemoteMedia(handler, mediaType)
{
    console.debug("====== rtcLiveIsListeningRemoteMedia ======");
    if(checkObjectParamFailed(handler) || checkStringParamFailed(mediaType))
        return undefined;
    return Live.isListeningRemoteMedia(handler, mediaType);
}

/**
 * 本地是否静音或禁像
 * @param {String} mediaType 媒体类型 :
 *                           音频：RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
 *                           视频：RtcMediaType.RTC_MEDIA_TYPE_VIDEO
 * @return {boolean}    true: 已静音/已禁像  false： 未静音/未禁像
 * @api private
 */
function rtcLiveIsLocalMediaMuted(mediaType)
{
    console.debug("====== rtcLiveIsLocalMediaMuted ======");
    if(checkStringParamFailed(mediaType))
        return undefined;
    return Live.isLocalMediaMuted(mediaType);
}

/**
 * 切换摄像头(手机)
 * @api private
 */
function rtcLiveSwitchCamera()
{
    console.debug("====== rtcLiveSwitchCamera ======");
    return Live.switchCamera();
}

/******************************* 直播服务API接口函数结束 **********************************/