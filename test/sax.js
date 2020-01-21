/*!
  * vue-client-xmlrpc v0.0.1
  * (c) 2020 Zeppilabs
  * 
  * @license MIT
  */
 
 const assert = require('assert')
 const sax = require('sax')

 describe('Sax-parser', function() {
   describe('#ontext', function() {
     it('run', function() {
        var parser = sax.parser(false)
        let content = null
        parser.ontext = (msg) => {
            content = msg
        }

        parser.write("<a>test</a>").close()
        assert.equal(content, 'test');

        parser.write("<b><a>test</a><a>test1</a></b>").close()
        assert.equal(content, 'test1');
     });
   });

   describe('#onopentag ', function() {
    it('run', function() {
       var parser = sax.parser(false)
       let content = null
       let queued = []
       parser.onopentag  = (msg) => {
           content = msg
           queued.push(msg)
       }

       parser.write("<a toto='2'>test</a>").close()
       assert.deepEqual(content, { name: 'A', attributes: {"TOTO": "2"}, isSelfClosing: false });

       parser.write("<a toto='2' tutu='3'>test</a>").close()
       assert.deepEqual(content, { name: 'A', attributes: {"TOTO": "2", "TUTU": "3"}, isSelfClosing: false });

       parser.write("<b><a>test</a><a>test1</a></b>").close()
       assert.deepEqual(content, { name: 'A', attributes: {}, isSelfClosing: false });

       assert.equal(queued.length, 5)
    });
  });

  describe('#onattribute  ', function() {
    it('run', function() {
       var parser = sax.parser(false)
       let content = null
       let queued = []
       parser.onattribute = (msg) => {
           content = msg
           queued.push(msg)
       }

       parser.write("<a toto='2'>test</a>").close()
       assert.deepEqual(content, { name: 'TOTO', value: '2' });

       parser.write("<a toto='2' tutu='3'>test</a>").close()
       assert.deepEqual(content, { name: 'TUTU', value: '3' });
       assert.equal(queued.length, 3)

       content = null
       parser.write("<b><a>test</a><a>test1</a></b>").close()
       assert.deepEqual(content, null);
    });
  });
  
  describe('#double  ', function() {
    it('run', function() {
      var parser = sax.parser(false)
      let content = null
      const response = "<?xml version=\"1.0\"?>\n" +
      "<methodResponse> \n" +
         "<params> \n" +
            "<param> \n" +
               "<value><double>18.24668429131</double></value> \n" +
            "</param> \n"+
         "</params> \n" +
      "</methodResponse>"

      let is_double = false
      parser.onopentag  = (msg) => {
        if(msg.name === 'DOUBLE'){
          is_double = true
        }
      }

      parser.ontext  = (msg) => {
        if(is_double){
          content = parseFloat(msg)
          is_double = false
        }
      }

      parser.write(response).close()
      assert.equal(content, 18.24668429131)
    });
  });
});
