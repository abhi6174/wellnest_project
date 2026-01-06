/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { EhrContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('EhrContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new EhrContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"ehr 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"ehr 1002 value"}'));
    });

    describe('#ehrExists', () => {

        it('should return true for a ehr', async () => {
            await contract.ehrExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a ehr that does not exist', async () => {
            await contract.ehrExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createEhr', () => {

        it('should create a ehr', async () => {
            await contract.createEhr(ctx, '1003', 'ehr 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"ehr 1003 value"}'));
        });

        it('should throw an error for a ehr that already exists', async () => {
            await contract.createEhr(ctx, '1001', 'myvalue').should.be.rejectedWith(/The ehr 1001 already exists/);
        });

    });

    describe('#readEhr', () => {

        it('should return a ehr', async () => {
            await contract.readEhr(ctx, '1001').should.eventually.deep.equal({ value: 'ehr 1001 value' });
        });

        it('should throw an error for a ehr that does not exist', async () => {
            await contract.readEhr(ctx, '1003').should.be.rejectedWith(/The ehr 1003 does not exist/);
        });

    });

    describe('#updateEhr', () => {

        it('should update a ehr', async () => {
            await contract.updateEhr(ctx, '1001', 'ehr 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"ehr 1001 new value"}'));
        });

        it('should throw an error for a ehr that does not exist', async () => {
            await contract.updateEhr(ctx, '1003', 'ehr 1003 new value').should.be.rejectedWith(/The ehr 1003 does not exist/);
        });

    });

    describe('#deleteEhr', () => {

        it('should delete a ehr', async () => {
            await contract.deleteEhr(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a ehr that does not exist', async () => {
            await contract.deleteEhr(ctx, '1003').should.be.rejectedWith(/The ehr 1003 does not exist/);
        });

    });

});
