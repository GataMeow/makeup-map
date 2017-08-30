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

function initMap() {
	var markers = [];
	var ventanasInfo = [];
	var spain = {lat: 40.0998791, lng: -3.842226};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 6,
		center: spain
	});
	var database = firebase.database();
	var lush = database.ref('tiendas/Sephora');
	lush.on('value', function(snapshot) {
		var tiendas = snapshot.val();
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
	});
}
