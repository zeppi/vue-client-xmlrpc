/*!
  * vue-client-xmlrpc v0.0.1
  * (c) 2020 Zeppilabs
  * 
  * @license MIT
  */

const axios = require('axios')
const validUrl = require("valid-url");
const xmlBuilder = require('xmlbuilder')

/**
 * @constructor
 * @param {String} uri URI string(e.g. 'http://localhost:9090/api')
 * 
 */
function XmlRpc(uri) {
    if (false === (this instanceof XmlRpc)) {
        return new XmlRpc(uri)
    }
    this.uri = uri
}

/**
 * Create an XML-RPC client.
 *
 * @param {String} uri URI string(e.g. 'http://localhost:9090/api')
 * 
 * @return {XmlRpc}
 */
XmlRpc.create = (uri) => {
    if (validUrl.isUri(uri)) {
        return new XmlRpc(uri)
    }
    throw "Invalid url, should be string(e.g. 'http://localhost:9090/api')"; 
}

/**
 * Makes an XML-RPC call
 *
 * @param {String} method
 * @param {Array} params
 * @param {Function} callback  - function(error, value) { ... }
 *   - {Object|null} error - Any errors when making the call, otherwise null.
 *   - {mixed} value       - The value returned in the method response.
 * 
 * @return {mixed}
 */
XmlRpc.prototype.call = function call(method, params, callback) {
  axios.post(this.uri, 
      this._encodeMethod(method, params),
      {headers: {'Content-Type': 'text/xml'}}
    ).then(response => {
        return callback(null, response)
    }).catch(e => {            
        return callback(e, null);
    })
}

/**
 * Makes an XML-RPC call
 *
 * @param {String} method
 * @param {Array} params
 * 
 * @return {String}
 */
XmlRpc.prototype._encodeMethod = function _encodeMethod(method, params){
    let options = { version: '1.0', allowSurrogateChars: true, encoding: 'utf-8' }
    let xml = xmlBuilder.create('methodCall', options)
    .ele('methodName')
      .txt(method)
    .up()
    .ele('params')

    params.forEach(function(param) {
        serializeValue(param, xml.ele('param'))
    })

    return xml.doc().toString()    
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function serializeValue(value, xml) {
    let stack = [{ value: value, xml: xml }]
    let current = valueNode = next = null

    while (stack.length > 0) {
        current = stack[stack.length - 1]

        if (current.index !== undefined) {
        // Iterating a compound
        next = getNextItemsFrame(current)
        if (next) {
            stack.push(next)
        }
        else {
            stack.pop()
        }
        }
        else {
        // we're about to add a new value (compound or simple)
        valueNode = current.xml.ele('value')
        switch(typeof current.value) {
            case 'boolean':
            appendBoolean(current.value, valueNode)
            stack.pop()
            break
            case 'string':
            appendString(current.value, valueNode)
            stack.pop()
            break
            case 'number':
            appendNumber(current.value, valueNode)
            stack.pop()
            break
            case 'object':
            if (current.value === null) {
                valueNode.ele('nil')
                stack.pop()
            }
            else if (current.value instanceof Date) {
                appendDatetime(current.value, valueNode)
                stack.pop()
            }
            else if (Buffer.isBuffer(current.value)) {
                appendBuffer(current.value, valueNode)
                stack.pop()
            }
            else {
                if (Array.isArray(current.value)) {
                current.xml = valueNode.ele('array').ele('data')
                }
                else {
                current.xml = valueNode.ele('struct')
                current.keys = Object.keys(current.value)
                }
                current.index = 0
                next = getNextItemsFrame(current)
                if (next) {
                stack.push(next)
                }
                else {
                stack.pop()
                }
            }
            break
            default:
            stack.pop()
            break
        }
        }
    }
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} frame 
 * 
 * @return {Object}
 */
function getNextItemsFrame(frame) {
    var nextFrame = null

    if (frame.keys) {
        if (frame.index < frame.keys.length) {
            let key = frame.keys[frame.index++]
            let member = frame.xml.ele('member').ele('name').text(key).up()
            nextFrame = {value: frame.value[key], xml: member}
        }
    }
    else if (frame.index < frame.value.length) {
        nextFrame = {value: frame.value[frame.index], xml: frame.xml}
        frame.index++
    }

    return nextFrame
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function appendBoolean(value, xml) {
    xml.ele('boolean').txt(value ? 1 : 0)
}

var illegalChars = /^(?![^<&]*]]>[^<&]*)[^<&]*$/
/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function appendString(value, xml) {
    if (value.length === 0) {
        xml.ele('string')
    }
    else if (!illegalChars.test(value)) {
        xml.ele('string').d(value)
    }
    else {
        xml.ele('string').txt(value)
    }
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function appendNumber(value, xml) {
    if (value % 1 == 0) {
        xml.ele('int').txt(value)
    }
    else {
        xml.ele('double').txt(value)
    }
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function appendDatetime(value, xml) {
    xml.ele('dateTime.iso8601').txt(dateFormatter.encodeIso8601(value))
}

/**
 * From https://github.com/baalexander/node-xmlrpc
 * 
 * @param {mixed} value 
 * @param {xmlBuilder} xml 
 */
function appendBuffer(value, xml) {
    xml.ele('base64').txt(value.toString('base64'))
}
    
module.exports = XmlRpc
