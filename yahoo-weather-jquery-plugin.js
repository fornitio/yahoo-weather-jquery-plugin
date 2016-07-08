(function($, undefined) {
	'use strict';
	$.fn.yahooWeather = function(p1) {
		const fahrenheitToCelsius = (f) => Math.ceil((f-32)/1.8);
		const add0 = (x) => (x.toString()[0] !== '0') ? ( (x<10) ? '0' + x : x ) : x;
		const addPlus = (x) => (x>0) ? '+' + x : x;
		const kharkivLocation = {
			coords : {
				latitude : 50.0346748,
				longitude : 36.345833
			}
		}
		const config = {
			method : 'GET',
			mode : 'cors'
		}
		const def = {}
		const location = new Promise(function(res,rej){
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(res, rej);
			} else rej('Browser doesn\'t support Geolocation');
		});
		location
			.catch(()=> Promise.resolve(kharkivLocation))
			.then((location)=>{
				const query = `
					select * from weather.forecast where woeid in (
						SELECT woeid FROM geo.places 
						WHERE text="(${location.coords.latitude},${location.coords.longitude})"
					)
				`;  
				const uri = `https://query.yahooapis.com/v1/public/yql?q=${query}&format=json`;
				return fetch(uri, config)
			})
			.then(res => res.json())
			.then(res => {
				const item = res.query.results.channel.item;
				def.{ city } = res.query.results.channel.location.city;
				def.country = res.query.results.channel.location.country;
				def.date = new Date(res.query.created);
				def.tHigh = fahrenheitToCelsius(item.forecast[0].high);
				def.tLow = fahrenheitToCelsius(item.forecast[0].low);
				def.condition = item.condition.code;
				def.temp = fahrenheitToCelsius(item.condition.temp);
				def.template = template;
				this.append(def.template());
			})
			.catch((err)=>{console.log(err)});
		return this;

		function template() {
			return `
				<div class="btn btn-default">
					<i class="wi wi-yahoo-${this.condition}">
						&nbsp;${addPlus(this.temp)}&deg;C  ${this.city}, ${this.country}
					</i>
					<div>
						${add0( this.date.getDate() )}.${add0( this.date.getMonth()+1 )}.${this.date.getFullYear()}, 
						${this.date.getHours()}:${add0(this.date.getMinutes())} 
					</div>
					<div>
						&downarrow;t&deg;&nbsp;${addPlus(this.tLow)}&deg;C,&nbsp; 		
						&uparrow;t&deg;&nbsp;${addPlus(this.tHigh)}&deg;C		
					</div>
					<a href="https://www.yahoo.com/?ilc=401" target="_blank"> <!--Yahoo obligates to insert this-->
						<img src="https://poweredby.yahoo.com/purple.png" width="134" height="29"/> 
					</a>
				</div>
			`;
		};
	}
})(jQuery)