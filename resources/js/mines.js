// Would be best to populate this list by accessing the InterMine
// registry at: http://registry.intermine.org/service/instances
// Unfortunately, we get a 'Access-Control-Allow-Origin' CORS error.
//

module.exports = { mines: [{
    "name" : "test",
    "url" : "./resources/testdata/",
    "templates" : null,
    "model" : null
    },{
    "name" : "MouseMine",
    "url" : "http://www.mousemine.org/mousemine/",
    "templates" : null,
    "model" : null
    },{
    "name" : "PhytoMine",
    "url" : "https://phytozome.jgi.doe.gov/phytomine/",
    "templates" : null,
    "model" : null
    },{
    "name" : "RatMine",
    "url" : "http://ratmine.mcw.edu/ratmine/",
    "templates" : null,
    "model" : null
    },{
    "name" : "FlyMine",
    "url" : "http://www.flymine.org/query/",
    "templates" : null,
    "model" : null
}]
};
