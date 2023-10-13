// routes for handling book-related requests
const express = require("express");
const Book = require("../../models/book");
const router = express.Router();

// Offer a book for lending
router.post("/add", async (req, res) => {
	try {
		// Extract the relevant book data from the request
		const { title, description } = req.body;

		const newBook = new Book({
			title,
			description,
			owner: req.user._id, // assuming req.user contains the authenticated user data
		});

		await newBook.save();
		res.status(201).json(newBook);
	} catch (error) {
		console.error("Error when offering the book:", error); // Add this line
		res.status(500).json({ error: "Error offering the book." });
	}
});

// Delete a book offer
router.delete("/delete-offer/:bookId", async (req, res) => {
	try {
		const bookToDelete = await Book.findOne({
			_id: req.params.bookId,
			owner: req.user._id,
		});
		if (!bookToDelete) {
			return res
				.status(403)
				.json({ error: "You cannot delete a book you did not offer." });
		}

		await Book.findByIdAndRemove(req.params.bookId);
		res.status(200).json({ message: "Book offer removed successfully." });
	} catch (error) {
		res.status(500).json({ error: "Error removing book offer." });
	}
});
// Display the logged-in user's lending library
router.get("/my-library", async (req, res) => {
	try {
		// Find all books owned by the logged-in user
		const myBooks = await Book.find({ owner: req.user._id });

		res.status(200).json(myBooks);
	} catch (error) {
		res.status(500).json({ error: "Error fetching your lending library." });
	}
});

// Borrow a book
router.post("/borrow/:bookId", async (req, res) => {
	try {
		// Fetch the book to borrow using its ID
		const bookToBorrow = await Book.findById(req.params.bookId);

		if (!bookToBorrow) {
			return res.status(404).json({ error: "Book not found." });
		}

		// Add the book to the user's list of borrowed books and save the user
		req.user.borrowedBooks.push(bookToBorrow);
		await req.user.save();

		res.status(200).json({ message: "Book borrowed successfully." });
	} catch (error) {
		res.status(500).json({ error: "Error borrowing the book." });
	}
});
// Display all books offered by other users
router.get("/offeredByOthers", async (req, res) => {
	try {
		const otherUsersBooks = await Book.find({ owner: { $ne: req.user._id } });
		res.status(200).json(otherUsersBooks);
	} catch (error) {
		res.status(500).json({ error: "Error fetching books from other users." });
	}
});

// Return a borrowed book
router.post("/return/:bookId", async (req, res) => {
	try {
		const bookIndex = req.user.borrowedBooks.findIndex(
			(b) => b._id.toString() === req.params.bookId
		);
		if (bookIndex > -1) {
			req.user.borrowedBooks.splice(bookIndex, 1);
			await req.user.save();
			res.status(200).json({ message: "Book returned successfully." });
		} else {
			res.status(404).json({ error: "Book not found in your borrowed list." });
		}
	} catch (error) {
		res.status(500).json({ error: "Error returning the book." });
	}
});

module.exports = router;
