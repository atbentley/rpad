function async(method, url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf('http') == -1) {
                callback(request.responseText);
            }
        }
    }
    request.open(method, url);
    request.send(null);
}