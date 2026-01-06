const express = require('express');
const router = express.Router();
const { fetchHTML, parseSEOData, calculateScore } = require('../services/seoService');
const { handleError } = require('../utils/errorHandler');

router.post('/', async (req, res) => {
  const { url } = req.body;

  // Validate URL exists
  if (!url) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'URL is required in request body'
    });
  }

  // Validate URL is a string
  if (typeof url !== 'string') {
    return res.status(400).json({
      error: 'Invalid input type',
      message: 'URL must be a string'
    });
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    
    // Ensure URL uses http or https protocol
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.status(400).json({
        error: 'Invalid URL protocol',
        message: 'URL must use http or https protocol'
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid URL format',
      message: 'URL must be a valid URL'
    });
  }

  // Perform SEO analysis
  try {
    // Fetch HTML content
    const html = await fetchHTML(url);

    // Parse SEO data
    const seoData = parseSEOData(html, url);

    // Calculate score
    const scoreResult = calculateScore(seoData);

    // Combine all checks (passed + issues) for complete overview
    const checks = [...scoreResult.passedChecks, ...scoreResult.issues];

    // Return analysis results
    res.json({
      url,
      seoScore: scoreResult.score,
      checks,
      issues: scoreResult.issues,
      passedChecks: scoreResult.passedChecks
    });
  } catch (error) {
    // Centralized error handling
    const errorResponse = handleError(error);
    res.status(errorResponse.status).json({
      error: errorResponse.error,
      message: errorResponse.message
    });
  }
});

module.exports = router;

