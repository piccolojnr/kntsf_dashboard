-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameKey` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Game_gameKey_key`(`gameKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameScore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    `score` INTEGER NOT NULL,
    `timeTaken` INTEGER NOT NULL,
    `movesCount` INTEGER NOT NULL,
    `gameData` JSON NULL,
    `playedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_student_game`(`studentId`, `gameId`),
    INDEX `idx_leaderboard`(`gameId`, `difficulty`, `score`, `timeTaken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GameScore` ADD CONSTRAINT `GameScore_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameScore` ADD CONSTRAINT `GameScore_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Leaderboard view for easy querying
CREATE VIEW leaderboard_view AS
SELECT 
    gs.id,
    s.studentId,
    s.name as studentName,
    s.course,
    s.level,
    g.gameKey,
    g.name as gameName,
    gs.difficulty,
    gs.score,
    gs.timeTaken,
    gs.movesCount,
    gs.playedAt,
    ROW_NUMBER() OVER (
        PARTITION BY g.id, gs.difficulty 
        ORDER BY gs.score DESC, gs.timeTaken ASC, gs.playedAt ASC
    ) as rankPosition
FROM GameScore gs
JOIN Student s ON gs.studentId = s.id
JOIN Game g ON gs.gameId = g.id
WHERE s.deletedAt IS NULL;

-- Personal best view for each student
CREATE VIEW personal_best_view AS
SELECT 
    s.studentId,
    s.name as studentName,
    g.gameKey,
    g.name as gameName,
    gs.difficulty,
    MAX(gs.score) as bestScore,
    MIN(gs.timeTaken) as bestTime,
    MIN(gs.movesCount) as bestMoves,
    COUNT(*) as totalPlays,
    MAX(gs.playedAt) as lastPlayed
FROM GameScore gs
JOIN Student s ON gs.studentId = s.id
JOIN Game g ON gs.gameId = g.id
WHERE s.deletedAt IS NULL
GROUP BY s.id, g.id, gs.difficulty;

-- Insert the games
INSERT INTO Game (gameKey, name, description, createdAt, updatedAt) VALUES
('memory', 'Memory Match', 'Test your memory by matching pairs of cards', NOW(3), NOW(3)),
('puzzle', 'Sliding Puzzle', 'Arrange numbered tiles in the correct order', NOW(3), NOW(3)),
('reaction', 'Reaction Time', 'Test how fast your reflexes really are', NOW(3), NOW(3)),
('speed-math', 'Speed Math', 'Solve math problems as quickly as possible', NOW(3), NOW(3)),
('pattern', 'Pattern Recognition', 'Identify and complete patterns in sequences', NOW(3), NOW(3)),
('word-search', 'Word Search', 'Find hidden words in a grid of letters', NOW(3), NOW(3)),
('color-quiz', 'Color Quiz', 'Test your knowledge of colors and their combinations', NOW(3), NOW(3)),
('math-challenge', 'Math Challenge', 'Solve challenging math problems under time pressure', NOW(3), NOW(3));
