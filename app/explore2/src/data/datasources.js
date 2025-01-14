const datasources = {

  'wikipedia': {
    active:                 true,
    name:                   'Wikipedia',
    description:            'encyclopedic topics',
    qid:                    'Q52',
    protocol:               'rest',
    endpoint:               'wikipedia.org/w/api.php',
    format:                 'json',
    connect:                'jsonp',
    pagesize:               5,
    filter:                 '0|14', // Wikipedia-API specific: list of Wikipedia namespaces
    url:                    'https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&format=${datasources.wikipedia.format}&srsearch=${term}&srnamespace=${datasources.wikipedia.filter}&srlimit=${datasources.wikipedia.pagesize}&list=search&continue=-||&sroffset=${ (explore.page -1) * datasources.wikipedia.pagesize}',
    icon:                   '<i class="fa-brands fa-wikipedia-w"></i>',
    code_data_collect:      'my_promises.push( processWikipediaResults( topicResults, struct, index ) );', // FIXME: invert control (see next line)
    //code_data_collect:      'processWikipediaResults( my_promises, topicResults, struct, index );',
    code_autocomplete_pre:  'autocompletePreWikipedia( r, dataset )',
    code_resolve:           'resolveWikipedia( result, renderObject )',
    code_render_mark:       'renderMarkWikipedia( inputs, source, q_, show_raw_results, id )',
    autocomplete_active:    true,
    autocomplete_protocol:  'opensearch',
    autocomplete_url:       'https://${explore.language}.wikipedia.org/w/api.php?action=${datasources.wikipedia.autocomplete_protocol}&format=${datasources.wikipedia.autocomplete_format}&search=${term}&namespace=${datasources.wikipedia.autocomplete_filter}&limit=${datasources.wikipedia.autocomplete_limit}&profile=${datasources.wikipedia.autocomplete_mode}',
    autocomplete_format:    'json',
    autocomplete_connect:   'jsonp',
    autocomplete_limit:     7,
    autocomplete_filter:    '0|14', // Wikipedia-API specific: list of Wikipedia namespaces
    autocomplete_mode:      'fuzzy',
  },

  'wikidata': {
    active:                 true,
    name:                   'Wikidata',
    description:            'knowledge base topics',
    qid:                    'Q2013',
    protocol:               'sparql',
    endpoint:               'https://query.wikidata.org/sparql',
    format:                 'json',
    connect:                'json',
    pagesize:               5, // NOTE: sync this value with "structured query builder"!
    filter:                 '',
    count_url:              '${datasources.wikidata.endpoint}?format=${datasources.wikidata.format}&query=SELECT (COUNT(*) AS ?count) WHERE { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${term}" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item.  } FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } }',
    url:                    '${datasources.wikidata.endpoint}?format=${datasources.wikidata.format}&query=SELECT DISTINCT ?item ?itemLabel WHERE { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${term}" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item.  } FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } } OFFSET ${ (explore.page -1) * datasources.wikidata.pagesize } LIMIT ${datasources.wikidata.pagesize}',
    icon:                   '<img class="datasource-icon" src="/assets/icons/wikidata.png"></img>',
    code_autocomplete_pre:  'autocompletePreWikidata( r, dataset )',
    code_data_collect:      'processWikidataResults( my_promises, topicResults, struct, index );',
    code_resolve:           'resolveWikidata( result, renderObject )',
    code_count:             'countWikidata( r, struct, index )',
    code_render_mark:       'renderMarkWikidata( inputs, source, q_, show_raw_results, id )',
    instance:               'https://www.wikidata.org',             // Wikibase specific
    instance_api:           'https://www.wikidata.org/w/api.php',   // Wikibase specific
    autocomplete_active:    true,
    autocomplete_protocol:  'sparql',
    autocomplete_url:       '${datasources.wikidata.endpoint}?format=${datasources.wikidata.autocomplete_format}&query=SELECT DISTINCT ?item ?itemLabel { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${term}" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam wikibase:limit ${datasources.wikidata.autocomplete_limit} .  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item. ?num wikibase:apiOrdinal true.  } ?item (wdt:P279|wdt:P31) ?type.  FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } } ORDER BY ?searchTerm ?num',
    autocomplete_format:    'json',
    autocomplete_connect:   'json',
    autocomplete_limit:     5,
    autocomplete_mode:      '',
  },

  'gleif': {
    active:                 false,
    name:                   'GLEIF',
    description:            'legal entities',
    qid:                    'Q6517388',
    protocol:               'rest',
    endpoint:               'https://api.gleif.org/api/v1/lei-records',
    format:                 'json',
    connect:                'json',
    pagesize:               5,
    url:                    '${datasources.gleif.endpoint}?page[size]=${datasources.gleif.pagesize}&page[number]=${explore.page}&filter[entity.names]=${term}',
    icon:                   '<img class="datasource-icon" src="/assets/icons/gleif.svg" alt="Gleif logo">',
    code_autocomplete_pre:  'autocompletePreGleif( r, dataset )',
    code_data_collect:      'my_promises.push( processGleifResults( topicResults, struct, index ) );',
    code_resolve:           'resolveGleif( result, renderObject )',
    code_render_mark:       'renderMarkGleif( inputs, source, q_, show_raw_results, id )',
    autocomplete_active:    true,
    autocomplete_protocol:  'json',
    autocomplete_url:       'https://api.gleif.org/api/v1/lei-records?page[size]=${datasources.gleif.autocomplete_limit}&page[number]=1&filter[entity.names]=${term}',
    autocomplete_format:    'json',
    autocomplete_connect:   'json',
    autocomplete_limit:     5,
  },

};
