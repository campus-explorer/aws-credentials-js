const adminTtl = 60 * 60 * 1; //  Admin   : 1h
const normalTtl = 60 * 60 * 8; // Default : 8h

/** @type {(profile: string) => number} */
const getTtl = (profile) => (profile.endsWith('-admin') ? adminTtl : normalTtl);

module.exports = getTtl;
