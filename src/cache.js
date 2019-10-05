const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const getProfileConfig = require('./profile-config');
const makeCredentialsObj = require('./make-credentials-obj');

const mkdirIfNotExists = cacheDir => {
    if (!fs.existsSync(cacheDir)) {
        mkdirp.sync(cacheDir);
        fs.chmodSync(cacheDir, 0o700);
    }
};

const getFilename = ({ profile, cacheDir }) => {
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

const withCache = fn => async ({ cacheDir, ...args }) => {
    const { profile } = args;
    const filename = getFilename({ profile, cacheDir });
    const cached = getCredentialsFromFile(filename);
    const credentials = cached ? cached : await fn(args);
    writeCredentialsToFile({ cacheDir, filename, credentials });
    return credentials;
};

module.exports = withCache;
