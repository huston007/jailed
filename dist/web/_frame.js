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

	
	/**
	 * Contains the code executed in the sandboxed frame under web-browser
	 * 
	 * Tries to create a Web-Worker inside the frame and set up the
	 * communication between the worker and the parent window. Some
	 * browsers restrict creating a worker inside a sandboxed iframe - if
	 * this happens, the plugin initialized right inside the frame (in the
	 * same thread)
	 */

	__webpack_require__(1);

	var scripts = document.getElementsByTagName('script');
	var thisScript = scripts[scripts.length-1];
	var parentNode = thisScript.parentNode;

	/**
	 * Initializes the plugin inside a webworker. May throw an exception
	 * in case this was not permitted by the browser.
	 */
	var initWebworkerPlugin = function() {
	    var WorkerScript = __webpack_require__(2);

	    var worker = new WorkerScript();

	    // mixed content warning in Chrome silently skips worker
	    // initialization without exception, handling this with timeout
	    var fallbackTimeout = setTimeout(function() {
	        console.warn('Failed to initialize web worker, falling back to iframe.');
	        worker.terminate();
	        initIframePlugin();
	    }, 1000);

	    // forwarding messages between the worker and parent window
	    worker.addEventListener('message', function(m) {
	        if (m.data.type == 'initialized') {
	            clearTimeout(fallbackTimeout);
	        }

	        parent.postMessage(m.data, '*');
	    });

	    window.addEventListener('message', function(m) {
	        worker.postMessage(m.data);
	    });
	}


	/**
	 * Creates plugin right in this iframe
	 */
	var initIframePlugin = function() {
	    // loads additional script into the frame
	    window.loadScript = function(path, sCb, fCb) {
	        var script = document.createElement('script');
	        script.src = path;

	        var clear = function() {
	            script.onload = null;
	            script.onerror = null;
	            script.onreadystatechange = null;
	            script.parentNode.removeChild(script);
	            currentErrorHandler = function(){};
	        }

	        var success = function() {
	            clear();
	            sCb();
	        }

	        var failure = function() {
	            clear();
	            fCb();
	        }

	        currentErrorHandler = failure;

	        script.onerror = failure;
	        script.onload = success;
	        script.onreadystatechange = function() {
	            var state = script.readyState;
	            if (state==='loaded' || state==='complete') {
	                success();
	            }
	        }

	        parentNode.appendChild(script);
	    }

	        
	    // handles script loading error
	    // (assuming scripts are loaded one by one in the iframe)
	    var currentErrorHandler = function(){};
	    window.addEventListener('error', function(message) {
	        currentErrorHandler();
	    });
	    __webpack_require__(4);
	    __webpack_require__(5);
	}



	try {
	    initWebworkerPlugin();
	} catch(e) {
	    initIframePlugin();
	}



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "_frame.html";

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		return __webpack_require__(3)("/******/ (function(modules) { // webpackBootstrap\n/******/ \t// The module cache\n/******/ \tvar installedModules = {};\n\n/******/ \t// The require function\n/******/ \tfunction __webpack_require__(moduleId) {\n\n/******/ \t\t// Check if module is in cache\n/******/ \t\tif(installedModules[moduleId])\n/******/ \t\t\treturn installedModules[moduleId].exports;\n\n/******/ \t\t// Create a new module (and put it into the cache)\n/******/ \t\tvar module = installedModules[moduleId] = {\n/******/ \t\t\texports: {},\n/******/ \t\t\tid: moduleId,\n/******/ \t\t\tloaded: false\n/******/ \t\t};\n\n/******/ \t\t// Execute the module function\n/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\n/******/ \t\t// Flag the module as loaded\n/******/ \t\tmodule.loaded = true;\n\n/******/ \t\t// Return the exports of the module\n/******/ \t\treturn module.exports;\n/******/ \t}\n\n\n/******/ \t// expose the modules object (__webpack_modules__)\n/******/ \t__webpack_require__.m = modules;\n\n/******/ \t// expose the module cache\n/******/ \t__webpack_require__.c = installedModules;\n\n/******/ \t// __webpack_public_path__\n/******/ \t__webpack_require__.p = \"\";\n\n/******/ \t// Load entry module and return exports\n/******/ \treturn __webpack_require__(0);\n/******/ })\n/************************************************************************/\n/******/ ([\n/* 0 */\n/***/ function(module, exports, __webpack_require__) {\n\n\t__webpack_require__(1);\n\t__webpack_require__(2);\n\n\tself.postMessage({\n\t    type: \"initialized\",\n\t    dedicatedThread: true\n\t});\n\n/***/ },\n/* 1 */\n/***/ function(module, exports) {\n\n\t\n\t/**\n\t * Contains the routines loaded by the plugin Worker under web-browser.\n\t * \n\t * Initializes the web environment version of the platform-dependent\n\t * connection object for the plugin site\n\t */\n\n\tself.application = {};\n\tself.connection = {};\n\n\n\t(function(){\n\t     \n\t    /**\n\t     * Event lisener for the plugin message\n\t     */\n\t    self.addEventListener('message', function(e){\n\t        var m = e.data.data;\n\t        switch (m.type) {\n\t        case 'import':\n\t        case 'importJailed':  // already jailed in the iframe\n\t            importScript(m.url);\n\t            break;\n\t        case 'execute':\n\t            execute(m.code);\n\t            break;\n\t        case 'message':\n\t            conn._messageHandler(m.data);\n\t            break;\n\t        }\n\t     });\n\n\n\t    /**\n\t     * Loads and executes the JavaScript file with the given url\n\t     *\n\t     * @param {String} url to load\n\t     */\n\t    var importScript = function(url) {\n\t        var error = null;\n\n\t        // importScripts does not throw an exception in old webkits\n\t        // (Opera 15.0), but we can determine a failure by the\n\t        // returned value which must be undefined in case of success\n\t        var returned = true;\n\t        try {\n\t            returned = importScripts(url);\n\t        } catch (e) {\n\t            error = e;\n\t        }\n\n\t        if (error || typeof returned != 'undefined') {\n\t            self.postMessage({type: 'importFailure', url: url});\n\t            if (error) {\n\t                throw error;\n\t            }\n\t        } else {\n\t           self.postMessage({type: 'importSuccess', url: url});\n\t        }\n\n\t    }\n\n\n\t    /**\n\t     * Executes the given code in a jailed environment. For web\n\t     * implementation, we're already jailed in the iframe and the\n\t     * worker, so simply eval()\n\t     * \n\t     * @param {String} code code to execute\n\t     */\n\t    var execute = function(code) {\n\t        try {\n\t            eval(code);\n\t        } catch (e) {\n\t            self.postMessage({type: 'executeFailure'});\n\t            throw e;\n\t        }\n\n\t        self.postMessage({type: 'executeSuccess'});\n\t    }\n\n\t     \n\t    /**\n\t     * Connection object provided to the JailedSite constructor,\n\t     * plugin site implementation for the web-based environment.\n\t     * Global will be then cleared to prevent exposure into the\n\t     * Worker, so we put this local connection object into a closure\n\t     */\n\t    var conn = {\n\t        disconnect: function(){ self.close(); },\n\t        send: function(data) {\n\t            self.postMessage({type: 'message', data: data});\n\t        },\n\t        onMessage: function(h){ conn._messageHandler = h; },\n\t        _messageHandler: function(){},\n\t        onDisconnect: function() {}\n\t    };\n\t     \n\t    connection = conn;\n\t     \n\t})();\n\n\n\n/***/ },\n/* 2 */\n/***/ function(module, exports, __webpack_require__) {\n\n\t\n\t/**\n\t * Core plugin script loaded into the plugin process/thread.\n\t * \n\t * Initializes the plugin-site API global methods.\n\t */\n\n\t(function(){\n\t     \n\t    // localize\n\t    var JailedSite = __webpack_require__(3);\n\t    var site = new JailedSite(connection);\n\t    delete JailedSite;\n\t    delete connection;\n\t     \n\t    site.onGetInterface(function(){\n\t        launchConnected();\n\t    });\n\t     \n\t    site.onRemoteUpdate(function(){\n\t        application.remote = site.getRemote();\n\t    });\n\t     \n\t     \n\n\t    /**\n\t     * Simplified clone of Whenable instance (the object can not be\n\t     * placed into a shared script, because the main library needs it\n\t     * before the additional scripts may load)\n\t     */\n\t    var connected = false;\n\t    var connectedHandlers = [];\n\t     \n\t    var launchConnected = function() {\n\t        if (!connected) {\n\t            connected = true;\n\n\t            var handler;\n\t            while(handler = connectedHandlers.pop()) {\n\t                handler();\n\t            }\n\t        }\n\t    }\n\t     \n\t    var checkHandler = function(handler){\n\t        var type = typeof handler;\n\t        if (type != 'function') {\n\t            var msg =\n\t                'A function may only be subsribed to the event, '\n\t                + type\n\t                + ' was provided instead'\n\t            throw new Error(msg);\n\t        }\n\n\t        return handler;\n\t    }\n\t    \n\t     \n\t    /**\n\t     * Sets a function executed after the connection to the\n\t     * application is estaplished, and the initial interface-exchange\n\t     * messaging is completed\n\t     * \n\t     * @param {Function} handler to be called upon initialization\n\t     */\n\t    application.whenConnected = function(handler) {\n\t        handler = checkHandler(handler);\n\t        if (connected) {\n\t            handler();\n\t        } else {\n\t            connectedHandlers.push(handler);\n\t        }\n\t    }\n\n\n\t    /**\n\t     * Sets the plugin interface available to the application\n\t     * \n\t     * @param {Object} _interface to set\n\t     */\n\t    application.setInterface = function(_interface) {\n\t        site.setInterface(_interface);\n\t    }\n\n\t \n\t \n\t    /**\n\t     * Disconnects the plugin from the application (sending\n\t     * notification message) and destroys itself\n\t     */\n\t    application.disconnect = function(_interface) {\n\t        site.disconnect();\n\t    }\n\n\t})();\n\n\n\n/***/ },\n/* 3 */\n/***/ function(module, exports, __webpack_require__) {\n\n\tvar Promise = __webpack_require__(4).Promise;\n\n\t/**\n\t * Contains the JailedSite object used both by the application\n\t * site, and by each plugin\n\t */\n\n\n\t/**\n\t * JailedSite object represents a single site in the\n\t * communication protocol between the application and the plugin\n\t *\n\t * @param {Object} connection a special object allowing to send\n\t * and receive messages from the opposite site (basically it\n\t * should only provide send() and onMessage() methods)\n\t */\n\tJailedSite = function (connection) {\n\t    this._interface = {};\n\t    this._remote = null;\n\t    this._remoteUpdateHandler = function () {\n\t    };\n\t    this._getInterfaceHandler = function () {\n\t    };\n\t    this._interfaceSetAsRemoteHandler = function () {\n\t    };\n\t    this._disconnectHandler = function () {\n\t    };\n\t    this._store = new ReferenceStore;\n\n\t    var me = this;\n\t    this._connection = connection;\n\t    this._connection.onMessage(\n\t        function (data) {\n\t            me._processMessage(data);\n\t        }\n\t    );\n\n\t    this._connection.onDisconnect(\n\t        function (m) {\n\t            me._disconnectHandler(m);\n\t        }\n\t    );\n\t}\n\n\n\t/**\n\t * Set a handler to be called when the remote site updates its\n\t * interface\n\t *\n\t * @param {Function} handler\n\t */\n\tJailedSite.prototype.onRemoteUpdate = function (handler) {\n\t    this._remoteUpdateHandler = handler;\n\t}\n\n\n\t/**\n\t * Set a handler to be called when received a responce from the\n\t * remote site reporting that the previously provided interface\n\t * has been succesfully set as remote for that site\n\t *\n\t * @param {Function} handler\n\t */\n\tJailedSite.prototype.onInterfaceSetAsRemote = function (handler) {\n\t    this._interfaceSetAsRemoteHandler = handler;\n\t}\n\n\n\t/**\n\t * Set a handler to be called when the remote site requests to\n\t * (re)send the interface. Used to detect an initialzation\n\t * completion without sending additional request, since in fact\n\t * 'getInterface' request is only sent by application at the last\n\t * step of the plugin initialization\n\t *\n\t * @param {Function} handler\n\t */\n\tJailedSite.prototype.onGetInterface = function (handler) {\n\t    this._getInterfaceHandler = handler;\n\t}\n\n\n\t/**\n\t * @returns {Object} set of remote interface methods\n\t */\n\tJailedSite.prototype.getRemote = function () {\n\t    return this._remote;\n\t}\n\n\tJailedSite.prototype.getClassInstanceInterface = function (instance) {\n\t    var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));\n\t    var _interface = {};\n\n\t    for (var i = 0; i < methods.length; i++) {\n\t        var method = methods[i];\n\t        _interface[method] = instance[method].bind(instance);\n\t    }\n\t    return _interface;\n\t};\n\n\n\t/**\n\t * Sets the interface of this site making it available to the\n\t * remote site by sending a message with a set of methods names\n\t *\n\t * @param {Object} _interface to set\n\t */\n\tJailedSite.prototype.setInterface = function (_interface) {\n\t    if (Object.getPrototypeOf(_interface) === Object.prototype) {\n\t        this._interface = _interface;\n\t    } else {\n\t        this._interface = this.getClassInstanceInterface(_interface);\n\t    }\n\t    this._sendInterface();\n\t};\n\n\n\t/**\n\t * Sends the actual interface to the remote site upon it was\n\t * updated or by a special request of the remote site\n\t */\n\tJailedSite.prototype._sendInterface = function () {\n\t    var names = [];\n\t    for (var name in this._interface) {\n\t        if (this._interface.hasOwnProperty(name)) {\n\t            names.push(name);\n\t        }\n\t    }\n\n\t    this._connection.send({type: 'setInterface', api: names});\n\t}\n\n\n\t/**\n\t * Unwraps remote method or callback. Takes furst two arguments and calls them when resolves or rejects returned.\n\t * Just resolves if plain value returned\n\t * @param method\n\t * @param args\n\t * @private\n\t */\n\tJailedSite.prototype._unwrapAndCallPromisedMethod = function (method, args) {\n\t    args = this._unwrap(args);\n\t    var resolveCallback = args.shift();\n\t    var rejectCallback = args.shift();\n\t    var result = method.apply(null, args);\n\n\t    //Handle returns\n\t    if (result) {\n\t        //Handle promise interface\n\t        if (result.then) {\n\t            result\n\t                .then(resolveCallback)\n\t                .catch(rejectCallback);\n\t        } else {\n\t            //Handle value return\n\t            resolveCallback(result);\n\t        }\n\t    }\n\t};\n\n\n\t/**\n\t * Handles a message from the remote site\n\t */\n\tJailedSite.prototype._processMessage = function (data) {\n\t    switch (data.type) {\n\t        case 'method':\n\t            var method = this._interface[data.name];\n\t            return this._unwrapAndCallPromisedMethod(method, data.args);\n\t            break;\n\t        case 'callback':\n\t            var method = this._store.fetch(data.id)[data.num];\n\t            return this._unwrapAndCallPromisedMethod(method, data.args);\n\t            break;\n\t        case 'setInterface':\n\t            this._setRemote(data.api);\n\t            break;\n\t        case 'getInterface':\n\t            this._sendInterface();\n\t            this._getInterfaceHandler();\n\t            break;\n\t        case 'interfaceSetAsRemote':\n\t            this._interfaceSetAsRemoteHandler();\n\t            break;\n\t        case 'disconnect':\n\t            this._disconnectHandler();\n\t            this._connection.disconnect();\n\t            break;\n\t    }\n\t}\n\n\n\t/**\n\t * Sends a requests to the remote site asking it to provide its\n\t * current interface\n\t */\n\tJailedSite.prototype.requestRemote = function () {\n\t    this._connection.send({type: 'getInterface'});\n\t}\n\n\n\t/**\n\t * Sets the new remote interface provided by the other site\n\t *\n\t * @param {Array} names list of function names\n\t */\n\tJailedSite.prototype._setRemote = function (names) {\n\t    this._remote = {};\n\t    var i, name;\n\t    for (i = 0; i < names.length; i++) {\n\t        name = names[i];\n\t        this._remote[name] = this._genRemoteMethod(name);\n\t    }\n\n\t    this._remoteUpdateHandler();\n\t    this._reportRemoteSet();\n\t}\n\n\n\t/**\n\t * Generates the wrapped function corresponding to a single remote\n\t * method. When the generated function is called, it will send the\n\t * corresponding message to the remote site asking it to execute\n\t * the particular method of its interface\n\t *\n\t * @param {String} name of the remote method\n\t *\n\t * @returns {Function} wrapped remote method\n\t */\n\tJailedSite.prototype._genRemoteMethod = function (name) {\n\t    var me = this;\n\t    var remoteMethod = function () {\n\t        var args = Array.prototype.slice.call(arguments);\n\n\t        return new Promise(function (resolve, reject) {\n\t            me._connection.send({\n\t                type: 'method',\n\t                name: name,\n\t                args: me._wrap([resolve, reject].concat(args))\n\t            });\n\t        });\n\t    };\n\n\t    return remoteMethod;\n\t}\n\n\n\t/**\n\t * Sends a responce reporting that interface just provided by the\n\t * remote site was sucessfully set by this site as remote\n\t */\n\tJailedSite.prototype._reportRemoteSet = function () {\n\t    this._connection.send({type: 'interfaceSetAsRemote'});\n\t}\n\n\n\t/**\n\t * Prepares the provided set of remote method arguments for\n\t * sending to the remote site, replaces all the callbacks with\n\t * identifiers\n\t *\n\t * @param {Array} args to wrap\n\t *\n\t * @returns {Array} wrapped arguments\n\t */\n\tJailedSite.prototype._wrap = function (args) {\n\t    var wrapped = [];\n\t    var callbacks = {};\n\t    var callbacksPresent = false;\n\t    for (var i = 0; i < args.length; i++) {\n\t        if (typeof args[i] == 'function') {\n\t            callbacks[i] = args[i];\n\t            wrapped[i] = {type: 'callback', num: i};\n\t            callbacksPresent = true;\n\t        } else {\n\t            wrapped[i] = {type: 'argument', value: args[i]};\n\t        }\n\t    }\n\n\t    var result = {args: wrapped};\n\n\t    if (callbacksPresent) {\n\t        result.callbackId = this._store.put(callbacks);\n\t    }\n\n\t    return result;\n\t}\n\n\n\t/**\n\t * Unwraps the set of arguments delivered from the remote site,\n\t * replaces all callback identifiers with a function which will\n\t * initiate sending that callback identifier back to other site\n\t *\n\t * @param {Object} args to unwrap\n\t *\n\t * @returns {Array} unwrapped args\n\t */\n\tJailedSite.prototype._unwrap = function (args) {\n\t    var called = false;\n\n\t    // wraps each callback so that the only one could be called\n\t    var once = function (cb) {\n\t        return function () {\n\t            if (!called) {\n\t                called = true;\n\t                return cb.apply(this, arguments);\n\t            } else {\n\t                var msg =\n\t                    'A callback from this set has already been executed';\n\t                throw new Error(msg);\n\t            }\n\t        };\n\t    }\n\n\t    var result = [];\n\t    var i, arg, cb, me = this;\n\t    for (i = 0; i < args.args.length; i++) {\n\t        arg = args.args[i];\n\t        if (arg.type == 'argument') {\n\t            result.push(arg.value);\n\t        } else {\n\t            cb = once(\n\t                this._genRemoteCallback(args.callbackId, i)\n\t            );\n\t            result.push(cb);\n\t        }\n\t    }\n\n\t    return result;\n\t}\n\n\n\t/**\n\t * Generates the wrapped function corresponding to a single remote\n\t * callback. When the generated function is called, it will send\n\t * the corresponding message to the remote site asking it to\n\t * execute the particular callback previously saved during a call\n\t * by the remote site a method from the interface of this site\n\t *\n\t * @param {Number} id of the remote callback to execute\n\t * @param {Number} argNum argument index of the callback\n\t *\n\t * @returns {Function} wrapped remote callback\n\t */\n\tJailedSite.prototype._genRemoteCallback = function (id, argNum) {\n\t    var me = this;\n\t    var remoteCallback = function () {\n\t        var args = Array.prototype.slice.call(arguments);\n\n\t        return new Promise(function (resolve, reject) {\n\t            me._connection.send({\n\t                type: 'callback',\n\t                id: id,\n\t                num: argNum,\n\t                args: me._wrap([resolve, reject].concat(args))\n\t            });\n\t        });\n\t    };\n\n\t    return remoteCallback;\n\t}\n\n\t/**\n\t * Sends the notification message and breaks the connection\n\t */\n\tJailedSite.prototype.disconnect = function () {\n\t    this._connection.send({type: 'disconnect'});\n\t    this._connection.disconnect();\n\t}\n\n\n\t/**\n\t * Set a handler to be called when received a disconnect message\n\t * from the remote site\n\t *\n\t * @param {Function} handler\n\t */\n\tJailedSite.prototype.onDisconnect = function (handler) {\n\t    this._disconnectHandler = handler;\n\t}\n\n\n\t/**\n\t * ReferenceStore is a special object which stores other objects\n\t * and provides the references (number) instead. This reference\n\t * may then be sent over a json-based communication channel (IPC\n\t * to another Node.js process or a message to the Worker). Other\n\t * site may then provide the reference in the responce message\n\t * implying the given object should be activated.\n\t *\n\t * Primary usage for the ReferenceStore is a storage for the\n\t * callbacks, which therefore makes it possible to initiate a\n\t * callback execution by the opposite site (which normally cannot\n\t * directly execute functions over the communication channel).\n\t *\n\t * Each stored object can only be fetched once and is not\n\t * available for the second time. Each stored object must be\n\t * fetched, since otherwise it will remain stored forever and\n\t * consume memory.\n\t *\n\t * Stored object indeces are simply the numbers, which are however\n\t * released along with the objects, and are later reused again (in\n\t * order to postpone the overflow, which should not likely happen,\n\t * but anyway).\n\t */\n\tvar ReferenceStore = function () {\n\t    this._store = {};    // stored object\n\t    this._indices = [0]; // smallest available indices\n\t}\n\n\n\t/**\n\t * @function _genId() generates the new reference id\n\t *\n\t * @returns {Number} smallest available id and reserves it\n\t */\n\tReferenceStore.prototype._genId = function () {\n\t    var id;\n\t    if (this._indices.length == 1) {\n\t        id = this._indices[0]++;\n\t    } else {\n\t        id = this._indices.shift();\n\t    }\n\n\t    return id;\n\t}\n\n\n\t/**\n\t * Releases the given reference id so that it will be available by\n\t * another object stored\n\t *\n\t * @param {Number} id to release\n\t */\n\tReferenceStore.prototype._releaseId = function (id) {\n\t    for (var i = 0; i < this._indices.length; i++) {\n\t        if (id < this._indices[i]) {\n\t            this._indices.splice(i, 0, id);\n\t            break;\n\t        }\n\t    }\n\n\t    // cleaning-up the sequence tail\n\t    for (i = this._indices.length - 1; i >= 0; i--) {\n\t        if (this._indices[i] - 1 == this._indices[i - 1]) {\n\t            this._indices.pop();\n\t        } else {\n\t            break;\n\t        }\n\t    }\n\t}\n\n\n\t/**\n\t * Stores the given object and returns the refernce id instead\n\t *\n\t * @param {Object} obj to store\n\t *\n\t * @returns {Number} reference id of the stored object\n\t */\n\tReferenceStore.prototype.put = function (obj) {\n\t    var id = this._genId();\n\t    this._store[id] = obj;\n\t    return id;\n\t}\n\n\n\t/**\n\t * Retrieves previously stored object and releases its reference\n\t *\n\t * @param {Number} id of an object to retrieve\n\t */\n\tReferenceStore.prototype.fetch = function (id) {\n\t    var obj = this._store[id];\n\t    this._store[id] = null;\n\t    delete this._store[id];\n\t    this._releaseId(id);\n\t    return obj;\n\t}\n\n\n\tmodule.exports = JailedSite;\n\n/***/ },\n/* 4 */\n/***/ function(module, exports, __webpack_require__) {\n\n\tvar __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global, setImmediate) {(function(global){\n\n\t//\n\t// Check for native Promise and it has correct interface\n\t//\n\n\tvar NativePromise = global['Promise'];\n\tvar nativePromiseSupported =\n\t  NativePromise &&\n\t  // Some of these methods are missing from\n\t  // Firefox/Chrome experimental implementations\n\t  'resolve' in NativePromise &&\n\t  'reject' in NativePromise &&\n\t  'all' in NativePromise &&\n\t  'race' in NativePromise &&\n\t  // Older version of the spec had a resolver object\n\t  // as the arg rather than a function\n\t  (function(){\n\t    var resolve;\n\t    new NativePromise(function(r){ resolve = r; });\n\t    return typeof resolve === 'function';\n\t  })();\n\n\n\t//\n\t// export if necessary\n\t//\n\n\tif (typeof exports !== 'undefined' && exports)\n\t{\n\t  // node.js\n\t  exports.Promise = nativePromiseSupported ? NativePromise : Promise;\n\t}\n\telse\n\t{\n\t  // AMD\n\t  if (true)\n\t  {\n\t    !(__WEBPACK_AMD_DEFINE_RESULT__ = function(){\n\t      return nativePromiseSupported ? NativePromise : Promise;\n\t    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n\t  }\n\t  else\n\t  {\n\t    // in browser add to global\n\t    if (!nativePromiseSupported)\n\t      global['Promise'] = Promise;\n\t  }\n\t}\n\n\n\t//\n\t// Polyfill\n\t//\n\n\tvar PENDING = 'pending';\n\tvar SEALED = 'sealed';\n\tvar FULFILLED = 'fulfilled';\n\tvar REJECTED = 'rejected';\n\tvar NOOP = function(){};\n\n\t// async calls\n\tvar asyncSetTimer = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;\n\tvar asyncQueue = [];\n\tvar asyncTimer;\n\n\tfunction asyncFlush(){\n\t  // run promise callbacks\n\t  for (var i = 0; i < asyncQueue.length; i++)\n\t    asyncQueue[i][0](asyncQueue[i][1]);\n\n\t  // reset async asyncQueue\n\t  asyncQueue = [];\n\t  asyncTimer = false;\n\t}\n\n\tfunction asyncCall(callback, arg){\n\t  asyncQueue.push([callback, arg]);\n\n\t  if (!asyncTimer)\n\t  {\n\t    asyncTimer = true;\n\t    asyncSetTimer(asyncFlush, 0);\n\t  }\n\t}\n\n\n\tfunction invokeResolver(resolver, promise) {\n\t  function resolvePromise(value) {\n\t    resolve(promise, value);\n\t  }\n\n\t  function rejectPromise(reason) {\n\t    reject(promise, reason);\n\t  }\n\n\t  try {\n\t    resolver(resolvePromise, rejectPromise);\n\t  } catch(e) {\n\t    rejectPromise(e);\n\t  }\n\t}\n\n\tfunction invokeCallback(subscriber){\n\t  var owner = subscriber.owner;\n\t  var settled = owner.state_;\n\t  var value = owner.data_;  \n\t  var callback = subscriber[settled];\n\t  var promise = subscriber.then;\n\n\t  if (typeof callback === 'function')\n\t  {\n\t    settled = FULFILLED;\n\t    try {\n\t      value = callback(value);\n\t    } catch(e) {\n\t      reject(promise, e);\n\t    }\n\t  }\n\n\t  if (!handleThenable(promise, value))\n\t  {\n\t    if (settled === FULFILLED)\n\t      resolve(promise, value);\n\n\t    if (settled === REJECTED)\n\t      reject(promise, value);\n\t  }\n\t}\n\n\tfunction handleThenable(promise, value) {\n\t  var resolved;\n\n\t  try {\n\t    if (promise === value)\n\t      throw new TypeError('A promises callback cannot return that same promise.');\n\n\t    if (value && (typeof value === 'function' || typeof value === 'object'))\n\t    {\n\t      var then = value.then;  // then should be retrived only once\n\n\t      if (typeof then === 'function')\n\t      {\n\t        then.call(value, function(val){\n\t          if (!resolved)\n\t          {\n\t            resolved = true;\n\n\t            if (value !== val)\n\t              resolve(promise, val);\n\t            else\n\t              fulfill(promise, val);\n\t          }\n\t        }, function(reason){\n\t          if (!resolved)\n\t          {\n\t            resolved = true;\n\n\t            reject(promise, reason);\n\t          }\n\t        });\n\n\t        return true;\n\t      }\n\t    }\n\t  } catch (e) {\n\t    if (!resolved)\n\t      reject(promise, e);\n\n\t    return true;\n\t  }\n\n\t  return false;\n\t}\n\n\tfunction resolve(promise, value){\n\t  if (promise === value || !handleThenable(promise, value))\n\t    fulfill(promise, value);\n\t}\n\n\tfunction fulfill(promise, value){\n\t  if (promise.state_ === PENDING)\n\t  {\n\t    promise.state_ = SEALED;\n\t    promise.data_ = value;\n\n\t    asyncCall(publishFulfillment, promise);\n\t  }\n\t}\n\n\tfunction reject(promise, reason){\n\t  if (promise.state_ === PENDING)\n\t  {\n\t    promise.state_ = SEALED;\n\t    promise.data_ = reason;\n\n\t    asyncCall(publishRejection, promise);\n\t  }\n\t}\n\n\tfunction publish(promise) {\n\t  promise.then_ = promise.then_.forEach(invokeCallback);\n\t}\n\n\tfunction publishFulfillment(promise){\n\t  promise.state_ = FULFILLED;\n\t  publish(promise);\n\t}\n\n\tfunction publishRejection(promise){\n\t  promise.state_ = REJECTED;\n\t  publish(promise);\n\t}\n\n\t/**\n\t* @class\n\t*/\n\tfunction Promise(resolver){\n\t  if (typeof resolver !== 'function')\n\t    throw new TypeError('Promise constructor takes a function argument');\n\n\t  if (this instanceof Promise === false)\n\t    throw new TypeError('Failed to construct \\'Promise\\': Please use the \\'new\\' operator, this object constructor cannot be called as a function.');\n\n\t  this.then_ = [];\n\n\t  invokeResolver(resolver, this);\n\t}\n\n\tPromise.prototype = {\n\t  constructor: Promise,\n\n\t  state_: PENDING,\n\t  then_: null,\n\t  data_: undefined,\n\n\t  then: function(onFulfillment, onRejection){\n\t    var subscriber = {\n\t      owner: this,\n\t      then: new this.constructor(NOOP),\n\t      fulfilled: onFulfillment,\n\t      rejected: onRejection\n\t    };\n\n\t    if (this.state_ === FULFILLED || this.state_ === REJECTED)\n\t    {\n\t      // already resolved, call callback async\n\t      asyncCall(invokeCallback, subscriber);\n\t    }\n\t    else\n\t    {\n\t      // subscribe\n\t      this.then_.push(subscriber);\n\t    }\n\n\t    return subscriber.then;\n\t  },\n\n\t  'catch': function(onRejection) {\n\t    return this.then(null, onRejection);\n\t  }\n\t};\n\n\tPromise.all = function(promises){\n\t  var Class = this;\n\n\t  if (!Array.isArray(promises))\n\t    throw new TypeError('You must pass an array to Promise.all().');\n\n\t  return new Class(function(resolve, reject){\n\t    var results = [];\n\t    var remaining = 0;\n\n\t    function resolver(index){\n\t      remaining++;\n\t      return function(value){\n\t        results[index] = value;\n\t        if (!--remaining)\n\t          resolve(results);\n\t      };\n\t    }\n\n\t    for (var i = 0, promise; i < promises.length; i++)\n\t    {\n\t      promise = promises[i];\n\n\t      if (promise && typeof promise.then === 'function')\n\t        promise.then(resolver(i), reject);\n\t      else\n\t        results[i] = promise;\n\t    }\n\n\t    if (!remaining)\n\t      resolve(results);\n\t  });\n\t};\n\n\tPromise.race = function(promises){\n\t  var Class = this;\n\n\t  if (!Array.isArray(promises))\n\t    throw new TypeError('You must pass an array to Promise.race().');\n\n\t  return new Class(function(resolve, reject) {\n\t    for (var i = 0, promise; i < promises.length; i++)\n\t    {\n\t      promise = promises[i];\n\n\t      if (promise && typeof promise.then === 'function')\n\t        promise.then(resolve, reject);\n\t      else\n\t        resolve(promise);\n\t    }\n\t  });\n\t};\n\n\tPromise.resolve = function(value){\n\t  var Class = this;\n\n\t  if (value && typeof value === 'object' && value.constructor === Class)\n\t    return value;\n\n\t  return new Class(function(resolve){\n\t    resolve(value);\n\t  });\n\t};\n\n\tPromise.reject = function(reason){\n\t  var Class = this;\n\n\t  return new Class(function(resolve, reject){\n\t    reject(reason);\n\t  });\n\t};\n\n\t})(typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : typeof self != 'undefined' ? self : this);\n\n\t/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5).setImmediate))\n\n/***/ },\n/* 5 */\n/***/ function(module, exports, __webpack_require__) {\n\n\t/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(6).nextTick;\n\tvar apply = Function.prototype.apply;\n\tvar slice = Array.prototype.slice;\n\tvar immediateIds = {};\n\tvar nextImmediateId = 0;\n\n\t// DOM APIs, for completeness\n\n\texports.setTimeout = function() {\n\t  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);\n\t};\n\texports.setInterval = function() {\n\t  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);\n\t};\n\texports.clearTimeout =\n\texports.clearInterval = function(timeout) { timeout.close(); };\n\n\tfunction Timeout(id, clearFn) {\n\t  this._id = id;\n\t  this._clearFn = clearFn;\n\t}\n\tTimeout.prototype.unref = Timeout.prototype.ref = function() {};\n\tTimeout.prototype.close = function() {\n\t  this._clearFn.call(window, this._id);\n\t};\n\n\t// Does not start the time, just sets up the members needed.\n\texports.enroll = function(item, msecs) {\n\t  clearTimeout(item._idleTimeoutId);\n\t  item._idleTimeout = msecs;\n\t};\n\n\texports.unenroll = function(item) {\n\t  clearTimeout(item._idleTimeoutId);\n\t  item._idleTimeout = -1;\n\t};\n\n\texports._unrefActive = exports.active = function(item) {\n\t  clearTimeout(item._idleTimeoutId);\n\n\t  var msecs = item._idleTimeout;\n\t  if (msecs >= 0) {\n\t    item._idleTimeoutId = setTimeout(function onTimeout() {\n\t      if (item._onTimeout)\n\t        item._onTimeout();\n\t    }, msecs);\n\t  }\n\t};\n\n\t// That's not how node.js implements it but the exposed api is the same.\n\texports.setImmediate = typeof setImmediate === \"function\" ? setImmediate : function(fn) {\n\t  var id = nextImmediateId++;\n\t  var args = arguments.length < 2 ? false : slice.call(arguments, 1);\n\n\t  immediateIds[id] = true;\n\n\t  nextTick(function onNextTick() {\n\t    if (immediateIds[id]) {\n\t      // fn.call() is faster so we optimize for the common use-case\n\t      // @see http://jsperf.com/call-apply-segu\n\t      if (args) {\n\t        fn.apply(null, args);\n\t      } else {\n\t        fn.call(null);\n\t      }\n\t      // Prevent ids from leaking\n\t      exports.clearImmediate(id);\n\t    }\n\t  });\n\n\t  return id;\n\t};\n\n\texports.clearImmediate = typeof clearImmediate === \"function\" ? clearImmediate : function(id) {\n\t  delete immediateIds[id];\n\t};\n\t/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).setImmediate, __webpack_require__(5).clearImmediate))\n\n/***/ },\n/* 6 */\n/***/ function(module, exports) {\n\n\t// shim for using process in browser\n\n\tvar process = module.exports = {};\n\tvar queue = [];\n\tvar draining = false;\n\tvar currentQueue;\n\tvar queueIndex = -1;\n\n\tfunction cleanUpNextTick() {\n\t    draining = false;\n\t    if (currentQueue.length) {\n\t        queue = currentQueue.concat(queue);\n\t    } else {\n\t        queueIndex = -1;\n\t    }\n\t    if (queue.length) {\n\t        drainQueue();\n\t    }\n\t}\n\n\tfunction drainQueue() {\n\t    if (draining) {\n\t        return;\n\t    }\n\t    var timeout = setTimeout(cleanUpNextTick);\n\t    draining = true;\n\n\t    var len = queue.length;\n\t    while(len) {\n\t        currentQueue = queue;\n\t        queue = [];\n\t        while (++queueIndex < len) {\n\t            if (currentQueue) {\n\t                currentQueue[queueIndex].run();\n\t            }\n\t        }\n\t        queueIndex = -1;\n\t        len = queue.length;\n\t    }\n\t    currentQueue = null;\n\t    draining = false;\n\t    clearTimeout(timeout);\n\t}\n\n\tprocess.nextTick = function (fun) {\n\t    var args = new Array(arguments.length - 1);\n\t    if (arguments.length > 1) {\n\t        for (var i = 1; i < arguments.length; i++) {\n\t            args[i - 1] = arguments[i];\n\t        }\n\t    }\n\t    queue.push(new Item(fun, args));\n\t    if (queue.length === 1 && !draining) {\n\t        setTimeout(drainQueue, 0);\n\t    }\n\t};\n\n\t// v8 likes predictible objects\n\tfunction Item(fun, array) {\n\t    this.fun = fun;\n\t    this.array = array;\n\t}\n\tItem.prototype.run = function () {\n\t    this.fun.apply(null, this.array);\n\t};\n\tprocess.title = 'browser';\n\tprocess.browser = true;\n\tprocess.env = {};\n\tprocess.argv = [];\n\tprocess.version = ''; // empty string to avoid regexp issues\n\tprocess.versions = {};\n\n\tfunction noop() {}\n\n\tprocess.on = noop;\n\tprocess.addListener = noop;\n\tprocess.once = noop;\n\tprocess.off = noop;\n\tprocess.removeListener = noop;\n\tprocess.removeAllListeners = noop;\n\tprocess.emit = noop;\n\n\tprocess.binding = function (name) {\n\t    throw new Error('process.binding is not supported');\n\t};\n\n\tprocess.cwd = function () { return '/' };\n\tprocess.chdir = function (dir) {\n\t    throw new Error('process.chdir is not supported');\n\t};\n\tprocess.umask = function() { return 0; };\n\n\n/***/ }\n/******/ ]);", __webpack_require__.p + "843e741624b13ee2ad33.worker.js");
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	// http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string

	var URL = window.URL || window.webkitURL;
	module.exports = function(content, url) {
		try {
			try {
				var blob;
				try { // BlobBuilder = Deprecated, but widely implemented
					var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
					blob = new BlobBuilder();
					blob.append(content);
					blob = blob.getBlob();
				} catch(e) { // The proposed API
					blob = new Blob([content]);
				}
				return new Worker(URL.createObjectURL(blob));
			} catch(e) {
				return new Worker('data:application/javascript,' + encodeURIComponent(content));
			}
		} catch(e) {
			return new Worker(url);
		}
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	
	/**
	 * Contains the routines loaded by the plugin iframe under web-browser
	 * in case when worker failed to initialize
	 * 
	 * Initializes the web environment version of the platform-dependent
	 * connection object for the plugin site
	 */


	window.application = {};
	window.connection = {};


	// event listener for the plugin message
	window.addEventListener('message', function(e) {
	    var m = e.data.data;
	    switch (m.type) {
	    case 'import':
	    case 'importJailed':  // already jailed in the iframe
	        importScript(m.url);
	        break;
	    case 'execute':
	        execute(m.code);
	        break;
	    case 'message':
	        conn._messageHandler(m.data);
	        break;
	    }
	});


	// loads and executes the javascript file with the given url
	var importScript = function(url) {
	    var success = function() {
	        parent.postMessage({
	            type : 'importSuccess',
	            url  : url
	        }, '*');
	    }

	    var failure = function() {
	       parent.postMessage({
	           type : 'importFailure',
	           url  : url
	       }, '*');
	    }

	    var error = null;
	    try {
	        window.loadScript(url, success, failure);
	    } catch (e) {
	        error = e;
	    }

	    if (error) {
	        throw error;
	        failure();
	    }
	}


	// evaluates the provided string
	var execute = function(code) {
	    try {
	        eval(code);
	    } catch (e) {
	        parent.postMessage({type : 'executeFailure'}, '*');
	        throw e;
	    }

	    parent.postMessage({type : 'executeSuccess'}, '*');
	}


	// connection object for the JailedSite constructor
	var conn = {
	    disconnect : function() {},
	    send: function(data) {
	        parent.postMessage({type: 'message', data: data}, '*');
	    },
	    onMessage: function(h){ conn._messageHandler = h },
	    _messageHandler: function(){},
	    onDisconnect: function(){}
	};

	window.connection = conn;

	parent.postMessage({
	    type : 'initialized',
	    dedicatedThread : false
	}, '*');



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Core plugin script loaded into the plugin process/thread.
	 * 
	 * Initializes the plugin-site API global methods.
	 */

	(function(){
	     
	    // localize
	    var JailedSite = __webpack_require__(6);
	    var site = new JailedSite(connection);
	    delete JailedSite;
	    delete connection;
	     
	    site.onGetInterface(function(){
	        launchConnected();
	    });
	     
	    site.onRemoteUpdate(function(){
	        application.remote = site.getRemote();
	    });
	     
	     

	    /**
	     * Simplified clone of Whenable instance (the object can not be
	     * placed into a shared script, because the main library needs it
	     * before the additional scripts may load)
	     */
	    var connected = false;
	    var connectedHandlers = [];
	     
	    var launchConnected = function() {
	        if (!connected) {
	            connected = true;

	            var handler;
	            while(handler = connectedHandlers.pop()) {
	                handler();
	            }
	        }
	    }
	     
	    var checkHandler = function(handler){
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
	     * Sets a function executed after the connection to the
	     * application is estaplished, and the initial interface-exchange
	     * messaging is completed
	     * 
	     * @param {Function} handler to be called upon initialization
	     */
	    application.whenConnected = function(handler) {
	        handler = checkHandler(handler);
	        if (connected) {
	            handler();
	        } else {
	            connectedHandlers.push(handler);
	        }
	    }


	    /**
	     * Sets the plugin interface available to the application
	     * 
	     * @param {Object} _interface to set
	     */
	    application.setInterface = function(_interface) {
	        site.setInterface(_interface);
	    }

	 
	 
	    /**
	     * Disconnects the plugin from the application (sending
	     * notification message) and destroys itself
	     */
	    application.disconnect = function(_interface) {
	        site.disconnect();
	    }

	})();



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(7).Promise;

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
/* 7 */
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

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(8).setImmediate))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(9).nextTick;
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8).setImmediate, __webpack_require__(8).clearImmediate))

/***/ },
/* 9 */
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