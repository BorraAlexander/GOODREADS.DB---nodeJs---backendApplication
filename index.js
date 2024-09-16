const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "goodreads.db");
const app = express();
app.use(express.json());

let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Db Error ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// GET BOOKS LIST API - (1)
app.get("/books/", async (request, response) => {
  const getBooksListQuery = `SELECT * FROM book ORDER BY book_id;`;
  const booksList = await db.all(getBooksListQuery);
  response.send(booksList);
});

// GET BOOK API - (2)
app.get("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const getBookDetails = `SELECT * FROM book WHERE book_id=${bookId};`;
  const bookDetails = await db.get(getBookDetails);
  response.send(bookDetails);
});

// ADD BOOK API - (3)
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

// UPDATE BOOK API - (4)
app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

// DELETE BOOK API - (5)

app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `DELETE 
      FROM 
       book 
     WHERE 
       book_id=${bookId};`;

  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

// GET AUTHORS BOOKS LIST API - (6)
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorsBooksQuery = `SELECT 
       * 
     FROM 
      book 
     WHERE 
      author_id=${authorId};`;

  const authorBooksList = await db.all(getAuthorsBooksQuery);
  response.send(authorBooksList);
});
