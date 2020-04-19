Mms.browser = adapter.browserDetails.browser;
Mms.browser_ver = adapter.browserDetails.version;

Mms.sessions = {};
Mms.noop = function() {};
Mms.dataChanDefaultLabel = "Mms_DataChan";
Mms.endOfCandidates = null;

const MmsHint = {
	MMS_HINT_CONNECT_TO_SERVER_FAILED: "mms_hint_connect_to_server_failed",
	MMS_HINT_CONNECT_TO_SERVER_RETRYING:"mms_hint_connect_to_server_retrying",
	MMS_HINT_NO_AUDIO_VIDEO_INPUT_DEVICE: "mms_hint_no_audio_video_input_device",
    MMS_HINT_NO_AUDIO_INPUT_DEVICE: "mms_hint_no_audio_input_device",
    MMS_HINT_NO_VIDEO_INPUT_DEVICE: "mms_hint_no_video_input_device",
};
//var kaCnt = 0;

Mms.init = function(options) {
	options = options || {};
	options.callback = (typeof options.callback === "function") ? options.callback : Mms.noop;
	if(Mms.initDone === true) {
		options.callback();
	} else {
		if(typeof console === "undefined" || typeof console.log === "undefined")
			console = { log: function() {} };
		Mms.trace = Mms.noop;
		Mms.debug = Mms.noop;
		Mms.vdebug = Mms.noop;
		Mms.log = Mms.noop;
		Mms.warn = Mms.noop;
		Mms.error = Mms.noop;
		if(options.debug === true || options.debug === "all") {
			Mms.trace = console.trace.bind(console);
			Mms.debug = console.debug.bind(console);
			Mms.vdebug = console.debug.bind(console);
			Mms.log = console.log.bind(console);
			Mms.warn = console.warn.bind(console);
			Mms.error = console.error.bind(console);
		} else if(Array.isArray(options.debug)) {
			for(var i in options.debug) {
				var d = options.debug[i];
				switch(d) {
					case "trace":
						Mms.trace = console.trace.bind(console);
						break;
					case "debug":
						Mms.debug = console.debug.bind(console);
						break;
					case "vdebug":
						Mms.vdebug = console.debug.bind(console);
						break;
					case "log":
						Mms.log = console.log.bind(console);
						break;
					case "warn":
						Mms.warn = console.warn.bind(console);
						break;
					case "error":
						Mms.error = console.error.bind(console);
						break;
					default:
						console.error("Unknown debugging option '" + d + "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
						break;
				}
			}
		}
		Mms.log("Init mms sdk");

		Mms.listDevices = function(callback, config) {
			callback = (typeof callback === "function") ? callback : Mms.noop;
			if (config == null) config = { audio: true, video: true };
			if(Mms.isGetUserMediaAvailable()) {
				navigator.mediaDevices.getUserMedia(config)
				.then(function(stream) {
					navigator.mediaDevices.enumerateDevices().then(function(devices) {
						Mms.debug(devices);
						callback(devices);
						// Get rid of the now useless stream
						try {
							var tracks = stream.getTracks();
							for(var i in tracks) {
								var mst = tracks[i];
								if(mst !== null && mst !== undefined)
									mst.stop();
							}
						} catch(e) {}
					});
				})
				.catch(function(err) {
                    Mms.error(err);

					callback([]);
				});
			} else {
				Mms.warn("navigator.mediaDevices unavailable");
				callback([]);
			}
		};
		Mms.attachMediaStream = function(element, stream) {
			element.srcObject = stream;
		};
		Mms.reattachMediaStream = function(to, from) {
			to.srcObject = from.srcObject;
		};
		// Detect tab close
		var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
		var eventName = iOS ? 'pagehide' : 'beforeunload';
		var oldOBF = window["on" + eventName];
		window.addEventListener(eventName, function(event) {
			Mms.log("Close window");
			for(var s in Mms.sessions) {
				if(Mms.sessions[s] !== null && Mms.sessions[s] !== undefined && Mms.sessions[s].destroyOnUnload) {
					Mms.log("Destroy service " + s);
					Mms.sessions[s].destroy({asyncRequest: false, notifyDestroyed: false, cleanupHandles:true});
				}
			}
			if(oldOBF && typeof oldOBF === "function")
				oldOBF();
		});
		// If this is a Safari Technology Preview, check if VP8 is supported
		Mms.safariVp8 = false;
		if(Mms.browser === 'safari' && Mms.browser_ver >= 605) {
			if(RTCRtpSender && RTCRtpSender.getCapabilities && RTCRtpSender.getCapabilities("video") &&
					RTCRtpSender.getCapabilities("video").codecs && RTCRtpSender.getCapabilities("video").codecs.length) {
				for(var i in RTCRtpSender.getCapabilities("video").codecs) {
					var codec = RTCRtpSender.getCapabilities("video").codecs[i];
					if(codec && codec.mimeType && codec.mimeType.toLowerCase() === "video/vp8") {
						Mms.safariVp8 = true;
						break;
					}
				}
				if(Mms.safariVp8) {
					Mms.log("Safari supports VP8");
				} else {
					Mms.warn("Safari does NOT support VP8: if you're using a Technology Preview, " +
						"try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
				}
			} else {
				var testpc = new RTCPeerConnection({}, {});
				testpc.createOffer({offerToReceiveVideo: true}).then(function(offer) {
					Mms.safariVp8 = offer.sdp.indexOf("VP8") !== -1;
					if(Mms.safariVp8) {
						Mms.log("Safari supports VP8");
					} else {
						Mms.warn("Safari does NOT support VP8: if you're using a Technology Preview, " +
							"try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
					}
					testpc.close();
					testpc = null;
				});
			}
		}
		// Check if this browser supports Unified Plan and transceivers
		Mms.unifiedPlan = false;
		if(Mms.browser === 'firefox' && Mms.browser_ver >= 59) {
			// Firefox definitely does, starting from version 59
			Mms.unifiedPlan = true;
		} else if(Mms.browser === 'chrome' && Mms.browser_ver < 72) {
			// Chrome does, but it's only usable from version 72 on
			Mms.unifiedPlan = false;
		} else if(!window.RTCRtpTransceiver || !('currentDirection' in RTCRtpTransceiver.prototype)) {
			// Safari supports addTransceiver() but not Unified Plan when
			// currentDirection is not defined
			Mms.unifiedPlan = false;
		} else {
			// Check if addTransceiver() throws an exception
			const tempPc = new RTCPeerConnection();
			try {
				tempPc.addTransceiver('audio');
				Mms.unifiedPlan = true;
			} catch (e) {}
			tempPc.close();
		}
		Mms.initDone = true;
		Mms.log("Mms Lib inited done!");
		options.callback();
	}
};

Mms.isWebrtcSupported = function() {
	return window.RTCPeerConnection !== undefined && window.RTCPeerConnection !== null;
};

Mms.isGetUserMediaAvailable = function() {
	return navigator.mediaDevices !== undefined && navigator.mediaDevices !== null &&
		navigator.mediaDevices.getUserMedia !== undefined && navigator.mediaDevices.getUserMedia !== null;
};

Mms.randomString = function(len) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
}


function Mms(mmsCallbacks) {
	if(Mms.initDone === undefined) {
		mmsCallbacks.error("Mms Lib not init");
		return {};
	}
	if(!Mms.isWebrtcSupported()) {
		mmsCallbacks.error("WebRTC not supported");
		return {};
	}
	mmsCallbacks = mmsCallbacks || {};
	mmsCallbacks.success = (typeof mmsCallbacks.success == "function") ? mmsCallbacks.success : Mms.noop;
	mmsCallbacks.error = (typeof mmsCallbacks.error == "function") ? mmsCallbacks.error : Mms.noop;
	mmsCallbacks.destroyed = (typeof mmsCallbacks.destroyed == "function") ? mmsCallbacks.destroyed : Mms.noop;
	if(mmsCallbacks.server === null || mmsCallbacks.server === undefined) {
		mmsCallbacks.error("Invalid server url");
		return {};
	}
	var ws = null;
	var wsHandlers = {};
	var wsKeepaliveTimeoutId = null;


	var wsReconnectTimeoutId = null;
	var reconnectCnt = 0;
    var reconnectPeriod = 300;
    var reconnectDiffPeriod = 200;
    var reconnecting = false;

	var server = mmsCallbacks.server;
	if(server.indexOf("ws") < 0) {
		mmsCallbacks.error("Invalid server url: should start with 'ws'");
		return {};
	}
	var iceServers = mmsCallbacks.iceServers;
	if(iceServers === undefined || iceServers === null)
		iceServers = [{urls: "stun:stun.l.google.com:19302"}];
	var iceTransportPolicy = mmsCallbacks.iceTransportPolicy;
	var bundlePolicy = mmsCallbacks.bundlePolicy;
	var ipv6Support = mmsCallbacks.ipv6;
	if(ipv6Support === undefined || ipv6Support === null)
		ipv6Support = false;
	var token = null;
	if(mmsCallbacks.token !== undefined && mmsCallbacks.token !== null)
		token = mmsCallbacks.token;
	var apisecret = null;
	if(mmsCallbacks.apisecret !== undefined && mmsCallbacks.apisecret !== null)
		apisecret = mmsCallbacks.apisecret;
	this.destroyOnUnload = true;
	if(mmsCallbacks.destroyOnUnload !== undefined && mmsCallbacks.destroyOnUnload !== null)
		this.destroyOnUnload = (mmsCallbacks.destroyOnUnload === true);

	var keepAlivePeriod = 25000;
    //var keepAlivePeriod = 10000;
	if(mmsCallbacks.keepAlivePeriod !== undefined && mmsCallbacks.keepAlivePeriod !== null)
		keepAlivePeriod = mmsCallbacks.keepAlivePeriod;
	if(isNaN(keepAlivePeriod))
		keepAlivePeriod = 25000;

	var connected = false;
	var sessionId = null;
	var serviceHandles = {};
	var that = this;
	var transactions = {};

	createSession(mmsCallbacks);

	// Public methods
	this.getServer = function() { return server; };
	this.wsConnected = function() { return connected; };
	this.reconnect = function(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error === "function") ? callbacks.error : Mms.noop;
		callbacks["reconnect"] = true;
		createSession(callbacks);
	};
	this.getSessionId = function() { return sessionId; };
	this.destroy = function(callbacks) { destroySession(callbacks); };
	this.attach = function(callbacks) { createHandle(callbacks); };
	this.setIceServers = function(param)
	{
		iceServers = param;

	};

	this.setIceRelay = function(isRelay) {
		if(isRelay)
			iceTransportPolicy = "relay";
		else
			iceTransportPolicy = undefined;
	};

	// overrides for default maxBitrate values for simulcasting
	function getMaxBitrates(simulcastMaxBitrates) {
		var maxBitrates = {
			high: 900000,
			medium: 300000,
			low: 100000,
		};

		if (simulcastMaxBitrates !== undefined && simulcastMaxBitrates !== null) {
			if (simulcastMaxBitrates.high)
				maxBitrates.high = simulcastMaxBitrates.high;
			if (simulcastMaxBitrates.medium)
				maxBitrates.medium = simulcastMaxBitrates.medium;
			if (simulcastMaxBitrates.low)
				maxBitrates.low = simulcastMaxBitrates.low;
		}
		return maxBitrates;
	}

	function handleEvent(json, skipTimeout) {
		if(json["mms"] === "keepalive") {
			Mms.vdebug("Recv KA, sid: " + sessionId);
			return;
		} else if(json["mms"] === "ack") {
			Mms.debug("Recv ack: ", JSON.stringify(json));
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["mms"] === "success") {
			Mms.debug("Recv success: ", JSON.stringify(json));
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["mms"] === "trickle") {
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.debug("This handle is not attached to this service");
				return;
			}
			var candidate = json["candidate"];
			Mms.debug("Recv trickled candidate: ", json);
			var config = serviceHandle.webrtcStuff;
			if(config.pc && config.remoteSdp) {
				Mms.debug("Adding remote candidate:", candidate);
				if(!candidate || candidate.completed === true) { // end-of-candidates
					config.pc.addIceCandidate(Mms.endOfCandidates);
				} else { // New candidate
					config.pc.addIceCandidate(candidate);
				}
			} else {
				Mms.debug("Not do setRemoteDescription (trickle recv before offer?), caching candidate");
				if(!config.candidates)
					config.candidates = [];
				config.candidates.push(candidate);
				Mms.debug(config.candidates);
			}
		} else if(json["mms"] === "webrtcup") {
			Mms.debug("Recv webrtcup event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.debug("This handle is not attached to this service");
				return;
			}
			serviceHandle.webrtcState(true);
			return;
		} else if(json["mms"] === "hangup") {
			// A service asked the service to hangup a PeerConnection on one of our handles
			Mms.debug("Recv hangup event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.debug("This handle is not attached to this service");
				return;
			}
			serviceHandle.webrtcState(false, json["reason"]);
			serviceHandle.hangup();
		} else if(json["mms"] === "detached") {
			Mms.debug("Recv detached event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				// maybe destroyHandle causes this situation.
				return;
			}
			serviceHandle.detached = true;
			serviceHandle.ondetached();
			serviceHandle.detach();
		} else if(json["mms"] === "media") { // Media started/stopped flowing
			Mms.debug("Recv media event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.debug("This handle is not attached to this service");
				return;
			}
			serviceHandle.mediaState(json["type"], json["receiving"]);
		} else if(json["mms"] === "slowlink") {
			Mms.debug("Recv slowlink event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.debug("This handle is not attached to this service");
				return;
			}
			serviceHandle.slowLink(json["uplink"], json["lost"]);
		} else if(json["mms"] === "error") {
			Mms.error("Err: " + json["error"].code + " " + json["error"].reason);
			Mms.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["mms"] === "event") {
			Mms.debug("Recv service event: ", json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Mms.warn("Missing sender...");
				return;
			}
			var servicedata = json["servicedata"];
			if(servicedata === undefined || servicedata === null) {
				Mms.warn("Missing servicedata...");
				return;
			}
			var data = servicedata["data"];
			Mms.debug("  -- Event from " + sender + " (" + servicedata["service"] + ") data: ", data);
			var serviceHandle = serviceHandles[sender];
			if(serviceHandle === undefined || serviceHandle === null) {
				Mms.warn("This handle is not attached to this service");
				return;
			}
			var jsep = json["jsep"];
			if(jsep !== undefined && jsep !== null) {
				Mms.debug("Handling SDP: ", jsep);
			}
			var callback = serviceHandle.onmessage;
			if(callback !== null && callback !== undefined) {
				data.transaction = json["transaction"];
				callback(data, jsep);
			} else {
				Mms.debug("No provided notification callback");
			}
		} else if(json["mms"] === "timeout") {
			Mms.error("Timeout, sid: " + sessionId);
			Mms.debug(json);
			ws.close(3504, "media server timeout");
			return;
		} else {
			Mms.warn("Unknown message/event  '" + json["mms"] + "', sid: " + sessionId);
			Mms.debug(json);
		}
	}

	function reconnectSession() {
        Mms.debug("reconnecting session ......");
        if(reconnectCnt < 3)
		{
			++reconnectCnt;
            //wsReconnectTimeoutId =  setTimeout(reconnectSession, reconnectPeriod+ reconnectDiffPeriod*reconnectCnt);
            wsReconnectTimeoutId =  setTimeout(reconnectSession, reconnectPeriod);
            mmsCallbacks.error(MmsHint.MMS_HINT_CONNECT_TO_SERVER_RETRYING);
		}
		else
		{
			reconnectCnt = 0;
			mmsCallbacks.error(MmsHint.MMS_HINT_CONNECT_TO_SERVER_FAILED);
			reconnecting = false;
		}
	}

	function keepAlive() {
		if(server === null || !connected)
			return;

		wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
		var request = { "mms": "keepalive", "session_id": sessionId, "transaction": Mms.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		ws.send(JSON.stringify(request));
	}

	function createSession(callbacks) {
		var transaction = Mms.randomString(12);
		var request = { "mms": "create", "transaction": transaction };
		if(callbacks["reconnect"] && sessionId !== null) {
			connected = false;
			request["mms"] = "claim";
			request["session_id"] = sessionId;
			if(ws) {
				ws.onopen = null;
				ws.onerror = null;
				ws.onclose = null;
				if(wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
					wsKeepaliveTimeoutId = null;
				}
			}
		}
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		ws = new WebSocket(server, 'mms');
		Mms.log("WebSocket server="+server);
		wsHandlers = {
			'error': function() {
				Mms.error("Error connect to the Mms server: " + server);
				if(!reconnecting)
				{
                    wsReconnectTimeoutId = setTimeout(reconnectSession, reconnectPeriod);
                    reconnecting = true;
				}

			},

			'open': function() {
				transactions[transaction] = function(json) {
					if (json["mms"] !== "success") {
						Mms.error("Err: " + json["error"].code + " " + json["error"].reason);
						callbacks.error(json["error"].reason);
						return;
					}
					wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
					connected = true;
					sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
					if(callbacks["reconnect"]) {
						clearTimeout(wsReconnectTimeoutId);
						wsReconnectTimeoutId = null;
						reconnecting = false;
						Mms.log("Claimed service: " + sessionId);
					} else {
						Mms.log("Created service: " + sessionId);
					}
					Mms.sessions[sessionId] = that;
					callbacks.success();
				};
				ws.send(JSON.stringify(request));
			},

			'message': function(event) {
				handleEvent(JSON.parse(event.data));
			},

			'close': function() {
				if (server === null || !connected) {
					return;
				}
				connected = false;
                wsReconnectTimeoutId = setTimeout(reconnectSession, reconnectPeriod);
                reconnecting = true;
				//mmsCallbacks.error("Lost connection to Server(Is it down?)");
			}
		};

		for(var eventName in wsHandlers) {
			ws.addEventListener(eventName, wsHandlers[eventName]);
		}
	}

	function destroySession(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		var notifyDestroyed = true;
		if(callbacks.notifyDestroyed !== undefined && callbacks.notifyDestroyed !== null)
			notifyDestroyed = (callbacks.notifyDestroyed === true);
		var cleanupHandles = false;
		if(callbacks.cleanupHandles !== undefined && callbacks.cleanupHandles !== null)
			cleanupHandles = (callbacks.cleanupHandles === true);
		Mms.log("Destroy service " + sessionId + " (async=" + asyncRequest + ")");
		if(sessionId === undefined || sessionId === null) {
			Mms.warn("No service to destroy");
			callbacks.success();
			if(notifyDestroyed)
				mmsCallbacks.destroyed();
			return;
		}
		delete Mms.sessions[sessionId];
		if(cleanupHandles) {
			for(var handleId in serviceHandles)
				destroyHandle(handleId, { noRequest: true });
		}
		if(!connected) {
			Mms.warn("Is the server down? (connected=false)");
			callbacks.success();
			return;
		}
		var request = { "mms": "destroy", "transaction": Mms.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;

		request["session_id"] = sessionId;

		var unbindWebSocket = function() {
			for(var eventName in wsHandlers) {
				ws.removeEventListener(eventName, wsHandlers[eventName]);
			}
			ws.removeEventListener('message', onUnbindMessage);
			ws.removeEventListener('error', onUnbindError);
			if(wsKeepaliveTimeoutId) {
				clearTimeout(wsKeepaliveTimeoutId);
			}
			ws.close();
		};

		var onUnbindMessage = function(event){
			var data = JSON.parse(event.data);
			if(data.session_id === request.session_id && data.transaction === request.transaction) {
				unbindWebSocket();
				callbacks.success();
				if(notifyDestroyed)
					mmsCallbacks.destroyed();
			}
		};
		var onUnbindError = function(event) {
			unbindWebSocket();
			callbacks.error("Failed to destroy the server: Is the server down?");
			if(notifyDestroyed)
				mmsCallbacks.destroyed();
		};

		ws.addEventListener('message', onUnbindMessage);
		ws.addEventListener('error', onUnbindError);

		ws.send(JSON.stringify(request));
	}

	function createHandle(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error === "function") ? callbacks.error : Mms.noop;
		callbacks.consentDialog = (typeof callbacks.consentDialog === "function") ? callbacks.consentDialog : Mms.noop;
		callbacks.iceState = (typeof callbacks.iceState === "function") ? callbacks.iceState : Mms.noop;
		callbacks.mediaState = (typeof callbacks.mediaState === "function") ? callbacks.mediaState : Mms.noop;
		callbacks.webrtcState = (typeof callbacks.webrtcState === "function") ? callbacks.webrtcState : Mms.noop;
		callbacks.slowLink = (typeof callbacks.slowLink === "function") ? callbacks.slowLink : Mms.noop;
		callbacks.onmessage = (typeof callbacks.onmessage === "function") ? callbacks.onmessage : Mms.noop;
		callbacks.onlocalstream = (typeof callbacks.onlocalstream === "function") ? callbacks.onlocalstream : Mms.noop;
		callbacks.onremotestream = (typeof callbacks.onremotestream === "function") ? callbacks.onremotestream : Mms.noop;
		callbacks.ondata = (typeof callbacks.ondata === "function") ? callbacks.ondata : Mms.noop;
		callbacks.ondataopen = (typeof callbacks.ondataopen === "function") ? callbacks.ondataopen : Mms.noop;
		callbacks.oncleanup = (typeof callbacks.oncleanup === "function") ? callbacks.oncleanup : Mms.noop;
		callbacks.ondetached = (typeof callbacks.ondetached === "function") ? callbacks.ondetached : Mms.noop;
		if(!connected) {
			Mms.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return;
		}
		var service = callbacks.service;
		if(service === undefined || service === null) {
			Mms.error("Invalid service");
			callbacks.error("Invalid service");
			return;
		}
		var opaqueId = callbacks.opaqueId;
		var handleToken = callbacks.token ? callbacks.token : token;
		var transaction = Mms.randomString(12);
		var request = { "mms": "attach", "service": service, "opaque_id": opaqueId,
			 "transaction": transaction };
		if(handleToken !== null && handleToken !== undefined)
			request["token"] = handleToken;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		transactions[transaction] = function(json) {
			if(json["mms"] !== "success") {
				Mms.error("Err: " + json["error"].code + " " + json["error"].reason);	// FIXME
				callbacks.error("Err: " + json["error"].code + " " + json["error"].reason);
				return;
			}
			var handleId = json.data["id"];
			Mms.log("Created handle: " + handleId);
			var serviceHandle = {
				session : that,
				service : service,
				id : handleId,
				token : handleToken,
				detached : false,
				webrtcStuff : {
					started : false,
					myStream : null,
					streamExternal : false,
					remoteStream : null,
					mySdp : null,
					mediaConstraints : null,
					pc : null,
					dataChannel : {},
					dtmfSender : null,
					trickle : true,
					iceDone : false,
					volume : {
						value : null,
						timer : null
					},
					bitrate : {
						value : null,
						bsnow : null,
						bsbefore : null,
						tsnow : null,
						tsbefore : null,
						timer : null
					}
				},
				getId : function() { return handleId; },
				getService : function() { return service; },
				getVolume : function() { return getVolume(handleId, true); },
				getRemoteVolume : function() { return getVolume(handleId, true); },
				getLocalVolume : function() { return getVolume(handleId, false); },
				isAudioMuted : function() { return isMuted(handleId, false); },
				muteAudio : function() { return mute(handleId, false, true); },
				unmuteAudio : function() { return mute(handleId, false, false); },
				isVideoMuted : function() { return isMuted(handleId, true); },
				muteVideo : function() { return mute(handleId, true, true); },
				unmuteVideo : function() { return mute(handleId, true, false); },
				getBitrate : function() { return getBitrate(handleId); },
				send : function(callbacks) { return sendMessage(handleId, callbacks); },
				data : function(callbacks) { sendData(handleId, callbacks); },
				dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
				consentDialog : callbacks.consentDialog,
				iceState : callbacks.iceState,
				mediaState : callbacks.mediaState,
				webrtcState : callbacks.webrtcState,
				slowLink : callbacks.slowLink,
				onmessage : callbacks.onmessage,
				createOffer : function(callbacks) { prepareWebrtc(handleId, true, callbacks); },
				createAnswer : function(callbacks) { prepareWebrtc(handleId, false, callbacks); },
				handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
				onlocalstream : callbacks.onlocalstream,
				onremotestream : callbacks.onremotestream,
				ondata : callbacks.ondata,
				ondataopen : callbacks.ondataopen,
				oncleanup : callbacks.oncleanup,
				ondetached : callbacks.ondetached,
				hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
				detach : function(callbacks) { destroyHandle(handleId, callbacks); }
			}
			serviceHandles[handleId] = serviceHandle;
			callbacks.success(serviceHandle);
		};
		request["session_id"] = sessionId;
		ws.send(JSON.stringify(request));
	}

	function serviceInvalid(handle) {
		if(handle === null || handle === undefined ||
				handle.webrtcStuff === null || handle.webrtcStuff === undefined) {
			Mms.warn("Invalid handle");
			return true;
		}
		return false;
	}

	function sendMessage(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error === "function") ? callbacks.error : Mms.noop;
		if(!connected) {
			Mms.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return null;
		}
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return null;
		}
		var message = callbacks.message;
		var jsep = callbacks.jsep;
		var transaction = Mms.randomString(12);
		var request = { "mms": "message", "body": message, "transaction": transaction };
		if(serviceHandle.token !== null && serviceHandle.token !== undefined)
			request["token"] = serviceHandle.token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(jsep !== null && jsep !== undefined)
			request.jsep = jsep;
		request["session_id"] = sessionId;
		request["handle_id"] = handleId;
		Mms.debug("Send message to service: ", request);
		transactions[transaction] = function(json) {
			if(json["mms"] === "success") {
				var servicedata = json["servicedata"];
				if(servicedata === undefined || servicedata === null) {
					Mms.warn("Request succeeded, but missing servicedata...");
					callbacks.success();
					return;
				}
				Mms.log("Synchronous transaction successful (" + servicedata["service"] + ")");
				var data = servicedata["data"];
				Mms.debug(data);
				callbacks.success(data);
				return;
			} else if(json["mms"] !== "ack") {
				if(json["error"] !== undefined && json["error"] !== null) {
					Mms.error("Err: " + json["error"].code + " " + json["error"].reason);
					callbacks.error(json["error"].code + " " + json["error"].reason);
				} else {
					Mms.error("Unknown error");
					callbacks.error("Unknown error");
				}
				return;
			}
			callbacks.success();
		};
		ws.send(JSON.stringify(request));
		return transaction;
	}

	function sendTrickleCandidate(handleId, candidate) {
		if(!connected) {
			Mms.warn("Is the server down? (connected=false)");
			return;
		}
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return;
		}
		var request = { "mms": "trickle", "candidate": candidate, "transaction": Mms.randomString(12) };
		if(serviceHandle.token !== null && serviceHandle.token !== undefined)
			request["token"] = serviceHandle.token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		request["session_id"] = sessionId;
		request["handle_id"] = handleId;
		Mms.vdebug("Send trickle candidate: ", request);
		ws.send(JSON.stringify(request));
	}

	function createDataChannel(handleId, dclabel, incoming, pendingText) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceHandle === null || serviceHandle === undefined ||
				serviceHandle.webrtcStuff === null || serviceHandle.webrtcStuff === undefined) {
			Mms.warn("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		var onDataChannelMessage = function(event) {
			Mms.log("Recv message on data channel:", event);
			var label = event.target.label;
			serviceHandle.ondata(event.data, label);
		}
		var onDataChannelStateChange = function(event) {
			Mms.log("Recv state change on data channel:", event);
			var label = event.target.label;
			var dcState = config.dataChannel[label] ? config.dataChannel[label].readyState : "null";
			Mms.log("State change on <" + label + "> data channel: " + dcState);
			if(dcState === 'open') {
				// Any pending messages to send?
				if(config.dataChannel[label].pending && config.dataChannel[label].pending.length > 0) {
					Mms.log("Send pending messages on <" + label + ">:", config.dataChannel[label].pending.length);
					for(var i in config.dataChannel[label].pending) {
						var text = config.dataChannel[label].pending[i];
						Mms.log("Send string on data channel <" + label + ">: " + text);
						config.dataChannel[label].send(text);
					}
					config.dataChannel[label].pending = [];
				}
				// Notify the open data channel
				serviceHandle.ondataopen(label);
			}
		}
		var onDataChannelError = function(error) {
			Mms.error("Error on data channel:", error);
		}
		if(!incoming) {
			// TODO: Add options (ordered, maxRetransmits, etc.)
			config.dataChannel[dclabel] = config.pc.createDataChannel(dclabel, {ordered:false});
		} else {
			// The channel was created by Mms
			config.dataChannel[dclabel] = incoming;
		}
		config.dataChannel[dclabel].onmessage = onDataChannelMessage;
		config.dataChannel[dclabel].onopen = onDataChannelStateChange;
		config.dataChannel[dclabel].onclose = onDataChannelStateChange;
		config.dataChannel[dclabel].onerror = onDataChannelError;
		config.dataChannel[dclabel].pending = [];
		if(pendingText)
			config.dataChannel[dclabel].pending.push(pendingText);
	}

	function sendData(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Mms.noop;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		var text = callbacks.text;
		if(text === null || text === undefined) {
			Mms.warn("Invalid text");
			callbacks.error("Invalid text");
			return;
		}
		var label = callbacks.label ? callbacks.label : Mms.dataChanDefaultLabel;
		if(!config.dataChannel[label]) {
			// Create new data channel and wait for it to open
			createDataChannel(handleId, label, false, text);
			callbacks.success();
			return;
		}
		if(config.dataChannel[label].readyState !== "open") {
			config.dataChannel[label].pending.push(text);
			callbacks.success();
			return;
		}
		Mms.log("Send string on data channel <" + label + ">: " + text);
		config.dataChannel[label].send(text);

		callbacks.success();
	}

	function sendDtmf(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Mms.noop;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		if(config.dtmfSender === null || config.dtmfSender === undefined) {
			if(config.pc !== undefined && config.pc !== null) {
				var senders = config.pc.getSenders();
				var audioSender = senders.find(function(sender) {
					return sender.track && sender.track.kind === 'audio';
				});
				if(!audioSender) {
					Mms.warn("Invalid DTMF configuration (no audio track)");
					callbacks.error("Invalid DTMF configuration (no audio track)");
					return;
				}
				config.dtmfSender = audioSender.dtmf;
				if(config.dtmfSender) {
					Mms.log("Created DTMF Sender");
					config.dtmfSender.ontonechange = function(tone) { Mms.debug("Sent DTMF tone: " + tone.tone); };
				}
			}
			if(config.dtmfSender === null || config.dtmfSender === undefined) {
				Mms.warn("Invalid DTMF configuration");
				callbacks.error("Invalid DTMF configuration");
				return;
			}
		}
		var dtmf = callbacks.dtmf;
		if(dtmf === null || dtmf === undefined) {
			Mms.warn("Invalid DTMF parameters");
			callbacks.error("Invalid DTMF parameters");
			return;
		}
		var tones = dtmf.tones;
		if(tones === null || tones === undefined) {
			Mms.warn("Invalid DTMF string");
			callbacks.error("Invalid DTMF string");
			return;
		}
		var duration = dtmf.duration;
		if(duration === null || duration === undefined)
			duration = 500;
		var gap = dtmf.gap;
		if(gap === null || gap === undefined)
			gap = 50;
		Mms.debug("Send DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
		config.dtmfSender.insertDTMF(tones, duration, gap);
		callbacks.success();
	}

	function destroyHandle(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Mms.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		var noRequest = true;
		if(callbacks.noRequest !== undefined && callbacks.noRequest !== null)
			noRequest = (callbacks.noRequest === true);
		Mms.log("Destroy handle " + handleId + " (async=" + asyncRequest + ")");
		cleanupWebrtc(handleId);
		var serviceHandle = serviceHandles[handleId];
		if(serviceHandle === null || serviceHandle === undefined || serviceHandle.detached) {
			// Service was already detached by Mms
			delete serviceHandles[handleId];
			callbacks.success();
			return;
		}
		if(noRequest) {
			// We're only removing the handle locally
			delete serviceHandles[handleId];
			callbacks.success();
			return;
 		}
		if(!connected) {
			Mms.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return;
		}
		var request = { "mms": "detach", "transaction": Mms.randomString(12) };
		if(serviceHandle.token !== null && serviceHandle.token !== undefined)
			request["token"] = serviceHandle.token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		request["session_id"] = sessionId;
		request["handle_id"] = handleId;
		ws.send(JSON.stringify(request));
		delete serviceHandles[handleId];
		callbacks.success();
	}

	function streamsDone(handleId, jsep, media, callbacks, stream) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		Mms.debug("streamsDone:", stream);
		if(stream) {
			Mms.debug("  -- Audio tracks:", stream.getAudioTracks());
			Mms.debug("  -- Video tracks:", stream.getVideoTracks());
		}
		// add or update
		var addTracks = false;
		if(!config.myStream || !media.update || config.streamExternal) {
			config.myStream = stream;
			addTracks = true;
		} else {
			if(((!media.update && isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
					stream.getAudioTracks() && stream.getAudioTracks().length) {
				config.myStream.addTrack(stream.getAudioTracks()[0]);
				if(Mms.unifiedPlan) {
					// Use Transceivers
					Mms.log((media.replaceAudio ? "Replace" : "Add") + " audio track:", stream.getAudioTracks()[0]);
					var audioTransceiver = null;
					var transceivers = config.pc.getTransceivers();
					if(transceivers && transceivers.length > 0) {
						for(var i in transceivers) {
							var t = transceivers[i];
							if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
									(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
								audioTransceiver = t;
								break;
							}
						}
					}
					if(audioTransceiver && audioTransceiver.sender) {
						audioTransceiver.sender.replaceTrack(stream.getAudioTracks()[0]);
					} else {
						config.pc.addTrack(stream.getAudioTracks()[0], stream);
					}
				} else {
					Mms.log((media.replaceAudio ? "Replace" : "Add") + " audio track:", stream.getAudioTracks()[0]);
					config.pc.addTrack(stream.getAudioTracks()[0], stream);
				}
			}
			if(((!media.update && isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
					stream.getVideoTracks() && stream.getVideoTracks().length) {
				config.myStream.addTrack(stream.getVideoTracks()[0]);
				if(Mms.unifiedPlan) {
					// Use Transceivers
					Mms.log((media.replaceVideo ? "Replace" : "Add") + " video track:", stream.getVideoTracks()[0]);
					var videoTransceiver = null;
					var transceivers = config.pc.getTransceivers();
					if(transceivers && transceivers.length > 0) {
						for(var i in transceivers) {
							var t = transceivers[i];
							if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
									(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
								videoTransceiver = t;
								break;
							}
						}
					}
					if(videoTransceiver && videoTransceiver.sender) {
						videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
					} else {
						config.pc.addTrack(stream.getVideoTracks()[0], stream);
					}
				} else {
					Mms.log((media.replaceVideo ? "Replace" : "Add") + " video track:", stream.getVideoTracks()[0]);
					config.pc.addTrack(stream.getVideoTracks()[0], stream);
				}
			}
		}
		if(!config.pc) {
			var pc_config = {"iceServers": iceServers, "iceTransportPolicy": iceTransportPolicy, "bundlePolicy": bundlePolicy};
			if(Mms.browser === "chrome") {
				pc_config["sdpSemantics"] = (Mms.browser_ver < 72)?"plan-b":"unified-plan";
			}
			var pc_constraints = {
				"optional": [{"DtlsSrtpKeyAgreement": true}]
			};
			if(ipv6Support === true) {
				pc_constraints.optional.push({"googIPv6":true});
			}
			if(callbacks.rtcConstraints && typeof callbacks.rtcConstraints === 'object') {
				Mms.debug("Add custom PeerConnection constraints:", callbacks.rtcConstraints);
				for(var i in callbacks.rtcConstraints) {
					pc_constraints.optional.push(callbacks.rtcConstraints[i]);
				}
			}
			if(Mms.browser === "edge") {
				pc_config.bundlePolicy = "max-bundle";
			}
			Mms.log("Creating PeerConnection");
			Mms.debug("pc constraint: ", pc_constraints);
			config.pc = new RTCPeerConnection(pc_config, pc_constraints);
			Mms.debug(config.pc);
			if(config.pc.getStats) {
				config.volume = {};
				config.bitrate.value = "0 kbits/sec";
			}
			Mms.log("Prepare local SDP and gather candidates (trickle=" + config.trickle + ")");
			config.pc.oniceconnectionstatechange = function(e) {
				if(config.pc)
					serviceHandle.iceState(config.pc.iceConnectionState);
			};
			config.pc.onicecandidate = function(event) {
				if (event.candidate == null ||
						(Mms.browser === 'edge' && event.candidate.candidate.indexOf('endOfCandidates') > 0)) {
					Mms.log("End of candidates.");
					config.iceDone = true;
					if(config.trickle === true) { // end of candidates
						sendTrickleCandidate(handleId, {"completed": true});
					} else { // No trickle, time to send the complete SDP (including all candidates)
						sendSDP(handleId, callbacks);
					}
				} else {
					// JSON.stringify doesn't work on some WebRTC objects anymore
					// See https://code.google.com/p/chromium/issues/detail?id=467366
					var candidate = {
						"candidate": event.candidate.candidate,
						"sdpMid": event.candidate.sdpMid,
						"sdpMLineIndex": event.candidate.sdpMLineIndex
					};
					if(config.trickle === true) {
						sendTrickleCandidate(handleId, candidate);
					}
				}
			};
			config.pc.ontrack = function(event) {
				Mms.log("Handle Remote Track");
				Mms.debug(event);
				if(!event.streams)
					return;
				config.remoteStream = event.streams[0];
				serviceHandle.onremotestream(config.remoteStream);
				if(event.track.onended)
					return;
				Mms.log("Add onended callback to track:", event.track);
				event.track.onended = function(ev) {
					Mms.log("Remote track muted/removed:", ev);
					if(config.remoteStream) {
						config.remoteStream.removeTrack(ev.target);
						serviceHandle.onremotestream(config.remoteStream);
					}
				}
				event.track.onmute = event.track.onended;
				event.track.onunmute = function(ev) {
					Mms.log("Remote track flowing again:", ev);
					try {
						config.remoteStream.addTrack(ev.target);
						serviceHandle.onremotestream(config.remoteStream);
					} catch(e) {
						Mms.error(e);
					};
				};
			};
		}
		if(addTracks && stream !== null && stream !== undefined) {
			Mms.log("Add local stream");
			var simulcast2 = callbacks.simulcast2 === true ? true : false;
			stream.getTracks().forEach(function(track) {
				Mms.log("Add local track:", track);
				if(!simulcast2) {
					config.pc.addTrack(track, stream);
				} else {
					if(track.kind === "audio") {
						config.pc.addTrack(track, stream);
					} else {
						Mms.log("Enable rid-based simulcast:", track);
						const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
						config.pc.addTransceiver(track, {
							direction: "sendrecv",
							streams: [stream],
							sendEncodings: [
								{ rid: "h", active: true, maxBitrate: maxBitrates.high },
								{ rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
								{ rid: "l", active: true, maxBitrate: maxBitrates.low, scaleResolutionDownBy: 4 }
							]
						});
					}
				}
			});
		}
		if(isDataEnabled(media) && !config.dataChannel[Mms.dataChanDefaultLabel]) {
			Mms.log("Create data channel");
			createDataChannel(handleId, Mms.dataChanDefaultLabel, false);
			config.pc.ondatachannel = function(event) {
				Mms.log("Data channel created by Mms:", event);
				createDataChannel(handleId, event.channel.label, event.channel);
			};
		}
		if(config.myStream)
			serviceHandle.onlocalstream(config.myStream);
		if(jsep === null || jsep === undefined) {
			createOffer(handleId, media, callbacks);
		} else {
			config.pc.setRemoteDescription(jsep)
				.then(function() {
					Mms.log("Remote description accepted!");
					config.remoteSdp = jsep.sdp;
					// Any trickle candidate we cached?
					if(config.candidates && config.candidates.length > 0) {
						for(var i = 0; i< config.candidates.length; i++) {
							var candidate = config.candidates[i];
							Mms.debug("Add remote candidate:", candidate);
							if(!candidate || candidate.completed === true) {// end-of-candidates
								config.pc.addIceCandidate(Mms.endOfCandidates);
							} else {// New candidate
								config.pc.addIceCandidate(candidate);
							}
						}
						config.candidates = [];
					}
					createAnswer(handleId, media, callbacks);
				}, callbacks.error);
		}
	}

	function prepareWebrtc(handleId, offer, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error === "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		if(offer && jsep) {
			Mms.error("provided a JSEP to a createOffer");
			callbacks.error("provided a JSEP to a createOffer");
			return;
		} else if(!offer && (!jsep || !jsep.type || !jsep.sdp)) {
			Mms.error("valid JSEP is required for createAnswer");
			callbacks.error("valid JSEP is required for createAnswer");
			return;
		}
		callbacks.media = callbacks.media || { audio: true, video: true };
		var media = callbacks.media;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		config.trickle = isTrickleEnabled(callbacks.trickle);
		if(config.pc === undefined || config.pc === null) {// new PeerConnection
			media.update = false;
			media.keepAudio = false;
			media.keepVideo = false;
		} else if(config.pc !== undefined && config.pc !== null) {
			Mms.log("Update media service");
			media.update = true;
			if(callbacks.stream !== null && callbacks.stream !== undefined) {
				if(callbacks.stream !== config.myStream) {
					Mms.log("Renegotiation involves a new external stream");
				}
			} else {
				// Check if there are changes on audio
				if(media.addAudio) {
					media.keepAudio = false;
					media.replaceAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
					if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
						Mms.error("Can't add audio stream, there already is one");
						callbacks.error("Can't add audio stream, there already is one");
						return;
					}
				} else if(media.removeAudio) {
					media.keepAudio = false;
					media.replaceAudio = false;
					media.addAudio = false;
					media.audioSend = false;
				} else if(media.replaceAudio) {
					media.keepAudio = false;
					media.addAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
				}
				if(config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceAudio) {
						media.keepAudio = false;
						media.replaceAudio = false;
						media.addAudio = true;
						media.audioSend = true;
					}
					if(isAudioSendEnabled(media)) {
						media.keepAudio = false;
						media.addAudio = true;
					}
				} else {
					if(config.myStream.getAudioTracks() === null
							|| config.myStream.getAudioTracks() === undefined
							|| config.myStream.getAudioTracks().length === 0) {
						// No audio track: if we were asked to replace, it's actually an "add"
						if(media.replaceAudio) {
							media.keepAudio = false;
							media.replaceAudio = false;
							media.addAudio = true;
							media.audioSend = true;
						}
						if(isAudioSendEnabled(media)) {
							media.keepVideo = false;
							media.addAudio = true;
						}
					} else {
						// We have an audio track: should we keep it as it is?
						if(isAudioSendEnabled(media) &&
								!media.removeAudio && !media.replaceAudio) {
							media.keepAudio = true;
						}
					}
				}
				// Check if there are changes on video
				if(media.addVideo) {
					media.keepVideo = false;
					media.replaceVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
					if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
						Mms.error("Can't add video stream, there already is one");
						callbacks.error("Can't add video stream, there already is one");
						return;
					}
				} else if(media.removeVideo) {
					media.keepVideo = false;
					media.replaceVideo = false;
					media.addVideo = false;
					media.videoSend = false;
				} else if(media.replaceVideo) {
					media.keepVideo = false;
					media.addVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
				}
				if(config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceVideo) {
						media.keepVideo = false;
						media.replaceVideo = false;
						media.addVideo = true;
						media.videoSend = true;
					}
					if(isVideoSendEnabled(media)) {
						media.keepVideo = false;
						media.addVideo = true;
					}
				} else {
					if(config.myStream.getVideoTracks() === null
							|| config.myStream.getVideoTracks() === undefined
							|| config.myStream.getVideoTracks().length === 0) {
						// No video track: if we were asked to replace, it's actually an "add"
						if(media.replaceVideo) {
							media.keepVideo = false;
							media.replaceVideo = false;
							media.addVideo = true;
							media.videoSend = true;
						}
						if(isVideoSendEnabled(media)) {
							media.keepVideo = false;
							media.addVideo = true;
						}
					} else {
						// We have a video track: should we keep it as it is?
						if(isVideoSendEnabled(media) &&
								!media.removeVideo && !media.replaceVideo) {
							media.keepVideo = true;
						}
					}
				}
				// Data channels can only be added
				if(media.addData)
					media.data = true;
			}
			// If we're updating and keeping all tracks, let's skip the getUserMedia part
			if((isAudioSendEnabled(media) && media.keepAudio) &&
					(isVideoSendEnabled(media) && media.keepVideo)) {
				serviceHandle.consentDialog(false);
				streamsDone(handleId, jsep, media, callbacks, config.myStream);
				return;
			}
		}
		// If we're updating, check if we need to remove/replace one of the tracks
		if(media.update && !config.streamExternal) {
			if(media.removeAudio || media.replaceAudio) {
				if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
					var s = config.myStream.getAudioTracks()[0];
					Mms.log("Remove audio track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch(e) {};
				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					var ra = true;
					if(media.replaceAudio && Mms.unifiedPlan) {
						// We can use replaceTrack
						ra = false;
					}
					if(ra) {
						for(var index in config.pc.getSenders()) {
							var s = config.pc.getSenders()[index];
							if(s && s.track && s.track.kind === "audio") {
								Mms.log("Remove audio sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
			if(media.removeVideo || media.replaceVideo) {
				if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
					var s = config.myStream.getVideoTracks()[0];
					Mms.log("Remove video track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch(e) {};
				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					var rv = true;
					if(media.replaceVideo && Mms.unifiedPlan) {
						// We can use replaceTrack
						rv = false;
					}
					if(rv) {
						for(var index in config.pc.getSenders()) {
							var s = config.pc.getSenders()[index];
							if(s && s.track && s.track.kind === "video") {
								Mms.log("Remove video sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
		}
		// Was a MediaStream object passed, or do we need to take care of that?
		if(callbacks.stream !== null && callbacks.stream !== undefined) {
			var stream = callbacks.stream;
			Mms.log("MediaStream provided by the application");
			Mms.debug(stream);
			// If this is an update, let's check if we need to release the previous stream
			if(media.update) {
				if(config.myStream && config.myStream !== callbacks.stream && !config.streamExternal) {
					// We're replacing a stream we captured ourselves with an external one
					try {
						// Try a MediaStreamTrack.stop() for each track
						var tracks = config.myStream.getTracks();
						for(var i in tracks) {
							var mst = tracks[i];
							Mms.log(mst);
							if(mst !== null && mst !== undefined)
								mst.stop();
						}
					} catch(e) {
						// Do nothing if this fails
					}
					config.myStream = null;
				}
			}
			// Skip the getUserMedia part
			config.streamExternal = true;
			serviceHandle.consentDialog(false);
			streamsDone(handleId, jsep, media, callbacks, stream);
			return;
		}
		if(isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
			if(!Mms.isGetUserMediaAvailable()) {
				callbacks.error("getUserMedia not available");
				return;
			}
			var constraints = { mandatory: {}, optional: []};
			serviceHandle.consentDialog(true);
			var audioSupport = isAudioSendEnabled(media);
			if(audioSupport === true && media != undefined && media != null) {
				if(typeof media.audio === 'object') {
					audioSupport = media.audio;
				}
			}
			var videoSupport = isVideoSendEnabled(media);
			if(videoSupport === true && media != undefined && media != null) {
				var simulcast = callbacks.simulcast === true ? true : false;
				var simulcast2 = callbacks.simulcast2 === true ? true : false;
				if((simulcast || simulcast2) && !jsep && (media.video === undefined || media.video === false))
					media.video = "hires";
				if(media.video && media.video != 'screen' && media.video != 'window') {
					if(typeof media.video === 'object') {
						videoSupport = media.video;
                        Mms.debug("prepareWebRtc videoSupport="+videoSupport);
					}
					else {
						var width = 0;
						var height = 0, maxHeight = 0;
						if(media.video === 'lowres') {
							// Small resolution, 4:3
							height = 240;
							maxHeight = 240;
							width = 320;
						} else if(media.video === 'lowres-16:9') {
							// Small resolution, 16:9
							height = 180;
							maxHeight = 180;
							width = 320;
						} else if(media.video === 'hires' || media.video === 'hires-16:9' || media.video === 'hdres') {
							// High(HD) resolution is only 16:9
							height = 720;
							maxHeight = 720;
							width = 1280;
						} else if(media.video === 'fhdres') {
							// Full HD resolution is only 16:9
							height = 1080;
							maxHeight = 1080;
							width = 1920;
						} else if(media.video === '4kres') {
							// 4K resolution is only 16:9
							height = 2160;
							maxHeight = 2160;
							width = 3840;
						} else if(media.video === 'stdres') {
							// Normal resolution, 4:3
							height = 480;
							maxHeight = 480;
							width  = 640;
						} else if(media.video === 'stdres-16:9') {
							// Normal resolution, 16:9
							height = 360;
							maxHeight = 360;
							width = 640;
						} else {
							Mms.log("Default video setting is stdres 4:3");
							height = 480;
							maxHeight = 480;
							width = 640;
						}
						Mms.log("Add media constraint:", media.video);
						videoSupport = {
							'height': {'ideal': height},
							'width':  {'ideal': width}
						};
						Mms.log("Add video constraint:", videoSupport);
					}
				} else if(media.video === 'screen' || media.video === 'window') {
					if(!media.screenshareFrameRate) {
						media.screenshareFrameRate = 3;
					}
					if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
						// The new experimental getDisplayMedia API is available, let's use that
						// https://groups.google.com/forum/#!topic/discuss-webrtc/Uf0SrR4uxzk
						// https://webrtchacks.com/chrome-screensharing-getdisplaymedia/
						navigator.mediaDevices.getDisplayMedia({ video: true })
							.then(function(stream) {
								serviceHandle.consentDialog(false);
								if(isAudioSendEnabled(media) && !media.keepAudio) {
									navigator.mediaDevices.getUserMedia({ audio: true, video: false })
									.then(function (audioStream) {
										stream.addTrack(audioStream.getAudioTracks()[0]);
										streamsDone(handleId, jsep, media, callbacks, stream);
									})
								} else {
									streamsDone(handleId, jsep, media, callbacks, stream);
								}
							}, function (error) {
								serviceHandle.consentDialog(false);
								callbacks.error(error);
							});
						return;
					}
					// We're going to try and use the extension for Chrome 34+, the old approach
					// for older versions of Chrome, or the experimental support in Firefox 33+
					function callbackUserMedia (error, stream) {
						serviceHandle.consentDialog(false);
						if(error) {
							callbacks.error(error);
						} else {
							streamsDone(handleId, jsep, media, callbacks, stream);
						}
					};
					function getScreenMedia(constraints, gsmCallback, useAudio) {
						Mms.log("Add media constraint (screen capture)");
						Mms.debug(constraints);
						navigator.mediaDevices.getUserMedia(constraints)
							.then(function(stream) {
								if(useAudio) {
									navigator.mediaDevices.getUserMedia({ audio: true, video: false })
									.then(function (audioStream) {
										stream.addTrack(audioStream.getAudioTracks()[0]);
										gsmCallback(null, stream);
									})
								} else {
									gsmCallback(null, stream);
								}
							})
							.catch(function(error) { serviceHandle.consentDialog(false); gsmCallback(error); });
					};
					if(Mms.browser === 'chrome') {
						var error = new Error('NavigatorUserMediaError');
						error.name = 'Not support screen-share, please check version >=72 and chrome://flags/ enable (Experimental Web Platform features)';
						serviceHandle.consentDialog(false);
						callbacks.error(error);
						return;
					} else if(Mms.browser === 'firefox') {
						if(Mms.browser_ver >= 33) {
							// Firefox 33+ has experimental support for screen sharing
							constraints = {
								video: {
									mozMediaSource: media.video,
									mediaSource: media.video
								},
								audio: isAudioSendEnabled(media) && !media.keepAudio
							};
							getScreenMedia(constraints, function (err, stream) {
								callbackUserMedia(err, stream);
								// Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
								if (!err) {
									var lastTime = stream.currentTime;
									var polly = window.setInterval(function () {
										if(!stream)
											window.clearInterval(polly);
										if(stream.currentTime == lastTime) {
											window.clearInterval(polly);
											if(stream.onended) {
												stream.onended();
											}
										}
										lastTime = stream.currentTime;
									}, 500);
								}
							});
						} else {
							var error = new Error('NavigatorUserMediaError');
							error.name = 'Not support screen-share, please install Firefox 33 (or more recent versions)';
							serviceHandle.consentDialog(false);
							callbacks.error(error);
							return;
						}
					}
					return;
				}
			}
			// If we got here, we're not screensharing
			if(media === null || media === undefined || media.video !== 'screen') {
				// Check whether all media sources are actually available or not
				navigator.mediaDevices.enumerateDevices().then(function(devices) {
					var audioExist = devices.some(function(device) {
						return device.kind === 'audioinput';
					}),
					videoExist = isScreenSendEnabled(media) || devices.some(function(device) {
						return device.kind === 'videoinput';
					});

					// Check whether a missing device is really a problem
					var audioSend = isAudioSendEnabled(media);
					var videoSend = isVideoSendEnabled(media);
					var needAudioDevice = isAudioSendRequired(media);
					var needVideoDevice = isVideoSendRequired(media);
					if(audioSend || videoSend || needAudioDevice || needVideoDevice) {
						// We need to send either audio or video
						var haveAudioDevice = audioSend ? audioExist : false;
						var haveVideoDevice = videoSend ? videoExist : false;
						if(!haveAudioDevice && !haveVideoDevice && needAudioDevice && needVideoDevice) {
							// FIXME Should we really give up, or just assume recvonly for both?
							serviceHandle.consentDialog(false);
							//callbacks.error('No capture device found');
							callbacks.error(MmsHint.MMS_HINT_NO_AUDIO_VIDEO_INPUT_DEVICE);
							return false;
						} else if(!haveAudioDevice && needAudioDevice) {
							serviceHandle.consentDialog(false);
                            callbacks.error(MmsHint.MMS_HINT_NO_AUDIO_INPUT_DEVICE);
							return false;
						} else if(!haveVideoDevice && needVideoDevice) {
							serviceHandle.consentDialog(false);
                            callbacks.error(MmsHint.MMS_HINT_NO_VIDEO_INPUT_DEVICE);
							return false;
						}
					}

					var gumConstraints = {
						audio: (audioExist && !media.keepAudio) ? audioSupport : false,
						video: (videoExist && !media.keepVideo) ? videoSupport : false
					};
					Mms.debug("getUserMedia constraints", gumConstraints);
					if (!gumConstraints.audio && !gumConstraints.video) {
						serviceHandle.consentDialog(false);
						streamsDone(handleId, jsep, media, callbacks, stream);
					} else {
						navigator.mediaDevices.getUserMedia(gumConstraints)
							.then(function(stream) {
								serviceHandle.consentDialog(false);
								streamsDone(handleId, jsep, media, callbacks, stream);
							}).catch(function(error) {
								serviceHandle.consentDialog(false);
								callbacks.error({code: error.code, name: error.name, message: error.message});
							});
					}
				})
				.catch(function(error) {
					serviceHandle.consentDialog(false);
					callbacks.error('enumerateDevices error', error);
				});
			}
		} else {
			// No need to do a getUserMedia, create offer/answer right away
			streamsDone(handleId, jsep, media, callbacks);
		}
	}

	function prepareWebrtcPeer(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		if(jsep !== undefined && jsep !== null) {
			if(config.pc === null) {
				Mms.warn("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
				callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
				return;
			}
			config.pc.setRemoteDescription(jsep)
				.then(function() {
					Mms.log("Remote description accepted!");
					config.remoteSdp = jsep.sdp;
					// Any trickle candidate we cached?
					if(config.candidates && config.candidates.length > 0) {
						for(var i = 0; i< config.candidates.length; i++) {
							var candidate = config.candidates[i];
							Mms.debug("Adding remote candidate:", candidate);
							if(!candidate || candidate.completed === true) {
								// end-of-candidates
								config.pc.addIceCandidate(Mms.endOfCandidates);
							} else {
								// New candidate
								config.pc.addIceCandidate(candidate);
							}
						}
						config.candidates = [];
					}
					// Done
					callbacks.success();
				}, callbacks.error);
		} else {
			callbacks.error("Invalid JSEP");
		}
	}

	function createOffer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success === "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error === "function") ? callbacks.error : Mms.noop;
		callbacks.customizeSdp = (typeof callbacks.customizeSdp === "function") ? callbacks.customizeSdp : Mms.noop;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		var simulcast = (callbacks.simulcast===true);
		if(!simulcast) {
			Mms.log("Create offer (iceDone=" + config.iceDone + ")");
		} else {
			Mms.log("Create offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		// https://code.google.com/p/webrtc/issues/detail?id=3508
		var mediaConstraints = {};
		if(Mms.unifiedPlan) {
			// use Transceivers
			var audioTransceiver = null, videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if(transceivers && transceivers.length > 0) {
				for(var i in transceivers) {
					var t = transceivers[i];
					if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
						if(!audioTransceiver)
							audioTransceiver = t;
						continue;
					}
					if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
						if(!videoTransceiver)
							videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if(!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if(media.removeAudio && audioTransceiver) {
					if (audioTransceiver.setDirection) {
						audioTransceiver.setDirection("inactive");
					} else {
						audioTransceiver.direction = "inactive";
					}
					Mms.log("Set audio transceiver to inactive:", audioTransceiver);
				}
			} else {
				// Take care of audio m-line
				if(audioSend && audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("sendrecv");
						} else {
							audioTransceiver.direction = "sendrecv";
						}
						Mms.log("Set audio transceiver to sendrecv:", audioTransceiver);
					}
				} else if(audioSend && !audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("sendonly");
						} else {
							audioTransceiver.direction = "sendonly";
						}
						Mms.log("Set audio transceiver to sendonly:", audioTransceiver);
					}
				} else if(!audioSend && audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("recvonly");
						} else {
							audioTransceiver.direction = "recvonly";
						}
						Mms.log("Set audio transceiver to recvonly:", audioTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Mms.log("Add recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if(!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if(media.removeVideo && videoTransceiver) {
					if (videoTransceiver.setDirection) {
						videoTransceiver.setDirection("inactive");
					} else {
						videoTransceiver.direction = "inactive";
					}
					Mms.log("Set video transceiver to inactive:", videoTransceiver);
				}
			} else {
				// Take care of video m-line
				if(videoSend && videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("sendrecv");
						} else {
							videoTransceiver.direction = "sendrecv";
						}
						Mms.log("Set video transceiver to sendrecv:", videoTransceiver);
					}
				} else if(videoSend && !videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("sendonly");
						} else {
							videoTransceiver.direction = "sendonly";
						}
						Mms.log("Set video transceiver to sendonly:", videoTransceiver);
					}
				} else if(!videoSend && videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("recvonly");
						} else {
							videoTransceiver.direction = "recvonly";
						}
						Mms.log("Set video transceiver to recvonly:", videoTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Mms.log("Add recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			mediaConstraints["offerToReceiveAudio"] = isAudioRecvEnabled(media);
			mediaConstraints["offerToReceiveVideo"] = isVideoRecvEnabled(media);
		}
		var iceRestart = callbacks.iceRestart === true ? true : false;
		if(iceRestart) {
			mediaConstraints["iceRestart"] = true;
		}
		Mms.debug("media constraint: ", mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Mms.browser === "firefox") {
			Mms.log("Enable Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders().find(function(s) {return s.track.kind == "video"});
			if(sender) {
				var parameters = sender.getParameters();
				if(!parameters)
					parameters = {};
				const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
				parameters.encodings = [
					{ rid: "h", active: true, maxBitrate: maxBitrates.high },
					{ rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
					{ rid: "l", active: true, maxBitrate: maxBitrates.low, scaleResolutionDownBy: 4 }
				];
				sender.setParameters(parameters);
			}
		}
		config.pc.createOffer(mediaConstraints)
			.then(function(offer) {
				Mms.debug(offer);
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": offer.type,
					"sdp": offer.sdp
				};
				callbacks.customizeSdp(jsep);
				offer.sdp = jsep.sdp;
				Mms.log("Set local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome (Safari STP may support it too)
					if(Mms.browser === "chrome" || Mms.browser === "safari") {
						Mms.log("Enable Simulcasting for Chrome (SDP munging)");
						offer.sdp = mungeSdpForSimulcasting(offer.sdp);
					} else if(Mms.browser !== "firefox") {
						Mms.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				config.mySdp = offer.sdp;
				config.pc.setLocalDescription(offer)
					.catch(callbacks.error);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Mms.log("Wait for all candidates...");
					return;
				}
				Mms.log("Offer ready");
				Mms.debug(callbacks);
				callbacks.success(offer);
			}, callbacks.error);
	}

	function createAnswer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Mms.noop;
		callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : Mms.noop;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			callbacks.error("Invalid handle");
			return;
		}
		var config = serviceHandle.webrtcStuff;
		var simulcast = callbacks.simulcast === true ? true : false;
		if(!simulcast) {
			Mms.log("Create answer (iceDone=" + config.iceDone + ")");
		} else {
			Mms.log("Create answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		var mediaConstraints = null;
		if(Mms.unifiedPlan) {
			// use Transceivers
			mediaConstraints = {};
			var audioTransceiver = null, videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if(transceivers && transceivers.length > 0) {
				for(var i in transceivers) {
					var t = transceivers[i];
					if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
						if(!audioTransceiver)
							audioTransceiver = t;
						continue;
					}
					if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
						if(!videoTransceiver)
							videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if(!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if(media.removeAudio && audioTransceiver) {
					try {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("inactive");
						} else {
							audioTransceiver.direction = "inactive";
						}
						Mms.log("Set audio transceiver to inactive:", audioTransceiver);
					} catch(e) {
						Mms.error(e);
					}
				}
			} else {
				// Take care of audio m-line
				if(audioSend && audioRecv) {
					if(audioTransceiver) {
						try {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("sendrecv");
							} else {
								audioTransceiver.direction = "sendrecv";
							}
							Mms.log("Set audio transceiver to sendrecv:", audioTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					}
				} else if(audioSend && !audioRecv) {
					if(audioTransceiver) {
						try {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("sendonly");
							} else {
								audioTransceiver.direction = "sendonly";
							}
							Mms.log("Set audio transceiver to sendonly:", audioTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					}
				} else if(!audioSend && audioRecv) {
					if(audioTransceiver) {
						try {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("recvonly");
							} else {
								audioTransceiver.direction = "recvonly";
							}
							Mms.log("Set audio transceiver to recvonly:", audioTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Mms.log("Add recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if(!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if(media.removeVideo && videoTransceiver) {
					try {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("inactive");
						} else {
							videoTransceiver.direction = "inactive";
						}
						Mms.log("Set video transceiver to inactive:", videoTransceiver);
					} catch(e) {
						Mms.error(e);
					}
				}
			} else {
				// Take care of video m-line
				if(videoSend && videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("sendrecv");
							} else {
								videoTransceiver.direction = "sendrecv";
							}
							Mms.log("Set video transceiver to sendrecv:", videoTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					}
				} else if(videoSend && !videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("sendonly");
							} else {
								videoTransceiver.direction = "sendonly";
							}
							Mms.log("Set video transceiver to sendonly:", videoTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					}
				} else if(!videoSend && videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("recvonly");
							} else {
								videoTransceiver.direction = "recvonly";
							}
							Mms.log("Set video transceiver to recvonly:", videoTransceiver);
						} catch(e) {
							Mms.error(e);
						}
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Mms.log("Add recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			if(Mms.browser == "firefox" || Mms.browser == "edge") {
				mediaConstraints = {
					offerToReceiveAudio: isAudioRecvEnabled(media),
					offerToReceiveVideo: isVideoRecvEnabled(media)
				};
			} else {
				mediaConstraints = {
					mandatory: {
						OfferToReceiveAudio: isAudioRecvEnabled(media),
						OfferToReceiveVideo: isVideoRecvEnabled(media)
					}
				};
			}
		}
		Mms.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Mms.browser === "firefox") {
			Mms.log("Enable Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Mms.log(sender);
			var parameters = sender.getParameters();
			Mms.log(parameters);
			const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
			sender.setParameters({encodings: [
				{ rid: "high", active: true, priority: "high", maxBitrate: maxBitrates.high },
				{ rid: "medium", active: true, priority: "medium", maxBitrate: maxBitrates.medium },
				{ rid: "low", active: true, priority: "low", maxBitrate: maxBitrates.low }
			]});
		}
		config.pc.createAnswer(mediaConstraints)
			.then(function(answer) {
				Mms.debug(answer);
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": answer.type,
					"sdp": answer.sdp
				};
				callbacks.customizeSdp(jsep);
				answer.sdp = jsep.sdp;
				Mms.log("Set local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome
					if(Mms.browser === "chrome") {
						// FIXME Apparently trying to simulcast when answering breaks video in Chrome...
						Mms.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
					} else if(Mms.browser !== "firefox") {
						Mms.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				config.mySdp = answer.sdp;
				config.pc.setLocalDescription(answer)
					.catch(callbacks.error);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Mms.log("wait for all candidates...");
					return;
				}
				callbacks.success(answer);
			}, callbacks.error);
	}

	function sendSDP(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Mms.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Mms.noop;
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return;
		}
		var config = serviceHandle.webrtcStuff;
		Mms.log("Send offer/answer SDP...");
		if(config.mySdp === null || config.mySdp === undefined) {
			Mms.warn("Local SDP instance is invalid, not sending anything...");
			return;
		}
		config.mySdp = {
			"type": config.pc.localDescription.type,
			"sdp": config.pc.localDescription.sdp
		};
		if(config.trickle === false)
			config.mySdp["trickle"] = false;
		Mms.debug(callbacks);
		config.sdpSent = true;
		callbacks.success(config.mySdp);
	}

	function getVolume(handleId, remote) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return 0;
		}
		var stream = remote ? "remote" : "local";
		var config = serviceHandle.webrtcStuff;
		if(!config.volume[stream])
			config.volume[stream] = { value: 0 };
		// Start getting the volume, if getStats is supported
		if(config.pc.getStats && Mms.browser === "chrome") {
			if(remote && (config.remoteStream === null || config.remoteStream === undefined)) {
				Mms.warn("Remote stream unavailable");
				return 0;
			} else if(!remote && (config.myStream === null || config.myStream === undefined)) {
				Mms.warn("Local stream unavailable");
				return 0;
			}
			if(config.volume[stream].timer === null || config.volume[stream].timer === undefined) {
				Mms.log("Start " + stream + " volume cam");
				config.volume[stream].timer = setInterval(function() {
					config.pc.getStats(function(stats) {
						var results = stats.result();
						for(var i=0; i<results.length; i++) {
							var res = results[i];
							if(res.type == 'ssrc') {
								if(remote && res.stat('audioOutputLevel'))
									config.volume[stream].value = parseInt(res.stat('audioOutputLevel'));
								else if(!remote && res.stat('audioInputLevel'))
									config.volume[stream].value = parseInt(res.stat('audioInputLevel'));
							}
						}
					});
				}, 200);
				return 0;
			}
			return config.volume[stream].value;
		} else {
			Mms.warn("Get the " + stream + " volume unsupported by browser");
			return 0;
		}
	}

	function isMuted(handleId, video) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return true;
		}
		var config = serviceHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined) {
			Mms.warn("Invalid PeerConnection");
			return true;
		}
		if(config.myStream === undefined || config.myStream === null) {
			Mms.warn("Invalid local MediaStream");
			return true;
		}
		if(video) {
			// Check video track
			if(config.myStream.getVideoTracks() === null
					|| config.myStream.getVideoTracks() === undefined
					|| config.myStream.getVideoTracks().length === 0) {
				Mms.warn("No video track");
				return true;
			}
			return !config.myStream.getVideoTracks()[0].enabled;
		} else {
			// Check audio track
			if(config.myStream.getAudioTracks() === null
					|| config.myStream.getAudioTracks() === undefined
					|| config.myStream.getAudioTracks().length === 0) {
				Mms.warn("No audio track");
				return true;
			}
			return !config.myStream.getAudioTracks()[0].enabled;
		}
	}

	function mute(handleId, video, mute) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return false;
		}
		var config = serviceHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined) {
			Mms.warn("Invalid PeerConnection");
			return false;
		}
		if(config.myStream === undefined || config.myStream === null) {
			Mms.warn("Invalid local MediaStream");
			return false;
		}
		if(video) {
			// Mute/unmute video track
			if(config.myStream.getVideoTracks() === null
					|| config.myStream.getVideoTracks() === undefined
					|| config.myStream.getVideoTracks().length === 0) {
				Mms.warn("No video track");
				return false;
			}
			config.myStream.getVideoTracks()[0].enabled = mute ? false : true;
			return true;
		} else {
			// Mute/unmute audio track
			if(config.myStream.getAudioTracks() === null
					|| config.myStream.getAudioTracks() === undefined
					|| config.myStream.getAudioTracks().length === 0) {
				Mms.warn("No audio track");
				return false;
			}
			config.myStream.getAudioTracks()[0].enabled = mute ? false : true;
			return true;
		}
	}

	function getBitrate(handleId) {
		var serviceHandle = serviceHandles[handleId];
		if(serviceInvalid(serviceHandle)) {
			return "Invalid handle";
		}
		var config = serviceHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined)
			return "Invalid PeerConnection";
		// Start getting the bitrate, if getStats is supported
		if(config.pc.getStats) {
			if(config.bitrate.timer === null || config.bitrate.timer === undefined) {
				Mms.log("Start bitrate timer (via getStats)");
				config.bitrate.timer = setInterval(function() {
					config.pc.getStats()
						.then(function(stats) {
							stats.forEach(function (res) {
								if(!res)
									return;
								var inStats = false;
								// Check if these are statistics on incoming media
								if((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) &&
										res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
									// New stats
									inStats = true;
								}
								// Parse stats now
								if(inStats) {
									config.bitrate.bsnow = res.bytesReceived;
									config.bitrate.tsnow = res.timestamp;
									if(config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
										// Skip this round
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									} else {
										// Calculate bitrate
										var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
										if(Mms.browser == "safari")
											timePassed = timePassed/1000;	// Apparently the timestamp is in microseconds, in Safari
										var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
										if(Mms.browser === 'safari')
											bitRate = parseInt(bitRate/1000);
										config.bitrate.value = bitRate + ' kbits/sec';
										//~ Mms.log("Estimated bitrate is " + config.bitrate.value);
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									}
								}
							});
						});
				}, 1000);
				return "0 kbits/sec";	// We don't have a bitrate value yet
			}
			return config.bitrate.value;
		} else {
			Mms.warn("Get the video bitrate unsupported by browser");
			return "Feature unsupported by browser";
		}
	}

	function webrtcError(error) {
		Mms.error("WebRTC error:", error);
	}

	function cleanupWebrtc(handleId, hangupRequest) {
		Mms.log("Clean WebRTC stuff");
		var serviceHandle = serviceHandles[handleId];
		if(serviceHandle === null || serviceHandle === undefined) {
			// Nothing to clean
			return;
		}
		var config = serviceHandle.webrtcStuff;
		if(config !== null && config !== undefined) {
			if(hangupRequest === true) {
				// Send a hangup request (we don't really care about the response)
				var request = { "mms": "hangup", "transaction": Mms.randomString(12) };
				if(serviceHandle.token !== null && serviceHandle.token !== undefined)
					request["token"] = serviceHandle.token;
				if(apisecret !== null && apisecret !== undefined)
					request["apisecret"] = apisecret;
				request["session_id"] = sessionId;
				request["handle_id"] = handleId;
				Mms.debug("Send hangup request: ", request);
				ws.send(JSON.stringify(request));
			}
			// Cleanup stack
			config.remoteStream = null;
			if(config.volume) {
				if(config.volume["local"] && config.volume["local"].timer)
					clearInterval(config.volume["local"].timer);
				if(config.volume["remote"] && config.volume["remote"].timer)
					clearInterval(config.volume["remote"].timer);
			}
			config.volume = {};
			if(config.bitrate.timer)
				clearInterval(config.bitrate.timer);
			config.bitrate.timer = null;
			config.bitrate.bsnow = null;
			config.bitrate.bsbefore = null;
			config.bitrate.tsnow = null;
			config.bitrate.tsbefore = null;
			config.bitrate.value = null;
			try {
				// Try a MediaStreamTrack.stop() for each track
				if(!config.streamExternal && config.myStream !== null && config.myStream !== undefined) {
					Mms.log("Stop local stream tracks");
					var tracks = config.myStream.getTracks();
					for(var i in tracks) {
						var mst = tracks[i];
						Mms.log(mst);
						if(mst !== null && mst !== undefined)
							mst.stop();
					}
				}
			} catch(e) {
				// Do nothing if this fails
			}
			config.streamExternal = false;
			config.myStream = null;
			// Close PeerConnection
			try {
				config.pc.close();
			} catch(e) {
				// Do nothing
			}
			config.pc = null;
			config.candidates = null;
			config.mySdp = null;
			config.remoteSdp = null;
			config.iceDone = false;
			config.dataChannel = {};
			config.dtmfSender = null;
		}
		serviceHandle.oncleanup();
	}

	// Helper method to munge an SDP to enable simulcasting (Chrome only)
	function mungeSdpForSimulcasting(sdp) {
		// Let's munge the SDP to add the attributes for enabling simulcasting
		// (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)
		var lines = sdp.split("\r\n");
		var video = false;
		var ssrc = [ -1 ], ssrc_fid = [ -1 ];
		var cname = null, msid = null, mslabel = null, label = null;
		var insertAt = -1;
		for(var i=0; i<lines.length; i++) {
			var mline = lines[i].match(/m=(\w+) */);
			if(mline) {
				var medium = mline[1];
				if(medium === "video") {
					// New video m-line: make sure it's the first one
					if(ssrc[0] < 0) {
						video = true;
					} else {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				} else {
					// New non-video m-line: do we have what we were looking for?
					if(ssrc[0] > -1) {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				}
				continue;
			}
			if(!video)
				continue;
			var fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);
			if(fid) {
				ssrc[0] = fid[1];
				ssrc_fid[0] = fid[2];
				lines.splice(i, 1); i--;
				continue;
			}
			if(ssrc[0]) {
				var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
				if(match) {
					cname = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
				if(match) {
					msid = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
				if(match) {
					mslabel = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
				if(match) {
					label = match[1];
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
			if(lines[i].length == 0) {
				lines.splice(i, 1); i--;
				continue;
			}
		}
		if(ssrc[0] < 0) {
			// Couldn't find a FID attribute, let's just take the first video SSRC we find
			insertAt = -1;
			video = false;
			for(var i=0; i<lines.length; i++) {
				var mline = lines[i].match(/m=(\w+) */);
				if(mline) {
					var medium = mline[1];
					if(medium === "video") {
						// New video m-line: make sure it's the first one
						if(ssrc[0] < 0) {
							video = true;
						} else {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					} else {
						// New non-video m-line: do we have what we were looking for?
						if(ssrc[0] > -1) {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					}
					continue;
				}
				if(!video)
					continue;
				if(ssrc[0] < 0) {
					var value = lines[i].match(/a=ssrc:(\d+)/);
					if(value) {
						ssrc[0] = value[1];
						lines.splice(i, 1); i--;
						continue;
					}
				} else {
					var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
					if(match) {
						cname = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
					if(match) {
						msid = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
					if(match) {
						mslabel = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
					if(match) {
						label = match[1];
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
				}
				if(lines[i].length == 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
		}
		if(ssrc[0] < 0) {
			// Still nothing, let's just return the SDP we were asked to munge
			Mms.warn("Couldn't find the video SSRC, simulcasting NOT enabled");
			return sdp;
		}
		if(insertAt < 0) {
			// Append at the end
			insertAt = lines.length;
		}
		// Generate a couple of SSRCs (for retransmissions too)
		// Note: should we check if there are conflicts, here?
		ssrc[1] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc[2] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc_fid[1] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc_fid[2] = Math.floor(Math.random()*0xFFFFFFFF);
		// Add attributes to the SDP
		for(var i=0; i<ssrc.length; i++) {
			if(cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
				insertAt++;
			}
			if(msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
				insertAt++;
			}
			if(mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if(label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + label);
				insertAt++;
			}
			// Add the same info for the retransmission SSRC
			if(cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' cname:' + cname);
				insertAt++;
			}
			if(msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' msid:' + msid);
				insertAt++;
			}
			if(mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if(label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' label:' + label);
				insertAt++;
			}
		}
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[2] + ' ' + ssrc_fid[2]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[1] + ' ' + ssrc_fid[1]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[0] + ' ' + ssrc_fid[0]);
		lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
		sdp = lines.join("\r\n");
		if(!sdp.endsWith("\r\n"))
			sdp += "\r\n";
		return sdp;
	}

	// Helper methods to parse a media object
	function isAudioSendEnabled(media) {
		Mms.debug("isAudioSendEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioSend === undefined || media.audioSend === null)
			return true;	// Default
		return (media.audioSend === true);
	}

	function isAudioSendRequired(media) {
		Mms.debug("isAudioSendRequired:", media);
		if(media === undefined || media === null)
			return false;	// Default
		if(media.audio === false || media.audioSend === false)
			return false;	// If we're not asking to capture audio, it's not required
		if(media.failIfNoAudio === undefined || media.failIfNoAudio === null)
			return false;	// Default
		return (media.failIfNoAudio === true);
	}

	function isAudioRecvEnabled(media) {
		Mms.debug("isAudioRecvEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioRecv === undefined || media.audioRecv === null)
			return true;	// Default
		return (media.audioRecv === true);
	}

	function isVideoSendEnabled(media) {
		Mms.debug("isVideoSendEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoSend === undefined || media.videoSend === null)
			return true;	// Default
		return (media.videoSend === true);
	}

	function isVideoSendRequired(media) {
		Mms.debug("isVideoSendRequired:", media);
		if(media === undefined || media === null)
			return false;	// Default
		if(media.video === false || media.videoSend === false)
			return false;	// If we're not asking to capture video, it's not required
		if(media.failIfNoVideo === undefined || media.failIfNoVideo === null)
			return false;	// Default
		return (media.failIfNoVideo === true);
	}

	function isVideoRecvEnabled(media) {
		Mms.debug("isVideoRecvEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoRecv === undefined || media.videoRecv === null)
			return true;	// Default
		return (media.videoRecv === true);
	}

	function isScreenSendEnabled(media) {
		Mms.debug("isScreenSendEnabled:", media);
		if (media === undefined || media === null)
			return false;
		if (typeof media.video !== 'object' || typeof media.video.mandatory !== 'object')
			return false;
		var constraints = media.video.mandatory;
		if (constraints.chromeMediaSource)
			return constraints.chromeMediaSource === 'desktop' || constraints.chromeMediaSource === 'screen';
		else if (constraints.mozMediaSource)
			return constraints.mozMediaSource === 'window' || constraints.mozMediaSource === 'screen';
		else if (constraints.mediaSource)
			return constraints.mediaSource === 'window' || constraints.mediaSource === 'screen';
		return false;
	}

	function isDataEnabled(media) {
		Mms.debug("isDataEnabled:", media);
		if(Mms.browser == "edge") {
			Mms.warn("Edge doesn't support data channels yet");
			return false;
		}
		if(media === undefined || media === null)
			return false;	// Default
		return (media.data === true);
	}

	function isTrickleEnabled(trickle) {
		Mms.debug("isTrickleEnabled:", trickle);
		if(trickle === undefined || trickle === null)
			return true;	// Default is true
		return (trickle === true);
	}
};
