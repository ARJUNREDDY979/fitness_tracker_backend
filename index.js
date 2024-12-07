const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
async function main() {
    const uri = `mongodb+srv://arjun:pogula@cluster0.agkvy.mongodb.net/Fitnessdb?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

const server = http.createServer(async (req, res) => {
  console.log(`Requested URL: ${req.url}`);

  // Serve portfolio website at root
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  // Serve API data
  else if (req.url === '/api') {
    // Add CORS headers
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });    
    const uri = `mongodb+srv://arjun:pogula@cluster0.agkvy.mongodb.net/Fitnessdb?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        let response = await getDataFromMongo(client)
        res.end(JSON.stringify(response))
    }catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
} else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(" <h1> 404 Nothing Found </h1>")
}
});

async function getDataFromMongo(client) {
  const cursor = client.db("Fitnessdb").collection("Fitnesscollection")
      .find();
  const results = await cursor.toArray();
  if (results.length > 0) {
      return results[0];
  } else {
      console.log(`No results`);
  }
}

// Set the port and start the server
const PORT = process.env.PORT || 5544;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
