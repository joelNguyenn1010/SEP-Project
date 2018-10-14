var chai = require('chai');
var should = chai.should();
var server = require('../app.js')
var chaiHttp = require('chai-http');
chai.should()
chai.use(chaiHttp)


describe('Router', () => {
  it('it should have json type', () => {
    return chai.request(server)
      .get('/')
      .then(res => {
        res.should.not.have.json
        // add more tests here as you see fit
      })
      .catch(err => {
         throw err
      })
  })

  it('it should not login', () =>{
    return chai.request(server)
    .get("/librarian/login")
    .send({ username: '123', password: '123' })
    .end(function (err, res) {
       expect(err).to.be.null
       expect(res).to.have.status(200)
  })
});
});

describe("Librarian Router", function(){
  context('Render View', function() {

    it('should render login view', function(){

    })
    it('should not render login view', function(){

    })


  })

})

