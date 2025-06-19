/*
  Skeleton JavaScript file
 */
'use strict';
(function() {
  window.addEventListener('load', init);
  const API_URL = 'https://dot3test.niceglacier-a3547b95.westus2.azurecontainerapps.io';

  /**
   * Initialize eventListners
   */
  function init() {
    updateFilterList();
    id('add-btn').addEventListener('click', addFilterWord);
    id('delete-btn').addEventListener('click', deleteFilterWord);
    id('filter-it-btn').addEventListener('click', filterMessage);
    id('upload-btn').addEventListener('click', uploadAndIndexPDF);
    id('query-btn').addEventListener('click', queryIndexedDocuments);
    console.log(id('login-btn'));
    id('login-btn').addEventListener('click', loginUser);
    id('logout-btn').addEventListener('click', logoutUser);
    id('increase-permission-btn').addEventListener('click', increasePermission);
    id('decrease-permission-btn').addEventListener('click', decreasePermission);
    checkLoginStatus();
  }

  /**
   * Update the filter list by fetching filter words from the server
   */
  async function updateFilterList() {
    try {
      const res = await fetch(`${API_URL}/filter`);
      await statusCheck(res);
      const data = await res.json();
      const list = id('filter-list');
      list.innerHTML = '';
      for (const word of data) {
        const li = gen('li');
        li.textContent = word;
        list.appendChild(li);
      }
    } catch (err) {
      id('filter-list').innerHTML = '<li>Error loading filter words</li>';
    }
  }

  /**
   * Add a filter word by sending a POST request to the server
   */
  async function addFilterWord() {
    const word = id('filter-word').value.trim();
    if (!word) return;
    try {
      const res = await fetch(`${API_URL}/filter/${encodeURIComponent(word)}`, {
        method: 'POST'
      });
      await statusCheck(res);
      id('filter-word').value = '';
      updateFilterList();
    } catch (err) {
      alert('Failed to add filter word');
    }
  }

  /**
   * Delete a filter word by sending a DELETE request to the server
   */
  async function deleteFilterWord() {
    const word = id('filter-word').value.trim();
    if (!word) return;
    try {
      const res = await fetch(`${API_URL}/filter/${encodeURIComponent(word)}`, {
        method: 'DELETE'
      });
      await statusCheck(res);
      id('filter-word').value = '';
      updateFilterList();
    } catch (err) {
      alert('Failed to delete filter word');
    }
  }

  /**
   * Filter a message by sending it to the server and displaying the filtered result
   */
  async function filterMessage() {
    const message = id('filter-message').value;
    try {
      const res = await fetch(`${API_URL}/filter_message/?message=${encodeURIComponent(message)}`, {
        method: 'POST'
      });
      await statusCheck(res);
      const data = await res.json();
      id('filtered-result').textContent = data.filtered_message;
    } catch (err) {
      id('filtered-result').textContent = 'Error filtering message';
    }
  }

  // Upload and index PDF document
  async function uploadAndIndexPDF() {
    const fileInput = id('pdf-file');
    const status = id('upload-status');
    if (!fileInput.files.length) {
      status.textContent = 'Please select a PDF file.';
      return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    status.textContent = 'Uploading...';
    try {
      const res = await fetch(`${API_URL}/index_document`, {
        method: 'POST',
        body: formData
      });
      await statusCheck(res);
      const data = await res.json();
      status.textContent = data.message || 'File indexed successfully!';
    } catch (err) {
      status.textContent = 'Error uploading or indexing file.';
    }
  }

  // Query indexed documents
  async function queryIndexedDocuments() {
    const queryText = id('query-text').value.trim();
    const resultsDiv = id('query-results');
    if (!queryText) {
      resultsDiv.textContent = 'Please enter a query.';
      return;
    }
    resultsDiv.textContent = 'Querying...';
    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: queryText, top_k: 3 })
      });
      await statusCheck(res);
      const data = await res.json();
      if (data.query_results && data.query_results.length > 0) {
        resultsDiv.innerHTML = data.query_results.map(r => `<pre>${r.chunk}</pre><hr>`).join('');
      } else {
        resultsDiv.textContent = 'No results found.';
      }
    } catch (err) {
      resultsDiv.textContent = 'Error querying documents.';
    }
  }

  // Login user
  async function loginUser() {
    const username = id('username-input').value.trim();
    if (!username) return;
    try {
      const res = await fetch(`${API_URL}/login/${encodeURIComponent(username)}`, {
        method: 'POST',
        credentials: 'include'
      });
      await statusCheck(res);
      id('username-input').value = '';
      await updateUserInfo(0); // Set initial permission level to 1
      id('current-username').textContent = username;
      showLoggedInUI();
    } catch (err) {
      alert('Login failed');
    }
  }

  // Logout user
  async function logoutUser() {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      await statusCheck(res);
      hideLoggedInUI();
    } catch (err) {
      alert('Logout failed');
    }
  }

  // Check login status and update UI
  async function checkLoginStatus() {
    // Try to get agents; if success, user is logged in
    try {
      await updateUserInfo();
      showLoggedInUI();
    } catch {
      hideLoggedInUI();
    }
  }

  // Update user info and agent list
  async function updateUserInfo(permissionLevel) {
    const agentsRes = await fetch(`${API_URL}/list_agents`, {
      method: 'POST',
      credentials: 'include'
    });
    await statusCheck(agentsRes);
    const agents = await agentsRes.json();
    const agentsList = id('agents-list');
    agentsList.innerHTML = '';
    agents.forEach(agent => {
      const li = gen('li');
      li.textContent = agent;
      agentsList.appendChild(li);
    });
    // Only update permission level, not username
    if (typeof permissionLevel !== 'undefined') {
      id('current-permission').textContent = permissionLevel;
    }
  }

  // Increase permission
  async function increasePermission() {
    try {
      const res = await fetch(`${API_URL}/increase_permission`, {
        method: 'POST',
        credentials: 'include'
      });
      await statusCheck(res);
      let current = parseInt(res.text) || 0;
      await updateUserInfo(current);
    } catch (err) {
      alert('Failed to increase permission');
    }
  }

  // Decrease permission
  async function decreasePermission() {
    try {
      const res = await fetch(`${API_URL}/decrease_permission`, {
        method: 'POST',
        credentials: 'include'
      });
      await statusCheck(res);
      let current = parseInt(res.text) || 0;
      await updateUserInfo(current);
    } catch (err) {
      alert('Failed to decrease permission');
    }
  }

  // Show/hide UI helpers
  function showLoggedInUI() {
    id('username-input').style.display = 'none';
    id('login-btn').style.display = 'none';
    id('logout-btn').style.display = '';
    id('user-info').style.display = '';
    id('agents-section').style.display = '';
  }
  function hideLoggedInUI() {
    id('username-input').style.display = '';
    id('login-btn').style.display = '';
    id('logout-btn').style.display = 'none';
    id('user-info').style.display = 'none';
    id('agents-section').style.display = 'none';
    id('current-username').textContent = '';
    id('current-permission').textContent = '';
    id('agents-list').innerHTML = '';
  }
  // Helper to get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   *  Wrapper function for getElementById
   * @param {string} id - id for DOM element
   * @returns {HTMLElement} - DOM object with a given id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   *  Wrapper function for querySelector
   * @param {string} selector - CSS selector for DOM element
   * @returns {HTMLElement} - DOM object matching the given selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   *  Wrapper function for querySelectorAll
   * @param {string} selector - CSS selector for DOM elements
   * @returns {NodeList} - NodeList of DOM objects matching the given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Wrapper function for a createElement
   *
   * @param {string} tag - html tag to create an html element
   * @returns {HTMLElement} - new DOM object with a given tag
   */
  function gen(tag) {
    return document.createElement(tag);
  }
})();