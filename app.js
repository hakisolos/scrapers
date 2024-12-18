// Import necessary modules
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Base URL for the quotes website
const BASE_URL = 'https://quotes.toscrape.com/tag/';

// Define a route to fetch quotes based on category
app.get('/api/quotes', async (req, res) => {
    // Step 1: Get the category from the query parameter
    const category = req.query.q;
    
    // Step 2: Validate the category parameter
    if (!category) {
        return res.status(400).json({ 
            founder: "H4KI XER",
            company: "NIKKA BOTZ INC",
            success: false, 
            message: "Category query parameter 'q' is required." 
        });
    }

    // Step 3: Construct the URL based on the category
    const URL = `${BASE_URL}${category}/`;

    try {
        // Step 4: Fetch the HTML from the constructed URL
        const { data: html } = await axios.get(URL);

        // Step 5: Load the HTML into Cheerio for parsing
        const $ = cheerio.load(html);

        // Step 6: Create an array to store the extracted quotes
        const quotes = [];

        // Step 7: Select each quote element and extract data
        $('.quote').each((index, element) => {
            const text = $(element).find('.text').text().trim(); // Extract the quote text
            const author = $(element).find('.author').text().trim(); // Extract the author
            const tags = [];

            // Extract all tags associated with the quote
            $(element).find('.tags .tag').each((_, tagElement) => {
                tags.push($(tagElement).text().trim());
            });

            // Push the extracted data into the quotes array
            if (text && author) {
                quotes.push({ text, author, tags });
            }
        });

        // Step 8: Return the extracted quotes as JSON
        if (quotes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `No quotes found for category '${category}'.` 
            });
        }

        res.json({ success: true, quotes });
    } catch (error) {
        // Step 9: Handle errors such as invalid categories or network issues
        console.error('Error fetching the website:', error.message);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while fetching quotes.",
            error: error.message 
        });
    }
});
const BASE_URL2 = 'https://www.lyrics.com/';

// Define a route to fetch lyrics by song name
app.get('/api/lyrics', async (req, res) => {
    // Step 1: Get the song name from the query parameter
    const song = req.query.q;

    // Step 2: Validate the song parameter
    if (!song) {
        return res.status(400).json({ 
            success: false, 
            message: "Song query parameter 'q' is required." 
        });
    }

    // Step 3: Construct the search URL
    const searchURL = `${BASE_URL2}serp.php?st=${encodeURIComponent(song)}`;

    try {
        // Step 4: Fetch the search results page
        const { data: searchHTML } = await axios.get(searchURL);

        // Step 5: Load the search results HTML into Cheerio
        const $ = cheerio.load(searchHTML);

        // Step 6: Extract the first search result link
        const firstResultLink = $('.sec-lyric a').first().attr('href');
        if (!firstResultLink) {
            return res.status(404).json({
                success: false,
                message: `No lyrics found for the song '${song}'.`
            });
        }

        // Step 7: Construct the URL for the lyrics page
        const lyricsURL = `${BASE_URL2}${firstResultLink}`;

        // Step 8: Fetch the lyrics page
        const { data: lyricsHTML } = await axios.get(lyricsURL);

        // Step 9: Load the lyrics page HTML into Cheerio
        const lyricsPage = cheerio.load(lyricsHTML);

        // Step 10: Extract the lyrics text
        const lyrics = lyricsPage('.lyric-body').text().trim();

        // Step 11: Return the lyrics in JSON format
        if (!lyrics) {
            return res.status(404).json({
                success: false,
                message: `Lyrics not found for the song '${song}'.`
            });
        }

        res.json({
            success: true,
            song,
            lyrics,
            source: lyricsURL
        });
    } catch (error) {
        // Step 12: Handle errors and respond with appropriate messages
        console.error('Error scraping lyrics:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching lyrics.",
            error: error.message
        });
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
