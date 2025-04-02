
/**
 * Module dependencies
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const randBytes = require('../utils/randBytes');


/**
 * Stores sessions when user log in
 * Helps persists data
 *
 */

const SESSION_FILE = path.join(__dirname, '..', 'db', 'sessions.json');

const sessionStore = {

    //IN MEMORY SESSION STORE
    sessions: {},
    filePath: SESSION_FILE, // PATH TO SESSIONS FILE IN DATABASE

    /**
     * initialize session store
     */

    init: async function () {
        await this.load_Sessions();
    },

    /**
     * Loads the session file, parses it and update the session object
     */

    load_Sessions: async function () {
        try {
            await fs.access(this.filePath);
            console.log('File found. Reading file...');
            let data = await fs.readFile(this.filePath, 'utf-8');
            this.sessions = JSON.parse(data);

        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('File does not exists. Creating file...');
                await fs.writeFile(this.filePath, JSON.stringify(this.sessions, null, 2), 'utf-8');
                console.log('File created.')
            } else {
                console.log(err)
                await fs.writeFile(this.filePath, JSON.stringify(this.sessions, null, 2), 'utf-8');
                console.error('Error loading sessions:', err.message)
            }
        }
    },

    /**
     * Create a new user session and stores in memory (session object)
     * 
     * @param {Object} payload
     * @returns {String}
     */

    create_Session: async function (payload) {
        const sessionId = randBytes();
        this.sessions[sessionId] = payload;
        await this.save_Sessions();
        return sessionId;

    },

    /**
     * Update the session json file for data persistance
     *
     */

    save_Sessions: async function () {
        try {
            const jsonData = JSON.stringify(this.sessions, null, 2);
            await fs.writeFile(this.filePath, jsonData, 'utf-8')
        } catch (err) {
            console.log(err.message)
        }
    },
    /**
     * Retrieve a specified session with session ID. 
     * 
     * @param {String} sessionId
     * @returns {Object}
     */

    get_sessionByID: async function (sessionID) {
        return this.sessions[sessionID] || null;
    },

    /**
     * Verifies if a session exists
     * 
     * @param {String} sessionID
     * @returns {Boolean}
     */

    isPresent: function (sessionID) {
        return this.sessions.hasOwnProperty(sessionID)
    },

    /**
     * retrieve the entire session object 
     * 
     * @return {Object}
     */

    show_sessions: function () {
        return this.sessions;

    },

    /**
     * Delete a specific session by ID
     * Update the session object
     * 
     * @param {String} sessionID
     */

    delete_session: async function (sessionID) {
        delete this.sessions[sessionID];
        await this.save_Sessions();
    }

}

module.exports = sessionStore;