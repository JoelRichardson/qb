function d3jsonPromise(url) {
    return new Promise(function(resolve, reject) {
        d3.json(url, function(error, json){
            error ? reject(error) : resolve(json);
        })
    });
}

module.exports = {
    d3jsonPromise
}
