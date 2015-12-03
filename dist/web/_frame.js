!function e(t,n,r){function o(s,a){if(!n[s]){if(!t[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(i)return i(s,!0);throw new Error("Cannot find module '"+s+"'")}var u=n[s]={exports:{}};t[s][0].call(u.exports,function(e){var n=t[s][1][e];return o(n?n:e)},u,u.exports,e,t,n,r)}return n[s].exports}for(var i="function"==typeof require&&require,s=0;s<r.length;s++)o(r[s]);return o}({1:[function(e,t,n){e("es6-promise"),JailedSite=function(e){this._interface={},this._remote=null,this._remoteUpdateHandler=function(){},this._getInterfaceHandler=function(){},this._interfaceSetAsRemoteHandler=function(){},this._disconnectHandler=function(){},this._store=new r;var t=this;this._connection=e,this._connection.onMessage(function(e){t._processMessage(e)}),this._connection.onDisconnect(function(e){t._disconnectHandler(e)})},JailedSite.prototype.onRemoteUpdate=function(e){this._remoteUpdateHandler=e},JailedSite.prototype.onInterfaceSetAsRemote=function(e){this._interfaceSetAsRemoteHandler=e},JailedSite.prototype.onGetInterface=function(e){this._getInterfaceHandler=e},JailedSite.prototype.getRemote=function(){return this._remote},JailedSite.prototype.setInterface=function(e){this._interface=e,this._sendInterface()},JailedSite.prototype._sendInterface=function(){var e=[];for(var t in this._interface)this._interface.hasOwnProperty(t)&&e.push(t);this._connection.send({type:"setInterface",api:e})},JailedSite.prototype._processMessage=function(e){switch(e.type){case"method":var t=this._interface[e.name],n=this._unwrap(e.args),r=n.shift(),o=n.shift(),i=t.apply(null,n);i&&(i.then?i.then(r)["catch"](o):r(i));break;case"callback":var t=this._store.fetch(e.id)[e.num],n=this._unwrap(e.args);t.apply(null,n);break;case"setInterface":this._setRemote(e.api);break;case"getInterface":this._sendInterface(),this._getInterfaceHandler();break;case"interfaceSetAsRemote":this._interfaceSetAsRemoteHandler();break;case"disconnect":this._disconnectHandler(),this._connection.disconnect()}},JailedSite.prototype.requestRemote=function(){this._connection.send({type:"getInterface"})},JailedSite.prototype._setRemote=function(e){this._remote={};var t,n;for(t=0;t<e.length;t++)n=e[t],this._remote[n]=this._genRemoteMethod(n);this._remoteUpdateHandler(),this._reportRemoteSet()},JailedSite.prototype._genRemoteMethod=function(e){var t=this,n=function(){var n=Array.prototype.slice.call(arguments);return new Promise(function(r,o){t._connection.send({type:"method",name:e,args:t._wrap([r,o].concat(n))})})};return n},JailedSite.prototype._reportRemoteSet=function(){this._connection.send({type:"interfaceSetAsRemote"})},JailedSite.prototype._wrap=function(e){for(var t=[],n={},r=!1,o=0;o<e.length;o++)"function"==typeof e[o]?(n[o]=e[o],t[o]={type:"callback",num:o},r=!0):t[o]={type:"argument",value:e[o]};var i={args:t};return r&&(i.callbackId=this._store.put(n)),i},JailedSite.prototype._unwrap=function(e){var t,n,r,o=!1,i=function(e){return function(){if(o){var t="A callback from this set has already been executed";throw new Error(t)}o=!0,e.apply(this,arguments)}},s=[];for(t=0;t<e.args.length;t++)n=e.args[t],"argument"==n.type?s.push(n.value):(r=i(this._genRemoteCallback(e.callbackId,t)),s.push(r));return s},JailedSite.prototype._genRemoteCallback=function(e,t){var n=this,r=function(){n._connection.send({type:"callback",id:e,num:t,args:n._wrap(arguments)})};return r},JailedSite.prototype.disconnect=function(){this._connection.send({type:"disconnect"}),this._connection.disconnect()},JailedSite.prototype.onDisconnect=function(e){this._disconnectHandler=e};var r=function(){this._store={},this._indices=[0]};r.prototype._genId=function(){var e;return e=1==this._indices.length?this._indices[0]++:this._indices.shift()},r.prototype._releaseId=function(e){for(var t=0;t<this._indices.length;t++)if(e<this._indices[t]){this._indices.splice(t,0,e);break}for(t=this._indices.length-1;t>=0&&this._indices[t]-1==this._indices[t-1];t--)this._indices.pop()},r.prototype.put=function(e){var t=this._genId();return this._store[t]=e,t},r.prototype.fetch=function(e){var t=this._store[e];return this._store[e]=null,delete this._store[e],this._releaseId(e),t},t.exports=JailedSite},{"es6-promise":5}],2:[function(e,t,n){!function(){var t=e("./_JailedSite"),n=new t(connection);delete t,delete connection,n.onGetInterface(function(){i()}),n.onRemoteUpdate(function(){application.remote=n.getRemote()});var r=!1,o=[],i=function(){if(!r){r=!0;for(var e;e=o.pop();)e()}},s=function(e){var t=typeof e;if("function"!=t){var n="A function may only be subsribed to the event, "+t+" was provided instead";throw new Error(n)}return e};application.whenConnected=function(e){e=s(e),r?e():o.push(e)},application.setInterface=function(e){n.setInterface(e)},application.disconnect=function(e){n.disconnect()}}()},{"./_JailedSite":1}],3:[function(require,module,exports){window.application={},window.connection={},window.addEventListener("message",function(e){var t=e.data.data;switch(t.type){case"import":case"importJailed":importScript(t.url);break;case"execute":execute(t.code);break;case"message":conn._messageHandler(t.data)}});var importScript=function(e){var t=function(){parent.postMessage({type:"importSuccess",url:e},"*")},n=function(){parent.postMessage({type:"importFailure",url:e},"*")},r=null;try{window.loadScript(e,t,n)}catch(o){r=o}if(r)throw r},execute=function(code){try{eval(code)}catch(e){throw parent.postMessage({type:"executeFailure"},"*"),e}parent.postMessage({type:"executeSuccess"},"*")},conn={disconnect:function(){},send:function(e){parent.postMessage({type:"message",data:e},"*")},onMessage:function(e){conn._messageHandler=e},_messageHandler:function(){},onDisconnect:function(){}};window.connection=conn,parent.postMessage({type:"initialized",dedicatedThread:!1},"*")},{}],4:[function(e,t,n){var r=document.getElementsByTagName("script"),o=r[r.length-1],i=o.parentNode,s=o.src.split("?")[0].split("/").slice(0,-1).join("/")+"/",a=function(){var e=[' self.addEventListener("message", function(m){   ','     if (m.data.type == "initImport") {          ',"         importScripts(m.data.url);              ","         self.postMessage({                      ",'             type : "initialized",               ',"             dedicatedThread : true              ","         });                                     ","     }                                           "," });                                             "].join("\n"),t=window.URL.createObjectURL(new Blob([e])),n=new Worker(t);n.postMessage({type:"initImport",url:s+"_worker.js"});var r=setTimeout(function(){n.terminate(),c()},300);n.addEventListener("message",function(e){"initialized"==e.data.type&&clearTimeout(r),parent.postMessage(e.data,"*")}),window.addEventListener("message",function(e){n.postMessage(e.data)})},c=function(){window.loadScript=function(e,n,r){var o=document.createElement("script");o.src=e;var s=function(){o.onload=null,o.onerror=null,o.onreadystatechange=null,o.parentNode.removeChild(o),t=function(){}},a=function(){s(),n()},c=function(){s(),r()};t=c,o.onerror=c,o.onload=a,o.onreadystatechange=function(){var e=o.readyState;("loaded"===e||"complete"===e)&&a()},i.appendChild(o)};var t=function(){};window.addEventListener("error",function(e){t()}),e("./_pluginWebIframe"),e("./_pluginCore")};try{a()}catch(u){c()}},{"./_pluginCore":2,"./_pluginWebIframe":3}],5:[function(e,t,n){(function(n,r){(function(){"use strict";function o(e){return"function"==typeof e||"object"==typeof e&&null!==e}function i(e){return"function"==typeof e}function s(e){return"object"==typeof e&&null!==e}function a(e){z=e}function c(e){K=e}function u(){return function(){n.nextTick(h)}}function f(){return function(){W(h)}}function p(){var e=0,t=new X(h),n=document.createTextNode("");return t.observe(n,{characterData:!0}),function(){n.data=e=++e%2}}function l(){var e=new MessageChannel;return e.port1.onmessage=h,function(){e.port2.postMessage(0)}}function d(){return function(){setTimeout(h,1)}}function h(){for(var e=0;Z>e;e+=2){var t=te[e],n=te[e+1];t(n),te[e]=void 0,te[e+1]=void 0}Z=0}function _(){try{var t=e,n=t("vertx");return W=n.runOnLoop||n.runOnContext,f()}catch(r){return d()}}function m(){}function v(){return new TypeError("You cannot resolve a promise with itself")}function y(){return new TypeError("A promises callback cannot return that same promise.")}function w(e){try{return e.then}catch(t){return ie.error=t,ie}}function g(e,t,n,r){try{e.call(t,n,r)}catch(o){return o}}function b(e,t,n){K(function(e){var r=!1,o=g(n,t,function(n){r||(r=!0,t!==n?A(e,n):k(e,n))},function(t){r||(r=!0,M(e,t))},"Settle: "+(e._label||" unknown promise"));!r&&o&&(r=!0,M(e,o))},e)}function S(e,t){t._state===re?k(e,t._result):t._state===oe?M(e,t._result):J(t,void 0,function(t){A(e,t)},function(t){M(e,t)})}function I(e,t){if(t.constructor===e.constructor)S(e,t);else{var n=w(t);n===ie?M(e,ie.error):void 0===n?k(e,t):i(n)?b(e,t,n):k(e,t)}}function A(e,t){e===t?M(e,v()):o(t)?I(e,t):k(e,t)}function E(e){e._onerror&&e._onerror(e._result),R(e)}function k(e,t){e._state===ne&&(e._result=t,e._state=re,0!==e._subscribers.length&&K(R,e))}function M(e,t){e._state===ne&&(e._state=oe,e._result=t,K(E,e))}function J(e,t,n,r){var o=e._subscribers,i=o.length;e._onerror=null,o[i]=t,o[i+re]=n,o[i+oe]=r,0===i&&e._state&&K(R,e)}function R(e){var t=e._subscribers,n=e._state;if(0!==t.length){for(var r,o,i=e._result,s=0;s<t.length;s+=3)r=t[s],o=t[s+n],r?j(n,r,o,i):o(i);e._subscribers.length=0}}function x(){this.error=null}function H(e,t){try{return e(t)}catch(n){return se.error=n,se}}function j(e,t,n,r){var o,s,a,c,u=i(n);if(u){if(o=H(n,r),o===se?(c=!0,s=o.error,o=null):a=!0,t===o)return void M(t,y())}else o=r,a=!0;t._state!==ne||(u&&a?A(t,o):c?M(t,s):e===re?k(t,o):e===oe&&M(t,o))}function T(e,t){try{t(function(t){A(e,t)},function(t){M(e,t)})}catch(n){M(e,n)}}function C(e,t){var n=this;n._instanceConstructor=e,n.promise=new e(m),n._validateInput(t)?(n._input=t,n.length=t.length,n._remaining=t.length,n._init(),0===n.length?k(n.promise,n._result):(n.length=n.length||0,n._enumerate(),0===n._remaining&&k(n.promise,n._result))):M(n.promise,n._validationError())}function L(e){return new ae(this,e).promise}function P(e){function t(e){A(o,e)}function n(e){M(o,e)}var r=this,o=new r(m);if(!G(e))return M(o,new TypeError("You must pass an array to race.")),o;for(var i=e.length,s=0;o._state===ne&&i>s;s++)J(r.resolve(e[s]),void 0,t,n);return o}function O(e){var t=this;if(e&&"object"==typeof e&&e.constructor===t)return e;var n=new t(m);return A(n,e),n}function U(e){var t=this,n=new t(m);return M(n,e),n}function q(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function Y(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function D(e){this._id=le++,this._state=void 0,this._result=void 0,this._subscribers=[],m!==e&&(i(e)||q(),this instanceof D||Y(),T(this,e))}function F(){var e;if("undefined"!=typeof r)e=r;else if("undefined"!=typeof self)e=self;else try{e=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=e.Promise;(!n||"[object Promise]"!==Object.prototype.toString.call(n.resolve())||n.cast)&&(e.Promise=de)}var N;N=Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)};var W,z,B,G=N,Z=0,K=({}.toString,function(e,t){te[Z]=e,te[Z+1]=t,Z+=2,2===Z&&(z?z(h):B())}),Q="undefined"!=typeof window?window:void 0,V=Q||{},X=V.MutationObserver||V.WebKitMutationObserver,$="undefined"!=typeof n&&"[object process]"==={}.toString.call(n),ee="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,te=new Array(1e3);B=$?u():X?p():ee?l():void 0===Q&&"function"==typeof e?_():d();var ne=void 0,re=1,oe=2,ie=new x,se=new x;C.prototype._validateInput=function(e){return G(e)},C.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},C.prototype._init=function(){this._result=new Array(this.length)};var ae=C;C.prototype._enumerate=function(){for(var e=this,t=e.length,n=e.promise,r=e._input,o=0;n._state===ne&&t>o;o++)e._eachEntry(r[o],o)},C.prototype._eachEntry=function(e,t){var n=this,r=n._instanceConstructor;s(e)?e.constructor===r&&e._state!==ne?(e._onerror=null,n._settledAt(e._state,t,e._result)):n._willSettleAt(r.resolve(e),t):(n._remaining--,n._result[t]=e)},C.prototype._settledAt=function(e,t,n){var r=this,o=r.promise;o._state===ne&&(r._remaining--,e===oe?M(o,n):r._result[t]=n),0===r._remaining&&k(o,r._result)},C.prototype._willSettleAt=function(e,t){var n=this;J(e,void 0,function(e){n._settledAt(re,t,e)},function(e){n._settledAt(oe,t,e)})};var ce=L,ue=P,fe=O,pe=U,le=0,de=D;D.all=ce,D.race=ue,D.resolve=fe,D.reject=pe,D._setScheduler=a,D._setAsap=c,D._asap=K,D.prototype={constructor:D,then:function(e,t){var n=this,r=n._state;if(r===re&&!e||r===oe&&!t)return this;var o=new this.constructor(m),i=n._result;if(r){var s=arguments[r-1];K(function(){j(r,o,s,i)})}else J(n,o,e,t);return o},"catch":function(e){return this.then(null,e)}};var he=F,_e={Promise:de,polyfill:he};"function"==typeof define&&define.amd?define(function(){return _e}):"undefined"!=typeof t&&t.exports?t.exports=_e:"undefined"!=typeof this&&(this.ES6Promise=_e),he()}).call(this)}).call(this,e("1YiZ5S"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"1YiZ5S":6}],6:[function(e,t,n){function r(){}var o=t.exports={};o.nextTick=function(){var e="undefined"!=typeof window&&window.setImmediate,t="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(e)return function(e){return window.setImmediate(e)};if(t){var n=[];return window.addEventListener("message",function(e){var t=e.source;if((t===window||null===t)&&"process-tick"===e.data&&(e.stopPropagation(),n.length>0)){var r=n.shift();r()}},!0),function(e){n.push(e),window.postMessage("process-tick","*")}}return function(e){setTimeout(e,0)}}(),o.title="browser",o.browser=!0,o.env={},o.argv=[],o.on=r,o.addListener=r,o.once=r,o.off=r,o.removeListener=r,o.removeAllListeners=r,o.emit=r,o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")}},{}]},{},[4]);