CREATE DATABASE hogwarts_diary;
USE hogwarts_diary;

CREATE TABLE user(
	id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL
);

CREATE TABLE diary(
	id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    date DATE,
    title VARCHAR(100),
    content TEXT,
    FOREIGN KEY(user_id) REFERENCES user(id)
    ON DELETE CASCADE
);

SELECT * FROM  user;
SELECT * FROM  diary;

