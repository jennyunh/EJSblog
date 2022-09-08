const express = require('express');

//store pool in db constant
const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/posts');
}
);


//render the posts-list.ejs file 
router.get('/posts', async function (req, res) {
    const query = `SELECT posts.*, authors.name AS author_name FROM posts 
INNER JOIN authors ON posts.author_id = authors.id`
    const [posts] = await db.query(query);

    res.render('posts-list', {
        posts: posts
    });
}
);



//create post page
router.get('/new-post', async function (req, res) {

    //query result is an array:
    //first item of array: array of data that was fetched
    //second item of array: meta data
    //array destructuring: take out first item of array
    const [authors] = await db.query('SELECT * FROM authors');
    res.render('create-post', { authors: authors });
}
);


//create the new post
router.post('/posts', async function (req, res) {
    const data = [
        req.body.title,
        req.body.summary,
        req.body.content,
        req.body.author
    ]

    //req.body stores the inputted form data.
    //req.body is an object. The name attribute 
    //of form inputs is the key, and value is user inputted data.
    //put ? as VALUE in query to indicate dynamic value
    //db.query takes a 2nd parameter (an array). 
    //Whatever you put into array it replaces the ?
    //If you have multiple ? dynamic values, you can put (?, ?, ?) 
    //or just (?) because mySQL2 package does that for you
    await db.query('INSERT INTO posts (title, summary, body, author_id) VALUES (?)',
        [data]);

    //after data is inserted into database, 
    //redirect the user to the main homepage
    res.redirect('/posts')

});




//Post detail page
router.get('/posts/:id', async function (req, res) {


    //WHERE clause has to be last.
    const query = `
SELECT posts.*, authors.name AS author_name, authors.email AS author_email
FROM posts 
INNER JOIN authors ON posts.author_id = authors.id
WHERE posts.id = ?
`;

    //db.query's 2nd parameter is array of values that should be injected into the ?
    //So put the req.params.id into the question mark in the query 
    //posts array has only 1 item in there. Or no item.
    const [posts] = await db.query(query, [req.params.id]);

    //if posts is undefined or the length is 0,
    //return a 404 status.
    if (!posts || posts.length === 0) {
        return res.status(404).render('404');
    }

    const postData = {
        //take all key value pairs of the post object contained in 
        //the first item of the posts array
        ...posts[0],
        date: posts[0].date.toISOString(),
        humanReadableDate: posts[0].date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    res.render('post-detail', { post: postData })
}
);









//delete a post
router.get('/deletePost/:id', async function (req, res) {
    const query = `
    DELETE FROM posts WHERE posts.id = ?
    `;


    const [posts] = await db.query(query, [req.params.id]);

    res.redirect('/posts');

}
);


//render the update post page
router.get('/editPost/:id', async function (req, res) {

    const query = `
        SELECT * FROM posts WHERE posts.id = ?
        `;

    const [posts] = await db.query(query, [req.params.id]);

    res.render('update-post', { post: posts[0] })

}
);



//update a post (POST METHOD)
router.post('/editPost/:id', async function (req, res) {

    const query = `
UPDATE posts SET title = ?, summary = ?, body = ?
WHERE id = ?`


    const data = [
        req.body.title,
        req.body.summary,
        req.body.content,
    ]

    await db.query(query, [data[0], data[1], data[2], req.params.id]);

    res.redirect('/posts')

})





module.exports = router;