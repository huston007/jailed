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

	__webpack_require__(1);
	__webpack_require__(2);

	self.addEventListener("message", function (m) {
	    if (m.data.type == "initImport") {
	        importScripts(m.data.url);
	        self.postMessage({
	            type: "initialized",
	            dedicatedThread: true
	        });
	    }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	
	/**
	 * Contains the routines loaded by the plugin Worker under web-browser.
	 * 
	 * Initializes the web environment version of the platform-dependent
	 * connection object for the plugin site
	 */

	self.application = {};
	self.connection = {};


	(function(){
	     
	    /**
	     * Event lisener for the plugin message
	     */
	    self.addEventListener('message', function(e){
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


	    /**
	     * Loads and executes the JavaScript file with the given url
	     *
	     * @param {String} url to load
	     */
	    var importScript = function(url) {
	        var error = null;

	        // importScripts does not throw an exception in old webkits
	        // (Opera 15.0), but we can determine a failure by the
	        // returned value which must be undefined in case of success
	        var returned = true;
	        try {
	            returned = importScripts(url);
	        } catch (e) {
	            error = e;
	        }

	        if (error || typeof returned != 'undefined') {
	            self.postMessage({type: 'importFailure', url: url});
	            if (error) {
	                throw error;
	            }
	        } else {
	           self.postMessage({type: 'importSuccess', url: url});
	        }

	    }


	    /**
	     * Executes the given code in a jailed environment. For web
	     * implementation, we're already jailed in the iframe and the
	     * worker, so simply eval()
	     * 
	     * @param {String} code code to execute
	     */
	    var execute = function(code) {
	        try {
	            eval(code);
	        } catch (e) {
	            self.postMessage({type: 'executeFailure'});
	            throw e;
	        }

	        self.postMessage({type: 'executeSuccess'});
	    }

	     
	    /**
	     * Connection object provided to the JailedSite constructor,
	     * plugin site implementation for the web-based environment.
	     * Global will be then cleared to prevent exposure into the
	     * Worker, so we put this local connection object into a closure
	     */
	    var conn = {
	        disconnect: function(){ self.close(); },
	        send: function(data) {
	            self.postMessage({type: 'message', data: data});
	        },
	        onMessage: function(h){ conn._messageHandler = h; },
	        _messageHandler: function(){},
	        onDisconnect: function() {}
	    };
	     
	    connection = conn;
	     
	})();



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Core plugin script loaded into the plugin process/thread.
	 * 
	 * Initializes the plugin-site API global methods.
	 */

	(function(){
	     
	    // localize
	    var JailedSite = __webpack_require__(3);
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(4).Promise;

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
/* 4 */
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

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5).setImmediate))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(6).nextTick;
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).setImmediate, __webpack_require__(5).clearImmediate))

/***/ },
/* 6 */
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