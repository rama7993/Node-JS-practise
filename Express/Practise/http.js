const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("Hello http World");
    res.end();
  } else if (req.url === "/api/recipes") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(["Chicken", "Biryani", "Coke"]));
    res.end();
  } else if (req.url === "/buffer") {
    const buffer = Buffer.from("Hello Buffer World", "utf-8");
    res.writeHead(200, { "Content-Type": "application/octet-stream" });
    res.write(buffer);
    res.end();
  } else if (req.url === "/api/binary") {
    const binaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello" in hex
    res.writeHead(200, { "Content-Type": "application/octet-stream" });
    res.write(binaryData);
    res.end();
  } else if (req.url === "/content-type") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(
      JSON.stringify({
        plainText: "text/plain",
        html: "text/html",
        css: "text/css",
        javascript: "application/javascript",
        json: "application/json",
        xml: "application/xml",
        png: "image/png",
        jpeg: "image/jpeg",
        gif: "image/gif",
        octetStream: "application/octet-stream",
        urlEncoded: "application/x-www-form-urlencoded",
        multipartForm: "multipart/form-data",
      })
    );
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404 Not Found");
    res.end();
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000...");
});
