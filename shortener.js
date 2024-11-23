import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
import Database from 'better-sqlite3';
import express from 'express';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
import path from 'path';

import DBHandler from './dbcore.mjs';

const app = express();

const dbFile = "database/redirects.db";
const db = new Database(dbFile);
const db2 = new DBHandler(dbFile);

const HOST_PORT = process.env.HOST_PORT;
const base_url = process.env.base_url;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));


app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
  res.render('index', { error: null });
});

app.get('/short', (req, res) => {
  res.render('shortener', { error: null });
});

app.post('/short', (req, res) => {
  const realUrl = req.body.realurl;
  const shortId = nanoid(8); 
  const shortUrl = `/shorter/${shortId}`;
  const creatorIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get client IP
  const timestamp = new Date().toISOString();


  try{
    const stmt = db.prepare('INSERT INTO redirects (shorturl, realurl, creatorip, timestamp) VALUES (?, ?, ?, ?)');
    stmt.run(shortUrl, realUrl, creatorIp, timestamp);
    res.render('shortened', { shortenedurl: base_url + shortUrl });
  }catch{
    res.render('short', { error: 'Error adding redirect.'});
  }
});

app.get('/shorter/:id', (req, res) => {
    const shortUrl = `/shorter/${req.params.id}`;
    const slctquery = db.prepare(`SELECT realurl FROM redirects WHERE shorturl = ?`);
    const result = slctquery.get(shortUrl);
    console.log(result);
    res.redirect(result.realurl);

});

app.post('/newNote', (req, res) => {
  res.redirect('/note');
});

app.get('/note', (req, res) => {
  res.render('note', { error: null });
});

app.post('/note', (req, res) => {
  const noteText = req.body.noteText;
  const noteId = nanoid(8); 
  const deleteKey = nanoid(24); 
  const noteUrl = `/notes/${noteId}`;


  try{
    const stmt = db.prepare('INSERT INTO notes (note, noteurl, deleteKey) VALUES (?, ?, ?)');
    stmt.run(noteText, noteUrl, deleteKey);
    res.render('noted', { noteUrl: base_url + noteUrl });
  }catch{
    res.render('note', { error: 'Error creating note.'});
  }
});

app.get('/notes/:id', (req, res) => {
    const noteUrl = `/notes/${req.params.id}`;
    const slctquery = db.prepare(`SELECT note, deleteKey FROM notes WHERE noteurl = ?`);
    const result = slctquery.get(noteUrl);
    console.log(result);
    if(result){
      res.render('getNote', { note: result.note, noteUrl: noteUrl, noteDeleteKey: result.deleteKey});
    }else{
      res.render('noNote', { message: "Note not found." });
    }
});

app.post('/deleteNote/:deleteKeyId', (req, res) => {
  const deleteKey = req.params.deleteKeyId;
  console.log("Delete Key: " , deleteKey);
  try{
    const stmt = db.prepare(`DELETE FROM notes WHERE deleteKey = ?`); 
    const result = stmt.run(deleteKey);
    console.log(result);
    console.log(result.changes);
    if(result.changes === 1){
      console.log("Render note not found.");
      res.render('noNote', { message: "Note deleted.." });
    }
  }catch{
    console.log("Error");
  }
});

app.listen(HOST_PORT, () => {
  console.log(`Server running at http://localhost:${HOST_PORT}`);
});
