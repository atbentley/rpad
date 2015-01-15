function async(method, url, callback, data, headers) {
    var request = new XMLHttpRequest();
    request.open(method, url);

    if (typeof headers === 'undefined') {
        request.setRequestHeader('Content-Type', 'application/json');
    } else {
        for (var key in headers) {
            request.setRequestHeader(key, headers[key]);
        }
    }
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf('http') == -1) {
                callback(request.responseText);
            }
        }
    }
    request.send(data);
}