/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(__dirname) {/**
	 * @fileoverview Jailed - safe yet flexible sandbox
	 * @version 0.2.0
	 * 
	 * @license MIT, see http://github.com/asvd/jailed
	 * Copyright (c) 2014 asvd <heliosframework@gmail.com> 
	 * 
	 * Main library script, the only one to be loaded by a developer into
	 * the application. Other scrips shipped along will be loaded by the
	 * library either here (application site), or into the plugin site
	 * (Worker/child process):
	 *
	 *  _JailedSite.js    loaded into both applicaiton and plugin sites
	 *  _frame.html       sandboxed frame (web)
	 *  _frame.js         sandboxed frame code (web)
	 *  _pluginWebWorker.js  platform-dependent plugin routines (web / worker)
	 *  _pluginWebIframe.js  platform-dependent plugin routines (web / iframe)
	 *  _pluginNode.js    platform-dependent plugin routines (Node.js)
	 *  _pluginCore.js    common plugin site protocol implementation
	 */


	var __jailed__path__;
	if (typeof window == 'undefined') {
	    // Node.js
	    __jailed__path__ = __dirname + '/';
	} else {
	    // web
	    var scripts = document.getElementsByTagName('script');
	    __jailed__path__ = scripts[scripts.length-1].src
	        .split('?')[0]
	        .split('/')
	        .slice(0, -1)
	        .join('/')+'/';
	}


	(function (root, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.jailed = {}));
	    }
	}(this, function (exports) {
	    var isNode = typeof window == 'undefined';
	      

	    /**
	     * A special kind of event:
	     *  - which can only be emitted once;
	     *  - executes a set of subscribed handlers upon emission;
	     *  - if a handler is subscribed after the event was emitted, it
	     *    will be invoked immideately.
	     * 
	     * Used for the events which only happen once (or do not happen at
	     * all) during a single plugin lifecycle - connect, disconnect and
	     * connection failure
	     */
	    var Whenable = function() {
	        this._emitted = false;
	        this._handlers = [];
	    }


	    /**
	     * Emits the Whenable event, calls all the handlers already
	     * subscribed, switches the object to the 'emitted' state (when
	     * all future subscibed listeners will be immideately issued
	     * instead of being stored)
	     */
	    Whenable.prototype.emit = function(){
	        if (!this._emitted) {
	            this._emitted = true;

	            var handler;
	            while(handler = this._handlers.pop()) {
	                setTimeout(handler,0);
	            }
	        }
	    }


	    /**
	     * Saves the provided function as a handler for the Whenable
	     * event. This handler will then be called upon the event emission
	     * (if it has not been emitted yet), or will be scheduled for
	     * immediate issue (if the event has already been emmitted before)
	     * 
	     * @param {Function} handler to subscribe for the event
	     */
	    Whenable.prototype.whenEmitted = function(handler){
	        handler = this._checkHandler(handler);
	        if (this._emitted) {
	            setTimeout(handler, 0);
	        } else {
	            this._handlers.push(handler);
	        }
	    }


	    /**
	     * Checks if the provided object is suitable for being subscribed
	     * to the event (= is a function), throws an exception if not
	     * 
	     * @param {Object} obj to check for being subscribable
	     * 
	     * @throws {Exception} if object is not suitable for subscription
	     * 
	     * @returns {Object} the provided object if yes
	     */
	    Whenable.prototype._checkHandler = function(handler){
	        var type = typeof handler;
	        if (type != 'function') {
	            var msg =
	                'A function may only be subsribed to the event, '
	                + type
	                + ' was provided instead'
	            throw new Error(msg);
	        }

	        return handler;
	    }



	    /**
	     * Initializes the library site for Node.js environment (loads
	     * _JailedSite.js)
	     */
	    var initNode = function() {
	        __webpack_require__(4);
	    }


	    /**
	     * Initializes the library site for web environment (loads
	     * _JailedSite.js)
	     */
	    var platformInit;
	    var initWeb = function() {
	        // loads additional script to the application environment
	        var load = function(path, cb) {
	            var script = document.createElement('script');
	            script.src = path;

	            var clear = function() {
	                script.onload = null;
	                script.onerror = null;
	                script.onreadystatechange = null;
	                script.parentNode.removeChild(script);
	            }

	            var success = function() {
	                clear();
	                cb();
	            }

	            script.onerror = clear;
	            script.onload = success;
	            script.onreadystatechange = function() {
	                var state = script.readyState;
	                if (state==='loaded' || state==='complete') {
	                    success();
	                }
	            }

	            document.body.appendChild(script);
	        }

	        platformInit = new Whenable;
	        var origOnload = window.onload || function(){};

	        window.onload = function(){
	            origOnload();
	            platformInit.emit();
	        }
	    }


	    var BasicConnection;
	      
	    /**
	     * Creates the platform-dependent BasicConnection object in the
	     * Node.js environment
	     */
	    var basicConnectionNode = function() {
	        //var childProcess = require('child_process');

	        /**
	         * Platform-dependent implementation of the BasicConnection
	         * object, initializes the plugin site and provides the basic
	         * messaging-based connection with it
	         * 
	         * For Node.js the plugin is created as a forked process
	         */
	        BasicConnection = function() {
	            // in Node.js always has a subprocess
	            this.dedicatedThread = true;
	            this._disconnected = false;
	            this._messageHandler = function(){};
	            this._disconnectHandler = function(){};

	            this._process = childProcess.fork(
	                __jailed__path__+'_pluginNode.js'
	            );

	            var me = this;
	            this._process.on('message', function(m){
	                me._messageHandler(m);
	            });

	            this._process.on('exit', function(m){
	                me._disconnected = true;
	                me._disconnectHandler(m);
	            });
	        }


	        /**
	         * Sets-up the handler to be called upon the BasicConnection
	         * initialization is completed.
	         * 
	         * For Node.js the connection is fully initialized within the
	         * constructor, so simply calls the provided handler.
	         * 
	         * @param {Function} handler to be called upon connection init
	         */
	        BasicConnection.prototype.whenInit = function(handler) {
	            handler();
	        }


	        /**
	         * Sends a message to the plugin site
	         * 
	         * @param {Object} data to send
	         */
	        BasicConnection.prototype.send = function(data) {
	            if (!this._disconnected) {
	                this._process.send(data);
	            }
	        }


	        /**
	         * Adds a handler for a message received from the plugin site
	         * 
	         * @param {Function} handler to call upon a message
	         */
	        BasicConnection.prototype.onMessage = function(handler) {
	            this._messageHandler = function(data) {
	                // broken stack would break the IPC in Node.js
	                try {
	                    handler(data);
	                } catch (e) {
	                    console.error();
	                    console.error(e.stack);
	                }
	            }
	        }


	        /**
	         * Adds a handler for the event of plugin disconnection
	         * (= plugin process exit)
	         * 
	         * @param {Function} handler to call upon a disconnect
	         */
	        BasicConnection.prototype.onDisconnect = function(handler) {
	            this._disconnectHandler = handler;
	        }


	        /**
	         * Disconnects the plugin (= kills the forked process)
	         */
	        BasicConnection.prototype.disconnect = function() {
	            this._process.kill('SIGKILL');
	            this._disconnected = true;
	        }

	    }


	    /**
	     * Creates the platform-dependent BasicConnection object in the
	     * web-browser environment
	     */
	    var basicConnectionWeb = function(basePath) {
	        basePath = basePath || '';
	        var perm = ['allow-scripts'];

	        if (__jailed__path__.substr(0,7).toLowerCase() == 'file://') {
	            // local instance requires extra permission
	            perm.push('allow-same-origin');
	        }

	        // frame element to be cloned
	        var sample = document.createElement('iframe');
	        sample.src = __jailed__path__ + basePath + '_frame.html';
	        sample.sandbox = perm.join(' ');
	        sample.style.display = 'none';


	        /**
	         * Platform-dependent implementation of the BasicConnection
	         * object, initializes the plugin site and provides the basic
	         * messaging-based connection with it
	         * 
	         * For the web-browser environment, the plugin is created as a
	         * Worker in a sandbaxed frame
	         */
	        BasicConnection = function() {
	            this._init = new Whenable;
	            this._disconnected = false;

	            var me = this;
	            platformInit.whenEmitted(function() {
	                if (!me._disconnected) {
	                    me._frame = sample.cloneNode(false);
	                    document.body.appendChild(me._frame);

	                    window.addEventListener('message', function (e) {
	                        if (e.source === me._frame.contentWindow) {
	                            if (e.data.type == 'initialized') {
	                                me.dedicatedThread =
	                                    e.data.dedicatedThread;
	                                me._init.emit();
	                            } else {
	                                me._messageHandler(e.data);
	                            }
	                        }
	                    });
	                }
	            });
	        }
	        
	        
	        /**
	         * Sets-up the handler to be called upon the BasicConnection
	         * initialization is completed.
	         * 
	         * For the web-browser environment, the handler is issued when
	         * the plugin worker successfully imported and executed the
	         * _pluginWebWorker.js or _pluginWebIframe.js, and replied to
	         * the application site with the initImprotSuccess message.
	         * 
	         * @param {Function} handler to be called upon connection init
	         */
	        BasicConnection.prototype.whenInit = function(handler) {
	            this._init.whenEmitted(handler);
	        }


	        /**
	         * Sends a message to the plugin site
	         * 
	         * @param {Object} data to send
	         */
	        BasicConnection.prototype.send = function(data) {
	            this._frame.contentWindow.postMessage(
	                {type: 'message', data: data}, '*'
	            );
	        }


	        /**
	         * Adds a handler for a message received from the plugin site
	         * 
	         * @param {Function} handler to call upon a message
	         */
	        BasicConnection.prototype.onMessage = function(handler) {
	            this._messageHandler = handler;
	        }


	        /**
	         * Adds a handler for the event of plugin disconnection
	         * (not used in case of Worker)
	         * 
	         * @param {Function} handler to call upon a disconnect
	         */
	        BasicConnection.prototype.onDisconnect = function(){};


	        /**
	         * Disconnects the plugin (= kills the frame)
	         */
	        BasicConnection.prototype.disconnect = function() {
	            if (!this._disconnected) {
	                this._disconnected = true;
	                if (typeof this._frame != 'undefined') {
	                    this._frame.parentNode.removeChild(this._frame);
	                }  // otherwise farme is not yet created
	            }
	        }

	    }

	    /**
	     * Initializes the sandbox
	     * @param basePath - path for root where jailed.js files is places. "sandbox-compiled/" for example
	     * Needed only for web.
	     */
	    exports.init = function (basePath) {
	        if (isNode) {
	            initNode();
	            basicConnectionNode();
	        } else {
	            initWeb();
	            basicConnectionWeb(basePath);
	        }
	    };

	      
	    /**
	     * Application-site Connection object constructon, reuses the
	     * platform-dependent BasicConnection declared above in order to
	     * communicate with the plugin environment, implements the
	     * application-site protocol of the interraction: provides some
	     * methods for loading scripts and executing the given code in the
	     * plugin
	     */
	    var Connection = function(){
	        this._platformConnection = new BasicConnection;

	        this._importCallbacks = {};
	        this._executeSCb = function(){};
	        this._executeFCb = function(){};
	        this._messageHandler = function(){};

	        var me = this;
	        this.whenInit = function(cb){
	            me._platformConnection.whenInit(cb);
	        };

	        this._platformConnection.onMessage(function(m) {
	            switch(m.type) {
	            case 'message':
	                me._messageHandler(m.data);
	                break;
	            case 'importSuccess':
	                me._handleImportSuccess(m.url);
	                break;
	            case 'importFailure':
	                me._handleImportFailure(m.url);
	                break;
	            case 'executeSuccess':
	                me._executeSCb();
	                break;
	            case 'executeFailure':
	                me._executeFCb();
	                break;
	            }
	        });
	    }


	    /**
	     * @returns {Boolean} true if a connection obtained a dedicated
	     * thread (subprocess in Node.js or a subworker in browser) and
	     * therefore will not hang up on the infinite loop in the
	     * untrusted code
	     */
	    Connection.prototype.hasDedicatedThread = function() {
	        return this._platformConnection.dedicatedThread;
	    }


	    /**
	     * Tells the plugin to load a script with the given path, and to
	     * execute it. Callbacks executed upon the corresponding responce
	     * message from the plugin site
	     * 
	     * @param {String} path of a script to load
	     * @param {Function} sCb to call upon success
	     * @param {Function} fCb to call upon failure
	     */
	    Connection.prototype.importScript = function(path, sCb, fCb) {
	        var f = function(){};
	        this._importCallbacks[path] = {sCb: sCb||f, fCb: fCb||f};
	        this._platformConnection.send({type: 'import', url: path});
	    }
	      

	    /**
	     * Tells the plugin to load a script with the given path, and to
	     * execute it in the JAILED environment. Callbacks executed upon
	     * the corresponding responce message from the plugin site
	     * 
	     * @param {String} path of a script to load
	     * @param {Function} sCb to call upon success
	     * @param {Function} fCb to call upon failure
	     */
	    Connection.prototype.importJailedScript = function(path, sCb, fCb) {
	        var f = function(){};
	        this._importCallbacks[path] = {sCb: sCb||f, fCb: fCb||f};
	        this._platformConnection.send({type: 'importJailed', url: path});
	    }


	    /**
	     * Sends the code to the plugin site in order to have it executed
	     * in the JAILED enviroment. Assuming the execution may only be
	     * requested once by the Plugin object, which means a single set
	     * of callbacks is enough (unlike importing additional scripts)
	     * 
	     * @param {String} code code to execute
	     * @param {Function} sCb to call upon success
	     * @param {Function} fCb to call upon failure
	     */
	    Connection.prototype.execute = function(code, sCb, fCb) {
	        this._executeSCb = sCb||function(){};
	        this._executeFCb = fCb||function(){};
	        this._platformConnection.send({type: 'execute', code: code});
	    }


	    /**
	     * Adds a handler for a message received from the plugin site
	     * 
	     * @param {Function} handler to call upon a message
	     */
	    Connection.prototype.onMessage = function(handler) {
	        this._messageHandler = handler;
	    }
	      
	      
	    /**
	     * Adds a handler for a disconnect message received from the
	     * plugin site
	     * 
	     * @param {Function} handler to call upon disconnect
	     */
	    Connection.prototype.onDisconnect = function(handler) {
	        this._platformConnection.onDisconnect(handler);
	    }


	    /**
	     * Sends a message to the plugin
	     * 
	     * @param {Object} data of the message to send
	     */
	    Connection.prototype.send = function(data) {
	        this._platformConnection.send({
	            type: 'message',
	            data: data
	        });
	    }


	    /**
	     * Handles import succeeded message from the plugin
	     * 
	     * @param {String} url of a script loaded by the plugin
	     */
	    Connection.prototype._handleImportSuccess = function(url) {
	        var sCb = this._importCallbacks[url].sCb;
	        this._importCallbacks[url] = null;
	        delete this._importCallbacks[url];
	        sCb();
	    }


	    /**
	     * Handles import failure message from the plugin
	     * 
	     * @param {String} url of a script loaded by the plugin
	     */
	    Connection.prototype._handleImportFailure = function(url) {
	        var fCb = this._importCallbacks[url].fCb;
	        this._importCallbacks[url] = null;
	        delete this._importCallbacks[url];
	        fCb();
	    }


	    /**
	     * Disconnects the plugin when it is not needed anymore
	     */
	    Connection.prototype.disconnect = function() {
	        this._platformConnection.disconnect();
	    }




	    /**
	     * Plugin constructor, represents a plugin initialized by a script
	     * with the given path
	     * 
	     * @param {String} url of a plugin source
	     * @param {Object} _interface to provide for the plugin
	     */
	    var Plugin = function(url, _interface) {
	        this._path = url;
	        this._initialInterface = _interface||{};
	        this._connect();
	    };


	    /**
	     * DynamicPlugin constructor, represents a plugin initialized by a
	     * string containing the code to be executed
	     * 
	     * @param {String} code of the plugin
	     * @param {Object} _interface to provide to the plugin
	     */
	    var DynamicPlugin = function(code, _interface) {
	        this._code = code;
	        this._initialInterface = _interface||{};
	        this._connect();
	    };


	    /**
	     * Creates the connection to the plugin site
	     */
	    DynamicPlugin.prototype._connect =
	           Plugin.prototype._connect = function() {
	        this.remote = null;

	        this._connect    = new Whenable;
	        this._fail       = new Whenable;
	        this._disconnect = new Whenable;
	               
	        var me = this;
	               
	        // binded failure callback
	        this._fCb = function(){
	            me._fail.emit();
	            me.disconnect();
	        }
	               
	        this._connection = new Connection;
	        this._connection.whenInit(function(){
	            me._init();
	        });
	    }


	    /**
	     * Creates the Site object for the plugin, and then loads the
	     * common routines (_JailedSite.js)
	     */
	    DynamicPlugin.prototype._init =
	           Plugin.prototype._init = function() {
	        var JailedSite = __webpack_require__(4);
	        this._site = new JailedSite(this._connection);
	               
	        var me = this;
	        this._site.onDisconnect(function() {
	            me._disconnect.emit();
	        });

	       me._sendInterface();
	    }
	    
	    /**
	     * Sends to the remote site a signature of the interface provided
	     * upon the Plugin creation
	     */
	    DynamicPlugin.prototype._sendInterface =
	           Plugin.prototype._sendInterface = function() {
	        var me = this;
	        this._site.onInterfaceSetAsRemote(function() {
	            if (!me._connected) {
	                me._loadPlugin();
	            }
	        });

	        this._site.setInterface(this._initialInterface);
	    }
	    
	    
	    /**
	     * Loads the plugin body (loads the plugin url in case of the
	     * Plugin)
	     */
	    Plugin.prototype._loadPlugin = function() {
	        var me = this;
	        var sCb = function() {
	            me._requestRemote();
	        }

	        this._connection.importJailedScript(this._path, sCb, this._fCb);
	    }
	    
	    
	    /**
	     * Loads the plugin body (executes the code in case of the
	     * DynamicPlugin)
	     */
	    DynamicPlugin.prototype._loadPlugin = function() {
	        var me = this;
	        var sCb = function() {
	            me._requestRemote();
	        }

	        this._connection.execute(this._code, sCb, this._fCb);
	    }
	    
	    
	    /**
	     * Requests the remote interface from the plugin (which was
	     * probably set by the plugin during its initialization), emits
	     * the connect event when done, then the plugin is fully usable
	     * (meaning both the plugin and the application can use the
	     * interfaces provided to each other)
	     */
	    DynamicPlugin.prototype._requestRemote = 
	           Plugin.prototype._requestRemote = function() {
	        var me = this;
	        this._site.onRemoteUpdate(function(){
	            me.remote = me._site.getRemote();
	            me._connect.emit();
	        });

	        this._site.requestRemote();
	    }


	    /**
	     * @returns {Boolean} true if a plugin runs on a dedicated thread
	     * (subprocess in Node.js or a subworker in browser) and therefore
	     * will not hang up on the infinite loop in the untrusted code
	     */
	    DynamicPlugin.prototype.hasDedicatedThread =
	           Plugin.prototype.hasDedicatedThread = function() {
	        return this._connection.hasDedicatedThread();
	    }

	    
	    /**
	     * Disconnects the plugin immideately
	     */
	    DynamicPlugin.prototype.disconnect = 
	           Plugin.prototype.disconnect = function() {
	        this._connection.disconnect();
	        this._disconnect.emit();
	    }
	   
	    
	    /**
	     * Saves the provided function as a handler for the connection
	     * failure Whenable event
	     * 
	     * @param {Function} handler to be issued upon disconnect
	     */
	    DynamicPlugin.prototype.whenFailed = 
	           Plugin.prototype.whenFailed = function(handler) {
	        this._fail.whenEmitted(handler);
	    }


	    /**
	     * Saves the provided function as a handler for the connection
	     * success Whenable event
	     * 
	     * @param {Function} handler to be issued upon connection
	     */
	    DynamicPlugin.prototype.whenConnected = 
	           Plugin.prototype.whenConnected = function(handler) {
	        this._connect.whenEmitted(handler);
	    }
	    
	    
	    /**
	     * Saves the provided function as a handler for the connection
	     * failure Whenable event
	     * 
	     * @param {Function} handler to be issued upon connection failure
	     */
	    DynamicPlugin.prototype.whenDisconnected = 
	           Plugin.prototype.whenDisconnected = function(handler) {
	        this._disconnect.whenEmitted(handler);
	    }
	    
	    
	    
	    exports.Plugin = Plugin;
	    exports.DynamicPlugin = DynamicPlugin;
	  
	}));


	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(5).Promise;

	/**
	 * Contains the JailedSite object used both by the application
	 * site, and by each plugin
	 */


	/**
	 * JailedSite object represents a single site in the
	 * communication protocol between the application and the plugin
	 *
	 * @param {Object} connection a special object allowing to send
	 * and receive messages from the opposite site (basically it
	 * should only provide send() and onMessage() methods)
	 */
	JailedSite = function (connection) {
	    this._interface = {};
	    this._remote = null;
	    this._remoteUpdateHandler = function () {
	    };
	    this._getInterfaceHandler = function () {
	    };
	    this._interfaceSetAsRemoteHandler = function () {
	    };
	    this._disconnectHandler = function () {
	    };
	    this._store = new ReferenceStore;

	    var me = this;
	    this._connection = connection;
	    this._connection.onMessage(
	        function (data) {
	            me._processMessage(data);
	        }
	    );

	    this._connection.onDisconnect(
	        function (m) {
	            me._disconnectHandler(m);
	        }
	    );
	}


	/**
	 * Set a handler to be called when the remote site updates its
	 * interface
	 *
	 * @param {Function} handler
	 */
	JailedSite.prototype.onRemoteUpdate = function (handler) {
	    this._remoteUpdateHandler = handler;
	}


	/**
	 * Set a handler to be called when received a responce from the
	 * remote site reporting that the previously provided interface
	 * has been succesfully set as remote for that site
	 *
	 * @param {Function} handler
	 */
	JailedSite.prototype.onInterfaceSetAsRemote = function (handler) {
	    this._interfaceSetAsRemoteHandler = handler;
	}


	/**
	 * Set a handler to be called when the remote site requests to
	 * (re)send the interface. Used to detect an initialzation
	 * completion without sending additional request, since in fact
	 * 'getInterface' request is only sent by application at the last
	 * step of the plugin initialization
	 *
	 * @param {Function} handler
	 */
	JailedSite.prototype.onGetInterface = function (handler) {
	    this._getInterfaceHandler = handler;
	}


	/**
	 * @returns {Object} set of remote interface methods
	 */
	JailedSite.prototype.getRemote = function () {
	    return this._remote;
	}

	JailedSite.prototype.getClassInstanceInterface = function (instance) {
	    var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
	    var _interface = {};

	    for (var i = 0; i < methods.length; i++) {
	        var method = methods[i];
	        _interface[method] = instance[method].bind(instance);
	    }
	    return _interface;
	};


	/**
	 * Sets the interface of this site making it available to the
	 * remote site by sending a message with a set of methods names
	 *
	 * @param {Object} _interface to set
	 */
	JailedSite.prototype.setInterface = function (_interface) {
	    if (Object.getPrototypeOf(_interface) === Object.prototype) {
	        this._interface = _interface;
	    } else {
	        this._interface = this.getClassInstanceInterface(_interface);
	    }
	    this._sendInterface();
	};


	/**
	 * Sends the actual interface to the remote site upon it was
	 * updated or by a special request of the remote site
	 */
	JailedSite.prototype._sendInterface = function () {
	    var names = [];
	    for (var name in this._interface) {
	        if (this._interface.hasOwnProperty(name)) {
	            names.push(name);
	        }
	    }

	    this._connection.send({type: 'setInterface', api: names});
	}


	/**
	 * Unwraps remote method or callback. Takes furst two arguments and calls them when resolves or rejects returned.
	 * Just resolves if plain value returned
	 * @param method
	 * @param args
	 * @private
	 */
	JailedSite.prototype._unwrapAndCallPromisedMethod = function (method, args) {
	    args = this._unwrap(args);
	    var resolveCallback = args.shift();
	    var rejectCallback = args.shift();
	    var result = method.apply(null, args);

	    //Handle returns
	    if (result) {
	        //Handle promise interface
	        if (result.then) {
	            result
	                .then(resolveCallback)
	                .catch(rejectCallback);
	        } else {
	            //Handle value return
	            resolveCallback(result);
	        }
	    }
	};


	/**
	 * Handles a message from the remote site
	 */
	JailedSite.prototype._processMessage = function (data) {
	    switch (data.type) {
	        case 'method':
	            var method = this._interface[data.name];
	            return this._unwrapAndCallPromisedMethod(method, data.args);
	            break;
	        case 'callback':
	            var method = this._store.fetch(data.id)[data.num];
	            return this._unwrapAndCallPromisedMethod(method, data.args);
	            break;
	        case 'setInterface':
	            this._setRemote(data.api);
	            break;
	        case 'getInterface':
	            this._sendInterface();
	            this._getInterfaceHandler();
	            break;
	        case 'interfaceSetAsRemote':
	            this._interfaceSetAsRemoteHandler();
	            break;
	        case 'disconnect':
	            this._disconnectHandler();
	            this._connection.disconnect();
	            break;
	    }
	}


	/**
	 * Sends a requests to the remote site asking it to provide its
	 * current interface
	 */
	JailedSite.prototype.requestRemote = function () {
	    this._connection.send({type: 'getInterface'});
	}


	/**
	 * Sets the new remote interface provided by the other site
	 *
	 * @param {Array} names list of function names
	 */
	JailedSite.prototype._setRemote = function (names) {
	    this._remote = {};
	    var i, name;
	    for (i = 0; i < names.length; i++) {
	        name = names[i];
	        this._remote[name] = this._genRemoteMethod(name);
	    }

	    this._remoteUpdateHandler();
	    this._reportRemoteSet();
	}


	/**
	 * Generates the wrapped function corresponding to a single remote
	 * method. When the generated function is called, it will send the
	 * corresponding message to the remote site asking it to execute
	 * the particular method of its interface
	 *
	 * @param {String} name of the remote method
	 *
	 * @returns {Function} wrapped remote method
	 */
	JailedSite.prototype._genRemoteMethod = function (name) {
	    var me = this;
	    var remoteMethod = function () {
	        var args = Array.prototype.slice.call(arguments);

	        return new Promise(function (resolve, reject) {
	            me._connection.send({
	                type: 'method',
	                name: name,
	                args: me._wrap([resolve, reject].concat(args))
	            });
	        });
	    };

	    return remoteMethod;
	}


	/**
	 * Sends a responce reporting that interface just provided by the
	 * remote site was sucessfully set by this site as remote
	 */
	JailedSite.prototype._reportRemoteSet = function () {
	    this._connection.send({type: 'interfaceSetAsRemote'});
	}


	/**
	 * Prepares the provided set of remote method arguments for
	 * sending to the remote site, replaces all the callbacks with
	 * identifiers
	 *
	 * @param {Array} args to wrap
	 *
	 * @returns {Array} wrapped arguments
	 */
	JailedSite.prototype._wrap = function (args) {
	    var wrapped = [];
	    var callbacks = {};
	    var callbacksPresent = false;
	    for (var i = 0; i < args.length; i++) {
	        if (typeof args[i] == 'function') {
	            callbacks[i] = args[i];
	            wrapped[i] = {type: 'callback', num: i};
	            callbacksPresent = true;
	        } else {
	            wrapped[i] = {type: 'argument', value: args[i]};
	        }
	    }

	    var result = {args: wrapped};

	    if (callbacksPresent) {
	        result.callbackId = this._store.put(callbacks);
	    }

	    return result;
	}


	/**
	 * Unwraps the set of arguments delivered from the remote site,
	 * replaces all callback identifiers with a function which will
	 * initiate sending that callback identifier back to other site
	 *
	 * @param {Object} args to unwrap
	 *
	 * @returns {Array} unwrapped args
	 */
	JailedSite.prototype._unwrap = function (args) {
	    var called = false;

	    // wraps each callback so that the only one could be called
	    var once = function (cb) {
	        return function () {
	            if (!called) {
	                called = true;
	                return cb.apply(this, arguments);
	            } else {
	                var msg =
	                    'A callback from this set has already been executed';
	                throw new Error(msg);
	            }
	        };
	    }

	    var result = [];
	    var i, arg, cb, me = this;
	    for (i = 0; i < args.args.length; i++) {
	        arg = args.args[i];
	        if (arg.type == 'argument') {
	            result.push(arg.value);
	        } else {
	            cb = once(
	                this._genRemoteCallback(args.callbackId, i)
	            );
	            result.push(cb);
	        }
	    }

	    return result;
	}


	/**
	 * Generates the wrapped function corresponding to a single remote
	 * callback. When the generated function is called, it will send
	 * the corresponding message to the remote site asking it to
	 * execute the particular callback previously saved during a call
	 * by the remote site a method from the interface of this site
	 *
	 * @param {Number} id of the remote callback to execute
	 * @param {Number} argNum argument index of the callback
	 *
	 * @returns {Function} wrapped remote callback
	 */
	JailedSite.prototype._genRemoteCallback = function (id, argNum) {
	    var me = this;
	    var remoteCallback = function () {
	        var args = Array.prototype.slice.call(arguments);

	        return new Promise(function (resolve, reject) {
	            me._connection.send({
	                type: 'callback',
	                id: id,
	                num: argNum,
	                args: me._wrap([resolve, reject].concat(args))
	            });
	        });
	    };

	    return remoteCallback;
	}

	/**
	 * Sends the notification message and breaks the connection
	 */
	JailedSite.prototype.disconnect = function () {
	    this._connection.send({type: 'disconnect'});
	    this._connection.disconnect();
	}


	/**
	 * Set a handler to be called when received a disconnect message
	 * from the remote site
	 *
	 * @param {Function} handler
	 */
	JailedSite.prototype.onDisconnect = function (handler) {
	    this._disconnectHandler = handler;
	}


	/**
	 * ReferenceStore is a special object which stores other objects
	 * and provides the references (number) instead. This reference
	 * may then be sent over a json-based communication channel (IPC
	 * to another Node.js process or a message to the Worker). Other
	 * site may then provide the reference in the responce message
	 * implying the given object should be activated.
	 *
	 * Primary usage for the ReferenceStore is a storage for the
	 * callbacks, which therefore makes it possible to initiate a
	 * callback execution by the opposite site (which normally cannot
	 * directly execute functions over the communication channel).
	 *
	 * Each stored object can only be fetched once and is not
	 * available for the second time. Each stored object must be
	 * fetched, since otherwise it will remain stored forever and
	 * consume memory.
	 *
	 * Stored object indeces are simply the numbers, which are however
	 * released along with the objects, and are later reused again (in
	 * order to postpone the overflow, which should not likely happen,
	 * but anyway).
	 */
	var ReferenceStore = function () {
	    this._store = {};    // stored object
	    this._indices = [0]; // smallest available indices
	}


	/**
	 * @function _genId() generates the new reference id
	 *
	 * @returns {Number} smallest available id and reserves it
	 */
	ReferenceStore.prototype._genId = function () {
	    var id;
	    if (this._indices.length == 1) {
	        id = this._indices[0]++;
	    } else {
	        id = this._indices.shift();
	    }

	    return id;
	}


	/**
	 * Releases the given reference id so that it will be available by
	 * another object stored
	 *
	 * @param {Number} id to release
	 */
	ReferenceStore.prototype._releaseId = function (id) {
	    for (var i = 0; i < this._indices.length; i++) {
	        if (id < this._indices[i]) {
	            this._indices.splice(i, 0, id);
	            break;
	        }
	    }

	    // cleaning-up the sequence tail
	    for (i = this._indices.length - 1; i >= 0; i--) {
	        if (this._indices[i] - 1 == this._indices[i - 1]) {
	            this._indices.pop();
	        } else {
	            break;
	        }
	    }
	}


	/**
	 * Stores the given object and returns the refernce id instead
	 *
	 * @param {Object} obj to store
	 *
	 * @returns {Number} reference id of the stored object
	 */
	ReferenceStore.prototype.put = function (obj) {
	    var id = this._genId();
	    this._store[id] = obj;
	    return id;
	}


	/**
	 * Retrieves previously stored object and releases its reference
	 *
	 * @param {Number} id of an object to retrieve
	 */
	ReferenceStore.prototype.fetch = function (id) {
	    var obj = this._store[id];
	    this._store[id] = null;
	    delete this._store[id];
	    this._releaseId(id);
	    return obj;
	}


	module.exports = JailedSite;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global, setImmediate) {(function(global){

	//
	// Check for native Promise and it has correct interface
	//

	var NativePromise = global['Promise'];
	var nativePromiseSupported =
	  NativePromise &&
	  // Some of these methods are missing from
	  // Firefox/Chrome experimental implementations
	  'resolve' in NativePromise &&
	  'reject' in NativePromise &&
	  'all' in NativePromise &&
	  'race' in NativePromise &&
	  // Older version of the spec had a resolver object
	  // as the arg rather than a function
	  (function(){
	    var resolve;
	    new NativePromise(function(r){ resolve = r; });
	    return typeof resolve === 'function';
	  })();


	//
	// export if necessary
	//

	if (typeof exports !== 'undefined' && exports)
	{
	  // node.js
	  exports.Promise = nativePromiseSupported ? NativePromise : Promise;
	}
	else
	{
	  // AMD
	  if (true)
	  {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function(){
	      return nativePromiseSupported ? NativePromise : Promise;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  else
	  {
	    // in browser add to global
	    if (!nativePromiseSupported)
	      global['Promise'] = Promise;
	  }
	}


	//
	// Polyfill
	//

	var PENDING = 'pending';
	var SEALED = 'sealed';
	var FULFILLED = 'fulfilled';
	var REJECTED = 'rejected';
	var NOOP = function(){};

	// async calls
	var asyncSetTimer = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;
	var asyncQueue = [];
	var asyncTimer;

	function asyncFlush(){
	  // run promise callbacks
	  for (var i = 0; i < asyncQueue.length; i++)
	    asyncQueue[i][0](asyncQueue[i][1]);

	  // reset async asyncQueue
	  asyncQueue = [];
	  asyncTimer = false;
	}

	function asyncCall(callback, arg){
	  asyncQueue.push([callback, arg]);

	  if (!asyncTimer)
	  {
	    asyncTimer = true;
	    asyncSetTimer(asyncFlush, 0);
	  }
	}


	function invokeResolver(resolver, promise) {
	  function resolvePromise(value) {
	    resolve(promise, value);
	  }

	  function rejectPromise(reason) {
	    reject(promise, reason);
	  }

	  try {
	    resolver(resolvePromise, rejectPromise);
	  } catch(e) {
	    rejectPromise(e);
	  }
	}

	function invokeCallback(subscriber){
	  var owner = subscriber.owner;
	  var settled = owner.state_;
	  var value = owner.data_;  
	  var callback = subscriber[settled];
	  var promise = subscriber.then;

	  if (typeof callback === 'function')
	  {
	    settled = FULFILLED;
	    try {
	      value = callback(value);
	    } catch(e) {
	      reject(promise, e);
	    }
	  }

	  if (!handleThenable(promise, value))
	  {
	    if (settled === FULFILLED)
	      resolve(promise, value);

	    if (settled === REJECTED)
	      reject(promise, value);
	  }
	}

	function handleThenable(promise, value) {
	  var resolved;

	  try {
	    if (promise === value)
	      throw new TypeError('A promises callback cannot return that same promise.');

	    if (value && (typeof value === 'function' || typeof value === 'object'))
	    {
	      var then = value.then;  // then should be retrived only once

	      if (typeof then === 'function')
	      {
	        then.call(value, function(val){
	          if (!resolved)
	          {
	            resolved = true;

	            if (value !== val)
	              resolve(promise, val);
	            else
	              fulfill(promise, val);
	          }
	        }, function(reason){
	          if (!resolved)
	          {
	            resolved = true;

	            reject(promise, reason);
	          }
	        });

	        return true;
	      }
	    }
	  } catch (e) {
	    if (!resolved)
	      reject(promise, e);

	    return true;
	  }

	  return false;
	}

	function resolve(promise, value){
	  if (promise === value || !handleThenable(promise, value))
	    fulfill(promise, value);
	}

	function fulfill(promise, value){
	  if (promise.state_ === PENDING)
	  {
	    promise.state_ = SEALED;
	    promise.data_ = value;

	    asyncCall(publishFulfillment, promise);
	  }
	}

	function reject(promise, reason){
	  if (promise.state_ === PENDING)
	  {
	    promise.state_ = SEALED;
	    promise.data_ = reason;

	    asyncCall(publishRejection, promise);
	  }
	}

	function publish(promise) {
	  promise.then_ = promise.then_.forEach(invokeCallback);
	}

	function publishFulfillment(promise){
	  promise.state_ = FULFILLED;
	  publish(promise);
	}

	function publishRejection(promise){
	  promise.state_ = REJECTED;
	  publish(promise);
	}

	/**
	* @class
	*/
	function Promise(resolver){
	  if (typeof resolver !== 'function')
	    throw new TypeError('Promise constructor takes a function argument');

	  if (this instanceof Promise === false)
	    throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');

	  this.then_ = [];

	  invokeResolver(resolver, this);
	}

	Promise.prototype = {
	  constructor: Promise,

	  state_: PENDING,
	  then_: null,
	  data_: undefined,

	  then: function(onFulfillment, onRejection){
	    var subscriber = {
	      owner: this,
	      then: new this.constructor(NOOP),
	      fulfilled: onFulfillment,
	      rejected: onRejection
	    };

	    if (this.state_ === FULFILLED || this.state_ === REJECTED)
	    {
	      // already resolved, call callback async
	      asyncCall(invokeCallback, subscriber);
	    }
	    else
	    {
	      // subscribe
	      this.then_.push(subscriber);
	    }

	    return subscriber.then;
	  },

	  'catch': function(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	Promise.all = function(promises){
	  var Class = this;

	  if (!Array.isArray(promises))
	    throw new TypeError('You must pass an array to Promise.all().');

	  return new Class(function(resolve, reject){
	    var results = [];
	    var remaining = 0;

	    function resolver(index){
	      remaining++;
	      return function(value){
	        results[index] = value;
	        if (!--remaining)
	          resolve(results);
	      };
	    }

	    for (var i = 0, promise; i < promises.length; i++)
	    {
	      promise = promises[i];

	      if (promise && typeof promise.then === 'function')
	        promise.then(resolver(i), reject);
	      else
	        results[i] = promise;
	    }

	    if (!remaining)
	      resolve(results);
	  });
	};

	Promise.race = function(promises){
	  var Class = this;

	  if (!Array.isArray(promises))
	    throw new TypeError('You must pass an array to Promise.race().');

	  return new Class(function(resolve, reject) {
	    for (var i = 0, promise; i < promises.length; i++)
	    {
	      promise = promises[i];

	      if (promise && typeof promise.then === 'function')
	        promise.then(resolve, reject);
	      else
	        resolve(promise);
	    }
	  });
	};

	Promise.resolve = function(value){
	  var Class = this;

	  if (value && typeof value === 'object' && value.constructor === Class)
	    return value;

	  return new Class(function(resolve){
	    resolve(value);
	  });
	};

	Promise.reject = function(reason){
	  var Class = this;

	  return new Class(function(resolve, reject){
	    reject(reason);
	  });
	};

	})(typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : typeof self != 'undefined' ? self : this);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6).setImmediate))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(7).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).setImmediate, __webpack_require__(6).clearImmediate))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
/******/ ]);