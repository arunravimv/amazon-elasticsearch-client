

### Creating Client Instance

var esClient = new EsClient({
    endpoint: appCfg.aws.es.endpoint,
    region: appCfg.aws.region,
    profile: profile
});

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
