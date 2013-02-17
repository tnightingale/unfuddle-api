var should = require('should'),
    SandboxedModule = require('sandboxed-module');

var RSVP = require('rsvp'),
    Unfuddle = SandboxedModule.require('../unfuddle', {
      requires: {'restify': require('./mock-restify')}
    });

suite('Unfuddle', function () {
    var unf;

    setup(function () {
        unf = new Unfuddle('affinitybridge', 'user', 'name');
    });

    suite('#ticket()', function () {
        test('should return Promises/A promise', function () {
            var promise = unf.ticket(1, 1);
            promise.should.be.a('object').and.have.property('then');
            promise.then.should.be.a('function');
        });

        test('should resolve a valid unfuddle project ticket', function (done) {
            var success = function (ticket) {
                    ticket.should.include({
                        number: 1,
                        project_id: 1,
                        summary: "Ticket 1 summary"
                    });
                    done();
                };
            unf.ticket(1, 1).then(success, done);
        });

        test('should error on a 404/non-existant unfuddle project ticket', function (done) {
            var success = function (ticket) {
                    done(new Error('ticket found'));
                };
            unf.ticket(1, 2).then(success, function (err) {
                done();
            });
        });
    });
});
