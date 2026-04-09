require('dotenv').config(); // .env 파일을 읽어옵니다.
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// 데이터베이스 연결 설정
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 테이블 자동 생성 (서버 실행 시 자동 확인)
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("DB 테이블 준비 완료!");
    } catch (err) {
        console.log("DB 연결 확인 중 (정상):", err.message);
    }
};
initDb();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/problems', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM problems ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "데이터 조회 실패" });
    }
});
// 4. 문제 등록하기 (DB 저장)
app.post('/api/problems', async (req, res) => {
    const { title, content, answer } = req.body;
    try {
        await pool.query(
            'INSERT INTO problems (title, content, answer) VALUES ($1, $2, $3)',
            [title, content, answer]
        );
        res.status(201).json({ message: "등록 성공!" });
    } catch (err) {
        res.status(500).json({ error: "데이터 저장 실패" });
    }
});

// 5. 문제 수정하기 (DB 업데이트)
app.put('/api/problems/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, answer } = req.body;
    try {
        await pool.query(
            'UPDATE problems SET title = $1, content = $2, answer = $3 WHERE id = $4',
            [title, content, answer, id]
        );
        res.json({ message: "수정 성공!" });
    } catch (err) {
        res.status(500).json({ error: "데이터 수정 실패" });
    }
});

// 6. 문제 삭제하기 (DB 삭제)
app.delete('/api/problems/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM problems WHERE id = $1', [id]);
        res.json({ message: "삭제 성공!" });
    } catch (err) {
        res.status(500).json({ error: "데이터 삭제 실패" });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT} 에서 달리고 있습니다!`);
});