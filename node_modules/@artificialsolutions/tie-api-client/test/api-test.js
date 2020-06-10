'use strict';

const fetchMock = require('fetch-mock');
const querystring = require('querystring');
const TIE = require('../src/tie-api-client');

describe('TIE API Client', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  const expectedPayload = { userinput: 'Hej där!', viewtype: 'tieapi' };
  const teneoEngineUrl = 'https://teneo.engine.com/';
  const endSessionUrl = `${teneoEngineUrl}endsession`;
  const urlWithSession = (url, sessionId) => `${url};jsessionid=${sessionId}`;

  it('should exist', () => {
    expect(TIE).to.not.be.undefined;
  });

  describe('#sendInput', () => {
    it('should exist', () => {
      expect(TIE.sendInput).to.not.be.undefined;
    });

    it('should POST the input to the specified url', (done) => {
      fetchMock.post(teneoEngineUrl, 200);

      TIE.sendInput(teneoEngineUrl, null, { text: 'Hej där!' }, () => {
        const [, request] = fetchMock.lastCall(teneoEngineUrl);
        expect(querystring.parse(request.body)).to.eql(expectedPayload);
        done();
      });
    });

    it('should append the session id to the url if passed', (done) => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(teneoEngineUrl, sessionId);

      fetchMock.post(expectedUrl, 200);

      TIE.sendInput(teneoEngineUrl, sessionId, { text: 'Hello world' }, () => {
        expect(fetchMock.lastUrl()).to.eql(expectedUrl);
        done();
      });
    });

    it('should POST with the correct headers', (done) => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(teneoEngineUrl, sessionId);
      fetchMock.post(expectedUrl, 200);

      TIE.sendInput(teneoEngineUrl, sessionId, { text: 'Hello there' }, () => {
        const [, { headers }] = fetchMock.lastCall(expectedUrl);

        expect(headers.get('Accept')).to.equal('application/json;charset=UTF-8');
        expect(headers.get('Content-Type')).to.equal('application/x-www-form-urlencoded;charset=UTF-8');
        expect(headers.get('Cookie')).to.equal(`JSESSIONID=${sessionId}`);
        done();
      });
    });

    it('should pass arbitrary input data as parameters', (done) => {
      fetchMock.post(teneoEngineUrl, 200);
      const expected = Object.assign({}, expectedPayload, {
        foo: 'bar', baz: '42'
      });

      TIE.sendInput(teneoEngineUrl, null, { text: 'Hej där!', foo: 'bar', baz: 42 }, () => {
        const [, request] = fetchMock.lastCall(teneoEngineUrl);
        const body = querystring.parse(request.body);
        expect(body).to.eql(expected);
        done();
      });
    });

    it('should NOT pass `viewtype`, `userinput`, `clientOrigin` or `text` as parameters', (done) => {
      fetchMock.post(teneoEngineUrl, 200);

      const inputData = {
        viewtype: 'y',
        text: 'Hej där!',
        userinput: 'z',
        clientOrigin: 'http://some-origin'
      };

      TIE.sendInput(teneoEngineUrl, null, inputData, () => {
        const [, request] = fetchMock.lastCall(teneoEngineUrl);
        expect(querystring.parse(request.body)).to.eql(expectedPayload);
        done();
      });
    });

    it('should return a Promise if no callback is passed', async () => {
      fetchMock.post(teneoEngineUrl, {});

      await TIE.sendInput(teneoEngineUrl, null, { text: 'Hej där!' });

      const [, request] = fetchMock.lastCall(teneoEngineUrl);
      expect(querystring.parse(request.body)).to.eql(expectedPayload);
    });

    it('should pass on the Engine response to the caller', async () => {
      const sessionId = '9CB85D4871939D0FD1E05BD26C456B06';
      const expectedUrl = urlWithSession(teneoEngineUrl, sessionId);
      const responseBody = {
        status: 0,
        input: { text: 'Hej där!', parameters: {} },
        output: { text: 'I do not understand', parameters: {} },
        sessionId
      };

      fetchMock.post(expectedUrl, {
        body: responseBody
      });

      const response = await TIE.sendInput(teneoEngineUrl, sessionId, { text: 'Hej där!' });
      expect(response).to.eql(responseBody);
    });

    it('should throw an error if the input data is NOT an object', () => {
      return expect(TIE.sendInput(teneoEngineUrl, null, 'foo')).to.be.rejectedWith(
        'sendInput input data must be an object with atleast a \'text\' property'
      );
    });

    it('should throw an error if the input data does NOT have a `text` property', () => {
      return expect(TIE.sendInput(teneoEngineUrl, null, { foo: 'bar' })).to.be.rejectedWith(
        'sendInput input data must be an object with atleast a \'text\' property'
      );
    });

    it('should throw an error if the input data contains complex data types', () => {
      const complexInput = {
        text: 'text',
        nestled: { x: 1 },
        array: [1, 2, 3]
      };

      return expect(TIE.sendInput(teneoEngineUrl, null, complexInput)).to.be.rejectedWith(
        'sendInput input data object can only contain values of type string, number or bool'
      );
    });

    describe('sendInput in the browser', () => {
      const clientOrigin = 'http://client-origin:3000';
      beforeEach(() => {
        global.document = { location: { origin: clientOrigin } };
      });

      afterEach(() => {
        delete global.document;
      });

      it('should send the client origin as a parameter', async () => {
        const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
        const expectedUrl = urlWithSession(teneoEngineUrl, sessionId);

        fetchMock.post(expectedUrl, {});

        await TIE.sendInput(teneoEngineUrl, sessionId, { text: 'Hej där!' });

        const [, request] = fetchMock.lastCall(expectedUrl);
        const expected = Object.assign({}, expectedPayload, { clientOrigin });

        expect(querystring.parse(request.body)).to.eql(expected);
      });
    });
  });

  describe('#close', () => {
    it('should end the current session', (done) => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(endSessionUrl, sessionId);

      fetchMock.post(expectedUrl, 200);

      TIE.close(teneoEngineUrl, sessionId, () => {
        const [, { headers }] = fetchMock.lastCall(expectedUrl);
        expect(headers.get('Cookie')).to.equal(`JSESSIONID=${sessionId}`);
        done();
      });
    });

    it('should return a Promise if no callback is passed', async () => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(endSessionUrl, sessionId);

      fetchMock.post(expectedUrl, {});

      const request = TIE.close(teneoEngineUrl, sessionId);
      expect(request).to.be.a('Promise');

      await request;

      const [, { headers }] = fetchMock.lastCall(expectedUrl);
      expect(headers.get('Cookie')).to.equal(`JSESSIONID=${sessionId}`);
    });

    it('should return a Promise if no sessionId and no callback are passed', async () => {
      fetchMock.post(endSessionUrl, {});

      const request = TIE.close(teneoEngineUrl);
      expect(request).to.be.a('Promise');

      await request;

      expect(fetchMock.lastCall(endSessionUrl)).to.exist;
    });
  });

  describe('#init', () => {
    it('should return a version of the API with the Teneo Engine URL prefilled for #sendInput', (done) => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(teneoEngineUrl, sessionId);

      fetchMock.post(expectedUrl, 200);

      const tieApi = TIE.init(teneoEngineUrl);

      tieApi.sendInput(sessionId, { text: 'Hej där!' }, () => {
        const [, request] = fetchMock.lastCall(expectedUrl);
        expect(querystring.parse(request.body)).to.eql(expectedPayload);
        expect(request.headers.get('Cookie')).to.equal(`JSESSIONID=${sessionId}`);
        done();
      });
    });

    it('should return a version of the API with the Teneo Engine URL prefilled for #close', (done) => {
      const sessionId = 'D3CE28F6558DB88B8AFCE3F36E90920B';
      const expectedUrl = urlWithSession(endSessionUrl, sessionId);

      fetchMock.post(expectedUrl, 200);

      const tieApi = TIE.init(teneoEngineUrl);

      tieApi.close(sessionId, () => {
        const [, { headers }] = fetchMock.lastCall(expectedUrl);
        expect(headers.get('Cookie')).to.equal(`JSESSIONID=${sessionId}`);
        done();
      });
    });
  });
});
