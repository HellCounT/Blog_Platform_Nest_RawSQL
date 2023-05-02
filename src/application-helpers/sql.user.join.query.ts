export const sqlUserJoinQuery = `
SELECT
u."id", u."login", u."email", u."createdAt", u."hash", 
c."confirmationCode", c."confirmationExpirationDate", c."isConfirmed",
r."recoveryCode", r."recoveryExpirationDate",
b."isBanned", b."banDate", b."banReason"
FROM "USERS" AS u
JOIN "USERS_CONFIRMATIONS" AS c
ON u."id" = c."userId"
JOIN "USERS_RECOVERY" AS r
ON u."id" = r."userId"
JOIN "USERS_GLOBAL_BAN" AS b
ON u."id" = b."userId"
`;
