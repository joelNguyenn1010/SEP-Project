const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const proxyquire = require('proxyquire');


describe("Librarian Router", function(){
  context('Render View', function() {

    it('should render login view', function(){

    })
    it('should not render login view', function(){

    })


  })

})

describe("Middleware", function() {
    const debugStub = function() {
      return sinon.stub();
    }
    let middleware;
     before(function(){
      middleware = proxyquire("../middleware/librarian.js", {
         debug: debugStub
       });
     });
});
