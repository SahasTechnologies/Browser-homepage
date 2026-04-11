export async function onRequest(context) {
    const apiKey = context.env.APOD_API_KEY;
    const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    
    
    const backupUrl = new URL('/backupimg.json', context.request.url);

    try {
        const response = await fetch(nasaUrl);

        // If NASA is working (Status 200) yay
        if (response.ok) {
            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }
        throw new Error("NASA API unavailable");

    } catch (error) {
        console.log("NASA failed, fetching backup...");
        
        try {
            const backupResponse = await fetch(backupUrl);
            const backupImages = await backupResponse.json();
            
            // backup list since the NASA API NGINX ERRORS
            const randomImg = backupImages[Math.floor(Math.random() * backupImages.length)];

            // return fake stuff so it doesnt break
            return new Response(JSON.stringify({
                url: randomImg,
                media_type: "image",
                title: "Space (Backup)",
                explanation: "NASA is currently offline, so here is a backup view of the cosmos."
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (backupError) {
            return new Response(JSON.stringify({ error: "Both NASA and Backup failed" }), { status: 500 });
        }
    }
}