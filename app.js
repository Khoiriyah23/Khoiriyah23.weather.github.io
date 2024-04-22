const http = require("http")
const fs = require ("fs")
const routes = require("./routes")

const Server = http.createServer ((req, res) => {

    const city = req.url.replace("/", "");

    if (req.url === "/") {
       routes.home(req, res);
    } else if (city && city.indexOf("/") < 0) {
        routes.result(req, res);
    } else {
        routes.error(res);
    }
 
})


Server.listen(2024)