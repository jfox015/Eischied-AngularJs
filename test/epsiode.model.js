const { expect } = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const Episode = require('../models/Episodes');

describe('Episode Model', () => {
  it('should create a new episode', (done) => {
    const EpisodeMock = sinon.mock(new Episode({ number: 100, title: 'Test title', director: 'test String', writer: 'test Writer', airDate: "2018-10-11" }));
    const episode = EpisodeMock.object;

    EpisodeMock
      .expects('save')
      .yields(null);

    episode.save((err) => {
      EpisodeMock.verify();
      EpisodeMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should return error if episode is not created', (done) => {
    const EpisodeMock = sinon.mock(new Episode({ number: 100, title: 'Test title', director: 'test String', writer: 'test Writer', airDate: "2018-10-11" }));
    const episode = EpisodeMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find episode by number', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      number: 100
    };

    userMock
      .expects('findOne')
      .withArgs({ number: 100 })
      .yields(null, expectedUser);

    User.findOne({ number: 100 }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.number).to.equal(100);
      done();
    });
  });

  it('should remove episode by number', (done) => {
    const EpisodeMock = sinon.mock(Episode);
    const expectedResult = {
      nRemoved: 1
    };

    EpisodeMock
      .expects('remove')
      .withArgs({ number: 100 })
      .yields(null, expectedResult);

    Episode.remove({ number: 100 }, (err, result) => {
      EpisodeMock.verify();
      EpisodeMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    });
  });
});