import express from "express"
import fetchUser from "../middleware/fetchUser.js"
import Note from "../models/Note.js"
import { body, validationResult } from "express-validator"

const router = express.Router()


// Route 1 : get all the notes: GET "/api/notes/fetachallnotes". requires login

router.get('/fetachallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }
})

// Route 2 : add the new note: POST "/api/notes/addnewnote". requires login

router.post('/addnewnote', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 }),
], async (req, res) => {

    const { title, description, tag } = req.body

    try {
        // if there are errors, return bad request and the errors

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }


        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save()
        res.json(savedNote)
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }
})

// Route 3 : update an existing note: PUT "/api/notes/updatenote/:id". requires login

router.put('/updatenote/:id', fetchUser, async (req, res) => {

    const { title, description, tag } = req.body

    try {
        // create a newNote object
        const newNote = {}

        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }


        // find the note to be updated and update it
        let note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).send("Note not found!")
        }

        // accessing others' notes

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed!")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note)
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }

})


// Route 4 : delete an existing note: DELETE "/api/notes/deletenote/:id". requires login

router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // find the note to be deleted and delete it
        let note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).send("Note not found!")
        }

        // allow deletion if user owns this note

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed!")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted!", note: note })
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }

})


export default router