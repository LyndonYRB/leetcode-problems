const axios = require('axios');
const fs = require('fs');
const simpleGit = require('simple-git');
const path = require('path');

const git = simpleGit();
const leetcodeSession = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNjQzMzMwOCIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiNjVlZTE5NWVlZmJjZjZmNzIwYTdhZGFlYzUxNDk2MmI1OGFhZTA0NThjMTQ5OWQxNWNlY2E2MTBhMmU3YjcwYSIsImlkIjo2NDMzMzA4LCJlbWFpbCI6Ikx5bmRvbi5zdGx1Y2VAZ21haWwuY29tIiwidXNlcm5hbWUiOiJMeW5kb25ZUkIiLCJ1c2VyX3NsdWciOiJMeW5kb25ZUkIiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvYXZhdGFycy9hdmF0YXJfMTY2OTY2MjI5OS5wbmciLCJyZWZyZXNoZWRfYXQiOjE3MjI5NzY5OTMsImlwIjoiNDUuODguMjIyLjE0MiIsImlkZW50aXR5IjoiMzYyZDdmZTNkOGIyNTgxYmZmYTM1OWYwZWVkYTcxMDYiLCJkZXZpY2Vfd2l0aF9pcCI6WyJmNjRkMTlkNWI5ZGQ2Y2JmYTlmMzNiYjYxMjJjOWVmOSIsIjQ1Ljg4LjIyMi4xNDIiXSwic2Vzc2lvbl9pZCI6Njg0MjA5MjQsIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.CpzJvggv1vN9loP0DiC_XumJd7Ils4_aDk6y6tqDgA4';

async function fetchSubmissions() {
    try {
        const response = await axios.get('https://leetcode.com/api/submissions/?offset=0&limit=10&lastkey=', {
            headers: {
                Cookie: `LEETCODE_SESSION=${leetcodeSession}`
            }
        });
        return response.data.submissions_dump;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
}

function saveSubmissionToFile(submission) {
    // Adjust the base directory to the correct location
    const baseDir = path.join(__dirname, 'leetcode-problems');
    const dir = path.join(baseDir, submission.title_slug);

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    // Save the files with .js extension
    const filePath = path.join(dir, `solution.js`);
    const content = submission.code;

    console.log(`Writing to file: ${filePath}`);
    console.log(`Written content: ${content}`);
    
    fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
    const submissions = await fetchSubmissions();
    for (const submission of submissions) {
        saveSubmissionToFile(submission);
        await commitAndPushChanges();
    }
}

async function commitAndPushChanges() {
    try {
        console.log('Checking Git status...');
        const status = await git.status();
        console.log('Git status:', status);

        if (status.files.length > 0) {
            console.log('Adding changes to Git...');
            await git.add('.');
            console.log('Committing changes...');
            await git.commit('Add LeetCode submission solutions');
            console.log('Pushing to GitHub...');
            await git.push('origin', 'main');
            console.log('Changes committed and pushed to GitHub.');
        } else {
            console.log('No changes to commit.');
        }
    } catch (error) {
        console.error('Error during Git operations:', error);
    }
}

main();
