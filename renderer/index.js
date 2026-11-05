
// BOOK CLASS

class Book {

    constructor(id, title, authors, subjects, pageCount, publisher, year, rating, cover) {

        this.id = id;
        this.title = title;
        this.authors = authors;
        this.subjects = subjects;
        this.pageCount = pageCount;
        this.publisher = publisher;
        this.year = year;
        this.rating = rating;
        this.cover = cover;

    }

    // Convert Open Library API data into Book objects

    static fromAPI(item) {

        const authors = Array.isArray(item.author_name)
            ? item.author_name.join(', ')
            : 'Author not available';

        const subjects = Array.isArray(item.subject)
            ? item.subject.slice(0, 3).join(', ')
            : 'Category not available';

        const publisher = Array.isArray(item.publisher)
            ? item.publisher[0]
            : 'Publisher not available';

        const pageCount = Number(item.number_of_pages_median) || 0;

        const year = item.first_publish_year
            ? String(item.first_publish_year)
            : 'Not available';

        const rating = item.ratings_average
            ? Number(item.ratings_average).toFixed(1)
            : 'Not rated';

        const cover = item.cover_i
            ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
            : '';

        return new Book(
            item.key,
            item.title || 'Title not available',
            authors,
            subjects,
            pageCount,
            publisher,
            year,
            rating,
            cover
        );

    }

}

// READING LIST CLASS
class ReadingList {

    constructor() {
        this.storageKey = 'imybookOpenLibraryReadingList';
        this.books = this.loadBooks();
    }

    // READ: Load books from Local Storage
    loadBooks() {
        try {
            const savedBooks = window.localStorage.getItem(this.storageKey);

            if (!savedBooks) {
                return [];
            }

            const books = JSON.parse(savedBooks);

            return Array.isArray(books) ? books : [];

        } catch (error) {
            console.error('Local Storage loading error:', error);
            return [];
        }
    }

    // SAVE: Save books into Local Storage
    saveBooks() {
        try {
            const data = JSON.stringify(this.books);

            window.localStorage.setItem(this.storageKey, data);

            // Verify that the data was saved
            const savedData = window.localStorage.getItem(this.storageKey);

            if (savedData !== data) {
                throw new Error('Saved data could not be verified.');
            }

            console.log('Reading list saved successfully.');

            return true;

        } catch (error) {
            console.error('Local Storage saving error:', error);
            return false;
        }
    }

    // CREATE: Add a new book
    addBook(book) {
        const existingBook = this.books.find(
            item => item.id === book.id
        );

        if (existingBook) {
            return false;
        }

        const newBook = {
            ...book,
            pagesRead: 0,
            status: 'Not Started'
        };

        this.books.push(newBook);

        if (!this.saveBooks()) {
            this.books.pop();
            return false;
        }

        return true;
    }

    // READ: Get all books
    getBooks() {
        return this.books;
    }

    // UPDATE: Update reading progress
    updateProgress(id, pagesRead) {
        const book = this.books.find(
            item => item.id === id
        );

        if (!book) {
            return false;
        }

        const oldPages = book.pagesRead;
        const oldStatus = book.status;

        book.pagesRead = pagesRead;

        if (pagesRead === book.pageCount) {
            book.status = 'Completed';
        } else if (pagesRead > 0) {
            book.status = 'Reading';
        } else {
            book.status = 'Not Started';
        }

        if (!this.saveBooks()) {
            book.pagesRead = oldPages;
            book.status = oldStatus;
            return false;
        }

        return true;
    }

    // DELETE: Remove a book
    deleteBook(id) {
        const originalBooks = [...this.books];

        this.books = this.books.filter(
            item => item.id !== id
        );

        if (this.books.length === originalBooks.length) {
            return false;
        }

        if (!this.saveBooks()) {
            this.books = originalBooks;
            return false;
        }

        return true;
    }
}



// CREATE READING LIST OBJECT


const myReadingList = new ReadingList();
window.myReadingList = myReadingList;

// GET HTML ELEMENTS
// ========================================

const discoverNav = document.getElementById('discoverNav');
const readingNav = document.getElementById('readingNav');

const discoverPage = document.getElementById('discoverPage');
const readingPage = document.getElementById('readingPage');

const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const searchButton = document.getElementById('searchButton');

const bookResults = document.getElementById('bookResults');
const message = document.getElementById('message');

const suggestionText = document.getElementById('suggestionText');

const readingListContainer = document.getElementById('readingList');

const totalBooks = document.getElementById('totalBooks');
const completedBooks = document.getElementById('completedBooks');
const overallProgress = document.getElementById('overallProgress');

const refreshButton = document.getElementById('refreshButton');


// PAGE NAVIGATION


function showPage(page) {

    discoverPage.classList.remove('active-page');
    readingPage.classList.remove('active-page');

    discoverNav.classList.remove('active');
    readingNav.classList.remove('active');

    if (page === 'discover') {

        discoverPage.classList.add('active-page');
        discoverNav.classList.add('active');

    } else {

        readingPage.classList.add('active-page');
        readingNav.classList.add('active');

        displayReadingList();

    }

}


// SUGGESTION LOGIC

function generateSuggestion(category, keyword) {

    let suggestion = '';

    if (category === 'fantasy') {

        suggestion = 'You may enjoy fantasy books with magical worlds, adventures and interesting characters.';

    } else if (category === 'romance') {

        suggestion = 'You may enjoy romance books that focus on relationships and emotional stories.';

    } else if (category === 'science') {

        suggestion = 'You may enjoy science books that explore technology, discoveries and scientific knowledge.';

    } else if (category === 'history') {

        suggestion = 'You may enjoy history books that explore past events and important historical figures.';

    } else if (category === 'self-help') {

        suggestion = 'You may enjoy self-help books that provide useful ideas for personal growth and improvement.';

    } else if (category === 'fiction') {

        suggestion = 'You may enjoy fiction books with creative stories and interesting characters.';

    } else if (category === 'programming') {

        suggestion = 'You may enjoy programming books that introduce coding, software development and computer science.';

    } else if (keyword.toLowerCase().includes('computer') ||
               keyword.toLowerCase().includes('coding')) {

        suggestion = 'You may enjoy books about computers, programming and technology.';

    } else if (keyword.toLowerCase().includes('love')) {

        suggestion = 'You may enjoy romance books with emotional and meaningful stories.';

    } else {

        suggestion = 'Explore different genres to discover books that match your reading interests.';

    }

    suggestionText.textContent = suggestion;

    try {
    window.localStorage.setItem(
        'imybookLatestSuggestion',
        suggestion
    );
} catch (error) {
    console.error('Suggestion storage error:', error);
}

}


// SEARCH BOOKS USING OPEN LIBRARY API
async function searchBooks() {

    const keyword = searchInput.value.trim();

    const category = categorySelect.value;

    message.textContent = '';
    message.className = '';

    bookResults.innerHTML = '';

    // Input validation

    if (keyword === '' && category === 'all') {

        message.textContent = 'Please enter a book title, author or select a category.';
        message.className = 'error-message';

        return;

    }

    generateSuggestion(category, keyword);

    let query = keyword;

    if (category !== 'all') {

        if (query !== '') {
            query += ' ';
        }

        query += `subject:${category}`;

    }

    const url =
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}` +
        `&limit=12` +
        `&fields=key,title,author_name,subject,number_of_pages_median,publisher,first_publish_year,cover_i,ratings_average`;

    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Unable to retrieve book information.');
        }

        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {

            message.textContent = 'No books found. Please try another keyword or category.';
            message.className = 'error-message';

            return;

        }

        const books = data.docs.map(
            item => Book.fromAPI(item)
        );

        displaySearchResults(books);

        message.textContent = `${books.length} book(s) found.`;
        message.className = 'success-message';

    } catch (error) {

        message.textContent =
            'Something went wrong while searching. Please check your internet connection and try again.';

        message.className = 'error-message';

        console.error(error);

    } finally {

        searchButton.disabled = false;
        searchButton.textContent = 'Search';

    }

}



// DISPLAY SEARCH RESULTS
function displaySearchResults(books) {

    bookResults.innerHTML = '';

    books.forEach(book => {

        const card = document.createElement('div');

        card.className = 'book-card';

        const image = book.cover
            ? `<img src="${escapeHTML(book.cover)}" alt="Book cover" onerror="this.style.display='none'">`
            : `<img src="" alt="Cover unavailable" style="display:none">`;

        card.innerHTML = `

            ${image}

            <div class="book-details">

                <h3>${escapeHTML(book.title)}</h3>

                <p><strong>Author:</strong> ${escapeHTML(book.authors)}</p>

                <p><strong>Subject:</strong> ${escapeHTML(book.subjects)}</p>

                <p><strong>Publisher:</strong> ${escapeHTML(book.publisher)}</p>

                <p><strong>First Published:</strong> ${escapeHTML(book.year)}</p>

                <p><strong>Page Count:</strong>
                    ${book.pageCount > 0 ? book.pageCount + ' pages' : 'Not available'}
                </p>

                <p><strong>Rating:</strong> ${escapeHTML(book.rating)}</p>

            </div>

            <button class="add-button">
                Add to Reading List
            </button>

        `;

        const addButton = card.querySelector('.add-button');

        addButton.addEventListener('click', () => {

            const added = myReadingList.addBook(book);

            if (added) {

                message.textContent = 'Book successfully added to your reading list!';
                message.className = 'success-message';

                addButton.textContent = 'Added';
                addButton.disabled = true;

            } else {

                message.textContent = 'This book is already in your reading list.';
                message.className = 'error-message';

            }

        });

        bookResults.appendChild(card);

    });

}



// DISPLAY READING LIST
function displayReadingList() {

    const books = myReadingList.getBooks();

    readingListContainer.innerHTML = '';

    let completed = 0;
    let totalPages = 0;
    let pagesRead = 0;

    books.forEach(book => {

        if (book.status === 'Completed') {
            completed++;
        }

        totalPages += Number(book.pageCount) || 0;
        pagesRead += Number(book.pagesRead) || 0;

        const card = document.createElement('div');

        card.className = 'book-card';

        const image = book.cover
            ? `<img src="${escapeHTML(book.cover)}" alt="Book cover" onerror="this.style.display='none'">`
            : '';

        const pageInformation = book.pageCount > 0
            ? `${book.pagesRead} / ${book.pageCount} pages`
            : 'Total page count unavailable';

        const progress = book.pageCount > 0
            ? Math.round((book.pagesRead / book.pageCount) * 100)
            : 0;

        card.innerHTML = `

            ${image}

            <div class="book-details">

                <h3>${escapeHTML(book.title)}</h3>

                <p><strong>Author:</strong> ${escapeHTML(book.authors)}</p>

                <p><strong>Subject:</strong> ${escapeHTML(book.subjects)}</p>

                <p><strong>Status:</strong> ${escapeHTML(book.status)}</p>

                <p class="progress-text">
                    Reading Progress: ${progress}%
                </p>

                <p>${pageInformation}</p>

                <input
                    type="number"
                    class="progress-input"
                    placeholder="Enter pages read"
                    min="0"
                    max="${book.pageCount}"
                    value="${book.pagesRead}"
                    ${book.pageCount <= 0 ? 'disabled' : ''}
                >

            </div>

            <button class="update-button">
                Update Progress
            </button>

            <button class="delete-button">
                Delete Book
            </button>

        `;

        const progressInput = card.querySelector('.progress-input');

        const updateButton = card.querySelector('.update-button');

        const deleteButton = card.querySelector('.delete-button');


        // UPDATE EVENT

        updateButton.addEventListener('click', () => {

            const pages = Number(progressInput.value);

            if (book.pageCount <= 0) {

                alert('Page count is not available for this book.');

                return;

            }

            if (
                progressInput.value.trim() === '' ||
                !Number.isInteger(pages) ||
                pages < 0 ||
                pages > book.pageCount
            ) {

                alert(`Please enter a whole number between 0 and ${book.pageCount}.`);

                return;

            }

            myReadingList.updateProgress(book.id, pages);

            alert('Reading progress successfully updated!');

            displayReadingList();

        });


        // DELETE EVENT

        deleteButton.addEventListener('click', () => {

            const confirmDelete = confirm(
                'Are you sure you want to delete this book?'
            );

            if (confirmDelete) {

                myReadingList.deleteBook(book.id);

                displayReadingList();

            }

        });


        readingListContainer.appendChild(card);

    });


    // UPDATE SUMMARY

    totalBooks.textContent = books.length;

    completedBooks.textContent = completed;


    // CALCULATE OVERALL READING PROGRESS

    let percentage = 0;

    if (totalPages > 0) {

        percentage = Math.round((pagesRead / totalPages) * 100);

    }

    overallProgress.textContent = `${percentage}%`;


    // EMPTY READING LIST MESSAGE

    if (books.length === 0) {

        readingListContainer.innerHTML = `
            <p class="empty-message">
                Your reading list is empty. Discover and add books to get started!
            </p>
        `;

    }

}


// HTML TEXT VALIDATION


function escapeHTML(text) {

    return String(text).replace(/[&<>"']/g, function(character) {

        const characters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return characters[character];

    });

}


// EVENT LISTENERS

// Navigate to Discover Books page

discoverNav.addEventListener('click', () => {

    showPage('discover');

});


// Navigate to My Reading List page

readingNav.addEventListener('click', () => {

    showPage('reading');

});


// Search button event

searchButton.addEventListener('click', searchBooks);


// Search using Enter key

searchInput.addEventListener('keypress', (event) => {

    if (event.key === 'Enter') {

        searchBooks();

    }

});


// Refresh reading list

refreshButton.addEventListener('click', () => {

    displayReadingList();

});



// INITIAL APPLICATION SETUP


function initializeApp() {

    displayReadingList();

    const savedSuggestion = localStorage.getItem('imybookLatestSuggestion');

    if (savedSuggestion) {

        suggestionText.textContent = savedSuggestion;

    }

}

initializeApp();
