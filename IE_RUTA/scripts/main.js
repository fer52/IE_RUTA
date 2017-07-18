document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    setTimeout(function() {
        navigator.splashscreen.hide();  
    }, 2000)
    //navigator.splashscreen.hide();
    
    var app = new App();
    app.run();
}

function App() {
}

var currentItem = {
    latitude:0,
    longitude:0,
    imageURI:'',
    barCode:'',
    status: 0,
    lagginStatus:0,
    d:0,
    m:0,
    y:0,
    h:0,
    request: 0    
};

var geoItem = {
    latitude:0,
    longitude:0   
};

var user = '';
var localStorageAppLogin = '';

App.prototype = {
    latitude:0,
    longitude:0,
    listScann:[],
    resultsField: null,
    lastScann:'',    
    _pictureSource: null,    
    _destinationType: null,    
    run: function() {
        var that = this,
            scanButton = document.getElementById("scanButton");
        deliveredBtn = document.getElementById("deliveredBtn");
        laggingBtn = document.getElementById("laggingBtn");
        
        that.resultsField = document.getElementById("result");
        
        logIn = document.getElementById("logIn");
        
        logIn.addEventListener("click",
                               function() { 
                                   //navigator.notification.alert('demo')
                                   $.mobile.loading("show", {
                                                        text: 'Componente de Cámara no encontrado',
                                                        textVisible: true,
                                                        theme: 'a',
                                                        textonly: false
                                                    });
                                   return;
                                   $.mobile.loading("show", {
                                                        text: 'Verificando...',
                                                        textVisible: true,
                                                        theme: 'a',
                                                        textonly: false
                                                    });
                                   user = document.getElementById("userName").value.toString().toUpperCase();
                                   var parametro = {"user":user,"pw":document.getElementById("pwd").value.toString()};
                                   
                                   $.ajax({
                                              type: "POST",
                                              dataType: "json",
                                              url: "http://agensedashboard.websolutions.com.gt/login.php",
                                              crossDomain: true,
                                              data: JSON.stringify(parametro),
                                              cache: false,
                                              success: function (info) {
                                                  $.mobile.loading("hide")
                                                  if (info.success) {
                                                      //localStorageApp.insertVariable('sessionDate', getCurrentDateA());
                                                      watchPosition();
                                                      localStorageAppLogin = getCurrentDateA();
                                                      $.mobile.changePage("#home1", { transition: "flip" });
                                                  }else {
                                                      showAlert('Usuario o contraseña incorrecta');
                                                  }                                                  
                                              },
                                              error: function (msg) {
                                                  $.mobile.loading("hide")
                                                  alert(msg);
                                              }
                                          });
                                   /*if (document.getElementById("userName").value.toString().toLowerCase() == 'administrador' && document.getElementById("pwd").value.toString().toLowerCase() == '1234') {
                                   $.mobile.changePage("#home", { transition: "flip" });
                                   }else {
                                   alert('Usuario o contraseña incorrecta')
                                   }*/
                               });
        
        //scann
        scanButton.addEventListener("click",
                                    function() { 
                                        that._scan.call(that); 
                                    });
        
        //estado entrega
        deliveredBtn.addEventListener("click",
                                      function() { 
                                          that._selectedResult(1); 
                                      });
        laggingBtn.addEventListener("click",
                                    function() { 
                                        that._selectedResult(0); 
                                    });
        
        //estado de rezago
        document.getElementById('laggingBtn1').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(1); 
                                                                });
        document.getElementById('laggingBtn2').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(2); 
                                                                });
        document.getElementById('laggingBtn3').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(3); 
                                                                });
        document.getElementById('laggingBtn4').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(4); 
                                                                });
        document.getElementById('laggingBtn5').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(5); 
                                                                });
        document.getElementById('laggingBtn6').addEventListener("click",
                                                                function() { 
                                                                    that._selectedResultLagging(6); 
                                                                });
        
        //camera        
        //alert(navigator.camera);
        that._destinationType = navigator.camera.DestinationType;
        
        //var sessionDate = localStorageApp.getVariable('sessionDate');
        var sessionDate = localStorageAppLogin;
        if (sessionDate !== '' && sessionDate !== undefined && sessionDate == getCurrentDateA()) {            
            $.mobile.changePage("#home", { transition: "flip" });
        }
    },
    
    _scan: function() {
        var that = this;
        if (window.navigator.simulator === true) {
            alert("Not Supported in Simulator.");
        } else {
            //var config = {formats:'RSS_EXPANDED',orientation:'landscape'};
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if (!result.cancelled) {
                        //that._addMessageToLog(result.format, result.text);    
                        that._nextPassScann(result.format, result.text);
                    }
                }, 
                function(error) {
                    alert("Scanning failed: " + error);
                })
            //,                config);
        }
    },
    _nextPassScann:function(format, text) {
        var that = this;
        //navigator.notification.alert('Lectura completa');
        alert('Lectura de código de barra completada');
        //info bar code
        currentItem.barCode = text;
        
        //alert('scann completo');       
        
        that._capturePhoto();
    },
    
    //capture photo
    _capturePhoto: function() {
        var that = this;
        
        // Take picture using device camera and retrieve image as base64-encoded string.
        navigator.camera.getPicture(function() {
            //that._uploadPhoto.apply(that, arguments);
            that._onPhotoDataSuccess.apply(that, arguments);
        }, function() {
            that._onFail.apply(that, arguments);
        }, {
                                        //quality: 30,
                                        destinationType: that._destinationType.FILE_URI, //DATA_URL
                                        targetWidth: 800,
                                        targetHeight: 600
                                        //sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM 
                                    });
    },
    _onPhotoDataSuccess: function(imageURI) {
        //alert('photo success');
        //alert(imageData.toString());
        currentItem.imageURI = imageURI;
        
        navigator.notification.alert('Fotografía de comprobante completada')
        
        $.mobile.changePage("#decision", { transition: "flip" });
        /*alert(imageData.length);*/
        /*var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';
        // Show the captured photo.
        smallImage.src = "data:image/jpeg;base64," + imageData;*/
    },
    _onFail: function(message) {
        //alert(message);
        //navigator.notification.confirm
        var that = this;
        that._capturePhoto();
    },
 
    //selected decision
    _selectedResult:function(status) {
        var that = this;
        
        /*alert(that.lastScann)
        alert(status)*/
        
        currentItem.status = status;
        
        if (status == 0) {
            $.mobile.changePage("#decisionRezago", { transition: "flip" });
        }else {
            currentItem.lagginStatus = 0;
            that._uploadData();    
        }
        /*var parametro = { action: 'changeStatus2', key:that.lastScann, keyStatus:status};
        $.ajax({
        type: "POST",
        dataType: "json",
        url: "http://agense.inversioneselmer.net/authentication.ashx",
        crossDomain: true,
        data: parametro,
        cache: false,
        success: function (info) {
        //alert(info);
        },
        error: function (msg) {
        //alert(msg);
        }
        });
        $.mobile.changePage("#home", { transition: "flip" });*/
    },
    
    //selected decision
    _selectedResultLagging:function(status) {
        var that = this;
        
        /*alert(that.lastScann)
        alert(status)*/
        
        currentItem.lagginStatus = status;

        that._uploadData();    
    },
    
    //send Data   
    _uploadData:function() {
        var that = this;
        
        //var strCurrentItem = JSON.stringify(currentItem);
        //navigator.notification.alert(strCurrentItem);
        
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = currentItem.imageURI.substr(currentItem.imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
 
        var params = new Object();
        
        //(d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
        var d = new Date();   
        var requestItem = {
            latitude:geoItem.latitude,
            longitude:geoItem.longitude,
            imageURI:currentItem.imageURI,
            barCode:currentItem.barCode,
            status: currentItem.status,
            lagginStatus:currentItem.lagginStatus,
            d:d.getDate(),
            m:(d.getMonth() + 1),
            a:d.getFullYear(),
            h:d.getHours() * 100 + d.getMinutes(),
            user: user,
            request: 0    
        };
        
        
        params.iddelivery = requestItem.barCode.substr(0, requestItem.barCode.indexOf('T'));
        params.barCode = requestItem.barCode;
        params.d = requestItem.d;
        params.m = requestItem.m;
        params.a = requestItem.a;
        params.h = requestItem.h;
        params.motivo = requestItem.lagginStatus;
        params.estado = requestItem.status;
        params.iduser = requestItem.user;
        params.latitud = requestItem.latitude;
        params.longitud = requestItem.longitude;
        
        dataDelivery = localStorage.getItem('dataDelivery');
        
        if (dataDelivery == '' || dataDelivery == undefined) {
            dataDelivery = [];   
        }else {
            dataDelivery = JSON.parse(dataDelivery);   
        }
        dataDelivery.push(requestItem);        
        
        localStorage.setItem('dataDelivery', JSON.stringify(dataDelivery));
        
        //alert(JSON.stringify(currentItem));
        
        options.params = params;
        options.chunkedMode = false;
 
        var ft = new FileTransfer();
        ft.upload(currentItem.imageURI, "http://agensedashboard.websolutions.com.gt/uploadImage.php", that._win, that._fail, options);               
        
        $.mobile.changePage("#home", { transition: "flip" });
    },
    _win:function (r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
        //alert(r.response);
    }, 
    _fail:function (error) {
        //alert("An error has occurred: Code = " = error.code);
    },
    
    
    _addMessageToLog: function(format, text) {
        var that = this;
        that.lastScann = text.substr(0, text.indexOf('T'));
        $.mobile.changePage("#decision", { transition: "flip" });
        /*currentMessage = that.resultsField.innerHTML,
        html = '<div class="row"><div class="col u-text-right"><label class="u-text-bold">' + format + '</label></div><div class="col u-text-left"><span class="u-color-accent">' + text + '</span></div></div>';
        that.resultsField.innerHTML = currentMessage + html;*/
    },        
       
}

function getCurrentDateA() {
    var d = new Date(); 
    
    return (d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
}

function showAlert(text) {
    navigator.notification.alert(text,
                                 function() {
                                     //that._alertDismissed.apply(that, arguments);
                                 },
                                 'Información', 
                                 'Ok'     
        );    
}

// Watch your changing position  
function watchPosition() {
    // Success callback for watching your changing position 
    var onWeatherWatchSuccess = function (position) {
        var updatedLatitude = position.coords.latitude;
        var updatedLongitude = position.coords.longitude;
 
        //if (updatedLatitude != geoItem.latitude && updatedLongitude != geoItem.longitude) {
        geoItem.latitude = updatedLatitude;
        geoItem.longitude = updatedLongitude;
        // Calls function we defined earlier. 
        //getWeather(updatedLatitude, updatedLongitude);
        //}
    }
    
    var onWeatherError = function(msg) {
        alert(msg);
    }
            
    return navigator.geolocation.watchPosition(onWeatherWatchSuccess, onWeatherError, { enableHighAccuracy: true });
}