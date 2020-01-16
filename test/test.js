/*!
  * vue-client-xmlrpc v0.0.1
  * (c) 2020 Zeppilabs
  * 
  * @license MIT
  */
var assert = require('assert')
var XmlRpc = require('../lib/xmlrpc')

describe('XmlRpc', function() {
  describe('#create()', function() {
    it('should return XmlRpc instance', function() {
        const o = XmlRpc.create('http://localhost:9090')      
        assert.equal((o instanceof XmlRpc), true);
    });

    it('should throw invalide url exception', function() {                
        try {
            const o = XmlRpc.create('httt')
            assert.equal(false, true);      
        }catch(e){
            assert.equal(e, "Invalid url, should be string(e.g. 'http://localhost:9090/api')");      
        } 
    });

    it('should create methodCall xml', function() {                
        const exptected = '<?xml version="1.0" encoding="utf-8"?><methodCall><methodName>anAction</methodName><params><param><value><array><data><value><string>string1</string></value><value><int>3</int></value></data></array></value></param></params></methodCall>'
        const o = XmlRpc.create('http://localhost:9090')

        assert.equal(o._encodeMethod('anAction', [['string1', 3]]), exptected);        
    });
  });
});