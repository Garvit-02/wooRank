/**
 * Maps error messages to HTTP status codes and formats error responses
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response with status code and message
 */
function handleError(error) {
  const message = error.message || 'Unknown error occurred';

  // Invalid URL errors (400)
  if (message.includes('Invalid URL') || 
      message.includes('URL must be') ||
      message.includes('Missing required field') ||
      message.includes('Invalid input type')) {
    return {
      status: 400,
      error: 'Invalid Request',
      message: message
    };
  }

  // Timeout errors (408)
  if (message.includes('timeout') || 
      message.includes('did not respond in time') ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT') {
    return {
      status: 408,
      error: 'Request Timeout',
      message: 'The request timed out while fetching the URL'
    };
  }

  // Blocked/Forbidden errors (403)
  if (message.includes('Connection refused') ||
      message.includes('blocked') ||
      error.code === 'ECONNREFUSED' ||
      (error.response && error.response.status === 403)) {
    return {
      status: 403,
      error: 'Access Forbidden',
      message: 'The website is blocking access or refusing connections'
    };
  }

  // Empty HTML errors (422)
  if (message.includes('Empty HTML') || 
      message.includes('No content')) {
    return {
      status: 422,
      error: 'Unprocessable Content',
      message: 'The page returned empty or no HTML content'
    };
  }

  // Large page errors (413)
  if (message.includes('too large') || 
      message.includes('exceeds size limit')) {
    return {
      status: 413,
      error: 'Payload Too Large',
      message: 'The page content exceeds the maximum allowed size'
    };
  }

  // DNS/Network errors (502)
  if (message.includes('DNS lookup failed') ||
      message.includes('Unable to resolve') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN') {
    return {
      status: 502,
      error: 'Bad Gateway',
      message: 'Unable to resolve the domain name'
    };
  }

  // Server errors from target (502)
  if (error.response && error.response.status >= 500) {
    return {
      status: 502,
      error: 'Bad Gateway',
      message: `Target server returned error: ${error.response.status}`
    };
  }

  // Client errors from target (400)
  if (error.response && error.response.status >= 400 && error.response.status < 500) {
    return {
      status: 400,
      error: 'Bad Request',
      message: `Target server returned error: ${error.response.status}`
    };
  }

  if (err.response && [403, 999].includes(err.response.status)) {
    return res.status(403).json({
      error: 'This website blocks automated SEO analysis.'
    });
  }
  

  // Default server error (500)
  return {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred during analysis'
  };
}

module.exports = {
  handleError
};

