fetchAndAppendBooks();
initClickEvents();

// Event Handling
function initClickEvents() {
  const showPanel = document.getElementById("show-panel");
  const bookList = document.getElementById("list");

  showPanel.addEventListener("click", handleShowPanelClick);
  bookList.addEventListener("click", handleBookListClick);
}

function handleShowPanelClick(event) {
  if (event.target.matches(".book-liker")) {
    const bookDiv = event.target.parentElement;
    const bookId = bookDiv.dataset.bookId;
    const currentUser = { id: "1", username: "pouros" };

    const usersList = getUsersListFromBook(bookId);

    if (!userLikedBook(currentUser, usersList)) {
      usersList.push(currentUser);
      patchLikes(usersList, bookDiv);
      event.target.textContent = "Unlike";
    } else {
      patchLikes(
        usersList.filter((user) => user.id != currentUser.id),
        bookDiv
      );
      event.target.textContent = "Like";
    }
  }
}

function userLikedBook(checkUser, usersList) {
  for (const user of usersList) {
    if (user.id == checkUser.id) {
      return true;
    }
  }

  return false;
}

function handleBookListClick(event) {
  if (event.target.matches("li")) {
    showBook(event.target.dataset.bookId);
  }
}

// DOM Manipulation
function appendBooks(books) {
  const bookList = document.getElementById("list");
  const showPanel = document.getElementById("show-panel");

  for (const book of books) {
    appendBookToList(book, bookList);
    appendBookToShow(book, showPanel);
  }

  showBook(1);
}

function appendBookToList(book, bookList) {
  bookList.appendChild(renderBookItem(book));
}

function renderBookItem(book) {
  const bookItem = document.createElement("li");
  bookItem.classList.add("book-li");
  bookItem.dataset.bookId = book.id;

  bookItem.textContent = book.title;

  return bookItem;
}

function appendBookToShow(book, showPanel) {
  showPanel.appendChild(renderBookDiv(book));
}

function renderBookDiv(book) {
  const bookDiv = document.createElement("div");
  bookDiv.classList.add("book-div");
  bookDiv.classList.add("hidden");
  bookDiv.dataset.bookId = book.id;

  bookDiv.innerHTML = `
    <img src="${book.image_url}"></img>
    <h1>${book.title}</h1>
    <h2>${book.subtitle}</h2>
    <h3>${book.author}</h3>
    <p>${book.description}</p>
    <ul class="users-list" data-book-id="${book.id}">
      ${renderUsersList(book.users)}
    </ul>
    <button class="book-liker">${
      userLikedBook({ id: "1" }, book.users) ? "Unlike" : "Like"
    }</button>
  `;

  return bookDiv;
}

function renderUsersList(users) {
  let usersList = "";

  for (user of users) {
    usersList += renderUserItem(user);
  }

  return usersList;
}

function renderUserItem(user) {
  return `<li class="user-li" data-user-id="${user.id}">${user.username}</li>`;
}

function showBook(bookId) {
  const bookDiv = document.querySelector(
    `div.book-div[data-book-id="${bookId}`
  );

  hideBook();

  bookDiv.classList.remove("hidden");
  setCurrentBook(bookId);
}

function hideBook(bookId) {
  let bookDiv;

  if (!!bookId) {
    bookDiv = document.querySelector(`div.book-div[data-book-id="${bookId}"]`);
  } else {
    bookDiv = document.querySelector(
      `div.book-div[data-book-id="${getCurrentBookId()}"]`
    );
  }

  bookDiv.classList.add("hidden");
}

function getCurrentBookId() {
  const showPanel = document.getElementById("show-panel");

  return showPanel.dataset.current || "1";
}

function setCurrentBook(bookId) {
  const showPanel = document.getElementById("show-panel");

  showPanel.dataset.current = bookId;
}

function updateLikes(users, bookDiv) {
  const usersList = bookDiv.getElementsByClassName("users-list")[0];
  while (usersList.firstChild) {
    usersList.removeChild(usersList.firstChild);
  }

  for (const user of users) {
    appendLikeToBook(user, bookDiv);
  }
}

function appendLikeToBook(user, bookDiv) {
  const usersList = bookDiv.getElementsByClassName("users-list")[0];

  usersList.innerHTML += renderUserItem(user);
}

// API Calls
function fetchAndAppendBooks() {
  fetchBooks().then(appendBooks);
}

function fetchBooks() {
  return fetch("http://localhost:3000/books").then((resp) => resp.json());
}

function patchLikes(users, bookDiv) {
  const bookId = bookDiv.dataset.bookId;

  const configObj = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ users: users }),
  };

  fetch(`http://localhost:3000/books/${bookId}`, configObj)
    .then((resp) => resp.json())
    .then((book) => {
      updateLikes(book.users, bookDiv);
    })
    .catch(console.log);
}

function getUsersListFromBook(bookId) {
  const usersList = Array.from(
    document
      .querySelector(`div.book-div[data-book-id="${bookId}"] > .users-list`)
      .getElementsByTagName("LI")
  );

  return usersList.map(convertUserItemToUserObj);
}

function convertUserItemToUserObj(userItem) {
  return {
    id: userItem.dataset.userId,
    username: userItem.textContent,
  };
}
