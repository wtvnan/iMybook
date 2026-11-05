let books = loadData(BOOKS_KEY, []);
let editId = null;

function render() {
  if (books.length === 0) {
    $('bookRows').innerHTML = '<tr><td colspan="7" class="empty">No books yet. Add one above or from the Search page.</td></tr>';
  } else {
    $('bookRows').innerHTML = books.map(b => `
      <tr>
        <td>${esc(b.title)}</td>
        <td>${esc(b.author)}</td>
        <td>${b.pages}</td>
        <td>${b.days}</td>
        <td>${b.perDay} pages/day</td>
        <td>${esc(b.status)}</td>
        <td>
          <button class="editBtn" data-id="${b.id}">Edit</button>
          <button class="deleteBtn red" data-id="${b.id}">Delete</button>
        </td>
      </tr>`).join('');
  }

  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
  const done = books.filter(b => b.status === 'Done').length;
  $('stats').textContent = `Total books: ${books.length} | Total pages: ${totalPages} pages | Finished: ${done}`;
}

function renderSuggestions() {
  const data = loadData(SUGG_KEY, null);
  if (!data || data.picks.length === 0) {
    $('savedSuggestions').innerHTML = '<p class="empty">No saved suggestions yet. Search for books on the Search page.</p>';
    return;
  }
  $('savedSuggestions').innerHTML = `
    <p class="hint">From your search: "${esc(data.keyword)}"</p>
    <ul>${data.picks.map(p => `<li><b>${esc(p.title)}</b> by ${esc(p.author)} (${p.pages} pages, rating ${p.rating ?? 'N/A'}) - ${esc(p.reason)}</li>`).join('')}</ul>`;
}

function resetForm() {
  $('bookForm').reset();
  editId = null;
  $('formTitle').textContent = 'Add a Book';
  $('submitBtn').textContent = 'Add Book';
  $('cancelBtn').hidden = true;
}

$('bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('title').value.trim();
  const author = $('author').value.trim();
  const pages = Number($('pages').value);
  const days = Number($('days').value);

  if (!title || !author) {
    showMessage('Title and author cannot be empty.', 'error');
    return;
  }
  if (!Number.isInteger(pages) || pages < 1 || pages > 10000) {
    showMessage('Pages must be a whole number between 1 and 10000.', 'error');
    return;
  }
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    showMessage('Days must be a whole number between 1 and 365.', 'error');
    return;
  }

  const record = {
    id: editId ?? Date.now(),
    title,
    author,
    pages,
    days,
    perDay: Number((pages / days).toFixed(1)),
    status: $('status').value
  };

  if (editId === null) {
    books.push(record);
    showMessage('Book added successfully.', 'success');
  } else {
    books = books.map(b => (b.id === editId ? record : b));
    showMessage('Book updated successfully.', 'success');
  }

  saveData(BOOKS_KEY, books);
  resetForm();
  render();
});

document.addEventListener('click', e => {
  const editBtn = e.target.closest('.editBtn');
  const deleteBtn = e.target.closest('.deleteBtn');

  if (editBtn) {
    const b = books.find(x => x.id === Number(editBtn.dataset.id));
    editId = b.id;
    $('title').value = b.title;
    $('author').value = b.author;
    $('pages').value = b.pages;
    $('days').value = b.days;
    $('status').value = b.status;
    $('formTitle').textContent = 'Edit Book';
    $('submitBtn').textContent = 'Update Book';
    $('cancelBtn').hidden = false;
    window.scrollTo(0, 0);
  }

  if (deleteBtn) {
    if (!confirm('Delete this book from your list?')) return;
    books = books.filter(b => b.id !== Number(deleteBtn.dataset.id));
    saveData(BOOKS_KEY, books);
    render();
    showMessage('Book deleted.', 'success');
  }
});

$('cancelBtn').addEventListener('click', resetForm);

render();
renderSuggestions();