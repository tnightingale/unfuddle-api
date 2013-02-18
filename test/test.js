var should = require('should'),
    SandboxedModule = require('sandboxed-module');

var Unfuddle = SandboxedModule.require('../unfuddle', {
        requires: {
            'restify': require('./mock-restify'),
        }
    });

// Dummy data.
var projects = [
        { id: 1, short_name: "project1", title: "Project 1" },
        { id: 2, short_name: "project2", title: "Project 2" }
    ],
    tickets = [
        { number: 1, project_id: 1, summary: "Ticket 1 summary"}
    ];


suite('Unfuddle', function () {
    var unf;

    setup(function () {
        unf = new Unfuddle('affinitybridge', 'user', 'name');
        unf.client._projects = projects;
        unf.client._tickets = tickets;
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

    suite('#projects()', function () {
        test('should return Promises/A promise', function () {
            var promise = unf.projects();
            promise.should.be.a('object').and.have.property('then');
            promise.then.should.be.a('function');
        });

        test('should return a list of projects', function (done) {
            var success = function (projects) {
                projects.should.be.an.instanceOf(Array).and.have.length(2);
                done();
            };
            unf.projects().then(success, done);
        });
    });

    suite('#projectById()', function () {
        test('should return Promises/A promise', function () {
            var promise = unf.projectById(1);
            promise.should.be.a('object').and.have.property('then');
            promise.then.should.be.a('function');
        });

        test('should return a valid unfuddle project', function (done) {
            var success = function (project) {
                    project.should.include({
                        id: 1,
                        short_name: 'project1',
                        title: "Project 1"
                    });
                    done();
                };
            unf.projectById(1).then(success, done);
        });

        test('should error on a 404/non-existant unfuddle project', function (done) {
            var success = function (project) {
                    done(new Error('project found'));
                };
            unf.projectById(3).then(success, function (err) {
                done();
            });
        });
    });

    suite('#projectByShortName()', function () {
        test('should return Promises/A promise', function () {
            var promise = unf.projectByShortName("project-1");
            promise.should.be.a('object').and.have.property('then');
            promise.then.should.be.a('function');
        });

        test('should return a valid unfuddle project', function (done) {
            var success = function (project) {
                    project.should.include({
                        id: 1,
                        short_name: 'project1',
                        title: "Project 1"
                    });
                    done();
                };
            unf.projectByShortName('project1').then(success, done);
        });

        test('should error on a 404/non-existant unfuddle project', function (done) {
            var success = function (project) {
                    done(new Error('project found'));
                };
            unf.projectByShortName('project3').then(success, function (err) {
                done();
            });
        });
    });
});
