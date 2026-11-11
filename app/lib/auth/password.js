import bcrypt from "bcryptjs";

const ROUNDS = 12;
// Used to keep login timing similar when the user doesn't exist.
const DUMMY_HASH = bcrypt.hashSync("conscious-effort-dummy", ROUNDS);

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
export const fakeCompare = (plain) => bcrypt.compare(plain, DUMMY_HASH);
