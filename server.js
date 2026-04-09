const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let problems = [
    { id: 1, title: "첫 번째 예시 문제", content: "대한민국의 수도는 어디인가요?", answer: "서울" },
    { id: 2, title: "넌센스 퀴즈", content: "세상에서 가장 큰 코는?", answer: "멕시코" }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/problems', (req, res) => {
    res.json(problems);
});

app.post('/api/problems', (req, res) => {
    const { title, content, answer } = req.body;
    const newProblem = {
        id: Date.now(),
        title,
        content,
        answer
    };
    problems.push(newProblem);
    res.status(201).json({ message: "등록 성공!" });
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 달리고 있습니다!`);
});