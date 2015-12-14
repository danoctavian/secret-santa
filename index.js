var fs = require("fs")
var express = require('express')
var twilio = require('twilio')
var shuffle = require('knuth-shuffle').knuthShuffle
var _ = require("underscore")

/* setup twilio */

var TWILIO_NUMBER = "+14159658674"
var TWILIO_ACCOUNT_SID = ""
var TWILIO_AUTH_TOKEN = ""

var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

function randomPairs(xs) {
  var shuffled = shuffle(xs)

  return shuffled.map(x => {
    console.log(xs)
    var filtered = xs.filter( e => e !== x)
    var didRemove = filtered.length < xs.length
    var val = {first: x, second: getRandomFromBucket(filtered)}
    if (didRemove) filtered.push(x)
    xs = filtered
    return val
  })
}

function getRandomFromBucket(bucket) {
   var randomIndex = Math.floor(Math.random() * bucket.length)
   return bucket.splice(randomIndex, 1)[0]
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
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


var santaGroup = ["Daryl Moulder","Dora Timmer","Brantley Beaird","Pindi Albert", "Rogier van der Wacht","Cory Brandli","Cees Trouwborst","Winnie Huang","Yumeng Zheng","Rosa Baum","Rajnish Garg","Tiffany Wang","Mike Lam","Matt Rubin","Dan Octavian","Eric Kennedy"]

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
var msgs = pairs.map(p => {
  var msg = {}
  msg.text = "Secret santa #2: Hey " + p.first.name + ". you will be getting a present for " + p.second.name + "."
  msg.number = p.first.number
  return msg
})


//  pairs = [pairs.filter(p => p.first.name === "Dan Octavian")[0]]

var receivers = pairs.map(p => p.second.name)

console.log(santaGroup)
console.log(receivers)

var assertion = _.isEqual(santaGroup.sort(), receivers.sort())
console.log(assertion)
assert(assertion)

console.log(msgs)

sendMessages(msgs)