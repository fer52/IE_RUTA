document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.hide();
    var app = new App();
    app.run();
}

function App() {
}

App.prototype = {
    resultsField: null,
     
    run: function() {
        var that = this,
        scanButton = document.getElementById("scanButton");
        
        that.resultsField = document.getElementById("result");
        
        scanButton.addEventListener("click",
                                    function() { 
                                        that._scan.call(that); 
                                    });
    },
    
    _scan: function() {
        var that = this;
        if (window.navigator.simulator === true) {
            alert("Not Supported in Simulator.");
        }
        else {
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if (!result.cancelled) {
                        that._addMessageToLog(result.format, result.text);    
                    }
                }, 
                function(error) {
                    alert("Scanning failed: " + error);
                });
        }
    },

    _addMessageToLog: function(format, text) {
        var that = this,
        currentMessage = that.resultsField.innerHTML,
        html = '<div class="row"><div class="col u-text-right"><label class="u-text-bold">' + format + '</label></div><div class="col u-text-left"><span class="u-color-accent">' + text + '</span></div></div>';
		
        that.resultsField.innerHTML = currentMessage + html;
    }
}