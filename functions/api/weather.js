export async function onRequest(context) {
    // I also have this as a CF function as ipify.com doesn't load on adblockers
    
    try {
        let lat, lon;

        // apparently cloudflare has geolocation too
        if (context.request.cf && context.request.cf.latitude && context.request.cf.longitude) {
            lat = context.request.cf.latitude;
            lon = context.request.cf.longitude;
            console.log("Using Cloudflare edge location data");
        } 
        // if the cf doesnt wrok
        else {
            // const ipurl = 'https://ip.hackclub.com/ip'
            // hackclub ip is kinda inaccurate for actual decisionmaking...
            // it says im a whole state away
            
            const ipifyResponse = await fetch('https://api.ipify.org');
            const ipString = await ipifyResponse.text(); 
            // Response is 1.1.1.1 for example

            const geoipurl = `http://ip-api.com/json/${ipString}`;
            const geoResponse = await fetch(geoipurl);
            const locationData = await geoResponse.json();
            
            /* no this is not my ip this was in the example
                {
                    "query": "24.48.0.1",
                    "status": "success",
                    "lat": 45.6085,
                    "lon": -73.5493,
                    ...
                }
            */
            lat = locationData.lat;
            lon = locationData.lon;
            console.log("bruh the stupid cloudflare doesnt work (as expected)");
        }

        // Round to 2 decimal points for the Weather API
        const finalLat = parseFloat(lat).toFixed(2);
        const finalLon = parseFloat(lon).toFixed(2);

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        return new Response(JSON.stringify(weatherData), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to get the weather" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}