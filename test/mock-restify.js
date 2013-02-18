var restify = require('restify');

restify.createJsonClient = function (options) { return new MockUnfuddleClient(); };

module.exports = restify;

function MockUnfuddleClient() {
    this._listeners = [];
    this._projects = [];
    this._tickets = [];
    this.listen(/^\/api\/v1\/projects$/, this.projects);
    this.listen(/^\/api\/v1\/projects\/(\d+)$/, this.projectById);
    this.listen(/^\/api\/v1\/projects\/by_short_name\/(\w+)$/, this.projectByShortName);
    this.listen(/^\/api\/v1\/projects\/(\d+)\/tickets\/by_number\/(\d+)$/, this.ticketByNumber);
}

MockUnfuddleClient.prototype.basicAuth = function (user, password) {};

MockUnfuddleClient.prototype.listen = function (regex, cb) {
    this._listeners.push({expression: regex, response: cb});
};

MockUnfuddleClient.prototype.get = function (path, cb) {
    this._listeners.forEach(function (listener) {
        var matches = path.match(listener.expression);
        if (matches && matches.length > 0) {
            var args = matches.filter(function (match, i) { return i !== 0; });
            args.push(cb);
            listener.response.apply(this, args);
            return;
        }
    }, this);
    this.HttpRes404(cb);
};

MockUnfuddleClient.prototype.projects = function (cb) {
    cb(null, {}, {}, this._projects);
};

MockUnfuddleClient.prototype.projectById = function (id, cb) {
    this._projects.forEach(function (project) {
        if (project.id === +id) {
            cb(null, {}, {}, project);
            return;
        }
    });
    this.HttpRes404(cb);
};

MockUnfuddleClient.prototype.projectByShortName = function (name, cb) {
    this._projects.forEach(function (project) {
        if (project.short_name === name) {
            cb(null, {}, {}, project);
            return;
        }
    });
    this.HttpRes404(cb);
};

MockUnfuddleClient.prototype.ticketByNumber = function (project_id, number, cb) {
    this._tickets.forEach(function (ticket) {
        if (ticket.project_id === +project_id && ticket.number === +number) {
            cb(null, {}, {}, ticket);
            return;
        }
    });
    this.HttpRes404(cb);
};

MockUnfuddleClient.prototype.HttpRes404 = function (cb) {
    cb({ statusCode: 404 }, {}, {}, null);
};
