const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const getProfileConfig = require('./profile-config');
const makeCredentialsObj = require('./make-credentials-obj');

/** @type {(cacheDir: string) => void} */
const mkdirIfNotExists = cacheDir => {
    if (!fs.existsSync(cacheDir)) {
        mkdirp.sync(cacheDir);
        fs.chmodSync(cacheDir, 0o700);
    }
};

/** @type {(profile: string, cacheDir: string) => string} */
const getFilename = (profile, cacheDir) => {
    const profileConfig = getProfileConfig(profile);
    const { role_arn: roleArn, mfa_serial: mfaSerial } = profileConfig;
    const unhashed =
        `{"RoleArn": "${roleArn}"` +
        (mfaSerial ? `, "SerialNumber": "${mfaSerial}"` : '') +
        '}';
    const hash = crypto.createHash('sha1');
    hash.update(unhashed);
    return `${cacheDir}/${hash.digest('hex')}.json`;
};

/** @type {(filename: string) => AWS.Credentials | void} */
const getCredentialsFromFile = filename => {
    if (!fs.existsSync(filename)) return undefined;

    let cached;
    try {
        cached = JSON.parse(fs.readFileSync(filename, 'utf8'));
    } catch {
        cached = undefined;
    }

    if (!cached) return undefined;
    const {
        AccessKeyId: accessKeyId,
        SecretAccessKey: secretAccessKey,
        SessionToken: sessionToken,
        Expiration: expireTime,
    } = cached.Credentials;
    const credentials = makeCredentialsObj({
        accessKeyId,
        secretAccessKey,
        sessionToken,
        expireTime,
    });
    return credentials.expired ? undefined : credentials;
};

/** @type {(params: {cacheDir: string, filename: string, credentials: AWS.Credentials}) => void} */
const writeCredentialsToFile = ({ cacheDir, filename, credentials }) => {
    const { sessionToken, expireTime } = credentials;
    mkdirIfNotExists(cacheDir);
    fs.writeFileSync(
        filename,
        JSON.stringify({
            Credentials: {
                AccessKeyId: credentials.accessKeyId,
                SecretAccessKey: credentials.secretAccessKey,
                ...(sessionToken && { SessionToken: sessionToken }),
                ...(expireTime && { Expiration: expireTime }),
            },
        }),
    );
};

/** @type {(cacheDir: string, profile: string, getCredentials: () => Promise<AWS.Credentials>) => Promise<AWS.Credentials>} */
const getCredentialsUseCache = async (cacheDir, profile, getCredentials) => {
    const filename = getFilename(profile, cacheDir);
    const cached = getCredentialsFromFile(filename);
    const credentials = cached ? cached : await getCredentials();
    writeCredentialsToFile({ cacheDir, filename, credentials });
    return credentials;
};

module.exports = getCredentialsUseCache;
