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

function showTiendasInMap(markers, ventanasInfo, map, tiendas) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	for (var i in tiendas) {
		var tienda = tiendas[i];
		var marker = new google.maps.Marker({
			position: tienda.location,
			map: map
		});
		markers.push(marker);
		(function (i) {
			marker.addListener('click', function() {
				var ventana = new google.maps.InfoWindow({
					content: getContentTienda(tiendas[i])
				});
				for (var j = 0; j < ventanasInfo.length; j++) {
					ventanasInfo[j].close();
				}
				ventanasInfo.push(ventana);
				ventana.open(map, markers[i]);
			});
		}) (i);
	};
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
		var count = 0;
		for (var marca in db) {
			marcas.push({
				name: marca,
				tiendas: db[marca]
			});
			$('#accordion').append(
				'<h3 id="marca_' + count + '">' + marca + '</h3><div><p data-tienda="' + marca + '"></p></div>'
			);
			(function(count) {
				$('#marca_' + count).click(function() {
					showTiendasInMap(markers, ventanasInfo, map, marcas[count].tiendas);
				});
			})(count);
			(function(marca) {
				database.ref('webs/' + marca).on('value', function(snapshot) {
					var url = snapshot.val();
					$('p[data-tienda="' + marca + '"]').html('<a target="_blank" href="' + url + '">' + url + '</a>');
				});
			})(marca);
			count++;
		}
		$( "#accordion" ).accordion({
			heightStyle: "content"
		});
		showTiendasInMap(markers, ventanasInfo, map, marcas[0].tiendas);
	});
}
