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