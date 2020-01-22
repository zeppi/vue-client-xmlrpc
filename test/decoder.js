/*!
  * vue-client-xmlrpc v0.0.1
  * (c) 2020 Zeppilabs
  * 
  * @license MIT
  */
 
 const assert = require('assert')
 const Decoder = require('../lib/decoder')

 describe('Decoder', function() {
    describe('#new()', function() {
      it('should return Decoder instance', function() {
          const o = new Decoder()
          assert.equal((o instanceof Decoder), true);
      });
    });

    describe('#Play with struct', function() {
        it('A basic struct response', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param> \n" +
                    "<struct> \n" +
                        "<member> \n" +
                        "<name>Name1</name>\n" +
                        "<value><i4>2</i4></value>\n" +
                        "</member> \n" +
                        "<member> \n" +
                        "<name>Name2</name>\n" +
                        "<value><i4>3</i4></value>\n" +
                        "</member> \n" +
                    "</struct> \n" +               
                    "</param> \n"+
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, {'Name1': 2, 'Name2': 3});
        });

        it('A complex struct response', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
               "<params> \n" +
                  "<param> \n" +
                    "<struct> \n" +
                      "<member> \n" +
                        "<name>Name1</name>\n" +
                        "<value><i4>2</i4></value>\n" +
                      "</member> \n" +
                      "<member> \n" +
                        "<name>Name2</name>\n" +
                        "<value>" + 
                          "<struct> \n" +
                            "<member> \n" +
                              "<name>Name1</name>\n" +
                              "<value><i4>2</i4></value>\n" +
                            "</member> \n" +
                            "<member> \n" +
                              "<name>Name2</name>\n" +
                              "<value><i4>3</i4></value>\n" +
                            "</member> \n" +
                          "</struct> \n" +     
                        "</value>\n" +
                      "</member> \n" +
                    "</struct> \n" +               
                  "</param> \n"+
               "</params> \n" +
            "</methodResponse>"
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, {'Name1': 2, 'Name2': {'Name1': 2, 'Name2': 3}});
        });

      });

      describe('#Play with array', function() {
        it('A basic array response', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param> \n" +
                    "<array> \n" +
                        "<data> \n" +
                        "<value><i4>2</i4></value>\n" +
                        "<value><i4>3</i4></value>\n" +
                        "</data> \n" +
                    "</array> \n" +               
                    "</param> \n"+
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, [2, 3]);
        });

        it('A complex struct response', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param> \n" +
                    "<array> \n" +
                        "<data> \n" +
                        "<value><i4>2</i4></value>\n" +
                        "<value>" + 
                            "<array> \n" +
                                "<data> \n" +
                                    "<value><i4>2</i4></value>\n" +
                                    "<value><i4>3</i4></value>\n" +
                                "</data> \n" +
                            "</array> \n" +
                        "</value>\n" +
                        "</data> \n" +
                    "</array> \n" +               
                    "</param> \n"+
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, [2, [2,3]]);
        });
      });

      describe('#Mixin', function() {
        it('Struct include array', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
               "<params> \n" +
                  "<param> \n" +
                    "<struct> \n" +
                      "<member> \n" +
                        "<name>Name1</name>\n" +
                        "<value><i4>2</i4></value>\n" +
                      "</member> \n" +
                      "<member> \n" +
                        "<name>Name2</name>\n" +
                        "<value>" + 
                            "<array> \n" +
                                "<data> \n" +
                                    "<value><i4>2</i4></value>\n" +
                                    "<value><i4>3</i4></value>\n" +
                                "</data> \n" +
                            "</array> \n" +
                        "</value>\n" +
                      "</member> \n" +
                    "</struct> \n" +               
                  "</param> \n"+
               "</params> \n" +
            "</methodResponse>"
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, {'Name1': 2, 'Name2': [2, 3]});
        });

        it('Array include struct', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param> \n" +
                    "<array> \n" +
                        "<data> \n" +
                        "<value><i4>2</i4></value>\n" +
                        "<value>" + 
                            "<struct> \n" +
                                "<member> \n" +
                                "<name>Name1</name>\n" +
                                "<value><i4>2</i4></value>\n" +
                                "</member> \n" +
                                "<member> \n" +
                                "<name>Name2</name>\n" +
                                "<value><i4>3</i4></value>\n" +
                                "</member> \n" +
                            "</struct> \n" + 
                        "</value>\n" +
                        "<value>" + 
                            "<struct> \n" +
                                "<member> \n" +
                                "<name>Name1</name>\n" +
                                "<value><i4>3</i4></value>\n" +
                                "</member> \n" +
                                "<member> \n" +
                                "<name>Name2</name>\n" +
                                "<value><i4>4</i4></value>\n" +
                                "</member> \n" +
                            "</struct> \n" + 
                        "</value>\n" +                        
                        "</data> \n" +
                    "</array> \n" +               
                    "</param> \n"+
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, [2, {'Name1': 2, 'Name2': 3}, {'Name1': 3, 'Name2': 4}]);
        });

        it('Array bug', function() {
            const response = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<methodResponse><params><param><value><array><data><value><struct><member><name>id</name><value><int>2</int></value></member><member><name>truc</name><value><string>zz</string></value></member></struct></value><value><struct><member><name>id</name><value><int>1</int></value></member><member><name>truc</name><value><string>zz</string></value></member></struct></value></data></array></value></param></params></methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.deepEqual(v, [{'id': 2, 'truc': 'zz'}, {'id': 1, 'truc': 'zz'}]);
        });

      });

      describe('#Simple Type', function() {
        it('String', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param><value><string>South Dakota</string></value></param> \n" +
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.equal(v, 'South Dakota');
        });

        it('Integer', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param><value><i4>5</i4></value></param> \n" +
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.equal(v, 5);
        });
        
        it('Boolean', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param><value><boolean>1</boolean></value></param> \n" +
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.equal(v, true);
        });  

        it('DateTime', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param><value><dateTime.iso8601>19980717T14:08:55</dateTime.iso8601></value></param> \n" +
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            exp = new Date('1998-07-17T12:08:55.000Z')
            
            assert.equal((v instanceof Date), true);
            assert.equal(v.getTime(), exp.getTime());
        }); 

        it('Base64', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
                "<params> \n" +
                    "<param><value><base64>eW91IGNhbid0IHJlYWQgdGhpcyE=</base64></value></param> \n" +
                "</params> \n" +
            "</methodResponse>"

            const o = new Decoder()
            const v = o.decode(response)
            assert.equal(v, 'eW91IGNhbid0IHJlYWQgdGhpcyE=');
        });

        it('Fault', function() {
            const response = "<?xml version=\"1.0\"?>\n" +
            "<methodResponse> \n" +
            "<fault>  \n" +
                "<value>  \n" +
                    "<struct>  \n" +
                        "<member> \n" +
                            "<name>faultCode</name> \n" +
                            "<value><int>4</int></value> \n" +
                        "</member> \n" +
                        "<member> \n" +
                            "<name>faultString</name> \n" +
                            "<value><string>Too many parameters.</string></value> \n" +
                        "</member> \n" +
                    "</struct> \n" +
                "</value> \n" +
            "</fault> \n" +
            "</methodResponse>";
            
            const o = new Decoder()
            const v = o.decode(response)
            
            assert.equal((v instanceof Error), true);
            assert.equal(v.message, 'Too many parameters.');
        }); 

      });
  });
