import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import app from "./F7App.js";
const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0];
const $$ = Dom7;

$$("#tab2").on("tab:show", () => {
    const sUser = firebase.auth().currentUser.uid;

    firebase.database().ref("books/" + sUser).on("value", (snapshot) => {
        const oBooks = snapshot.val();

        if (oBooks) {
            const $bookList = $$("#bookList");

            $bookList.html("");

            Object.keys(oBooks).forEach(sBookKey => {
                const oBook = oBooks[sBookKey];

                const sCardHTML = `
                <div class="container">
                <div class="card ${oBook.datePurchased ? 'strikethrough' : ''} small-card">
                    <div class="card-header">${oBook.title}</div>
                    <div class="card-content card-content-padding">
                        <img src="${oBook.imageUrl}" alt="${oBook.title}" class="book-image">
                        <p>Author: ${oBook.author}</p>
                        <p>Genre: ${oBook.genre}</p>
                        <p>Published: ${oBook.published}</p>
                    </div>
                    <div class="card-footer">
                        <button class="button button-active btn-bought bought-button" data-book-key="${sBookKey}" ${oBook.datePurchased ? 'disabled' : ''}>I bought this</button>
                        <button class="button btn-delete delete-button" data-book-key="${sBookKey}" ${oBook.datePurchased ? 'disabled' : ''}>I don't need this</button>
                    </div>
                </div>
            </div>
            <style>
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .strikethrough {
                text-decoration: line-through;
            }
            .bought-button {
                background-color: grey;
            }
            .delete-button {
                background-color: grey;
            }
            .book-image {
                width: 100%;
                height: auto;
                margin-bottom: 10px;
            }
            .small-card {
                width: 80%;
                max-width: 300px;
            }
        </style>
    
`;
                $bookList.append(sCardHTML);
            });

            $$('.btn-bought').on('click', function () {
                const sBookKey = $$(this).data('book-key');
                firebase.database().ref("books/" + sUser + "/" + sBookKey + "/datePurchased").set(new Date().toISOString().split('T')[0]);
            });

            $$('.btn-delete').on('click', function () {
                const sBookKey = $$(this).data('book-key');

                if (confirm("Are you sure you want to delete this book?")) {                    
                    firebase.database().ref("books/" + sUser + "/" + sBookKey).remove()
                        .then(() => {
                            console.log("Book deleted from Firebase!");
                        })
                        .catch(error => {
                            console.error("Error deleting book from Firebase: ", error);
                        });
                } else {
                    return;
                }
            });
        } else {
            $$("#bookList").html("<p>No books found.</p>");
        }
    });
});

$$(".add-item").on("submit", e => {
    e.preventDefault(); // Prevent the default form submission behavior
   
    const title = $$("#title").val();
    const author = $$("#author").val();
    const genre = $$("#genre").val();
    const published = $$("#published").val();
    const imageUrl = $$("#imageUrl").val();

    console.log("Title:", title);
    console.log("Author:", author);
    console.log("Genre:", genre);
    console.log("Published:", published);
    console.log("Image URL:", imageUrl);

    if (!title || !author || !genre || !published) {
        console.log("Please fill in all fields.");
        return;
    }

    const bookData = {
        title: title,
        author: author,
        genre: genre,
        published: published,
        imageUrl: imageUrl
        };

    const userId = firebase.auth().currentUser.uid;
    const updates = {};
    updates["/books/" + userId + "/" + title] = bookData;

    firebase.database().ref().update(updates)
        .then(() => {
            console.log("Book added to Firebase!");
            app.sheet.close(".add-item", true);
        })
        .catch(error => {
            console.error(error);
        });
});
