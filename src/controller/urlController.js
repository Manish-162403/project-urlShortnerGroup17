const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validUrl = require('valid-url')


//........................................redis.................................................

const redis = require("redis");

const { promisify } = require("util");


const redisClient = redis.createClient({host:'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com',port:17454,username:'functioup-free-db',password:'yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO'});


redisClient.on('connect',() => {
    console.log('connected to redis successfully!');
})

redisClient.on('error',(error) => {
    console.log('Redis connection error :', error);
})


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



//...................................validation............................................................

const isValid = function(value){
    if(typeof value ==undefined ||  value ==null)return false
    if(typeof value==='string'&&value.trim().length===0) return false
    return true
}


//...........................................................create short url...................................................


const createUrl = async function (req, res) {
    try {

        const longUrl = req.body.longUrl

        if (!longUrl) {
            
            return res.status(400).send({ status: false, message: "please provide required input field" })
        
        }

        //let existUrl = await urlModel.findOne({longUrl:longUrl})
        // if(existUrl) return res.status(201).send({ status: true, data: existUrl })

        const baseUrl = "http://localhost:3000"

        if (!validUrl.isUri(baseUrl)) {

            return res.status(400).send({ status: false, message: "invalid base URL" })

        }

        const cahcedUrlData = await GET_ASYNC(`${longUrl}`)

        if (cahcedUrlData) {

            return res.status(200).send({ status: "true", data: cahcedUrlData })

        }

        let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (urlPresent) {

            await SET_ASYNC(`${longUrl}`, JSON.stringify(urlPresent))

            return res.status(200).send({ status: true, data: urlPresent })

        }

        const urlCode = shortId.generate()

        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {

            return res.status(400).send({ status: false, message: "urlCode already exist in tha db" })

        }

        const shortUrl = baseUrl + '/' + urlCode

        const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (dupshortUrl) {

            return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })

        }

        const newUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }

        // console.log(newUrl)

        const createUrl = await urlModel.create(newUrl)

        return res.status(201).send({ status: true, data: createUrl })

    }

    catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }

}




//..............................................get by params.....................................




const getUrl = async function (req, res) {

        let data1 = await GET_ASYNC(`${req.params.urlCode}`)//

        if(!isValid(data1)){return res.status(400).send({status: false, message: "The Link is not valid"})}



    if(data1) {

        let data2 = JSON.parse(data1)

     return res.status(302).redirect(data2.longUrl)

    } else {

      let output = await urlModel.findOne({urlCode:data1});

if(output){

     await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(output.longUrl))

     return res.status(302).redirect( output.longUrl );

    }else{
        
        return res.status(400).send("not found")}

}
  
  };


 



module.exports.createUrl = createUrl
module.exports.getUrl = getUrl


















// const createUrl = async function(req,res){
//     try {  
//         let data = await GET_ASYNC(`${req.body.longUrl}`)
    
//    const {longUrl} = data

//     if (!Object.keys(longUrl).length>0) {return res.status(400).send({status: false, message: "please input Some data"})}

// if(!isValid(longUrl)){return res.status(400).send({status:false, message: "please input longUrl"})}

// if(!(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(longUrl))){

//     return res.status(400).send({status:false, message: "please enter a valid URL"})
// }

//     if (!validUrl.isUri(baseUrl)) {
//         return res.status(401).send('Invalid base URL')
//     }

//     const urlCode = shortid.generate()


//     if (validUrl.isUri(data)) {
        
           
//             let url = await urlModel.findOne({urlCode:req.body.longUrl})

//             if (url) {
//                return res.status(200).send({status:false,message: "URL already exist please check in DataBase", Data: url})
               
//             } else {
          
//                 const shortUrl = baseUrl + '/' + urlCode

//                 newUrl = await urlModel.create({longUrl,shortUrl,urlCode})
          

//                 const finalData = {longUrl:newUrl.longUrl, shortUrl:newUrl.shortUrl, urlCode:newUrl.urlCode}
//                 await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(finalData))
//                return res.status(201).send({status:true, message:finalData})
//             }}
   

//  }catch (err) {
           
//            return res.status(500).send({status:false,message:err.message})
//         }
    
// }



///////////////////get//////////////////////////////////////////////////////////


// let getUrl = async function (req, res) {
// const data = req.params.urlCode

// if (!Object.keys(data).length>0) {return res.status(400).send({status: false, message: "please input Some data"})}

// //if(!isValid(data)){return res.status(400).send({status:false, message: "please input urlcode"})}

// const output = await urlModel.findOne({urlCode:data})

// if(!output){return res.status(404).send({status:false, message: "not found"})}

// return res.status(200).redirect(output.longUrl)

// }
