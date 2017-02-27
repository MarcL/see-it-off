var express = require('express');

const port = 7080;
const app = express();

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on: ${port}`);
});
