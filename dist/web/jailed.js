!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jailed=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
_dereq_('es6-promise');

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


/**
 * Sets the interface of this site making it available to the
 * remote site by sending a message with a set of methods names
 *
 * @param {Object} _interface to set
 */
JailedSite.prototype.setInterface = function (_interface) {
    this._interface = _interface;
    this._sendInterface();
}


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
 * Handles a message from the remote site
 */
JailedSite.prototype._processMessage = function (data) {
    switch (data.type) {
        case 'method':
            var method = this._interface[data.name];
            var args = this._unwrap(data.args);
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
            break;
        case 'callback':
            var method = this._store.fetch(data.id)[data.num];
            var args = this._unwrap(data.args);
            method.apply(null, args);
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

        //TODO: find a way to polyfill promise
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
                cb.apply(this, arguments);
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
        me._connection.send({
            type: 'callback',
            id: id,
            num: argNum,
            args: me._wrap(arguments)
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
},{"es6-promise":3}],2:[function(_dereq_,module,exports){
(function (__dirname){
/**
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
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
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
        _dereq_('./_JailedSite.js');
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
        var childProcess = _dereq_('child_process');

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
        var JailedSite = _dereq_('./_JailedSite');
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


}).call(this,"/")
},{"./_JailedSite":1,"./_JailedSite.js":1,"child_process":4}],3:[function(_dereq_,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = _dereq_;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof _dereq_ === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,_dereq_("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1YiZ5S":5}],4:[function(_dereq_,module,exports){

},{}],5:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

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
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[2])
(2)
});