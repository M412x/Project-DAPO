var darkMap = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
var lightMap = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
var hasInternet = false, map, marker, prevlat, prevlng, mapLayer, record, userid, prevtimestamp, isNightMode, prevaccuracy;
document.addEventListener('deviceready', deviceReady, false);
document.addEventListener('online', passOfflineData, false);
$(function() {
	$('.menu-btn').click(function() {
		$('.menu').toggleClass('open');
	});
	$('.menu a').click(function() {
		$('.menu').removeClass('open');
	});
	$('#seen').click(function () {
		confirmClick('seen');
	});
	$('#bitten').click(function(){
		confirmClick('bitten');
	});
	$('#night').click(function() {
		isNightMode = !isNightMode;
		if(!isNightMode){
			try {
				dayMode();
			}catch (e) {
			}
		}else{
			try	{
				nightMode();
			}catch (e) {
			}
		}
	});
	$('#center').click(function(){
		map.panTo(marker.getLatLng());
	});
});
function deviceReady(){
	navigator.splashscreen.show();
	window.StatusBar.overlaysWebView(true);
	window.StatusBar.styleDefault();
	cordova.plugins.diagnostic.requestExternalStorageAuthorization(function(status){
		if(status == 'GRANTED'){
			createFile('logs.txt');
			createFile('id.txt');
			window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function (fs){
				fs.root.getFile('id.txt', {}, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							if(this.result == ''){
								window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(){
									fs.root.getFile('id.txt', {create: true}, function(fileEntry) {
										fileEntry.createWriter(function(fileWriter) {
											userid = Date.now()+device.uuid;
											var blob = new Blob([userid], {type: 'text/plain'});
											fileWriter.write(blob);
										});
									});
								});
							}else{
								userid = this.result;
							}
							if(typeof userid == 'undefined'){
								$('.tutorial').show();
								$('#page2').hide();
								$('#page3').hide();
								var page = 1;
								$('#circle1').css('color', 'black');
								$('#next').click(function(){
									$('#page'+page).hide();
									page++;
									if(page <= 3){
										$('#page'+page).fadeIn();
										$('#circle'+page).css('color', 'black');
									}else{
										$('.tutorial').fadeOut();
										// alert(userid);
										navigator.geolocation.getCurrentPosition(function(pos){
											if(typeof prevlat == 'undefined'){
												$('#header-success').text('GPS Connected');
												$('#header-success').fadeIn();
											}
											prevlat = lat = pos.coords.latitude;
											prevlng = lng = pos.coords.longitude;
											prevaccuracy = accuracy = pos.coords.accuracy;
											if(hasInternet && typeof marker == 'undefined'){
												var icon = L.icon({
													iconUrl: 'img/logo.png',
													iconSize: [50,50],
													popupAnchor: [0, -35]
												});
												marker = L.Marker.movingMarker([[prevlat,prevlng],[lat,lng]],[1500], {icon:icon}).addTo(map);
												marker.addEventListener("click", function(){
													map.panTo(marker.getLatLng());
												});
												map.panTo(marker.getLatLng());
											}
											setTimeout(function(){
												$('#header-success').fadeOut();
											}, 3000);
										},function(e){
											$('#header-warning').text('Could not connect GPS. Retrying...');
											$('#header-warning').fadeIn();
											setTimeout(function(){
												$('#header-warning').fadeOut();
											}, 3000);
										},{
											enableHighAccuracy: true,
											maximumAge: 60000,
											timeout: 10000
										});
										var options = {
											maximumAge: 5000,
											timeout: 1000,
											enableHighAccuracy: true,
											interval: 30000,
											fastInterval: 5000
										};
										navigator.geolocation.watchPosition(liveMap, function () {
											cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
												if(!enabled){
													navigator.notification.alert('Please turn on GPS and restart the app.', navigator.app.exitApp, 'Oops', 'OK');
												}
											}, function(e) {
												navigator.app.exitApp();
											});
										}, options);
										//navigator.notification.alert('Please Restart the App.', navigator.app.exitApp, 'Thanks', 'OK');
									}
								});
							}
						};
						reader.readAsText(file);
					});
				});
			});
			cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
				if(!enabled){
					navigator.notification.alert('Please turn on GPS and restart the app.', navigator.app.exitApp, 'Oops', 'OK');
				}
			}, function() {
				navigator.app.exitApp();
			});
			navigator.splashscreen.hide();
			$('#header-info').text('Loading Map...');
			$('#header-info').fadeIn();
			$.ajax({
				url: 'https://api.openweathermap.org/data/2.5/weather?lat=14.5995&lon=120.9842&apikey=9742b361c731f67dabe1928c914de5d7',
				type: 'get',
				success: function(){
					hasInternet = true;
					$('#header-info').fadeOut();
				},error: function(){
					$('#header-info').fadeOut();
				},
				timeout: 2000,
				async: false,
			});
			if(hasInternet){
				map = L.map('map',{zoomControl: false}).setView([14.5995,120.9842], 16);
				mapLayer = L.tileLayer(lightMap, {
					maxZoom: 20,
					minZoom: 5,
				}).addTo(map);
				L.heatLayer(coords.map(function(p){return [p[0], p[1], weight];})).addTo(map);
				isNightMode = false;
				$('.background-dark').addClass('hidden');
				$('.background-light').addClass('hidden');
			}
			navigator.geolocation.getCurrentPosition(function(pos){
				if(typeof prevlat == 'undefined'){		
					$('#header-success').text('GPS Connected');
					$('#header-success').fadeIn();
				}
				prevlat = lat = pos.coords.latitude;
				prevlng = lng = pos.coords.longitude;
				prevaccuracy = accuracy = pos.coords.accuracy;
				if(hasInternet && typeof marker == 'undefined'){
					var icon = L.icon({
						iconUrl: 'img/logo.png',
						iconSize: [50,50],
						popupAnchor: [0, -35]
					});
					marker = L.Marker.movingMarker([[prevlat,prevlng],[lat,lng]],[1500], {icon:icon}).addTo(map);
					marker.addEventListener("click", function(){
						map.panTo(marker.getLatLng());
					});
					map.panTo(marker.getLatLng());
				}
				setTimeout(function(){
					$('#header-success').fadeOut();
				}, 3000);
			},function(e){
				$('#header-warning').text('Could not connect GPS. Retrying...');
				$('#header-warning').fadeIn();
				setTimeout(function(){
					$('#header-warning').fadeOut();
				}, 3000);			
			},{
				enableHighAccuracy: true,
				maximumAge: 60000,
				timeout: 10000
			});
			
			var options = {
				maximumAge: 5000,
				timeout: 1000,
				enableHighAccuracy: true,
				interval: 30000,
				fastInterval: 5000
			};
			navigator.geolocation.watchPosition(liveMap, function () {
				cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
					if(!enabled){
						navigator.notification.alert('Please turn on GPS and restart the app.', navigator.app.exitApp, 'Oops', 'OK');
					}
				}, function(e) {
					navigator.app.exitApp();
				});
			}, options);

		}else{
			navigator.notification.alert('Please Restart the App and Allow to Access Storage.', navigator.app.exitApp, 'Oops', 'OK');
		}
	});
}

function liveMap(pos){
	if(typeof prevlat == 'undefined'){		
		$('#header-success').text('GPS Connected');
		$('#header-success').fadeIn();
	}
	setTimeout(function(){
		$('#header-success').fadeOut();
	}, 3000);
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
		if(!enabled){
			navigator.notification.alert('Please turn on GPS and restart the app.', navigator.app.exitApp, 'Oops', 'OK');
		}
	}, function() {
		navigator.app.exitApp();
	});
	lat = pos.coords.latitude;
	lng = pos.coords.longitude;
	accuracy = pos.coords.accuracy;
	if(hasInternet && typeof marker == 'undefined'){
		var icon = L.icon({
			iconUrl: 'img/logo.png',
			iconSize: [50,50],
			popupAnchor: [0, -35]
		});
		marker = L.Marker.movingMarker([[lat,lng],[lat,lng]],[1500], {icon:icon}).addTo(map);
		marker.addEventListener("click", function(){
			map.panTo(marker.getLatLng());
		});
		map.panTo(marker.getLatLng());
	}
	if(navigator.onLine && hasInternet){
		marker.addLatLng([lat,lng],1500);
		marker.start();
	}
	prevlat = lat;
	prevlng = lng;
	prevtimestamp = pos.timestamp;
	prevaccuracy = accuracy;
}

function createFile(file) {
	window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(fs){
		fs.root.getFile(file, {create: true, exclusive: true});
	});
}
function writeFile() {
	window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(fs){
		fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				var content = '';
				if(fileWriter.length == 0){
					content = '['+JSON.stringify(record)+',';
				}else{
					content = JSON.stringify(record)+',';
				}
				var blob = new Blob([content], {type: 'text/plain'});
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				delete record;
			});
		});
	});
}
function confirmClick(action){
	$('.spinner-area').fadeIn();
	navigator.notification.confirm((action == 'bitten' ? 'Are you bitten?' : 'Have you seen a mosquito?'), function(index){
		if(index == 1){
			passOnlineData(action);
		}else{
			$('.spinner-area').fadeOut();
		}
	}, 'Confirm', ['Yes', 'No']);
}
function passOnlineData(action){
	var model, url;
	model = device.model;
	record = {
		"model": model,
		"userid": userid,
		"action": action
	};
	if(typeof prevlat == 'undefined' && typeof prevlng == 'undefined'){
		navigator.geolocation.getCurrentPosition(function(pos){
			if(typeof prevlat == 'undefined'){		
				$('#header-success').text('GPS Connected');
				$('#header-success').fadeIn();
			}
			prevlat = lat = pos.coords.latitude;
			prevlng = lng = pos.coords.longitude;
			accuracy = pos.coords.accuracy;
			prevtimestamp = pos.timestamp;
			if(navigator.onLine && hasInternet){
				var icon = L.icon({
					iconUrl: 'img/logo.png',
					iconSize: [50,50],
					popupAnchor: [0, -35]
				});
				marker = L.Marker.movingMarker([[prevlat,prevlng],[lat,lng]],[1500], {icon:icon}).addTo(map);
				marker.addEventListener("click", function(){
					map.panTo(marker.getLatLng());
				});
				map.panTo(marker.getLatLng());
				url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + prevlat + '&lon=' + prevlng + '&apikey=9742b361c731f67dabe1928c914de5d7';
				record["lat"] = prevlat;
				record["lng"] = prevlng;
				record["accuracy"] = prevaccuracy;
				record["timestamp"] = prevtimestamp;
				$.ajax({
					url: url,
					type: 'get',
					error: function(){
						writeFile();
						$('.spinner-area').fadeOut();
					},
					success: function(data, status){
						record["weather"] = data.weather[0].description;
						record["humidity"] = data.main.humidity;
						record["temperature"] = data.main.temp;
						celsius = (record["temperature"] - 273.15).toFixed(1);
						farenheit = (9 / 5 * celsius + 32).toFixed(1);
						record["pressure"] = data.main.pressure;
						$.post("https://dapo.bnshosting.net/api/set.php", {
							submit: "submit",
							data: '['+JSON.stringify(record)+']',
							success: function(){
							}
						});
						$('.spinner-area').fadeOut();
						$('#result').html('Latitude: '+prevlat+'<br>');
						$('#result').append('Longitude: '+prevlng+'<br>');
						$('#result').append('Weather: '+record['weather']+'<br>');
						$('#result').append('Humidity: '+record['humidity']+'%<br>');
						$('#result').append('Temperature: '+celsius+' °C | '+farenheit+' °F<br>');
						$('#result').append('Pressure: '+record['pressure']+'hPa<br>');
						$('#results').modal('show');
					},
					async: false
				});
				setTimeout(function(){
					$('#header-success').fadeOut();
				}, 3000);
				delete record;
			}
		},function(e){
			$('#header-warning').text('Could not connect GPS. Retrying...');
			$('#header-warning').fadeIn();
			setTimeout(function(){
				$('#header-warning').fadeOut();
			}, 3000);
		},{
			enableHighAccuracy: true,
			maximumAge: 60000,
			timeout: 10000
		});
	}else{
		url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + prevlat + '&lon=' + prevlng + '&apikey=9742b361c731f67dabe1928c914de5d7';
		record["lat"] = prevlat;
		record["lng"] = prevlng;
		record["timestamp"] = prevtimestamp;
		record["accuracy"] = prevaccuracy;
		$.ajax({
			url: url,
			type: 'get',
			error: function(){
				writeFile();
				$('.spinner-area').fadeOut();
				$('#result').html('Latitude: '+prevlat+'<br>');
				$('#result').append('Longitude: '+prevlng+'<br>');
				$('#results').modal('show');
			},
			success: function(data, status){
				record["weather"] = data.weather[0].description;
				record["humidity"] = data.main.humidity;
				record["temperature"] = data.main.temp;
				record["pressure"] = data.main.pressure;
				celsius = (record["temperature"] - 273.15).toFixed(1);
				farenheit = (9 / 5 * celsius + 32).toFixed(1);
				$.post("https://dapo.bnshosting.net/api/set.php", {
					submit: "submit",
					data: '['+JSON.stringify(record)+']',
					success: function(){
					}
				});
				$('.spinner-area').fadeOut();
				$('#result').html('Latitude: '+prevlat+'<br>');
				$('#result').append('Longitude: '+prevlng+'<br>');
				$('#result').append('Weather: '+record['weather']+'<br>');
				$('#result').append('Humidity: '+record['humidity']+'%<br>');
				$('#result').append('Temperature: '+celsius+' °C | '+farenheit+' °F<br>');
				$('#result').append('Pressure: '+record['pressure']+'hPa<br>');				
				$('#results').modal('show');
			},
			async: false
		});
		delete record;
	}
}
function passOfflineData(){
	window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function (fs){
		fs.root.getFile('log.txt', {}, function(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();
				reader.onloadend = function(e) {
					if(this.result != ''){
						$.post("https://dapo.bnshosting.net/api/set.php", {
							submit: "submit",
							data: this.result.substring(0,this.result.length-1)+']'
						},function(){
							window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(){
								fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
									fileEntry.createWriter(function(fileWriter) {
										var blob = new Blob([''], {type: 'text/plain'});
										fileWriter.write(blob);
									});
								});
							});
						});
					}
				};
				reader.readAsText(file);
			});
		});
	});
}
function nightMode() {
	$('#nightIcon').removeClass('fa-moon');
	$('#nightIcon').addClass('fa-lightbulb');
	StatusBar.styleLightContent();
	$('body').css({
		"padding": "0",
		"margin": "0",
		"width": "100%",
		"height": "100%",
		"overflow": "hidden",
		"background": "black",
	});
	try{
		map.removeLayer(mapLayer);
	}catch (e) {

	}
	$('.background-dark').removeClass('hidden');
	$('.background-light').addClass('hidden');
	if(navigator.onLine && hasInternet){
		mapLayer = L.tileLayer(darkMap, {
			maxZoom: 20,
			minZoom: 5,
		}).addTo(map);
		$('.background-dark').addClass('hidden');
		$('.background-light').addClass('hidden');
	}
}
function dayMode() {
	$('#nightIcon').removeClass('fa-lightbulb');
	$('#nightIcon').addClass('fa-moon');
	StatusBar.styleDefault();
	$('body').css({
		"padding": "0",
		"margin": "0",
		"width": "100%",
		"height": "100%",
		"overflow": "hidden",
		"background": "white",
	});
	try{
		map.removeLayer(mapLayer);
	}catch (e) {

	}
	$('.background-light').removeClass('hidden');
	$('.background-dark').addClass('hidden');
	if(navigator.onLine && hasInternet){
		mapLayer = L.tileLayer(lightMap, {
			maxZoom: 20,
			minZoom: 5,
		}).addTo(map);
		$('.background-dark').addClass('hidden');
		$('.background-light').addClass('hidden');
	}
}
