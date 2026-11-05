const BOOKS_KEY = 'imybook_books';
const SUGG_KEY = 'imybook_suggestions';

const $ = id => document.getElementById(id);

function loadData(key, fallback) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return fallback;
  }
  return JSON.parse(text);
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function showMessage(text, type) {
  const box = $('message');
  box.textContent = text;
  box.className = 'message ' + type;
}