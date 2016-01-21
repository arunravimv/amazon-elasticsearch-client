### importing custom client class

var arrayUtils = require('./utils/arrayUtils');
var EsClient = require('./utils/customElasticSearchClient');

### Dependencies
npm install aws-sdk, npm install q

### Creating Client Instance

var esClient = new EsClient({
    endpoint: '', 
    region: '', 
    profile: ''});

###### Please Note : if using profile based creedential loading, put your credential at '~/.aws/credential' file. refer AWS Docs. Give profile undefined, to use IAM role based credential

### Api Usage 

#### index
        var params = {
            index: indexName,
            type: docType,
            id: id,
            body: body
        };
         esClient.index(params);
         
#### indexExist
        var params = {
            index: indexName
        };
         esClient.indices.exists(params);

#### index create

        var params = {
            index: indexName,
            body: {
                mappings: mappings,
                settings: settings
            }
        };
         esClient.indices.create(params)

#### search

        var params = {
            index: indexName,
            type: docType,
            body: dslQuery
        };
         esClient.search(params)
         
#### put settings
        var params = {
            index: indexName,
            body: settings
        };

         esClient.indices.putSettings(params);
         
#### index close

         esClient.indices.close({index: index});

#### index open

         esClient.indices.open({index: index});

#### aliases update

        var actions = [];

        actions.push({
            remove: {index: "*", alias: aliasName}
        });
        actions.push({
            add: {index: indexName, alias: aliasName}
        });

         esClient.indices.updateAliases({
            body: {
                actions: actions
            }
        });
#### delete index
        

         var params = {
            index: indexNames
        };
         esClient.indices.delete(params);
