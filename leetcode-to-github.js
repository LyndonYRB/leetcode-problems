const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const LEETCODE_USERNAME = 'LyndonYRB';
const GITHUB_REPO = 'https://github.com/LyndonYRB/leetcode-problems.git';
const LOCAL_REPO_PATH = 'C:\\Users\\lyndo\\MyCoding\\Leetcode\\leetcode-problems';

// Replace these with your actual LeetCode session cookies
const LEETCODE_SESSION = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNjQzMzMwOCIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiNjVlZTE5NWVlZmJjZjZmNzIwYTdhZGFlYzUxNDk2MmI1OGFhZTA0NThjMTQ5OWQxNWNlY2E2MTBhMmU3YjcwYSIsImlkIjo2NDMzMzA4LCJlbWFpbCI6Ikx5bmRvbi5zdGx1Y2VAZ21haWwuY29tIiwidXNlcm5hbWUiOiJMeW5kb25ZUkIiLCJ1c2VyX3NsdWciOiJMeW5kb25ZUkIiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvYXZhdGFycy9hdmF0YXJfMTY2OTY2MjI5OS5wbmciLCJyZWZyZXNoZWRfYXQiOjE3MjI5NzY5OTMsImlwIjoiNDUuODguMjIyLjE0MiIsImlkZW50aXR5IjoiMzYyZDdmZTNkOGIyNTgxYmZmYTM1OWYwZWVkYTcxMDYiLCJkZXZpY2Vfd2l0aF9pcCI6WyJmNjRkMTlkNWI5ZGQ2Y2JmYTlmMzNiYjYxMjJjOWVmOSIsIjQ1Ljg4LjIyMi4xNDIiXSwic2Vzc2lvbl9pZCI6Njg0MjA5MjQsIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.CpzJvggv1vN9loP0DiC_XumJd7Ils4_aDk6y6tqDgA4';
const CSRF_TOKEN = 'juEtmsItuVsUy00RWuv8PNnSvzdFxt3HT6lA7J7JtSgz7m7dowPqM4xaEV4uUjtE';

const git = simpleGit(LOCAL_REPO_PATH);

async function fetchRecentSolutions() {
    try {
        const url = `https://leetcode.com/api/submissions/${LEETCODE_USERNAME}/`;
        const response = await axios.get(url, {
            headers: {
                'Cookie': `LEETCODE_SESSION=${LEETCODE_SESSION}; csrftoken=${CSRF_TOKEN}`,
                'X-CSRFToken': CSRF_TOKEN,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
            }
        });
        return response.data.submissions_dump || [];
    } catch (error) {
        console.error('Failed to fetch submissions:', error);
        return [];
    }
}

function saveSolution(solution) {
    const problemSlug = solution.title_slug;
    const code = solution.code;
    const lang = solution.lang;

    const fileExtension = {
        python: '.py',
        cpp: '.cpp',
        java: '.java',
        // Add other languages and their extensions as needed
    }[lang] || '';

    const filename = `${problemSlug}${fileExtension}`;
    const filepath = path.join(LOCAL_REPO_PATH, filename);

    fs.writeFileSync(filepath, code);
    return filename;
}

async function gitCommitAndPush(files) {
    try {
        await git.add(files);
        const commitMessage = `LeetCode solutions update: ${new Date().toISOString()}`;
        await git.commit(commitMessage);
        await git.push('origin', 'main');
    } catch (error) {
        console.error('Failed to commit and push:', error);
    }
}

async function main() {
    const recentSolutions = await fetchRecentSolutions();
    if (recentSolutions.length === 0) return;

    const filesToCommit = recentSolutions.map(saveSolution);
    if (filesToCommit.length > 0) {
        await gitCommitAndPush(filesToCommit);
    }
}

main().catch(console.error);
