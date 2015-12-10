
/**
 * Contains the code executed in the sandboxed frame under web-browser
 * 
 * Tries to create a Web-Worker inside the frame and set up the
 * communication between the worker and the parent window. Some
 * browsers restrict creating a worker inside a sandboxed iframe - if
 * this happens, the plugin initialized right inside the frame (in the
 * same thread)
 */

require('file?name=_frame.html!./_frame.html');

var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length-1];
var parentNode = thisScript.parentNode;
var __jailed__pcath__ = thisScript.src
    .split('?')[0]
    .split('/')
    .slice(0, -1)
    .join('/')+'/';


/**
 * Initializes the plugin inside a webworker. May throw an exception
 * in case this was not permitted by the browser.
 */
var initWebworkerPlugin = function() {
    var WorkerScript = require("worker!./worker-index.js");

    var worker = new WorkerScript(blobUrl);

    // telling worker to load _pluginWebWorker.js (see blob code above)
    worker.postMessage({
        type: 'initImport',
        url: __jailed__path__ + '_worker.js'
    });


    // mixed content warning in Chrome silently skips worker
    // initialization without exception, handling this with timeout
    var fallbackTimeout = setTimeout(function() {
        console.warn('Failed to initialize web worker, falling back to iframe.')
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
    require('./_pluginWebIframe');
    require('./_pluginCore');
}



try {
    initWebworkerPlugin();
} catch(e) {
    initIframePlugin();
}

