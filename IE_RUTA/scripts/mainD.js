document.addEventListener("deviceready", onDeviceReady, false);

var app;

//<a href="waze://?ll=latitude,longitude">Waze</a>

function onDeviceReady() {
    setTimeout(function() {
        navigator.splashscreen.hide();  
    }, 2000)
    
    app = new App();
    app.run();
}

function App() {
}

var currentInfo = {
    idRoute:'',
    idUser: ''
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

var listDetailRoute = [];

var ide = '-1';
var user;

var geoItem = {
    latitude:0,
    longitude:0   
};

var localStorageNew = [];
var localStorageActive = [];
var localStorageAll = [];
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
        
        //pagina detalle de ruta
        $('#newroute').on('pagebeforeshow', function() {
            $.mobile.loading("show", {
                                 text: 'Descargando Detalle...',
                                 textVisible: true,
                                 theme: 'a',
                                 textonly: false
                             });
            
            var parametro = {"id":currentInfo.idUser, "idR": currentInfo.idRoute};                                   
            $.ajax({
                       type: "POST",
                       dataType: "json",
                       url: getURL("processDetailRoute.php"),
                       crossDomain: true,
                       data: JSON.stringify(parametro),
                       cache: false,
                       success: function (info) {
                           $.mobile.loading("hide")
                           if (info.success) {
                               listDetailRoute = info.Rows;
                               createListDetail(info.Rows);
                           }else {
                               listDetailRoute = [];
                               showAlert('Reintente la petición');
                           }                                                  
                       },
                       error: function (msg) {
                           listDetailRoute = [];
                           $.mobile.loading("hide")
                           alert(msg.responseText)
                       }
                   });
        });
        
        //pagina inicial
        $('#pageactive').on('pagebeforeshow', function() {
            $.mobile.loading("show", {
                                 text: 'Descagando Rutas...',
                                 textVisible: true,
                                 theme: 'a',
                                 textonly: false
                             });
            var parametro = {"id":currentInfo.idUser};
                                   
            $.ajax({
                       type: "POST",
                       dataType: "json",
                       url: getURL("processRoute.php"),
                       crossDomain: true,
                       data: JSON.stringify(parametro),
                       cache: false,
                       success: function (info) {
                           $.mobile.loading("hide")
                           if (info.success) {
                               createListActive(info.Rows);
                           }else {
                               showAlert('Reintente la petición');
                           }                                                  
                       },
                       error: function (msg) {
                           $.mobile.loading("hide")
                           alert(msg);
                       }
                   });
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
                                              url: getURL("login.php"),
                                              crossDomain: true,
                                              data: JSON.stringify(parametro),
                                              cache: false,
                                              success: function (info) {
                                                  $.mobile.loading("hide")
                                                  if (info.success) {
                                                      //localStorageApp.insertVariable('sessionDate', getCurrentDateA());
                                                      //watchPosition();
                                                      //localStorageAppLogin = getCurrentDateA();
                                                      //localStorage.setItem('dataDelivery', JSON.stringify(dataDelivery));
                                                      //localStorage.getItem('dataDelivery');
                                                      //ide = info.ide;
                                                      currentInfo.idUser = info.id;
                                                      $.mobile.loading("hide");
                                                      $.mobile.changePage("#pageactive", { transition: "flip" });
                                                      
                                                      if (info.isOwner == 1) {
                                                          $("#createUser").css('display', 'block');    
                                                      }else {
                                                          $("#createUser").css('display', 'none');    
                                                      }
                                                  }else {
                                                      showAlert('Usuario o contraseña incorrecta');
                                                  }                                                  
                                              },
                                              error: function (msg) {
                                                  $.mobile.loading("hide")
                                                  alert(msg);
                                              }
                                          });
                                   /*if (parametro.user == "ADMIN" && parametro.pw == "4321") {
                                   $.mobile.changePage("#pageactive", { transition: "flip" });
                                   }else {
                                   showAlert('Usuario o contraseña incorrecta');
                                   }*/
                                   //$.mobile.loading("hide")
                               });
        
        //logOut
        document.getElementById("logOut").addEventListener("click",
                                                           function() { 
                                                               document.getElementById('userName').value = '';
                                                               document.getElementById('pwd').value = '';
                                                               $.mobile.changePage("#logon1", { transition: "flip" });
                                                           });
        
        //nuevo usuario
        document.getElementById("createUser").addEventListener("click",
                                                               function() { 
                                                                   $.mobile.changePage("#pageUser", { transition: "flip" });
                                                               });
        
        document.getElementById("returnInitActive").addEventListener("click",
                                                                     function() { 
                                                                         $.mobile.changePage("#pageactive", { transition: "flip" });
                                                                     });
        
        document.getElementById("saveNewUser").addEventListener("click",
                                                                function() { 
                                                                    //validaciones
                                                                    if ($.trim(document.getElementById('nameUser').value) == '') {
                                                                        showAlert('Debe ingresar Nombre');
                                                                        return;
                                                                    }
                                                                    if ($.trim(document.getElementById('idUser').value) == '') {
                                                                        showAlert('Debe ingresar id para ingreso a Aplicación');
                                                                        return;
                                                                    }        
                                                                    if ($.trim(document.getElementById('pwUser').value) == '') {
                                                                        showAlert('Debe ingresar contraseña');
                                                                        return;
                                                                    }        
                                                                    
                                                                    $.mobile.loading("show", {
                                                                                         text: 'Guardando Usuario...',
                                                                                         textVisible: true,
                                                                                         theme: 'a',
                                                                                         textonly: false
                                                                                     });
                                                                    
                                                                    var param = {
                                                                        "name":document.getElementById('nameUser').value,
                                                                        "idus":document.getElementById('idUser').value,
                                                                        "pw":document.getElementById('pwUser').value
                                                                    };
                                                                    
                                                                    $.ajax({
                                                                               type: "POST",
                                                                               dataType: "json",
                                                                               url: getURL("createUser.php"),
                                                                               crossDomain: true,
                                                                               data: JSON.stringify(param),
                                                                               cache: false,
                                                                               success: function (info) {
                                                                                   $.mobile.loading("hide")
                                                                                   if (info.success) {
                                                                                       $.mobile.changePage("#pageactive", { transition: "flip" });
                                                                                   }else {
                                                                                       showAlert('Intente nuevamente');
                                                                                   }   
                                                                               },
                                                                               error: function (msg) {
                                                                                   $.mobile.loading("hide")
                                                                                   alert(msg);
                                                                               }
                                                                           });
                                                                });
        
        //nueva ruta
        routeButton.addEventListener("click",
                                     function() { 
                                         navigator.notification.prompt(
                                             'Ingrese nombre de Ruta', 
                                             getNameRoute, // callback to invoke
                                             'Ruta', // title
                                             ['Guardar','Cancelar']
                                             );
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
        /*historyButton.addEventListener("click",
        function() { 
        //that._selectedResult(0); 
        createHistory();
        });*/
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
        /*document.getElementById("returnAcive").addEventListener("click",
        function() { 
        $.mobile.changePage("#pageactive", { transition: "flip" });
        });*/
        /*document.getElementById("moveStepArrive").addEventListener("click",
        function() { 
        moveStep(1);
        });*/
        /*document.getElementById("moveStepDelivery").addEventListener("click",
        function() { 
        moveStep(2);
        });
        */
        
        //nueva ruta
        /*document.getElementById("saveRoute").addEventListener("click",
        function() { 
        that._createRouteActive();
        $.mobile.changePage("#pageactive", { transition: "flip" });                                        
        });*/
  
        //TODO
        //nuevo elemento de ruta
        document.getElementById("newItemR").addEventListener("click",
                                                             function() { 
                                                                 console.log('click new item')
                                                                 document.getElementById('saveNewItem').style.display = 'block';
                                                                 document.getElementById('takePhotoNewItem').style.display = 'block';
                                                                 document.getElementById('routeWaze').style.display = 'none';
                                                                 
                                                                 var name = document.getElementById('name'),
                                                                     idCustomer = document.getElementById('idCustomer'),
                                                                     address = document.getElementById('address'),
                                                                     tel = document.getElementById('tel');  
                                                                 
                                                                 currentItem.imageURI = '';      
                                                                 document.getElementById('previewTakePhoto').src = '';
                                                                 name.value = '';
                                                                 idCustomer.value = '';
                                                                 address.value = '';
                                                                 tel.value = '';
                                                                 
                                                                 $.mobile.changePage("#newItemRoute", { transition: "flip" });
                                                             });
        
        //eliminar ruta
        document.getElementById("deleteRoute").addEventListener("click",
                                                                function() { 
                                                                    var nm = document.getElementById('nameRoute').value;
                                                                    navigator.notification.confirm(
                                                                        '¿Está seguro de borrar la ruta: ' + nm + '?', // message
                                                                        function(btn) {
                                                                            //currentInfo.idRoute
                                                                            if (btn == 1) {
                                                                                var param = {idR: currentInfo.idRoute};
        
                                                                                $.mobile.loading("show", {
                                                                                                     text: 'Borrando...',
                                                                                                     textVisible: true,
                                                                                                     theme: 'a',
                                                                                                     textonly: false
                                                                                                 });
        
                                                                                $.ajax({
                                                                                           type: "POST",
                                                                                           dataType: "json",
                                                                                           url: getURL("deleteRoute.php"),
                                                                                           crossDomain: true,
                                                                                           data: JSON.stringify(param),
                                                                                           cache: false,
                                                                                           success: function (info) {
                                                                                               $.mobile.loading("hide")
                                                                                               if (info.success) {
                                                                                                   $.mobile.changePage("#pageactive", { transition: "flip" });
                                                                                                   currentInfo.idRoute = '';
                                                                                               }else {
                                                                                                   //currentInfo.idRoute = ''
                                                                                                   showAlert('Intente nuevamente');
                                                                                               }   
                                                                                           },
                                                                                           error: function (msg) {
                                                                                               $.mobile.loading("hide")
                                                                                               alert(msg);
                                                                                           }
                                                                                       });
                                                                            }
                                                                        },
                                                                        'Remover', // title
                                                                        ['Si','No']     // buttonLabels
                                                                        );
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
                                                                    //console.log('Save new Item');
                                                                    //showAlert('Conexión no establecida, intente nuevamente');
                                                                    that._saveItem();                                        
                                                                });
        
        //cambiar contraseña
        document.getElementById('changePassword').addEventListener("click",
                                                                   function() { 
                                                                       navigator.notification.prompt(
                                                                           'Ingrese nueva contraseña', 
                                                                           function(result) {
                                                                               if (result.buttonIndex == 1) {
                                                                                   var param = {pw: result.input1, user:currentInfo.idUser}
        
                                                                                   if ($.trim(result.input1) == '') {
                                                                                       showAlert('Ingrese valor valido')   
                                                                                       return;
                                                                                   }
        
                                                                                   $.mobile.loading("show", {
                                                                                                        text: 'Cambiando Contraseña...',
                                                                                                        textVisible: true,
                                                                                                        theme: 'a',
                                                                                                        textonly: false
                                                                                                    });
        
                                                                                   $.ajax({
                                                                                              type: "POST",
                                                                                              dataType: "json",
                                                                                              url: getURL("changePw.php"),
                                                                                              crossDomain: true,
                                                                                              data: JSON.stringify(param),
                                                                                              cache: false,
                                                                                              success: function (info) {
                                                                                                  $.mobile.loading("hide")
                                                                                                  if (info.success) {
                                                                                                      showAlert('Cambio exitoso de contraseña!');
                                                                                                  }else {
                                                                                                      showAlert('Intente nuevamente');
                                                                                                  }                                                  
                                                                                              },
                                                                                              error: function (msg) {
                                                                                                  $.mobile.loading("hide")
                                                                                                  alert(msg);
                                                                                              }
                                                                                          });
                                                                               }else {
                                                                               }
                                                                           },
                                                                           'Contraseña', // title
                                                                           ['Aceptar','Cancelar']
                                                                           );
                                                                   });
        
        //document.getElementById('')
        $("#searchCliente").change(function() {
            var lstItems = $("#listAllNew");
            
            var listItems = $('.itemDetailRoute');
            var textSearch = this.value.toString();
            if ($.trim(textSearch) != "") {
                listItems.each(function(it, i) {
                    if ($(i).attr('datanamedetail').toString().toUpperCase().indexOf(textSearch.toUpperCase()) > -1) {
                        $(i).css("display", "block");
                    }else {
                        $(i).css("display", "none");
                    }
                })
            }else {
                listItems.each(function(it, i) {
                    $(i).css("display", "block");
                })      
            }
            //list.append('<li id="itemNew-' + code + '" class="itemDetailRoute" data-nameDetail="' + name + '" data-icon="info"><span onclick="removeItem(\'' + code + '\',\'' + name + '\')" class="material-icons" style="float: left;color:red">remove_circle</span><a onclick="viewItemRouteD(\'' + code + '\')" href="#">' + name + '</a></li>');            
        });
        //var sessionDate = localStorageApp.getVariable('sessionDate');
        //var sessionDate = localStorageAppLogin;
        //if (sessionDate !== '' && sessionDate !== undefined && sessionDate == getCurrentDateA()) {            
        //   $.mobile.changePage("#home", { transition: "flip" });
        //}
    },
    //save item
    _saveItem:function() {
        var name = document.getElementById('name'),
            idCustomer = document.getElementById('idCustomer'),
            address = document.getElementById('address'),
            tel = document.getElementById('tel');                
        
        //validaciones
        if ($.trim(name.value) == '') {
            showAlert('Debe ingresar Nombre');
            return;
        }
        if ($.trim(idCustomer.value) == '') {
            showAlert('Debe ingresar identificación');
            return;
        }        
        if ($.trim(address.value) == '') {
            showAlert('Debe ingresar dirección');
            return;
        }        
        if ($.trim(tel.value) == '') {
            showAlert('Debe ingresar número Telefonico');
            return;
        }        
        if (currentItem.imageURI == '') {
            showAlert('Debe de ingresar fotografía');
            return;
        }
        
        $.mobile.loading("show", {
                             text: 'Guardando...',
                             textVisible: true,
                             theme: 'a',
                             textonly: false
                         });
                        
        var itemNew = {
            uuid: guid(),
            uuidRoute: currentInfo.idRoute,
            user: currentInfo.idUser,
            //position: geoItem,
            positionlat: geoItem.latitude,
            positionlon: geoItem.longitude,
            //fecha: getCurrentDateA(),
            //hora:getCurrentHour(),
            name: name.value,
            idCus: idCustomer.value,
            address: address.value,
            tel: tel.value
        };
          
        uploadDataImage(itemNew, currentItem.imageURI);
    },
    //capture photo
    _capturePhoto: function() {
        var that = this;
        
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true  //Corrects Android orientation quirks
        };
        
        /*{
        quality: 50,
        destinationType: Camera.DestinationType.NATIVE_URI, //DATA_URL
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        //targetWidth: 800,
        //targetHeight: 600,
        //sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM 
        }*/        
        // Take picture using device camera and retrieve image as base64-encoded string.
        /*navigator.camera.getPicture(function() {
        //that._uploadPhoto.apply(that, arguments);
        that._onPhotoDataSuccess.apply(that, arguments);
        }, function() {
        that._onFail.apply(that, arguments);
        }, options);*/
        
        navigator.camera.getPicture(function cameraSuccess(imageUri) {
            //displayImage(imageUri);
            // You may choose to copy the picture, save it somewhere, or upload.
            //func(imageUri);
            that._onPhotoDataSuccess(imageUri)
        }, function cameraError(error) {
            //console.debug("Unable to obtain picture: " + error, "app");
            showAlert("Unable to obtain picture: " + error, "app");
        }, options);
    },
    _onPhotoDataSuccess: function(imageURI) {
        try {
            //showAlert(imageURI);
            currentItem.imageURI = imageURI;                  
            document.getElementById('previewTakePhoto').src = imageURI;
        }catch (exT) {
            showAlert(exT);    
        }
    },
    _onFail: function(message) {
        showAlert(message);
    },
   
    //crea nueva ruta
    _createRouteActive:function() {
        if (localStorageNew.length > 0) {
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
            localStorageNew.forEach(function(item, index) {
                item.ide = ide;
                item.uuidr = uuidR;
                item.plat = geoItem.latitude;
                item.plon = geoItem.longitude;
                item.f = getCurrentDateA();
                item.h = getCurrentHour();
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

function saveListActive() {
    localStorageActive = localStorageNew;
    localStorageNew = [];
    localStorage.setItem('listNew', '');
    localStorage.setItem('listActive', JSON.stringify(localStorageActive));
                        
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
function updateStateItemActive(imagenURI) {
    currentCodeMoveStep.d = 1;
    currentCodeMoveStep.dimagenUri = imagenURI;
    //currentCodeMoveStep.dposition = geoItem;
    currentCodeMoveStep.dlat = geoItem.latitude;
    currentCodeMoveStep.dlon = geoItem.longitude;
    currentCodeMoveStep.dfecha = getCurrentDateA();
    currentCodeMoveStep.dhora = getCurrentHour();
    currentCodeMoveStep.dsend = 0;
    $("#delivery-" + currentCodeMoveStep.code).css('display', 'block');         
    
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
    
    currentCodeMoveStep = null;
        
    //indexCurrent = -1;
    var isCompleate = true;
    localStorageActive.forEach(function(item, index) {
        if (item.a === 1 && item.d === 1) {
        }else {
            isCompleate = false;
        }        
    });
    
    if (isCompleate) {
        $("#modalFinished").css('display', 'block');
    }
    
    $.mobile.changePage("#pageactive", { transition: "flip" });
}

//finaliza ruta
isFinish = false;
function finishList() {
    isFinish = true;
    app._capturePhoto();         
}
function finishedList(imageURI) {
    //todo finish
    uploadDataImageFinish(localStorageActive[0].uuidr, imageURI);
    
    localStorageActive = [];
    
    createListActive(false);
    
    $("#modalFinished").css('display', 'none');    
    isFinish = false;
    showAlert('Ruta Finalizada');
}

//funcion para revision de detalle
function viewItemRouteD(code) {
    $.mobile.loading("show", {
                         text: 'Descargando Detalle...',
                         textVisible: true,
                         theme: 'a',
                         textonly: false
                     });
    
    $.mobile.changePage("#newItemRoute", { transition: "flip" });
    
    var itemSel;
    listDetailRoute.forEach(function(item, index) {
        if (item.ID === code) {
            itemSel = item;
        }
    });
 
    var name = document.getElementById('name'),
        idCustomer = document.getElementById('idCustomer'),
        address = document.getElementById('address'),
        tel = document.getElementById('tel');  
    
    name.value = itemSel.CUSTOMER;
    idCustomer.value = itemSel.CUSTOMERID;
    address.value = itemSel.CUSTOMERADDRESS;    
    tel.value = itemSel.CUSTOMERPHONE;
    document.getElementById('previewTakePhoto').src = getURL('imageRecord/' + code + '.jpg');
    
    document.getElementById('saveNewItem').style.display = 'none';
    document.getElementById('takePhotoNewItem').style.display = 'none';
    document.getElementById('routeWaze').style.display = 'block';
    
    document.getElementById('routeWaze').href = "https://waze.com/ul?ll=" + itemSel.GLATITUDE + "," + itemSel.GLONGITUDE + "&navigate=yes&pin=1";
    //document.getElementById('routeWaze').href = "waze://ul?ll=" + itemSel.GLATITUDE + "," + itemSel.GLONGITUDE + "&navigate=yes&pin=1";
}

//funcionalidad de borrado de elementos
var codeItemSelected;

function removeItem(code, name) {
    codeItemSelected = code;
    navigator.notification.confirm(
        '¿Está seguro de remover a: ' + name + '?', // message
        onConfirmRemove, // callback to invoke with index of button pressed
        'Remover', // title
        ['Si','No']     // buttonLabels
        );
}
function onConfirmRemove(btn) {
    var itemIndex = -1;
    if (btn == 1) {
        //name: result.input1,guid:currentInfo.idRoute,user:currentInfo.idUser
        var param = {idRemove: codeItemSelected, idR: currentInfo.idRoute};
        
        $.mobile.loading("show", {
                             text: 'Borrando...',
                             textVisible: true,
                             theme: 'a',
                             textonly: false
                         });
        
        $.ajax({
                   type: "POST",
                   dataType: "json",
                   url: getURL("deleteItem.php"),
                   crossDomain: true,
                   data: JSON.stringify(param),
                   cache: false,
                   success: function (info) {
                       $.mobile.loading("hide")
                       if (info.success) {
                           //$("#nameRoute").val(result.input1);
                           //$ .mobile.changePage("#newroute", { transition: "flip" });
                           $('#itemNew-' + codeItemSelected).remove();
                           $('#listAllNew').listview('refresh');
                       }else {
                           //currentInfo.idRoute = ''
                           showAlert('Intente nuevamente');
                       }   
                       
                       codeItemSelected = "";
                   },
                   error: function (msg) {
                       $.mobile.loading("hide")
                       alert(msg);
                   }
               });
    }
}

function updateStore(object, idStore) {
    if (object) {
        localStorage.setItem(idStore, JSON.stringify(object));
    }
}

//mantenimiento a lista activa
function createListActive(listData) {
    $('#listAllActive').empty();
    listData.forEach(function(item, index) {
        addItemListActive(item);
    });
    $('#listAllActive').listview('refresh');
};
function addItemListActive(item) {
    var list = $('#listAllActive');
    
    var name = item.NAME,
        total = item.TOTAL,
        code = item.ID;
    //var icons = '<span id="delivery-' + code + '" class="material-icons" style="' + showItemD + 'margin: 12px 0px;float:right;font-size:24px;color:green">done_all</span><span id="arrive-' + code + '" class="material-icons" style="' + showItemA + 'margin: 12px 0px;float:right;font-size:24px;color:red">room</span><span id="store-' + code + '" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:blue">store</span>';
    var icons = '<span id="arrive-' + code + '" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:red">room</span> <span style="margin: 12px 0px;float:right;font-size:24px;color:blue">' + total + '</span>';
    list.append('<li onclick="moveToStep(\'' + code + '\',\'' + name + '\')" id="itemNew-' + code + '" data-icon="false"><a href="#">' + name + icons + '</a></li>');            
}

//mantenimiento a lista detalle de ruta
function createListDetail(listData) {
    $('#listAllNew').empty();
    listData.forEach(function(item, index) {
        addItemListDetail(item);
    });
    $('#listAllNew').listview('refresh');
};
function addItemListDetail(item) {
    var list = $('#listAllNew');
    
    var name = item.CUSTOMER,
        code = item.ID;
    //var icons = '<span id="delivery-' + code + '" class="material-icons" style="' + showItemD + 'margin: 12px 0px;float:right;font-size:24px;color:green">done_all</span><span id="arrive-' + code + '" class="material-icons" style="' + showItemA + 'margin: 12px 0px;float:right;font-size:24px;color:red">room</span><span id="store-' + code + '" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:blue">store</span>';
    /*
    var icons = '<span id="arrive-' + code + '" class="material-icons" style="margin: 12px 0px;float:right;font-size:24px;color:red">room</span> <span style="margin: 12px 0px;float:right;font-size:24px;color:blue">' + total + '</span>';
    list.append('<li onclick="moveToStep(\'' + code + '\',\'' + name + '\')" id="itemNew-' + code + '" data-icon="false"><a href="#">' + name + icons + '</a></li>');            
    */
    list.append('<li id="itemNew-' + code + '" class="itemDetailRoute" datanamedetail="' + name + '" data-icon="info"><span onclick="removeItem(\'' + code + '\',\'' + name + '\')" class="material-icons" style="float: left;color:red">remove_circle</span><a onclick="viewItemRouteD(\'' + code + '\')" href="#">' + name + '</a></li>');            
}

//mantenimiento a lista nueva
function createListNew() {
    $('#listAllNew').empty();
    localStorageNew.forEach(function(item, index) {
        addItemListNew(item.code);
    });
    $('#listAllNew').listview('refresh');
};
function addItemListNew(code) {
    var list = $('#listAllNew');
    
    list.append('<li id="itemNew-' + code + '" data-icon="info"><span onclick="removeItem(\'' + code + '\')" class="material-icons" style="float: left;color:red">remove_circle</span><a href="#">' + code + '</a></li>');            
}

//var currentCodeMoveStep;
var currentCodeMoveStep = null;
var indexCurrent = -1;

function moveToStep(code, name) {
    currentInfo.idRoute = code;
    $("#nameRoute").val(name);
    $.mobile.changePage("#newroute", { transition: "flip" });
}

//busca item activo para siguiente paso
function moveStep(ind) {
    if (currentCodeMoveStep.a === 0) {
        //send -1 no se envia 0 pendiente de actualizar 1 actualizado
        currentCodeMoveStep.a = 1;
        //currentCodeMoveStep.aposition = geoItem;
        currentCodeMoveStep.alat = geoItem.latitude;
        currentCodeMoveStep.alon = geoItem.longitude;
        currentCodeMoveStep.afecha = getCurrentDateA();
        currentCodeMoveStep.ahora = getCurrentHour();
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
        
        $("#arrive-" + currentCodeMoveStep.code).css('display', 'block');
        $.mobile.changePage("#pageactive", { transition: "flip" });
    }else if (currentCodeMoveStep.d === 0) {
        //entregado                ;                
        //currentItemDelivery = item;
        app._capturePhoto();                
    } 
}

function getCurrentDateA() {
    var d = new Date(); 
    
    return (d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
}

function getCurrentHour() {
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

function uploadDataImageFinish(uuidRecord, imageURI) {
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
function uploadDataImage(item, imagenURI) {
    $.mobile.loading("show", {
                         text: 'Buscando Ubicación...',
                         textVisible: true,
                         theme: 'a',
                         textonly: false
                     });
    navigator.geolocation.getCurrentPosition(
        function(position) {
            $.mobile.loading("show", {
                                 text: 'Subiendo Imagen...',
                                 textVisible: true,
                                 theme: 'a',
                                 textonly: false
                             });
            try {
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = imagenURI.substr(imagenURI.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";

                item.positionlat = position.coords.latitude;
                item.positionlon = position.coords.longitude;
            
                options.params = item;
                //options.chunkedMode = false;

                var ft = new FileTransfer();
                ft.upload(imagenURI, encodeURI(getURL("uploadImage.php")), imageWin, imageFail, options);               
            }catch (exC) {
                showAlert(ex);   
            }
        },
        function(error) {
            var msg = 'code: ' + error.code + '\n' + 'message: ' + error.message + '\n';
            showAlert(msg);
        },
        { maximumAge: 2000, timeout: 5000, enableHighAccuracy: true }
        );
}
function imageWin (r) {
    //nuevo elemento
    //limpiar valores
    var name = document.getElementById('name'),
        idCustomer = document.getElementById('idCustomer'),
        address = document.getElementById('address'),
        tel = document.getElementById('tel');  
    
    currentItem.imageURI = '';      
    document.getElementById('previewTakePhoto').src = '';
    name.value = '';
    idCustomer.value = '';
    address.value = '';
    tel.value = '';    
        
    //regresar a pagina
    $.mobile.changePage("#newroute", { transition: "flip" });
    
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    //alert(JSON.stringify(r.response));
}
function imageFail(error) {
    //alert("An error has occurred: Code = " = error.code);
    showAlert(error);
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

function createHistory() {
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
                       info.data.forEach(function(item, index) {
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
        /*map = new google.maps.Map(document.getElementById('map'), {
        center: {
        lat: 14.598385,
        lng: -90.651017
        },
        zoom: 11
        });*/
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
    if (marker && marker.setMap)
        marker.setMap(null);

    var data = {
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

function getNameRoute(result) {
    if (result.buttonIndex == 1) {
        currentInfo.idRoute = guid();
        var param = {name: result.input1,guid:currentInfo.idRoute,user:currentInfo.idUser}
        
        if ($.trim(result.input1) == '') {
            showAlert('Ingrese nombre valido')   
            return;
        }
        
        $.mobile.loading("show", {
                             text: 'Guardando...',
                             textVisible: true,
                             theme: 'a',
                             textonly: false
                         });
        
        $.ajax({
                   type: "POST",
                   dataType: "json",
                   url: getURL("newRoute.php"),
                   crossDomain: true,
                   data: JSON.stringify(param),
                   cache: false,
                   success: function (info) {
                       $.mobile.loading("hide")
                       if (info.success) {
                           $("#nameRoute").val(result.input1);
                           $.mobile.changePage("#newroute", { transition: "flip" });
                       }else {
                           currentInfo.idRoute = ''
                           showAlert('Intente nuevamente');
                       }                                                  
                   },
                   error: function (msg) {
                       $.mobile.loading("hide")
                       alert(msg);
                   }
               });
    }else {
    }
}
function getURL(url) {
    var domain = 'http://approute.inversioneselmer.net/';
    return domain + url;   
}