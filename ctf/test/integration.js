var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
var Add = require('../maths');

describe('Addition Tests', () => {
    it('should return 3 when passed 1 and 2', ()=>{
        var numberOne = 1;
        var numberTwo = 2;

        var expectedResult = 3;

        var actualResult = Add(numberOne, numberTwo);
        actualResult.should.equal(expectedResult);
        expect(actualResult).to.equal(expectedResult);
        assert.equal(actualResult, expectedResult);
    });

    it('should not return 3 when passed 1 and 4', ()=>{
        var numberOne = 1;
        var numberTwo = 4;

        var notExpectedResult = 3;

        var actualResult = Add(numberOne, numberTwo);
        actualResult.should.not.equal(notExpectedResult);
        expect(actualResult).to.not.equal(notExpectedResult);
        assert.notEqual(actualResult, notExpectedResult);
    });
});