const dotenv = require("dotenv").config();
const URL = require('url').URL
const urlExists = require("url-exists");
const axios = require('axios')
const express = require("express");
const bodyParser = require("body-parser");
// App configurations
const app = express();
// Let the app be able to see the html file that called the server
app.use(bodyParser.urlencoded({ extended: true })); 

const clinetId = process.env.CLINET_ID
const base_url = process.env.BASE_URL

// A RESTFul GET API/*
app.get("/soundcloud", async (req, res) => {

    const inputUrl = req.header("url")
    const validation = await parametersValidation(inputUrl)

    if(validation){
            const result = await soundcloudRequest(inputUrl)
            console.log(result)
            res.send(result)
    }else{
        console.log("[-] Invalid Inputs [-]")
        res.status(400).json({ message: "Invalid Inputs" })
    }
});

async function fetchUrl(url){
    return axios.get(url)
        .then(result => {
            return result.data.url
        })
        .catch(error => {
            return error
        })
    }
async function fetchInfo(inputUrl){
   return axios.get(base_url+inputUrl)
    
    .then(result => {
        return result.data
    })
    .catch(error => {
        console.log(error)
        return error
    })
}

async function soundcloudRequest(input){
    
    //fetch info
    const info = await fetchInfo(input)
    //initilaze info
    const artwork_url = info.artwork_url
    const title = info.title
    const media_url = info.media.transcodings[1].url
    //fetch strem link
    const url = await fetchUrl(media_url+''+clinetId)

    return {
        "thumbnail" : artwork_url,
        "title" : title,
        "url" : url
    }
}

async function parametersValidation(inputUrl){
    if( inputUrl){
        //
        if(isUrlValid(inputUrl)){
            //
            if(isHostnameValid(inputUrl)){
                return true
            }else{
                return false
            }
            //
        }else{
            return false
        }
    }else{
        return false
    }
}

async function isUrlValid(inputUrl){
    return urlExists(inputUrl, function(err, exists) {
        if (exists) {
          return true
        } else {
            console.log("Url is not Valid: "+inputUrl);
          console.log(err);
          return false
        }
      });     
}
function isHostnameValid(inputUrl){
    var hostname = null
    try {
        hostname = new URL(inputUrl).hostname
    } catch (error) {
        return false
    }
    if(hostname === 'soundcloud.com'){
        return true
      }else{
        console.log("The Host is not Valid: "+hostname);
        return false
      }
}

// Starting up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;