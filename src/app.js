// src/app.js

import { signIn,signOut, getUser } from './auth';
import { getUserFragments, getFragmentById_API,getFragmentInfoById_API, getFragmentById_API, getFragmentsExp_API, postFragment_API } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  const getFragmentById = document.querySelector('#getFragmentById');
  const getFragments = document.querySelector('#getFragments');
  const getFragmentsExp = document.querySelector('#getFragmentsExp');
  

  // Get Container
  const getContainer = document.querySelector('#getContainer');

  // Post Routes UI Element
  const postFragmentTxt = document.querySelector('#postFragmentTxt');
  const postContainer = document.querySelector('#postContainer');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    signOut();
     // Reset the UI after logout
     userSection.hidden = true;
     loginBtn.disabled = false;
     getFragments.disabled = true;
     getFragmentById.querySelector('button').disabled = true;
     getFragmentsExp.disabled = true;
     postFragmentTxt.disabled = true;
  };


  getFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    const clickedButtonName = event.submitter.getAttribute('name');
    const fragmentId = event.target.elements[0].value;
    
    let data = null;

    if (clickedButtonName === 'withInfo') {
      data = await getFragmentInfoById_API(user, event.target.elements[0].value);
    } else {
        // Fetch the regular fragment
        data = await getFragmentById_API(user, fragmentId);
    }
    if (typeof data === 'string') {
      const [headersRaw, body] = data.split('\n\n');
      const headers = headersRaw.split('\n').map(header => `<b>${header}</b><br>`).join('');
      const bodyContent = body || 'No content available';

      // Display the response (headers and body separately)
      getContainer.innerHTML = `<div>${headers}</div><div><br>${bodyContent}</div>`;
    }else if (data.type === 'json') {
      getContainer.innerText = JSON.stringify(data.data, null, 2);
    } else if (fragmentId.endsWith('.html')) {
      // Render HTML content if the fragment is an HTML file
      getContainer.innerHTML = data.body;
  }
    else {
      // Otherwise, handle the response as JSON
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  getFragments.onclick = async () => {
    let data = await getUserFragments(user);
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  getFragmentsExp.onclick = async () => {
    const user = await getUser();
    if (!user) return;
    const data = await getFragmentsExp_API(user);
    getContainer.innerText = JSON.stringify(data, null, 2);
  };



   // Post Routes...........................................................................
   postFragmentTxt.onsubmit = async (event) => {
    event.preventDefault();
    const fragmentType = event.target.elements['type'].value;
    const fragmentContent = event.target.elements['value'].value;
    
    const to_send = { value: fragmentContent, type: fragmentType };
    // For Debug
    console.log(to_send);
    let data = await postFragment_API(user, to_send);
    if (data) {
      postContainer.innerText = JSON.stringify(data.data, null, 2);
    }
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    getFragments.disabled = true;
    getFragmentById.querySelector('button').disabled = true;
    getFragmentsExp.disabled = true;
    postFragmentTxt.disabled = true;
    return;
  }
  
  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);
  
  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Disabling getFragmentsById till user post it and we get id.
  getFragmentById.disabled = true;

  getFragmentsExp.disabled = false;

  postFragmentTxt.disabled = false;

}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);