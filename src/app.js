// src/app.js

import { signIn, signOut, getUser } from './auth';
import { 
  getUserFragments, 
  getFragmentById_API, 
  getFragmentInfoById_API, 
  getFragmentsExp_API, 
  postFragment_API,
  updateFragment_API,
  downloadFragment_API,
  deleteFragmentById_API
} from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // GET section
  const getFragmentById = document.querySelector('#getFragmentById');
  const getFragments = document.querySelector('#getFragments');
  const getFragmentsExp = document.querySelector('#getFragmentsExp');
  const getContainer = document.querySelector('#getContainer');
  
  // DOWNLOAD section
  const downloadFragment = document.querySelector('#downloadFragment');
  const downloadContainer = document.querySelector('#downloadContainer');
  
  // UPDATE section
  const updateFragment = document.querySelector('#updateFragment');
  const updateContainer = document.querySelector('#updateContainer');
  
  // POST TEXT section
  const postFragmentTxt = document.querySelector('#postFragmentTxt');
  const postTextContainer = document.querySelector('#postTextContainer');
  
  // POST IMAGE section
  const postFragmentImg = document.querySelector('#postFragmentImg');
  const postImageContainer = document.querySelector('#postImageContainer');

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
    
    // Clear all result containers
    getContainer.innerHTML = '';
    downloadContainer.innerHTML = '';
    updateContainer.innerHTML = '';
    postTextContainer.innerHTML = '';
    postImageContainer.innerHTML = '';
  };

  getFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    const clickedButtonName = event.submitter.getAttribute('name');
    const fragmentId = event.target.elements[0].value;
    
    // Show loading indicator
    getContainer.innerText = 'Loading...';
    
    let data = null;

    if (clickedButtonName === 'withInfo') {
      data = await getFragmentInfoById_API(user, fragmentId);
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
    } else if (data.type === 'json') {
      getContainer.innerText = JSON.stringify(data.data, null, 2);
    } else if (fragmentId.endsWith('.html')) {
      // Render HTML content if the fragment is an HTML file
      getContainer.innerHTML = data.body;
    } else {
      // Otherwise, handle the response as JSON
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  // Handle downloading fragments
  downloadFragment.onsubmit = async (event) => {
    event.preventDefault();
    const fragmentId = event.target.elements.id.value;
    const format = event.target.elements.format.value;
    
    // Show loading indicator
    downloadContainer.innerText = 'Processing download...';
    
    const data = await downloadFragment_API(user, fragmentId, format);
    
    if (data.type === 'json') {
      // Show error message
      downloadContainer.innerText = JSON.stringify(data.data, null, 2);
      return;
    }
    
    // Create a download link for the blob
    const url = URL.createObjectURL(data.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    downloadContainer.innerText = `Downloaded ${data.filename} (${data.contentType})`;
  };

  // Handle updating fragments
  updateFragment.onsubmit = async (event) => {
    event.preventDefault();
    const fragmentId = event.target.elements.id.value;
    const fragmentType = event.target.elements.type.value;
    const fragmentContent = event.target.elements.value.value;
    
    // Show loading indicator
    updateContainer.innerText = 'Updating fragment...';
    
    const to_update = { value: fragmentContent, type: fragmentType };
    console.log("Updating fragment:", to_update);
    
    const data = await updateFragment_API(user, fragmentId, to_update);
    if (data) {
      updateContainer.innerText = JSON.stringify(data.data, null, 2);
    }
  };

  getFragments.onclick = async () => {
    // Show loading indicator
    getContainer.innerText = 'Loading fragments...';
    
    let data = await getUserFragments(user);
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  getFragmentsExp.onclick = async () => {
    // Show loading indicator
    getContainer.innerText = 'Loading expanded fragments...';
    
    const user = await getUser();
    if (!user) return;
    const data = await getFragmentsExp_API(user);
    getContainer.innerText = JSON.stringify(data, null, 2);
  };

  // Post Text Fragment
  postFragmentTxt.onsubmit = async (event) => {
    event.preventDefault();
    const fragmentType = event.target.elements['type'].value;
    const fragmentContent = event.target.elements['value'].value;
    
    // Show loading indicator
    postTextContainer.innerText = 'Posting text fragment...';
    
    const to_send = { value: fragmentContent, type: fragmentType };
    // For Debug
    console.log(to_send);
    let data = await postFragment_API(user, to_send);
    if (data) {
      postTextContainer.innerText = JSON.stringify(data.data, null, 2);
      
      // If successful, show fragment ID for easy access
      if (data.data && data.data.fragment && data.data.fragment.id) {
        const fragmentId = data.data.fragment.id;
        postTextContainer.innerText += `\n\nCreated fragment with ID: ${fragmentId}\n(You can use this ID for GET, UPDATE or DOWNLOAD operations)`;
      }
    }
  };
  
  // Post Image Fragment
  postFragmentImg.onsubmit = async (event) => {
    event.preventDefault();
    const imageType = event.target.elements['type'].value;
    const imageFile = event.target.elements['file'].files[0];
    
    if (!imageFile) {
      postImageContainer.innerText = "Please select an image file";
      return;
    }
    
    // Show loading indicator
    postImageContainer.innerText = 'Uploading image...';
    
    // Read the file as ArrayBuffer
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const to_send = { 
        value: e.target.result, 
        type: imageType 
      };
      
      console.log("Sending image fragment:", imageType);
      let data = await postFragment_API(user, to_send);
      if (data) {
        postImageContainer.innerText = JSON.stringify(data.data, null, 2);
        
        // If successful, show fragment ID for easy access
        if (data.data && data.data.fragment && data.data.fragment.id) {
          const fragmentId = data.data.fragment.id;
          postImageContainer.innerText += `\n\nCreated image fragment with ID: ${fragmentId}\n(You can use this ID for GET, UPDATE or DOWNLOAD operations)`;
        }
      }
    };
    
    reader.onerror = () => {
      postImageContainer.innerText = "Error reading file";
    };
    
    reader.readAsArrayBuffer(imageFile);
  };

  // Delete fragment handler
  if (deleteFragmentById) {
    deleteFragmentById.onsubmit = async (event) => {
      event.preventDefault();
      const fragmentId = event.target.elements[0].value;
      
      if (!fragmentId) {
        alert('Please enter a fragment ID');
        return;
      }
      
      let data = await deleteFragmentById_API(user, fragmentId);
      if (data) {
        deleteContainer.innerText = JSON.stringify(data, null, 2);
      }
    };
  }



  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Clear all containers
    getContainer.innerHTML = '';
    downloadContainer.innerHTML = '';
    updateContainer.innerHTML = '';
    postTextContainer.innerHTML = '';
    postImageContainer.innerHTML = '';
    return;
  }
  
  // Do an authenticated request to the fragments API server and log the result
  const fragments = await getUserFragments(user);
  
  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  
  // If there are fragments, show them in the get container
  if (fragments && !fragments.error) {
    getContainer.innerText = JSON.stringify(fragments, null, 2);
  } else {
    getContainer.innerText = 'No fragments found. Create a new fragment to get started.';
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);