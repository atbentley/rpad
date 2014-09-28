function async(method, url, callback, data) {
    var request = new XMLHttpRequest();
    request.open(method, url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf('http') == -1) {
                callback(request.responseText);
            }
        }
    }
    request.send(data);
}