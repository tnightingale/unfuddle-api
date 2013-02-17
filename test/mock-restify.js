var restify = require('restify');

restify.createJsonClient = function (options) { return new MockUnfuddleClient(); };

module.exports = restify;

function MockUnfuddleClient() {
    this.listeners = [];
    this.tickets = [
        { number: 1, project_id: 1, summary: "Ticket 1 summary"}
    ];
    this.listen(/api\/v1\/projects\/(\d+)\/tickets\/by_number\/(\d+)/, this.ticketByNumber);
}

MockUnfuddleClient.prototype.basicAuth = function (user, password) {};

MockUnfuddleClient.prototype.listen = function (regex, cb) {
    this.listeners.push({expression: regex, response: cb});
};

MockUnfuddleClient.prototype.get = function (path, cb) {
    this.listeners.forEach(function (listener) {
        var matches = path.match(listener.expression);
        if (matches.length > 0) {
            var args = matches.filter(function (match, i) { return i !== 0; });
            args.push(cb);
            listener.response.apply(this, args);
            return;
        }
    }, this);
    this.HttpRes404(cb);
};

MockUnfuddleClient.prototype.ticketByNumber = function (project_id, number, cb) {
    this.tickets.forEach(function (ticket) {
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
