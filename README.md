 Mern Stack MongoDB Assignment

This repository contains the solution for the MongoDB fundamentals assignment focusing on CRUD operations, advanced queries, aggregation pipelines, and indexing.

     Setup Instructions
      Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- MongoDB Shell (`mongosh`) or MongoDB Compass

       Installation
1. Clone this repository:
   
   git clone <your-repository-url>
   cd <repository-directory>
   

2. Install dependencies:
   
   npm install mongodb
   

### Database Setup
1. Start your MongoDB server (if running locally):
   
   mongod
   

2. Populate the database with sample book data:
   
   node insert_books.js
   

3. Run the queries and operations:
   
   node queries.js
   

 Files Overview

           insert_books.js
- Populates the MongoDB database with sample book data
- Creates a `plp_bookstore` database with a `books` collection
- Drops existing collection if present to ensure clean setup

       `queries.js`
Contains all required MongoDB operations:

1.       CRUD Operations
   - Create: Insert new books
   - Read: Find books by author
   - Update: Modify prices and stock status
   - Delete: Remove outdated books

2.        Advanced Queries
   - Filtering with multiple conditions
   - Sorting and projection
   - Range queries

3.       Aggregation Pipeline
   - Genre-based analysis
   - Statistical calculations (averages, counts)
   - Data grouping and sorting

4.          Indexing
   - Index creation for common query patterns
   - Query explanation and optimization

       MongoDB Connection Details
- URI : `mongodb://localhost:27017`
- Database: `plp_bookstore`
- Collection : `books`

    Sample Queries to Try

After running the setup, you can try these queries in `mongosh`:

        javascript
// Find all fantasy books
db.books.find({ genre: "Fantasy" })

// Find books published after 1950, sorted by price
db.books.find({ published_year: { $gt: 1950 } }).sort({ price: 1 })

// Get average price by genre
db.books.aggregate([
  { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
])


      Screenshots
Include these screenshots in your submission:
1. Output of `insert_books.js`
2. Results of `queries.js` execution
3. Index information from `db.books.getIndexes()`
4. Sample query results from MongoDB Compass or shell

 Troubleshooting

- Connection Issues : Verify MongoDB is running and the URI is correct
- Duplicate Data : The script automatically drops the collection before insertion
- Permission Errors : Ensure your user has read/write access to the database


This README includes:

1. Clear setup instructions for both local and Atlas deployments
2. Comprehensive file documentation explaining each script's purpose
3. Sample queries for manual testing
4. Submission requirements with screenshot guidance
5. Troubleshooting section for common issues
