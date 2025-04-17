// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';


/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return { error: err.message };
  }
}
/**
 * Posts a new fragment for the authenticated user.
 *
 * @param {Object} user - The authenticated user.
 * @param {Object} fragment - The fragment to be posted (contains type and value properties).
 * @returns {string} - The response data from the API.
 */
export async function postFragment_API(user, fragment) {
  console.log('Posting fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': fragment.type,
      },
      body: fragment.value,
    });
    // Catching Known Errors
    if (res.status === 404 || res.status === 415) {
      let data = await res.json();
      return {
        data,
        type: 'json',
      };
    }
    // Catching Unknown Errors
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    // Everything is good...
    const data = await res.json();
    console.log('Got the Response.', data);
    return {
      data,
      type: 'json',
    };
  } catch (err) {
    console.error('Unable to call Post /v1/fragment', { err });
    return {
      type: 'json',
      data: { error: err.message },
    };
  }
}

/**
 * Updates a fragment with the given ID.
 * 
 * @param {Object} user - The authenticated user.
 * @param {string} id - The ID of the fragment to update.
 * @param {Object} fragment - The fragment data to update (contains type and value).
 * @returns {Object} - The response data from the API.
 */
export async function updateFragment_API(user, id, fragment) {
  console.log('Updating fragment data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': fragment.type,
      },
      body: fragment.value,
    });
    
    // Handle known error codes
    if (res.status === 404 || res.status === 400) {
      let data = await res.json();
      return {
        data,
        type: 'json',
      };
    }
    
    // Handle unknown errors
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    
    // Handle successful response
    const data = await res.json();
    console.log('Got update response', data);
    return {
      data,
      type: 'json',
    };
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments/:id', { err });
    return {
      type: 'json',
      data: { error: err.message },
    };
  }
}

export async function getFragmentById_API(user, id) {
  console.log('Requesting to get fragment data..');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    // Catching Known Errors
    if (res.status === 404 || res.status === 415) {
      let data = await res.json();
      return {
        data,
        type: 'json',
      };
    }
    // Catching Unknown Errors
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    else {
      // Extract response headers
    const headers = [];
    res.headers.forEach((value, key) => {
      headers.push(`${key}: ${value}`);
    });

    // Extract body
    const body = await res.text();

    // Construct the full HTTP response format
    const responseString = `HTTP/1.1 ${res.status} ${res.statusText}\n${headers.join('\n')}\n\n${body}`;

    console.log('Got user fragment', { responseString });

    return responseString;
    }
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return {
      type: 'json',
      data: { error: err.message },
    };
  }
}

/**
 * Downloads a fragment with optional conversion.
 * 
 * @param {Object} user - The authenticated user.
 * @param {string} id - The ID of the fragment to download.
 * @param {string} extension - Optional extension for conversion.
 * @returns {Object} - The blob data and content type.
 */
export async function downloadFragment_API(user, id, extension = '') {
  console.log('Downloading fragment data...');
  try {
    // Format the URL with extension if provided
    const extensionPart = extension ? `.${extension}` : '';
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${extensionPart}`, {
      headers: user.authorizationHeaders(),
    });
    
    // Handle error responses
    if (res.status === 404 || res.status === 415) {
      let data = await res.json();
      return {
        data,
        type: 'json',
      };
    }
    
    // Handle unknown errors
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    
    // Get the content type to determine how to handle the response
    const contentType = res.headers.get('Content-Type');
    
    // Create a blob from the response
    const blob = await res.blob();
    
    return {
      blob,
      contentType,
      filename: `fragment-${id}${extensionPart}`,
    };
  } catch (err) {
    console.error('Unable to download fragment', { err });
    return {
      type: 'json',
      data: { error: err.message },
    };
  }
}

export async function getFragmentInfoById_API(user, id) {
  console.log('Requesting to get fragment Metadata...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    // Catching Known Errors
    if (res.status === 404) {
      let data = await res.json();
      return {
        data,
        type: 'json',
      };
    }
    // Catching Unknown Errors
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragment', data);
    return {
      data,
      type: 'json',
    };
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return {
      type: 'json',
      data: { error: err.message },
    };
  }
}

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally) with expanded data.
 * We expect a user to have an `idToken` attached, so we can send that along
 * with the request.
 */
export async function getFragmentsExp_API(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return { error: err.message };
  }
}

export async function deleteFragmentById_API(user, id) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'DELETE',
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Unable to call DELETE /v1/fragmens/${id}`, { error });
    return { error: error.message };
  }
}