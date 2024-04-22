const fs = require ("fs");
const https = require ("https");
const API_KEY = require("./API_KEY");
const { request } = require("http");
const footerData = fs.readFileSync("./templates/footer.html", "utf-8");
const headData = fs.readFileSync("./templates/head.html", "utf-8")
const querystring = require("querystring")

const homeRoute = (request, response) =>{
    const bodyData = fs.readFileSync("./templates/home.html", "utf-8");
    if(request.method.toUpperCase() === "GET") {
    response.writeHead(200, {"content-Type": "text/html"})
    
    //head
    response.write(headData);
        //body
       response.write(bodyData);
       //footer
        response.end(footerData)
    } else {
        request.on("data", (bodyData) => {
            const data = querystring.parse(bodyData.toString())
            console.log(data);
            response.writeHead(303, {"Location" : "/" + data.city})
            response.end("");
        })
        
    }
}

const resultRoute = (request,response) => {
   let resultData = fs.readFileSync("./templates/result.html", "utf-8")
   let errorData = fs.readFileSync("./templates/error.html", "utf-8")

    response.writeHead(200, {"content-Type": "text/html"})

    
    //head
    response.write(headData);

    const city = request.url.replace("/", "");
    if (city.indexOf("[[") > -1) {
        return;
    }
    const API = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
   
   https.get(API, (res) => {

    let data = "";
    res.on("data", (resp) => {
        data += resp;
    })

    res.on("end", () => {
        const responseData = JSON.parse(data.toString());
            if (responseData.cod === 200) {
        const templatesData = {
            city : responseData.name,
            country : responseData.sys.country,
            temperature: Math.floor(responseData.main.temp - 273),
            description: responseData.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${responseData.weather[0].icon}@2x.png`
        }

        for (let key in templatesData) {
            
            resultData = resultData.replace(RegExp("{{" + key + "}}", "g") ,templatesData[key]);
        }
            response.write(resultData)
        

            } else {
                const errorMessage = responseData.message;
                errorData = errorData.replace("{{errorMessage}}", errorMessage);
                response.write(errorData);
            }
            response.end(footerData)
    })

   }).on("error", (message) => {
                errorData = errorData.replace("{{errorMessage}}", message);
                response.write(errorData);
                response.end(footerData);
   })
}

const errorRoute = (response) => {
    
    //head
    response.write(headData);
    response.writeHead(200, {"content-Type": "text/html"})
   response.write("<h1 class='white'>Error 404")
   response.write("<p class ='white'>Erroor loading the page </p>");
   response.end(footerData)

}


module.exports = {error: errorRoute, home:homeRoute, result:resultRoute}