# Business API

| Endpoint | Access and input | Success |
|---|---|---|
| GET /books | Public, optional category and limit 1–100. mine=true requires JWT | 200 newest-first array; public rows omit userId and userEmail |
| GET /books/:id | Reader token, 24-hex book ID | 200 book |
| POST /books | Reader token, full book input | 201 created book |
| PATCH /books/:id | Owner token, full editable input | 200 updated book |
| DELETE /books/:id | Owner token, no active loans | 200 message |
| POST /borrows | Reader token, JSON bookId | 201 record with book snapshot, borrowDate and returnDate |
| GET /borrows | Reader token | 200 reader's active loans |
| DELETE /borrows/:id | Borrower token, loan ID | 200 return message |

Send private requests with Authorization: Bearer and the Better Auth JWT. Book input contains title, author, category, HTTPS image, description and integer totalCopies (0–10000). Category is Fiction, Science, History, Kids or Others. The server assigns user identity, creation time and stock. Validation errors return 400, invalid authentication 401, forbidden owner actions 403, missing records 404 and conflicting stock/borrow actions 409. Errors contain a message. Next.js serves authentication and uploads separately.
