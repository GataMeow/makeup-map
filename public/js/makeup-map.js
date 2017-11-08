// Initialize Firebase
var config = {
    apiKey: "AIzaSyANmkd1CLbTAeoePfaJc6-OKYcdKr91e-M",
    authDomain: "makeup-map-170617.firebaseapp.com",
    databaseURL: "https://makeup-map-170617.firebaseio.com",
    projectId: "makeup-map-170617",
    storageBucket: "",
    messagingSenderId: "739919216927"
};
firebase.initializeApp(config);

function getContentTienda(tienda) {
    return '<h1>' + tienda.name + '</h1>' +
        '<p>' + tienda.telephone + '</p>' +
        '<p>' + tienda.address + '<br/>' + tienda.city + '</p>';
}

function clearMap(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function showTiendasInMap(markers, ventanasInfo, map, tiendas) {
    clearMap(markers);
    for (var i in tiendas) {
        var tienda = tiendas[i];
        var marker = new google.maps.Marker({
            position: tienda.location,
            map: map
        });
        markers.push(marker);
        (function (i, marker) {
            marker.addListener('click', function() {
                var ventana = new google.maps.InfoWindow({
                    content: getContentTienda(tiendas[i])
                });
                for (var j = 0; j < ventanasInfo.length; j++) {
                    ventanasInfo[j].close();
                }
                ventanasInfo.push(ventana);
                ventana.open(map, marker);
            });
        }) (i, marker);
    };
}

function buildMenuLateral(markers, ventanasInfo, map, database, marcas) {
    database.ref('webs').on('value', function(snapshot) {
        var webs = snapshot.val();
        var count = 0;
        for (var marca in webs) {
            var urls = webs[marca];
            var element = '<h3 id="marca_' + count + '" data-marca="' + marca + '">' + marca + '</h3><div>';
            if (urls.constructor === Array) {
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].url) {
                        element = element + '<p><a target="_blank" href="' + urls[i].url + '">' + urls[i].text + '</a></p>';
                    } else {
                        element = element + '<p>' + urls[i].text + '</p>';
                    }
                }
            } else {
                element = element + '<p><a target="_blank" href="' + urls + '">' + urls + '</a></p>';
            }
            element = element + '</div>';

            var indice_en_marcas = 0;
            while (indice_en_marcas < marcas.length && marcas[indice_en_marcas].name != marca) {
                indice_en_marcas++;
            }
            if (indice_en_marcas >= marcas.length) {
                marcas.push({
                    name: marca,
                    tiendas: []
                });
            }

            var new_index = 0;
            for (var index in marcas) {
                var marca_existente = marcas[index];
                for (var i in marca_existente.tiendas) {
                    var tienda = marca_existente.tiendas[i];
                    if (tienda.brands != undefined) {
                        for (var j in tienda.brands) {
                            var brand = tienda.brands[j];
                            if (brand == marca) {
                                marcas[indice_en_marcas].tiendas['virtual_' + new_index] = {
                                    address: tienda.address,
                                    city: tienda.city,
                                    location: tienda.location,
                                    name: tienda.name,
                                    telephone: tienda.telephone
                                };
                                new_index++;
                            }
                        }
                    }
                }
            }

            $('#accordion').append(element);
            (function(count) {
                $('#marca_' + count).click(function() {
                    clearMap(markers);
                    for (var i = 0; i < marcas.length; i++) {
                        if (marcas[i].name == $(this).data('marca')) {
                            showTiendasInMap(markers, ventanasInfo, map, marcas[i].tiendas);
                        }
                    }
                });
            })(count);
            count++;
        }
        $( "#accordion" ).accordion({
            heightStyle: "content",
            collapsible: true,
            active: false
        });
    });
}

function initMap() {
    var markers = [];
    var ventanasInfo = [];
    var marcas = [];
    var spain = {lat: 40.0998791, lng: -3.842226};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: spain
    });
    var database = firebase.database();

    database.ref('tiendas').on('value', function(snapshot) {
        var db = snapshot.val();
        for (var marca in db) {
            marcas.push({
                name: marca,
                tiendas: db[marca]
            });
        }
        buildMenuLateral(markers, ventanasInfo, map, database, marcas);
    });

}
