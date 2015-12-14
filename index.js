var fs = require("fs")
var express = require('express')
var twilio = require('twilio')
var shuffle = require('knuth-shuffle').knuthShuffle


/* setup twilio */

var TWILIO_NUMBER = "+14159658674"
var TWILIO_ACCOUNT_SID = ""
var TWILIO_AUTH_TOKEN = ""

var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

function randomPairs(xs) {
  var shuffled = shuffle(xs)

  return shuffled.map( x => {
    return {first: x, second: getRandomFromBucket(xs.filter( e => e !== x))}
  })
}

function getRandomFromBucket(bucket) {
   var randomIndex = Math.floor(Math.random() * bucket.length)
   return bucket.splice(randomIndex, 1)[0]
}

var sendMessages = ms => {
  var n = 0
  ms.forEach(function(m) {
    console.log("sending a twilio message to " + m.number)
    client.sms.messages.create({
        to: m.number,
        from: TWILIO_NUMBER,
        body: m.text
    }, function(error, message) {
        if (!error) {    
            console.log('Message sent on:');
            console.log(message.dateCreated);
            console.log("!!to: " + message.to)
        } else {
            console.log('!!Err: ' + JSON.stringify(error))
        }

        n++

        if (n === ms.length) {
          console.log("done with batch")
        }
    });  
  })
}


var santaGroup = ["Daryl Moulder","Dora Timmer","Brantley Beaird","Pindi Albert", "Rogier van der Wacht","Cory Brandli","Cees Trouwborst","Winnie Huang","Sam Turner","Yumeng Zheng","Rosa Baum","Rajnish Garg","Tiffany Wang","Mike Lam","Matt Rubin","Dan Octavian","Eric Kennedy"]

console.log(santaGroup.length)


var numbers = JSON.parse(fs.readFileSync("goodNumbers.json"))

numbers.push({name: "Rogier van der Wacht", number: "+14155101740"})
numbers.push({name: "Dora Timmer", number: numbers.filter(p => p.name === "Cees Trouwborst")[0].number})
 
var numbersMap = {}
numbers.forEach(n => {
  numbersMap[n.name] = n
}) 

console.log(numbersMap)

var pplWithNumbers = santaGroup.map(p => {

  if (!numbersMap[p]) {
    console.log("no phone number for " + p)
  }
  return numbersMap[p]
})

console.log(pplWithNumbers)

var pairs = randomPairs(pplWithNumbers)

//attach message 
pairs.forEach(p => {
  p.first.text = "Secret santa: Hey " + p.first.name + ". you will be buying a present for " + p.second.name + "."
})


//  pairs = [pairs.filter(p => p.first.name === "Dan Octavian")[0]]

var msgs = pairs.map(p => { return p.first})

console.log(msgs)

sendMessages(msgs)