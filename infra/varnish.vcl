vcl 4.1;

backend minio {
    .host = "caddy";
    .port = "8080";
}

sub vcl_recv {
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }
}

sub vcl_backend_response {
    set beresp.ttl = 10m;
}
