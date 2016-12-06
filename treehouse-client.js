const https = require("https"),
      qs = require("querystring");

module.exports = {
    makeRequest(path, callback) {
        const options = {
            host: "teamtreehouse.com",
            path: path,
            port: 443,
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
                "Connection": "keep-alive",
                "Accept-Language": "en-US",
                "DNT": 1,
                "Referer": "https://www.google.co.uk",
            }
        };

        let request = https.request(options, response => {
            response.setEncoding("utf8");
            let profileData = "";
            response.on("data", buffer => {
                profileData += buffer;
            });
            response.on("end", () => {
                callback(JSON.parse(profileData));
            });
        });

        request.end();
    },
    getProfile(username, callback) {
        const path = `/${qs.escape(username)}.json`;
        this.makeRequest(path, callback);
    }
};