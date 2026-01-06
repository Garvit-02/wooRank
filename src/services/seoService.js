const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

/**
 * Fetches HTML content from a given URL
 * @param {string} url - The URL to fetch
 * @param {number} timeout - Request timeout in milliseconds (default: 10000)
 * @returns {Promise<string>} Raw HTML content
 * @throws {Error} Readable error message for various failure scenarios
 */
async function fetchHTML(url, timeout = 10000) {
  try {
    const response = await axios.get(url, {
      timeout: timeout,
      headers: {
        'User-Agent': 'SEO-Analyzer-Bot/1.0'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Allow invalid SSL certificates
      }),
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300
    });

    // Ensure response is HTML/text
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('URL does not return HTML content');
    }

    const html = response.data;

    // Check for empty HTML
    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      throw new Error('Empty HTML: Page returned no content');
    }

    // Check for large pages (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (html.length > MAX_SIZE) {
      throw new Error('Page too large: Content exceeds 10MB limit');
    }

    return html;
  } catch (error) {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: URL did not respond in time');
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      throw new Error('DNS lookup failed: Unable to resolve domain name');
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused: Server is not accepting connections');
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error('Connection timeout: Unable to establish connection');
    }

    // Handle HTTP errors
    if (error.response) {
      const status = error.response.status;
      if (status >= 400 && status < 500) {
        throw new Error(`Client error: Server returned ${status} status code`);
      }
      if (status >= 500) {
        throw new Error(`Server error: Server returned ${status} status code`);
      }
      throw new Error(`HTTP error: Server returned ${status} status code`);
    }

    // Handle SSL errors (if rejectUnauthorized was true)
    if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || 
        error.code === 'CERT_HAS_EXPIRED' ||
        error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      throw new Error('SSL certificate error: Invalid or expired certificate');
    }

    // Handle other axios errors
    if (error.message) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }

    // Fallback for unknown errors
    throw new Error('Unknown error occurred while fetching URL');
  }
}

/**
 * Parses HTML content and extracts SEO-related data
 * @param {string} html - Raw HTML content
 * @param {string} url - Original URL for determining internal links and HTTPS
 * @returns {Object} SEO analysis results
 */
function parseSEOData(html, url) {
  const $ = cheerio.load(html);
  const urlObj = new URL(url);
  const baseDomain = urlObj.hostname;

  // Extract page title
  const title = $('title').first().text().trim() || null;

  // Extract meta description
  const metaDescription = $('meta[name="description"]').attr('content') || 
                          $('meta[name="Description"]').attr('content') || 
                          null;

  // Count H1 tags
  const h1Count = $('h1').length;

  // Count total images
  const totalImages = $('img').length;

  // Count images missing alt attribute
  let imagesMissingAlt = 0;
  $('img').each((_, element) => {
    const alt = $(element).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') {
      imagesMissingAlt++;
    }
  });

  // Count total internal links
  let totalInternalLinks = 0;
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    try {
      // Handle relative URLs
      if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
        totalInternalLinks++;
        return;
      }

      // Handle absolute URLs
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === baseDomain) {
        totalInternalLinks++;
      }
    } catch (err) {
      // Invalid URL format, skip
    }
  });

  // Check if site uses HTTPS
  const usesHTTPS = urlObj.protocol === 'https:';

  return {
    title,
    metaDescription,
    h1Count,
    totalImages,
    imagesMissingAlt,
    totalInternalLinks,
    usesHTTPS
  };
}

/**
 * Calculates SEO score based on parsed data
 * @param {Object} seoData - SEO data from parseSEOData
 * @returns {Object} Score object with score (0-100), issues, and passedChecks
 */
function calculateScore(seoData) {
  const checks = [];
  const issues = [];
  const passedChecks = [];
  let score = 0;

  // Define scoring criteria (easy to modify)
  const SCORING = {
    TITLE_PRESENT: { points: 20, message: 'Page has a title tag' },
    META_DESCRIPTION_PRESENT: { points: 20, message: 'Page has a meta description' },
    H1_PRESENT: { points: 20, message: 'Page has at least one H1 tag' },
    IMAGES_HAVE_ALT: { points: 20, message: 'All images have alt text' },
    USES_HTTPS: { points: 20, message: 'Page uses HTTPS' }
  };

  // Check 1: Title present (20 points)
  if (seoData.title) {
    score += SCORING.TITLE_PRESENT.points;
    passedChecks.push(SCORING.TITLE_PRESENT.message);
  } else {
    issues.push('Missing page title tag');
  }

  // Check 2: Meta description present (20 points)
  if (seoData.metaDescription) {
    score += SCORING.META_DESCRIPTION_PRESENT.points;
    passedChecks.push(SCORING.META_DESCRIPTION_PRESENT.message);
  } else {
    issues.push('Missing meta description');
  }

  // Check 3: At least one H1 (20 points)
  if (seoData.h1Count >= 1) {
    score += SCORING.H1_PRESENT.points;
    passedChecks.push(SCORING.H1_PRESENT.message);
  } else {
    issues.push('No H1 tags found on the page');
  }

  // Check 4: Images with alt text (20 points)
  // Pass if no images OR all images have alt text
  if (seoData.totalImages === 0 || seoData.imagesMissingAlt === 0) {
    score += SCORING.IMAGES_HAVE_ALT.points;
    passedChecks.push(SCORING.IMAGES_HAVE_ALT.message);
  } else {
    issues.push(`${seoData.imagesMissingAlt} image(s) missing alt text`);
  }

  // Check 5: HTTPS usage (20 points)
  if (seoData.usesHTTPS) {
    score += SCORING.USES_HTTPS.points;
    passedChecks.push(SCORING.USES_HTTPS.message);
  } else {
    issues.push('Page does not use HTTPS');
  }

  // Ensure score never exceeds 100
  score = Math.min(score, 100);

  return {
    score,
    issues,
    passedChecks
  };
}

module.exports = {
  fetchHTML,
  parseSEOData,
  calculateScore
};

