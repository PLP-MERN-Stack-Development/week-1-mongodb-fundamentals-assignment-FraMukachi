

// 1. Create database and collection (if not exists)
use plp_bookstore

// 2. Clear existing data if needed
db.books.drop()

// 3. Insert sample data
db.books.insertMany([
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    published_year: 1960,
    price: 12.99,
    in_stock: true,
    pages: 336,
    publisher: 'J. B. Lippincott & Co.'
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    published_year: 1949,
    price: 10.99,
    in_stock: true,
    pages: 328,
    publisher: 'Secker & Warburg'
  },
  // ... include all other books from your original data
  {
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    genre: 'Gothic Fiction',
    published_year: 1847,
    price: 9.99,
    in_stock: true,
    pages: 342,
    publisher: 'Thomas Cautley Newby'
  }
])

print("=== Database initialized with sample data ===")

// ===== CRUD OPERATIONS ===== //

// CREATE - Insert a new book
db.books.insertOne({
  title: 'The Silent Patient',
  author: 'Alex Michaelides',
  genre: 'Psychological Thriller',
  published_year: 2019,
  price: 13.99,
  in_stock: true,
  pages: 352,
  publisher: 'Celadon Books'
})
print("\n=== CREATE: Added new book ===")

// READ - Find books by author
const tolkienBooks = db.books.find({ author: 'J.R.R. Tolkien' }).toArray()
print("\n=== READ: Books by J.R.R. Tolkien ===")
printjson(tolkienBooks)

// UPDATE - Discount fantasy books by 15%
const updateResult = db.books.updateMany(
  { genre: 'Fantasy' },
  { $mul: { price: 0.85 } }
)
print(`\n=== UPDATE: Modified ${updateResult.modifiedCount} fantasy books ===`)

// DELETE - Remove books not in stock
const deleteResult = db.books.deleteMany({ in_stock: false })
print(`\n=== DELETE: Removed ${deleteResult.deletedCount} out-of-stock books ===`)

// ===== ADVANCED QUERIES ===== //

// Query 1: Expensive in-stock books, sorted by year
const expensiveBooks = db.books.find({
  price: { $gt: 12 },
  in_stock: true
}).sort({ published_year: 1 }).toArray()
print("\n=== Advanced Query 1: Expensive In-Stock Books ===")
printjson(expensiveBooks)

// Query 2: Books with 300-500 pages
const mediumBooks = db.books.find({
  pages: { $gte: 300, $lte: 500 }
}).toArray()
print("\n=== Advanced Query 2: Medium Length Books (300-500 pages) ===")
printjson(mediumBooks)

// Query 3: Stock status analysis
const stockAnalysis = db.books.aggregate([
  { $group: { 
    _id: "$in_stock", 
    count: { $sum: 1 },
    avgPrice: { $avg: "$price" }
  }}
]).toArray()
print("\n=== Advanced Query 3: Stock Status Analysis ===")
printjson(stockAnalysis)

// ===== AGGREGATION PIPELINE ===== //
const genreAnalysis = db.books.aggregate([
  { $match: { in_stock: true } },
  { $group: {
    _id: "$genre",
    count: { $sum: 1 },
    avgPrice: { $avg: "$price" },
    avgPages: { $avg: "$pages" },
    titles: { $push: "$title" }
  }},
  { $sort: { count: -1 } },
  { $project: {
    genre: "$_id",
    count: 1,
    avgPrice: { $round: ["$avgPrice", 2] },
    avgPages: { $round: ["$avgPages", 1] },
    sampleTitles: { $slice: ["$titles", 2] },
    _id: 0
  }}
]).toArray()
print("\n=== Aggregation: Genre Analysis ===")
printjson(genreAnalysis)

// ===== INDEXING ===== //

// Create indexes
db.books.createIndex({ author: 1 })
db.books.createIndex({ genre: 1, price: 1 })
db.books.createIndex({ published_year: -1 })

// Show indexes
const indexes = db.books.getIndexes()
print("\n=== Current Indexes ===")
printjson(indexes)

// Explain a query
const explain = db.books.find({
  genre: 'Fiction',
  price: { $lt: 15 }
}).sort({ published_year: -1 }).explain()
print("\n=== Query Explanation ===")
printjson({
  winningPlan: explain.queryPlanner.winningPlan,
  executionStats: {
    executionTimeMillis: explain.executionStats.executionTimeMillis,
    totalDocsExamined: explain.executionStats.totalDocsExamined
  }
})

print("\n=== ALL OPERATIONS COMPLETED ===")
