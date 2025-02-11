// src/app.js

import { signIn, getUser } from './auth';
import { getUserFragments, getFragmentById_API, postFragment_API } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  const getFragmentById = document.querySelector('#getFragmentById');
  const getFragments = document.querySelector('#getFragments');

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

  getFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    const clickedButtonName = event.submitter.getAttribute('name');
    console.log(clickedButtonName);
    let data = null;
    data = await getFragmentById_API(user, event.target.elements[0].value);
    getContainer.innerText = data; 
  };

  getFragments.onclick = async () => {
    let data = await getUserFragments(user);
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

   // Post Routes...........................................................................
   postFragmentTxt.onsubmit = async (event) => {
    event.preventDefault();
    const to_send = { value: event.target.elements[0].value, type: event.target.elements[1].value };
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
    postFragmentImg.querySelector('button').disabled = true;
   
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
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);