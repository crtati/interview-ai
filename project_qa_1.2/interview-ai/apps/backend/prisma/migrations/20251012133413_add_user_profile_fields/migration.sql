-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "phone" TEXT,
    "birthDate" TEXT,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "educationLevel" TEXT,
    "institution" TEXT,
    "fieldOfStudy" TEXT,
    "graduationYear" TEXT,
    "certifications" TEXT,
    "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
    "currentPosition" TEXT,
    "currentCompany" TEXT,
    "yearsOfExperience" TEXT,
    "previousPositions" TEXT,
    "skills" TEXT,
    "languages" TEXT,
    "desiredPosition" TEXT,
    "desiredSalary" TEXT,
    "availability" TEXT,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "workMode" TEXT,
    "aboutMe" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "firstName", "id", "lastName", "password", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "firstName", "id", "lastName", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
