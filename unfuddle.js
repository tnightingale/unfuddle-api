var https = require('https'),
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
            path = '/api/{v}/projects/{id}/tickets/by_number/{number}'
                    .replace('{v}', version)
                    .replace('{id}', project_id)
                    .replace('{number}', number);

        this.client.get(path, function (err, req, res, obj) {
            if (err) promise.reject({ err: err, req: req, res: res, obj: obj });

            cache.tickets.push(obj);
            promise.resolve(obj);
        });
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
        this.client.get('/api/' + version + '/projects', function (err, req, res, obj) {
            if (err) promise.reject({ err: err, req: req, res: res, obj: obj });

            cache.projects = obj;
            promise.resolve(obj);
        });
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
            path = '/api/{v}/projects/{id}'
                        .replace('{v}', version)
                        .replace('{id}', id);

        this.client.get(path, function (err, req, res, obj) {
            if (err) {
                if (err.statusCode === 404) {
                    err = new restify.ResourceNotFoundError("Project: '" + id + "', not found");
                }
                promise.reject(err);
            }

            cache.projects.push(obj);
            promise.resolve(obj);
        });
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
            path = '/api/{v}/projects/by_short_name/{name}'
                    .replace('{v}', version)
                    .replace('{name}', name);

        this.client.get(path, function (err, req, res, obj) {
            if (err) {
                if (err.statusCode === 404) {
                    err = new restify.ResourceNotFoundError("Project: '" + name + "', not found");
                }
                promise.reject(err);
            }

            cache.projects.push(obj);
            promise.resolve(obj);
        });
    }

    return promise;
};

Unfuddle.prototype.checkCache = function (bin, condition) {
    var cache = this.cache;
    if (bin in cache && cache[bin].length) {
        return _.find(cache[bin], condition);
    }
};
