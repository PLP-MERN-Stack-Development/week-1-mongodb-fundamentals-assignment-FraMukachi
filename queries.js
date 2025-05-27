// queries.js - MongoDB Operations for PLP Bookstore Assignment
const { MongoClient } = require('mongodb');

// Connection configuration
const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

// Utility function for printing results
function printResults(title, results) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(results, null, 2));
}

// 1. CRUD Operations
async function crudOperations() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const books = client.db(dbName).collection(collectionName);

    // CREATE - Insert a new book
    const newBook = {
      title: 'The Midnight Library',
      author: 'Matt Haig',
      genre: 'Fantasy',
      published_year: 2020,
      price: 14.99,
      in_stock: true,
      pages: 304,
      publisher: 'Canongate Books'
    };
    const insertResult = await books.insertOne(newBook);
    printResults('CREATE - Inserted Book', {
      insertedId: insertResult.insertedId,
      ...newBook
    });

    // READ - Find books by J.R.R. Tolkien
    const tolkienBooks = await books.find({ author: 'J.R.R. Tolkien' }).toArray();
    printResults('READ - Tolkien Books', tolkienBooks);

    // UPDATE - Discount all fantasy books by 15%
    const updateResult = await books.updateMany(
      { genre: 'Fantasy' },
      { $mul: { price: 0.85 } }
    );
    printResults('UPDATE - Discounted Fantasy Books', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

    // Verify the update
    const updatedFantasy = await books.find({ genre: 'Fantasy' }).toArray();
    printResults('READ - Updated Fantasy Books', updatedFantasy);

    // DELETE - Remove books published before 1900
    const deleteResult = await books.deleteMany({ published_year: { $lt: 1900 } });
    printResults('DELETE - Removed Old Books', {
      deletedCount: deleteResult.deletedCount
    });

  } finally {
    await client.close();
  }
}

// 2. Advanced Queries
async function advancedQueries() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const books = client.db(dbName).collection(collectionName);

    // Query 1: Find expensive in-stock books, sorted by publication year
    const expensiveBooks = await books.find({
      price: { $gt: 12 },
      in_stock: true
    })
    .sort({ published_year: 1 })
    .project({ title: 1, author: 1, price: 1, published_year: 1, _id: 0 })
    .toArray();
    printResults('Advanced Query 1 - Expensive In-Stock Books', expensiveBooks);

    // Query 2: Find books with page count between 300-500 pages
    const mediumLengthBooks = await books.find({
      pages: { $gte: 300, $lte: 500 }
    }).toArray();
    printResults('Advanced Query 2 - Medium Length Books (300-500 pages)', mediumLengthBooks);

    // Query 3: Count books by availability status
    const stockStatus = await books.aggregate([
      { $group: { 
        _id: "$in_stock", 
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" }
      }}
    ]).toArray();
    printResults('Advanced Query 3 - Stock Status Analysis', stockStatus);

  } finally {
    await client.close();
  }
}

// 3. Aggregation Pipeline
async function aggregationPipeline() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const books = client.db(dbName).collection(collectionName);

    const pipeline = [
      // Stage 1: Filter for in-stock books
      { $match: { in_stock: true } },
      
      // Stage 2: Group by genre with statistics
      { $group: {
        _id: "$genre",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        avgPages: { $avg: "$pages" },
        titles: { $push: "$title" }
      }},
      
      // Stage 3: Sort by count descending
      { $sort: { count: -1 } },
      
      // Stage 4: Project for cleaner output
      { $project: {
        genre: "$_id",
        count: 1,
        avgPrice: { $round: ["$avgPrice", 2] },
        avgPages: { $round: ["$avgPages", 1] },
        sampleTitles: { $slice: ["$titles", 2] },
        _id: 0
      }}
    ];

    const results = await books.aggregate(pipeline).toArray();
    printResults('Aggregation - Genre Analysis', results);

  } finally {
    await client.close();
  }
}

// 4. Indexing Operations
async function indexingOperations() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const books = client.db(dbName).collection(collectionName);

    // Create indexes
    await books.createIndex({ author: 1 });
    await books.createIndex({ genre: 1, price: 1 });
    await books.createIndex({ published_year: -1 });

    // Get index information
    const indexes = await books.indexes();
    printResults('Current Indexes', indexes);

    // Explain a query to demonstrate index usage
    const explain = await books.find({
      genre: 'Fiction',
      price: { $lt: 15 }
    }).sort({ published_year: -1 }).explain();
    
    printResults('Query Explanation', {
      queryPlanner: {
        winningPlan: explain.queryPlanner.winningPlan,
        rejectedPlans: explain.queryPlanner.rejectedPlans
      },
      executionStats: {
        executionTimeMillis: explain.executionStats.executionTimeMillis,
        totalDocsExamined: explain.executionStats.totalDocsExamined
      }
    });

  } finally {
    await client.close();
  }
}

// Main execution function
async function main() {
  console.log('Starting MongoDB Operations...');
  
  await crudOperations();
  await advancedQueries();
  await aggregationPipeline();
  await indexingOperations();
  
  console.log('\nAll operations completed!');
}

main().catch(err => {
  console.error('Error in main execution:', err);
  process.exit(1);
});
