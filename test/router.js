const restify = require('restify')
const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const request = require('supertest')

const Route = require('..')

describe('Restify Router', function () {
  var server

  beforeEach(function () {
    server = restify.createServer()
    server.use(restify.queryParser())
    server.use(restify.acceptParser(server.acceptable))
    server.use(restify.bodyParser())
  })

  afterEach(function() {
    server.close.bind(server)
  })

  describe('Simple unnamed routes', function () {
    it('Should add simple GET route to server', function (done) {
      var r = new Route({
        path: '/hello',
        method: 'get',
        handler: function (req, res, next) {
          res.send('Hello World')
          next()
        }
      }).attach(server)

      request(server)
        .get('/hello')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err

          res.body.should.equal('Hello World')
          done()
        })
    })

    it('Should add simple GET route with prefix to server', function (done) {

      var r = new Route({
        path: '/world/',
        method: 'get',
        handler: function (req, res, next) {
          res.send('Hello World')
          next()
        }
      }).setPrefix('/hello/')
        .attach(server)

      request(server)
        .get('/hello/world')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err

          res.body.should.equal('Hello World')
          done()
        })
    })

    it('Should add simple POST route to server', function (done) {
      new Route({
        path: '/postme',
        method: 'post',
        handler: function (req, res, next) {
          res.send(req.body.name)
          next()
        }
      }).attach(server)

      request(server)
        .post('/postme')
        .set('Content-Type', 'application/json')
        .send({name: 'test'})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;

          res.body.should.equal('test')
          done()
        })
    })

    it('Should add simple PUT route to server', function (done) {
      new Route({
        path: '/puttme',
        method: 'put',
        handler: function (req, res, next) {
          res.send(req.body.name)
          next()
        }
      }).attach(server)

      request(server)
        .put('/puttme')
        .set('Content-Type', 'application/json')
        .send({name: 'test'})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.equal('test')
          done()
        })
    })

    it('Should add simple DELETE route to server', function (done) {
      new Route({
        path: '/deleteme/:id',
        method: 'del',
        handler: function (req, res, next) {
          res.send(req.params.id)
          next()
        }
      }).attach(server)

      request(server)
          .del('/deleteme/2')
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.equal('2')
            done()
          })

    })

    it('Should add simple PATCH route to server', function (done) {
      new Route({
        path: '/patchme',
        method: 'patch',
        handler: function (req, res, next) {
          res.send(req.body.name)
          next()
        }
      }).attach(server)

      request(server)
          .patch('/patchme')
          .set('Content-Type', 'application/json')
          .send({name: 'test'})
          .expect(200)
          .end(function (err, res) {
            if (err) throw err
            res.body.should.equal('test')
            done()
          })
    })

    it('Should add simple HEAD route to server', function (done) {
      new Route({
        path: '/head',
        method: 'head',
        handler: function (req, res, next) {
          res.header('x-test', 'testing')
          res.send(200)
          next()
        }
      }).attach(server)

      request(server)
          .head('/head')
          .expect(200)
          .expect('x-test', 'testing')
          .end(done)
    })

    it('Should add simple OPTIONS route to server', function (done) {
      new Route({
        path: '/opts',
        method: 'opts',
        handler: function (req, res, next) {
          res.header('Allow', 'GET,POST,OPTIONS')
          res.send(200)
          next()
        }
      }).attach(server)

      request(server)
        .options('/opts')
        .expect(200)
        .expect('Allow', 'GET,POST,OPTIONS')
        .end(done)
    })
  })

  describe('Complex route definitions', function () {
    it('Should add a named route', function (done) {
      new Route({
        name:    'hello',
        path:    '/hello',
        method:  'get',
        handler: function (req, res, next) {
          res.send('Hello World')
          next()
        }
      }).attach(server)

      request(server)
          .get('/hello')
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.equal('Hello World')
            done()
          })
    })

    it('Should add versioned routes', function (done) {
      new Route({
        path:    '/hello',
        method:  'get',
        version: '1.0.0',
        handler: function (req, res, next) {
          res.send('1.0.0')
          next()
        }
      }).attach(server)

      new Route({
        path:    '/hello',
        method:  'get',
        version: '2.0.0',
        handler: function (req, res, next) {
          res.send('2.0.0')
          next()
        }
      }).attach(server)

      request(server)
          .get('/hello')
          .set('Accept-Version', '~2')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.should.equal('2.0.0')
            done()
          })
    })
  })

  describe('Group route definitions', function () {
    it('Should add sub route', function (done) {
      new Route({
        path:    '/hello/'
      }).addRoute(new Route({
        path:    '/world',
        method:  'get',
        handler: function (req, res, next) {
          res.send('Hello World')
          next()
        }
      })).attach(server)

      request(server)
          .get('/hello/world')
          .expect(200)
          .end(function (err, res) {
            if (err) throw err
            res.body.should.equal('Hello World')
            done()
          })
    })

    it('Should add versioned routes', function (done) {
      new Route({
        path:    '/hello',
        method:  'get',
        version: '1.0.0',
        handler: function (req, res, next) {
          res.send('1.0.0')
          next()
        }
      }).attach(server)

      new Route({
        path:    '/hello',
        method:  'get',
        version: '2.0.0',
        handler: function (req, res, next) {
          res.send('2.0.0')
          next()
        }
      }).attach(server)

      request(server)
          .get('/hello')
          .set('Accept-Version', '~2')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.should.equal('2.0.0')
            done()
          })
    })
  })

  describe('Failure cases', function () {
    it('Should fail if invalid path type is provided', function () {
      expect(function () {
        new Route({
          path:    '/great',
          method:  true,
          version: '1.0.0',
          handler: function (req, res, next) {
            //fails
            res.send(200)
          }
        }).attach(server)
      }).to.throw('Method must be a string')
    })
  })
})