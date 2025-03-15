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
 * @param {Object} text - The fragment text to be posted.
 * @returns {string} - The response data from the API.
 */
export async function postFragment_API(user, text) {
  console.log('Posting fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': text.type,
      },
      body: text.value,
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