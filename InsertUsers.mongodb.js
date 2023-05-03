// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// const { db } = require("./models/w2users");

// Select the database to use.
use('comp2537w2');


// Insert a few documents into the sales collection.
// db.getCollection('w1users').insertMany([
//     { username: 'admin', password: 'admin', type: 'admin' },
//     { username: 'user1', password: 'pass1', type: 'user' },
//     { username: 'user2', password: 'pass2', type: 'user' },
//     { username: 'user3', password: 'pass3', type: 'user' }
// ]);

db.getCollection('w2users').insertMany([
    {
        username: 'admin', password: '$2b$10$ZL4ty2R1kctYa8wKm8pUqu0aVcIePIdre0NENmHJ/J0EcYGqZUzUW',
        type: 'admin', todos: [{ name: 'todo1', done: false }, { name: 'todo2', done: false }]
    },
    {
        username: 'user1', password: '$2b$10$ZL4ty2R1kctYa8wKm8pUqu0aVcIePIdre0NENmHJ/J0EcYGqZUzUW',
        type: 'user', todos: [{ name: 'todo1', done: false }, { name: 'todo2', done: false }]
    },
    {
        username: 'user2', password: '$2b$10$ZL4ty2R1kctYa8wKm8pUqu0aVcIePIdre0NENmHJ/J0EcYGqZUzUW',
        type: 'user', todos: [{ name: 'todo1', done: false }, { name: 'todo2', done: false }]
    },
    {
        username: 'user3', password: '$2b$10$ZL4ty2R1kctYa8wKm8pUqu0aVcIePIdre0NENmHJ/J0EcYGqZUzUW',
        type: 'user', todos: [{ name: 'todo1', done: false }, { name: 'todo2', done: false }]
    }
]);  
