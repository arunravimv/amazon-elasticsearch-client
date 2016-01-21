/*
 Custom elastic search client for Amazon elastic search service.
 */

var path = require('path');
var Q = require('q');
var AWS = require("aws-sdk");
var arrayUtils = require('./arrayUtils');
const nonBodyRequest = ['GET', 'COPY', 'HEAD', 'PURGE', 'UNLOCK', 'VIEW'];

function esClient(params) {
    var endpoint = new AWS.Endpoint(params.endpoint);
    var credentials = params.profile === undefined ? new AWS.EnvironmentCredentials('AWS') : new AWS.SharedIniFileCredentials({profile: params.profile});
    var send = new AWS.NodeHttpClient();
    var region = params.region;

    function processRequest(reqMethod, reqPath, params) {
        var deferred = Q.defer();
        try {
            var req = new AWS.HttpRequest(endpoint);
            req.method = reqMethod;
            req.path = reqPath;
            req.region = region;

            if (params && !nonBodyRequest.contains(reqMethod)) {
                req.body = JSON.stringify(params.body);
            } else {
                //Do Nothing : No params in the request or Body not supported by this request.
            }

            req.headers['presigned-expires'] = false;
            req.headers.Host = endpoint.host;
            var signer = new AWS.Signers.V4(req, 'es');
            signer.addAuthorization(credentials, new Date());
            send.handleRequest(req, null, function (httpResp) {
                var body = '';
                var status = httpResp.statusCode;
                httpResp.on('data', function (chunk) {
                    body += chunk;
                });
                httpResp.on('end', function (chunk) {
                    deferred.resolve({body: body, status: status});
                });
                httpResp.on('close', function (chunk) {
                    deferred.resolve({body: body, status: status});
                });
            }, function (err) {
                deferred.reject(err);
            });

        } catch (error) {
            console.log(error.stack);
            deferred.reject(error);
        }
        return deferred.promise;
    }

    this.indices = {
        'exists': function (params) {
            var deferred = Q.defer();
            var reqPath = path.join('/', params.index);
            processRequest('HEAD', reqPath)
                .then(function (response) {
                    if (response.status === 404) {
                        deferred.resolve(false);
                    } else if (response.status === 200) {
                        deferred.resolve(true);
                    } else {
                        deferred.reject(response);
                    }
                })
                .catch(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        'create': function (params) {
            var reqPath = path.join('/', params.index);
            delete params.index;
            delete params.type;
            return processRequest('PUT', reqPath, params);
        },
        'delete': function (params) {
            var reqPath = path.join('/', params.index);
            return processRequest('DELETE', reqPath);
        },
        putSettings: function (params) {
            var reqPath = path.join('/', params.index, '_settings');
            delete params.index;
            delete params.type;
            return processRequest('PUT', reqPath, params);
        },
        getSettings: function (params) {
            var reqPath = path.join('/', params.index, '_settings');
            return processRequest('GET', reqPath);
        },
        putMapping: function (params) {
            var reqPath = path.join('/', params.index, '_mapping', params.type);
            delete params.index;
            delete params.type;
            return processRequest('PUT', reqPath, params);
        },
        getMapping: function (params) {
            var reqPath = path.join('/', params.index, '_mapping', params.type);
            return processRequest('GET', reqPath);
        },
        updateAliases: function (params) {
            var reqPath = path.join('/', params.index, '_aliases');
            return processRequest('POST', reqPath);
        },
        closeIndex: function (params) {
            var reqPath = path.join('/', params.index, '_close');
            return processRequest('POST', reqPath);
        },

        openIndex: function (params) {
            var reqPath = path.join('/', params.index, '_open');
            return processRequest('POST', reqPath);
        }
    };
    this.index = function (params) {
        var reqPath = path.join('/', params.index, params.type, params.id);
        delete params.index;
        delete params.type;
        delete params.id;
        if (params.routing) {
            reqPath += '?routing' + params.routing;
            delete params.routing;
        }
        return processRequest('POST', reqPath, params);
    };
    this.search = function (params) {
        var reqPath = path.join('/', params.index, params.type, '_search');
        delete params.index;
        delete params.type;
        delete params.id;
        if (params.routing) {
            reqPath += '?routing=' + params.routing;
            delete params.routing;
        }
        return processRequest('POST', reqPath, params);
    };
}

module.exports = esClient;