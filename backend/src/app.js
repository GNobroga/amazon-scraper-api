const dotenv = require('dotenv');
const express = require('express');
const jsdom = require('jsdom');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

class ExtractionError extends Error {
    constructor(message) {
        super(message);
    }
}

async function getHTMLWithCallback(url, callback) {
    try {
        const { data } = await axios.get(url);
        callback?.(data);
        return data;
    } catch (err) {
        if (err instanceof ExtractionError) {
            throw err;
        }
        throw new Error(`Failed to fetch HTML content from the URL: ${url}. ${err.message}`);
    }
}

function extractItemDetailsFromHTMLElement(element) {
   try {
        const recipeTitle = element.querySelector('[data-cy=title-recipe] h2 > span')?.textContent;
        const starRating = element.querySelector('[data-cy=reviews-block] [data-cy="reviews-ratings-slot"]')?.textContent;
        const reviewCount = element.querySelector('[data-cy=reviews-block] > div:nth-child(1) > a > span')?.textContent;
        const imageUrl = element.querySelector('[data-component-type=s-product-image] img')?.src
        return {
            recipeTitle: recipeTitle || 'Sem título',
            starRating: starRating || 'Sem avaliação',
            reviewCount: reviewCount ? parseInt(reviewCount.replace('.', '')) : 0,
            imageUrl
        };
   } catch (err) {
        throw new ExtractionError('Unable to extract information about the item details');
   }
}

app.get('/api/scrape', (req, res) => {
    const { keyword =  ''} = req.query;
    getHTMLWithCallback(`https://www.amazon.com.br/s?k=${keyword}`, html => {
        const dom = new jsdom.JSDOM(html);
        const items = Array.from(dom.window.document.querySelectorAll('div[role="listitem"]'))
            .map(extractItemDetailsFromHTMLElement);
        res.json({ items });
    }).catch(err => {
        res.status(500).json(err);
    });
});



app.listen(PORT, () => console.log(`Server is listening at http://localhost:${PORT}`));