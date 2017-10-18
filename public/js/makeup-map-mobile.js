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
                console.log('Mostrando ventana ' + i);
                console.log('Marker: ' + marker);
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
            var element = '<option id="marca_' + count + '" data-marca="' + marca + '">' + marca + '</option>';
            var div_urls = '<div class="div-urls" data-marca="' + marca + '" style="display: none">';
            if (urls.constructor === Array) {
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].url) {
                        div_urls = div_urls + '<p><a target="_blank" href="' + urls[i].url + '">' + urls[i].text + '</a></p>';
                    } else {
                        div_urls = div_urls + '<p>' + urls[i].text + '</p>';
                    }
                }
            } else {
                div_urls = div_urls + '<p><a target="_blank" href="' + urls + '">' + urls + '</a></p>';
            }
            div_urls = div_urls + '</div>';

            $('#combo').append(element);
            $('#urls').append(div_urls);
            count++;
        }
        $('#combo').on('change', function() {
            var marca = $(this).val();
            clearMap(markers);
            for (var i = 0; i < marcas.length; i++) {
                if (marcas[i].name == marca) {
                    showTiendasInMap(markers, ventanasInfo, map, marcas[i].tiendas);
                }
            }
            $('.div-urls').hide();
            $('.div-urls').each(function() {
                if ($(this).data('marca') == marca) {
                    $(this).show();
                }
            });
        });
    });
}

function initMap() {
    var markers = [];
    var ventanasInfo = [];
    var marcas = [];
    var spain = {lat: 40.0998791, lng: -3.842226};
    var map = new google.maps.Map(document.getElementById('map-mobile'), {
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
