document.addEventListener("deviceready", onDeviceReady, false);
var app;
function onDeviceReady() {
    setTimeout(function() {
        navigator.splashscreen.hide();  
    }, 2000)
    //navigator.splashscreen.hide();
    
    app = new App();
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

var ide='-1';
var user;

var geoItem = {
    latitude:0,
    longitude:0   
};

var localStorageNew=[];
var localStorageActive=[];
var localStorageAll=[];
var currentItemDelivery = '';

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
            routeButton = document.getElementById("routeButton"),
            historyButton = document.getElementById("historyButton");
        
        //paginas
        $('#newItemRoute').on('pageshow',function(){
            //updateDataMap();
        });
        
        //paginas
        $('#newroute').on('pagebeforeshow',function(){
            var lsNew = localStorage.getItem('listNew');
            
            if(lsNew == '' || lsNew == undefined){
                localStorageNew = [];
            }else{
                localStorageNew = JSON.parse(lsNew);
            }
                
            createListNew()
        });
        
        //paginas
        /*$('#pageactive').on('pageload',function(){
            
            var lsNew = localStorage.getItem('listActive');
            
            if(lsNew == '' || lsNew == undefined){
                localStorageActive = [];
            }else{
                localStorageActive = JSON.parse(lsNew);
            }
                
            createListActive(false)
        });
        */
        //acciones
        logIn = document.getElementById("logIn");        
        logIn.addEventListener("click",
                               function() { 
                                   //navigator.notification.alert('demo')
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
                                              url: "http://agensedomicilio.agense.net/login.php",
                                              crossDomain: true,
                                              data: JSON.stringify(parametro),
                                              cache: false,
                                              success: function (info) {
                                                  $.mobile.loading("hide")
                                                  if (info.success) {
                                                      //localStorageApp.insertVariable('sessionDate', getCurrentDateA());
                                                      watchPosition();
                                                      localStorageAppLogin = getCurrentDateA();
                                                      
                                                      //localStorage.setItem('dataDelivery', JSON.stringify(dataDelivery));
                                                      //localStorage.getItem('dataDelivery');
                                                      ide = info.ide;
                                                      $.mobile.changePage("#newroute", { transition: "flip" });
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
        
        //nueva ruta
        routeButton.addEventListener("click",
                                    function() { 
                                        $.mobile.changePage("#newroute", { transition: "flip" });
                                    });
        
        document.getElementById("returnsettings").addEventListener("click",
                                    function() { 
                                        $.mobile.changePage("#pageactive", { transition: "flip" });
                                    });
        
        //estado entrega
        /*routeActiveButton.addEventListener("click",
                                      function() { 
                                          //that._selectedResult(1); 
                                      });*/
        historyButton.addEventListener("click",
                                    function() { 
                                        //that._selectedResult(0); 
                                        createHistory();
                                    });
        document.getElementById("returnActiveHistory").addEventListener("click",
                                    function() { 
                                        $.mobile.changePage("#pageactive", { transition: "flip" });
                                    });
        
        
        document.getElementById('moveFinished').addEventListener("click",
                                    function() { 
                                        finishList();    
                                    });
        
        //camera        
        //alert(navigator.camera);
        that._destinationType = navigator.camera.DestinationType;
        
        //trasladar a menu de acciones
        /*document.getElementById("moveSettings").addEventListener("click",
                                    function() { 
                                        $.mobile.changePage("#pagesettings", { transition: "flip" });
                                    });*/
        document.getElementById("returnAcive").addEventListener("click",
                                    function() { 
                                        $.mobile.changePage("#pageactive", { transition: "flip" });
                                    });
        document.getElementById("moveStepArrive").addEventListener("click",
                                    function() { 
                                        moveStep(1);
                                    });
        document.getElementById("moveStepDelivery").addEventListener("click",
                                    function() { 
                                        moveStep(2);
                                    });
                
        
        //nueva ruta
        document.getElementById("saveRoute").addEventListener("click",
                                    function() { 
                                        that._createRouteActive();
                                        $.mobile.changePage("#pageactive", { transition: "flip" });                                        
                                    });
        
        document.getElementById("newItem").addEventListener("click",
                                    function() { 
                                        
                                        $.mobile.changePage("#newItemRoute", { transition: "flip" });
                                        
                                    });
        
        
        //new item
        document.getElementById("returnNewRoute").addEventListener("click",
                                    function() { 
                                        
                                        $.mobile.changePage("#newroute", { transition: "flip" });
                                        
                                    });
        
        document.getElementById("takePhotoNewItem").addEventListener("click",
                                    function() { 
                                        that._capturePhoto();                                        
                                    });
        document.getElementById("saveNewItem").addEventListener("click",
                                    function() { 
                                        console.log('Save Item');
                                        that._saveItem();                                        
                                    });
        
        
        //var sessionDate = localStorageApp.getVariable('sessionDate');
        //var sessionDate = localStorageAppLogin;
        //if (sessionDate !== '' && sessionDate !== undefined && sessionDate == getCurrentDateA()) {            
         //   $.mobile.changePage("#home", { transition: "flip" });
        //}
    },
    //save item
    _saveItem:function(){
      
        var code = document.getElementById('newCode');
        
        //validaciones
        if($.trim(code.value) == ''){
            showAlert('Debe ingresar Nombre');
            return;
        }
        
        if(currentItem.imageURI == ''){
            showAlert('Debe de ingresar fotografía');
            return;
        }
         
        //nuevo elemento
        addItemListNew(code.value);
        $('#listAllNew').listview('refresh');
        
        var itemNew ={
          uuid: guid(),
          uuidr: '',
          user: user,
          code: code.value,
          imagenUri: currentItem.imageURI,
          position: geoItem,
          fecha: getCurrentDateA(),
          hora:getCurrentHour(),
          a: 0,
          aimagenUri: '',
          aposition: 0,
          afecha: 0,
          ahora:0,
          d:0,
          dimagenUri: '',
          dposition: 0,
          dfecha: 0,
          dhora:0,
          f:0,
          fimagenUri: '',
          fposition: 0,
          ffecha: 0,
          fhora:0,
        };
        
        //guarda elemento
        localStorageNew.push(itemNew);        
        updateStore(localStorageNew,'listNew')
        
        //limpiar valores
        currentItem.imageURI = '';
        code.value = '';        
        document.getElementById('previewTakePhoto').src = '';
        
        //regresar a pagina
        $.mobile.changePage("#newroute", { transition: "flip" });
        
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
        currentItem.imageURI = imageURI;
           
        //$.mobile.changePage("#decision", { transition: "flip" });        
        //console.log(currentItem.imagenURI);
        
        if(isFinish){
            finishedList(imageURI);
        }else if(currentCodeMoveStep != null){
            updateStateItemActive(imageURI);
        }else{
            document.getElementById('previewTakePhoto').src = imageURI;
        }
        
    },
    _onFail: function(message) {
        showAlert(message);
    },
   
    //crea nueva ruta
     _createRouteActive:function(){
         
        if(localStorageNew.length > 0){
             
           /* $.ajax({
              type: "POST",
              dataType: "json",
              url: "http://agensedomicilio.agense.net/login.php",
              crossDomain: true,
              data: JSON.stringify(parametro),
              cache: false,
              success: function (info) {
                  $.mobile.loading("hide")
                  if (info.success) {
                      //localStorageApp.insertVariable('sessionDate', getCurrentDateA());
                      watchPosition();
                      localStorageAppLogin = getCurrentDateA();
                      
                      $.mobile.changePage("#pageactive", { transition: "flip" });
                  }else {
                      showAlert('Usuario o contraseña incorrecta');
                  }                                                  
              },
              error: function (msg) {
                  $.mobile.loading("hide")
                  alert(msg);
              }
          });*/
            
            var uuidR = guid();
            localStorageNew.forEach(function(item,index){
                item.ide = ide;
                item.uuidr = uuidR;
                item.plat= geoItem.latitude;
                item.plon= geoItem.longitude;
                item.f= getCurrentDateA();
                item.h=getCurrentHour();
            })
            
            saveListActive();
            
            /*localStorageActive = localStorageNew;
            localStorageNew = [];
            localStorage.setItem('listNew','');
            localStorage.setItem('listActive',JSON.stringify(localStorageActive));
            
            
            
            $('#listAllNew').empty();
            $('#listAllNew').listview('refresh');
                        
            createListActive();
            
            $.mobile.changePage("#pageactive", { transition: "flip" });*/
        }
     }
};

function saveListActive(){
    
    localStorageActive = localStorageNew;
                        localStorageNew = [];
                        localStorage.setItem('listNew','');
                        localStorage.setItem('listActive',JSON.stringify(localStorageActive));
                        
                        $('#listAllNew').empty();
                        $('#listAllNew').listview('refresh');
                                    
    
    /*$.ajax({
              type: "POST",
              dataType: "json",
              url: "http://agensedomicilio.agense.net/uploadDataActive.php",
              crossDomain: true,
              data: JSON.stringify(localStorageNew),
              cache: false,
              success: function (info) {
                  $.mobile.loading("hide")
                  if (info.success) {
                        localStorageActive = localStorageNew;
                        localStorageNew = [];
                        localStorage.setItem('listNew','');
                        localStorage.setItem('listActive',JSON.stringify(localStorageActive));
                        
                        $('#listAllNew').empty();
                        $('#listAllNew').listview('refresh');
                                    
                        createListActive(true);
                        
                        $.mobile.changePage("#pageactive", { transition: "flip" });
                  }else {
                      showAlert('En estos momentos no se puede crear la ruta, inténtelo nuevamente');
                  }                                                  
              },
              error: function (msg) {
                 $.mobile.loading("hide");
                  showAlert('En estos momentos no se puede crear la ruta, inténtelo nuevamente');
                  //alert(msg);
              }
          });
    */
}

//actualiza estado item
function updateStateItemActive(imagenURI){

    currentCodeMoveStep.d = 1;
    currentCodeMoveStep.dimagenUri = imagenURI;
    //currentCodeMoveStep.dposition = geoItem;
    currentCodeMoveStep.dlat= geoItem.latitude;
    currentCodeMoveStep.dlon= geoItem.longitude;
    currentCodeMoveStep.dfecha= getCurrentDateA();
    currentCodeMoveStep.dhora=getCurrentHour();
    currentCodeMoveStep.dsend = 0;
    $("#delivery-" + currentCodeMoveStep.code).css('display','block');         
    
    //envia información de estado
        $.ajax({
              type: "POST",
              dataType: "json",
              url: "http://agensedomicilio.agense.net/uploadDataItem.php",
              crossDomain: true,
              data: JSON.stringify(currentCodeMoveStep),
              cache: false,
              success: function (info) {
                  $.mobile.loading("hide")
                  if (info.success) {
                        //currentCodeMoveStep.dsend = 1;
                  }else {
                      
                  }                                                  
              },
              error: function (msg) {                                 
                  //alert(msg);
              }
          });
    
    currentCodeMoveStep=null;
        
    //indexCurrent = -1;
    var isCompleate = true;
    localStorageActive.forEach(function(item,index){
       
        if(item.a === 1 && item.d === 1){
            
        }else{
            isCompleate = false;
        }        
        
    });
    
    if(isCompleate){
        $("#modalFinished").css('display','block');
    }
    
    $.mobile.changePage("#pageactive", { transition: "flip" });
}

//finaliza ruta
isFinish = false;
function finishList(){
    isFinish = true;
    app._capturePhoto();         
    
}
function finishedList(imageURI){
    
    
    //todo finish
    uploadDataImageFinish(localStorageActive[0].uuidr,imageURI);
    
    localStorageActive = [];
    
    createListActive(false);
    
    $("#modalFinished").css('display','none');    
    isFinish = false;
    showAlert('Ruta Finalizada');
}

//funcionalidad de borrado de elementos
var codeItemSelected;
function removeItem(code){
    console.log(code);
    codeItemSelected  = code;
    navigator.notification.confirm(
        '¿Está seguro de remover '+ code + '?', // message
         onConfirmRemove,            // callback to invoke with index of button pressed
        'Remover',           // title
        ['Si','No']     // buttonLabels
    );
        
}
function onConfirmRemove(btn){
    var itemIndex = -1;
    if(btn == 1){
        localStorageNew.forEach(function(item,index){
            if(item.code == codeItemSelected){
                itemIndex = index;
            }
        })
        
        if(itemIndex >-1){
            localStorageNew.splice(itemIndex, 1);

            updateStore(localStorageNew,'listNew')                        
            createListNew();
        }
    }
}
function updateStore(object,idStore){
    
    if(object){
        localStorage.setItem(idStore,JSON.stringify(object));
    }
    
}

//mantenimiento a lista activa
function createListActive(sendDataImage){
    $('#listAllActive').empty();
    localStorageActive.forEach(function(item,index){
        addItemListActive(item);
        if(sendDataImage){
            uploadDataImage(item.uuid,item.imagenUri);    
        } 
    });
    $('#listAllActive').listview('refresh');
};
function addItemListActive(item){
    var list = $('#listAllActive');
    
    var showItemD = item.d===1 ? '' : 'display:none;',
    showItemA = item.a===1 ? '' : 'display:none;';
    
    var code = item.code;
    var icons = '<span id="delivery-'+ code +'" class="material-icons" style="' + showItemD + 'margin: 12px 0px;float:right;font-size:24px;color:green">done_all</span><span id="arrive-'+ code +'" class="material-icons" style="' + showItemA + 'margin: 12px 0px;float:right;font-size:24px;color:red">room</span><span id="store-'+ code +'" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:blue">store</span>';
    list.append('<li onclick="moveToStep(\'' + code + '\')" id="itemNew-'+ code +'" data-icon="false"><a href="#">' + code + icons + '</a></li>');            
}

//mantenimiento a lista nueva
function createListNew(){
    $('#listAllNew').empty();
    localStorageNew.forEach(function(item,index){
        addItemListNew(item.code);
    });
    $('#listAllNew').listview('refresh');
};
function addItemListNew(code){
    var list = $('#listAllNew');
    //<a href="#"></a>
    list.append('<li id="itemNew-'+ code +'" data-icon="info"><span onclick="removeItem(\'' + code + '\')" class="material-icons" style="float: left;color:red">remove_circle</span><a href="#">' + code +  '</a></li>');            
}

//var currentCodeMoveStep;
var currentCodeMoveStep = null;
var indexCurrent = -1;
function moveToStep(code){
    
    //var code = currentCodeMoveStep;
    indexCurrent = -1;
    localStorageActive.forEach(function(item,index){
       
        if(item.code === code){
            indexCurrent = index;
            //currentCodeMoveStep = item;                             
        }        
    });
    
    currentCodeMoveStep = localStorageActive[indexCurrent];
    
    if(currentCodeMoveStep && (currentCodeMoveStep.a === 0 || currentCodeMoveStep.d === 0)){
        
        //document.getElementById('moveStepArrive').disabled = true;
        //document.getElementById('moveStepDelivery').disabled = true;
        $("#btnMoveStepArrive").addClass('disabledButton');
        $("#btnMoveStepDelivery").addClass('disabledButton');
        if(currentCodeMoveStep.a === 0){
            //document.getElementById('moveStepArrive').disabled = false;        
            $("#btnMoveStepArrive").removeClass('disabledButton');
        }else if(currentCodeMoveStep.d === 0){
            $("#btnMoveStepDelivery").removeClass('disabledButton');
            //document.getElementById('moveStepDelivery').disabled = false;        
        }
        $.mobile.changePage("#pageStep", { transition: "flip" });           
    }
         
}

//busca item activo para siguiente paso
function moveStep(ind){

    if(currentCodeMoveStep.a === 0){
        //send -1 no se envia 0 pendiente de actualizar 1 actualizado
        
        currentCodeMoveStep.a = 1;
        //currentCodeMoveStep.aposition = geoItem;
        currentCodeMoveStep.alat= geoItem.latitude;
        currentCodeMoveStep.alon= geoItem.longitude;
        currentCodeMoveStep.afecha= getCurrentDateA();
        currentCodeMoveStep.ahora=getCurrentHour();
        currentCodeMoveStep.asend = 0;
        currentCodeMoveStep.dsend = -1;
        
        //envia información de estado
        $.ajax({
              type: "POST",
              dataType: "json",
              url: "http://agensedomicilio.agense.net/uploadDataItem.php",
              crossDomain: true,
              data: JSON.stringify(currentCodeMoveStep),
              cache: false,
              success: function (info) {
                  $.mobile.loading("hide")
                  if (info.success) {
                        currentCodeMoveStep.asend = 1;
                  }else {
                      
                  }                                                  
              },
              error: function (msg) {                                 
                  //alert(msg);
              }
          });
        
        $("#arrive-"+currentCodeMoveStep.code).css('display','block');
        $.mobile.changePage("#pageactive", { transition: "flip" });
        
    }else if(currentCodeMoveStep.d === 0){
        //entregado                ;                
        //currentItemDelivery = item;
        app._capturePhoto();                
    } 
          
}


function getCurrentDateA() {
    var d = new Date(); 
    
    return (d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
}

function getCurrentHour(){
    var d = new Date();
    return (d.getHours() * 100) + d.getMinutes();
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
        //alert(msg);
    }
            
    return navigator.geolocation.watchPosition(onWeatherWatchSuccess, onWeatherError, { enableHighAccuracy: true });
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


function uploadDataImageFinish(uuidRecord,imageURI) {
    //var that = this;
    
    //var strCurrentItem = JSON.stringify(currentItem);
    //navigator.notification.alert(strCurrentItem);
    
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    var params = new Object();
        
    params.uuidRecord = uuidRecord;
    params.h = getCurrentHour();
    params.f = getCurrentDateA();
    params.lon = geoItem.longitude;
    params.lat = geoItem.latitude;
    
    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(imageURI, "http://agensedomicilio.agense.net/uploadImageFinish.php", imageWin, imageFail, options);               
    
    //$.mobile.changePage("#home", { transition: "flip" });
}

//send Data   
function uploadDataImage(uuidRecord,imageURI) {
    //var that = this;
    
    //var strCurrentItem = JSON.stringify(currentItem);
    //navigator.notification.alert(strCurrentItem);
    
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    var params = new Object();
        
/*    params.iddelivery = requestItem.barCode.substr(0, requestItem.barCode.indexOf('T'));
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
 */
    params.uuidRecord = uuidRecord;
    
    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(imageURI, "http://agensedomicilio.agense.net/uploadImage.php", imageWin, imageFail, options);               
    
    //$.mobile.changePage("#home", { transition: "flip" });
}
function imageWin (r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    //alert(r.response);
}
function imageFail(error) {
    //alert("An error has occurred: Code = " = error.code);
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function createHistory(){
 
    $.mobile.loading('show', {
    	text: 'Descargando Historial...',
    	textVisible: true
    });
    
    
    var parametro = {"user":user};
                                   
       $.ajax({
                  type: "POST",
                  dataType: "json",
                  url: "http://agensedomicilio.agense.net/getHistoryData.php",
                  crossDomain: true,
                  data: JSON.stringify(parametro),
                  cache: false,
                  success: function (info) {
                      $.mobile.loading("hide")
                      if (info.success) {
                          
                          
                          
                        $('#listAllHistory').empty();
                        info.data.forEach(function(item,index){
                            

                            var list = $('#listAllHistory');
                        
                            //var showItemD = item.d===1 ? '' : 'display:none;',
                            //showItemA = item.a===1 ? '' : 'display:none;';
                            
                            //var code = item.code;
                            //var icons = '<span id="delivery-'+ code +'" class="material-icons" style="' + showItemD + 'margin: 12px 0px;float:right;font-size:24px;color:green">done_all</span><span id="arrive-'+ code +'" class="material-icons" style="' + showItemA + 'margin: 12px 0px;float:right;font-size:24px;color:red">room</span><span id="store-'+ code +'" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:blue">store</span>';
                            list.append('<li  data-icon="false"><a href="#">' + item.ENTREGA + ' - ' + item.FECHA + ' ' + item.HORA + '</a></li>');            
                                              
                          
                            
                        });
                        $('#listAllHistory').listview('refresh');

                        
                          
                      }else {
                          //showAlert('Usuario o contraseña incorrecta');
                      }                                                  
                  },
                  error: function (msg) {
                      $.mobile.loading("hide")
                      alert(msg);
                  }
              });

    $.mobile.changePage("#pageHistory", { transition: "flip" });
    
}
var map;
function loadGeo() {
    if (!map) {
        //alert('create map')
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 14.598385,
                lng: -90.651017
            },
            zoom: 11
        });

        // var myLatlng = new google.maps.LatLng(-15.363882, 90.044922);
        //
        // marker = new google.maps.Marker({
        //     position: myLatlng,
        //     title: "Item"
        // });
        //
        // // To add the marker to the map, call setMap();
        // marker.setMap(map);
    }
}

var marker;
function updateDataMap() {


    if (marker && marker.setMap) marker.setMap(null);

    var data={
        long: geoItem.longitude,
        lat: geoItem.latitude
    };
    
    if (data.lat !== 0 && data.long !== 0) {
        var myLatlng = {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.long)
        };

        map.setCenter(new google.maps.LatLng(myLatlng.lat, myLatlng.lng));

        /*marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: 'Hello World!'
        });*/
        marker = new google.maps.Marker({
            position: myLatlng,
            title: "Hello World!"
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);
    }
      
}