var Util = require('util'),
    _ = require('underscore'),
    RSVP = require('rsvp'),
    restify = require('restify');

var domain = "https://{s}.unfuddle.com",
    version = 'v1';

module.exports = Unfuddle;

function Unfuddle(subdomain, user, password) {
    this.cache = { projects: [], tickets: [] };
    this.client = restify.createJsonClient({
        url: domain.replace('{s}', subdomain)
    });
    this.client.basicAuth(user, password);
}

Unfuddle.prototype.ticket = function (project_id, number) {
    var promise = new RSVP.Promise(),
        ticket = this.checkCache('tickets', function (t) {
            return t.number === number && t.project_id === project_id;
        });

    if (ticket) {
        promise.resolve(ticket);
    }
    else {
        var cache = this.cache,
            path = Util.format('/api/%s/projects/%d/tickets/by_number/%d', version, project_id, number);

        this.client.get(path, function (err, req, res, obj) {
            if (err) {
                var message = "Ticket: %d, not found in project: %d";
                promise.reject(this.error(err, Util.format(message, number, project_id)));
            }

            cache.tickets.push(obj);
            promise.resolve(obj);
        }.bind(this));
    }

    return promise;
};

Unfuddle.prototype.projects = function () {
    var cache = this.cache,
        promise = new RSVP.Promise();

    if (cache.projects.length) {
        promise.resolve(cache.projects)
    }
    else {
        this.client.get(Util.format('/api/%s/projects', version), function (err, req, res, obj) {
            if (err) promise.reject(this.error(err, "Unable to get list of projects"));
            cache.projects = obj;
            promise.resolve(obj);
        }.bind(this));
    };

    return promise;
};

Unfuddle.prototype.projectById = function (id) {
    var promise = new RSVP.Promise(),
        project = this.checkCache('projects', function (p) { return p.id === id; });

    if (project) {
        promise.resolve(project);
    }
    else {
        var cache = this.cache,
            path = Util.format('/api/%s/projects/%d', version, id);

        this.client.get(path, function (err, req, res, obj) {
            if (err) {
                var message = "Project: %d, not found.";
                promise.reject(this.error(err, Util.format(message, id)));
            }
            cache.projects.push(obj);
            promise.resolve(obj);
        }.bind(this));
    }

    return promise;
};

Unfuddle.prototype.projectByShortName = function (name) {
    var promise = new RSVP.Promise(),
        project = this.checkCache('projects', function (p) { return p.short_name == name; });

    if (project) {
        promise.resolve(project);
    }
    else {
        var cache = this.cache,
            path = Util.format('/api/%s/projects/by_short_name/%s', version, name);

        this.client.get(path, function (err, req, res, obj) {
            if (err) {
                var message = "Project: %s, not found.";
                promise.reject(this.error(err, Util.format(message, name)));
            }
            cache.projects.push(obj);
            promise.resolve(obj);
        }.bind(this));
    }

    return promise;
};

Unfuddle.prototype.checkCache = function (bin, condition) {
    var cache = this.cache;
    if (bin in cache && cache[bin].length) {
        return _.find(cache[bin], condition);
    }
};

Unfuddle.prototype.error = function (err, message) {
    if ('statusCode' in err) {
        switch(err.statusCode) {
            case 404:
            err = new restify.ResourceNotFoundError(message || "");
        }
    }
    return err;
};
