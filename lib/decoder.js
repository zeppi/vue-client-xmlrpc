/*!
  * vue-client-xmlrpc v0.0.1
  * (c) 2020 Zeppilabs
  * 
  * @license MIT
  */

const sax = require('sax')
const dateFormatter = require('./date_formatter')

const SINGLE_TYPE = 'single'
const STRUCT_TYPE = 'struct'
const NAME_TYPE = 'name'
const VALUE_TYPE = 'value'
const ARRAY_TYPE = 'array'

const TOKEN_ROOT = 'methodResponse'
const TOKEN_STRING = 'string'
const TOKEN_BOOLEAN = 'boolean'
const TOKEN_INT = 'int'
const TOKEN_I4 = 'i4'
const TOKEN_I8 = 'i8'
const TOKEN_DOUBLE = 'double'
const TOKEN_BASE64 = 'base64'
const TOKEN_DATETIME = 'dateTime.iso8601'
const TOKEN_NIL = 'nil'
const TOKEN_FAULT = 'fault'

var Decoder = function() {
    this.parser = sax.parser(true)
    this.content = null
    this.current = null

    this.is_error = false;

    this.parser.onopentag = this.onOpentag.bind(this)    
    this.parser.ontext = this.onText.bind(this)
    this.parser.onclosetag = this.onClosetag.bind(this)
}

/**
 * 
 */
let Chain = function() {
    this.value = null        
    this.type = SINGLE_TYPE
    this.tmp = null
    this.filter = null        
    this.parent = null
    this.child = null
}

/**
 * 
 */
Decoder.prototype.onOpentag = function(msg){
    if(msg.name === TOKEN_ROOT){
        this.current = this.content = new Chain()
    }

    if(msg.name === TOKEN_FAULT){
        this.is_error = true
    }

    if(msg.name === STRUCT_TYPE){
        this.__add_child()
        this.current.type = STRUCT_TYPE
        this.current.value = {}      
    }

    if(msg.name === NAME_TYPE){
        this.__add_child()
        this.current.type = NAME_TYPE     
    }

    if(msg.name === VALUE_TYPE){
        this.__add_child()        
        this.current.type = VALUE_TYPE            
    }

   
    if(msg.name === ARRAY_TYPE){
        this.__add_child()        
        this.current.type = ARRAY_TYPE 
        this.current.value = []           
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_I4, TOKEN_INT].includes(msg.name)){
        this.current.filter = (v) => {
            let intVal = parseInt(v, 10)
            if(isNaN(intVal)) return 0          
            return intVal
        }
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_I8].includes(msg.name)){
        this.current.filter = (v) => {     
            const isInteger = /^-?\d+$/ 
            if (!isInteger.test(v)) return 0       
            return v
        }
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_DOUBLE].includes(msg.name)){
        this.current.filter = (v) => {
            let floatVal = parseFloat(v, 10)
            if(isNaN(floatVal)) return 0.0        
            return floatVal
        }
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_STRING, TOKEN_BASE64].includes(msg.name)){
        this.current.filter = (v) => {      
            return v
        }
    }
        
    if(this.current.type === VALUE_TYPE && [TOKEN_BOOLEAN].includes(msg.name)){
        this.current.filter = (v) => {      
            return (v === '1')
        }
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_NIL].includes(msg.name)){
        this.current.filter = (v) => {      
            return null
        }
    }

    if(this.current.type === VALUE_TYPE && [TOKEN_DATETIME].includes(msg.name)){
        this.current.filter = (v) => {      
            return  dateFormatter.decodeIso8601(v)
        }
    }
}

/**
 * 
 */
Decoder.prototype.__add_child = function(){
    this.current.child = new Chain()
    this.current.child.parent = this.current          
    this.current = this.current.child
}

/**
 * 
 */
Decoder.prototype.onText = function(msg){
    if(this.current && this.current.parent !== null){
        if(this.current.type === NAME_TYPE){
            this.current.parent.tmp = msg
        }

        if(this.current.type === VALUE_TYPE && this.current.filter !== null){
            this.current.value = this.current.filter(msg)
            
            if(this.current.parent.type === STRUCT_TYPE && this.current.parent.tmp !== null){
                this.current.parent.value[this.current.parent.tmp] = this.current.value
                this.current.parent.tmp = null;
            }

            if(this.current.parent.type === ARRAY_TYPE ){
                this.current.parent.value.push(this.current.value)
            }
        }
    }  
}

/**
 * 
 */
Decoder.prototype.onClosetag = function(msg){
    switch(msg) {
        case STRUCT_TYPE:
        if (this.current.parent !== null){
            if(this.current.parent.type === VALUE_TYPE && this.current.parent.parent.tmp){
                this.current.parent.parent.value[this.current.parent.parent.tmp] = this.current.value
                this.current.parent.parent.tmp = null
            }else if(this.current.parent.type === VALUE_TYPE && this.current.parent.parent.tmp === null){
                if(this.is_error){
                    this.current.parent.value = this.current.value
                }else{
                    this.current.parent.parent.value.push(this.current.value)
                }
            }
            this.current = this.current.parent
        }            
        break
        case ARRAY_TYPE:
        if (this.current.parent !== null){
            if(this.current.parent.type === VALUE_TYPE && this.current.parent.parent.tmp === null){
                if (this.current.parent.parent.value){
                    this.current.parent.parent.value.push(this.current.value)
                }else{
                    this.current.parent.value = this.current.value
                }
            }else if(this.current.parent.type === VALUE_TYPE && this.current.parent.parent.tmp){
                this.current.parent.parent.value[this.current.parent.parent.tmp] = this.current.value
            }
            this.current = this.current.parent
        }            
        break
        case NAME_TYPE:
        if (this.current.parent !== null)
            this.current = this.current.parent
        break
        case VALUE_TYPE:
        if (this.current.parent !== null)
            this.current = this.current.parent
        break
        default:
        break
    }  
}

/**
 * Decode XML-RPC Response
 * 
 * @param {String} response 
 * 
 * @return {Mixed|Null}
 */
Decoder.prototype.decode = function(response) {    
    this.parser.write(response).close()

    if(this.content.child === null) return null
    if(this.is_error) return new Error(this.content.child.value.faultString)

    return this.content.child.value
}

module.exports = Decoder
