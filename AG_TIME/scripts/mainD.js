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
        $('#pageactive').on('pageload',function(){
            var lsNew = localStorage.getItem('listActive');
            
            if(lsNew == '' || lsNew == undefined){
                localStorageActive = [];
            }else{
                localStorageActive = JSON.parse(lsNew);
            }
                
            createListActive()
        });
        
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
                                                      
                                                      $.mobile.changePage("#pageactive", { transition: "flip" });
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
            showAlert('Debe ingresar código');
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
                item.uuidr = uuidR;
                item.plat= geoItem.latitude;
                item.plon= geoItem.longitude;
                item.f= getCurrentDateA();
                item.h=getCurrentHour();
            })
            
            localStorageActive = localStorageNew;
            localStorageNew = [];
            localStorage.setItem('listNew','');
            localStorage.setItem('listActive',JSON.stringify(localStorageActive));
            
            saveListActive();
            
            $('#listAllNew').empty();
            $('#listAllNew').listview('refresh');
                        
            createListActive();
            
            $.mobile.changePage("#pageactive", { transition: "flip" });
        }
     }
};

function saveListActive(){
        
    $.ajax({
              type: "POST",
              dataType: "json",
              url: "http://agensedomicilio.agense.net/uploadDataActive.php",
              crossDomain: true,
              data: JSON.stringify(localStorageActive),
              cache: false,
              success: function (info) {
                  $.mobile.loading("hide")
                  if (info.success) {
                      //localStorageApp.insertVariable('sessionDate', getCurrentDateA());
                      //watchPosition();
                      //localStorageAppLogin = getCurrentDateA();
                      
                      //$.mobile.changePage("#pageactive", { transition: "flip" });
                  }else {
                      //showAlert('Usuario o contraseña incorrecta');
                  }                                                  
              },
              error: function (msg) {
                 // $.mobile.loading("hide")
                  //alert(msg);
              }
          });
    
}

//actualiza estado item
function updateStateItemActive(imagenURI){

    currentCodeMoveStep.d = 1;
    currentCodeMoveStep.dimagenUri = imagenURI;
    currentCodeMoveStep.dposition = geoItem;
    currentCodeMoveStep.dfecha= getCurrentDateA();
    currentCodeMoveStep.dhora=getCurrentHour();
    $("#delivery-" + currentCodeMoveStep.code).css('display','block');  
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
function finishedList(){
    localStorageActive = [];
    
    createListActive();
    
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
function createListActive(){
    $('#listAllActive').empty();
    localStorageActive.forEach(function(item,index){
        addItemListActive(item);
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
        currentCodeMoveStep.a = 1;
        currentCodeMoveStep.aposition = geoItem;
        currentCodeMoveStep.afecha= getCurrentDateA();
        currentCodeMoveStep.ahora=getCurrentHour();
        
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

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}