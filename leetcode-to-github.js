const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const git = simpleGit();

const GITHUB_REPO_URL = 'https://github.com/LyndonYRB/leetcode-problems';
const LOCAL_REPO_PATH = './leetcode-problems';
const LEETCODE_API_URL = 'https://leetcode.com/api/submissions/?offset=0&limit=10&lastkey=';
const LEETCODE_SESSION_COOKIE = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNjQzMzMwOCIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiNjVlZTE5NWVlZmJjZjZmNzIwYTdhZGFlYzUxNDk2MmI1OGFhZTA0NThjMTQ5OWQxNWNlY2E2MTBhMmU3YjcwYSIsImlkIjo2NDMzMzA4LCJlbWFpbCI6Ikx5bmRvbi5zdGx1Y2VAZ21haWwuY29tIiwidXNlcm5hbWUiOiJMeW5kb25ZUkIiLCJ1c2VyX3NsdWciOiJMeW5kb25ZUkIiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvYXZhdGFycy9hdmF0YXJfMTY2OTY2MjI5OS5wbmciLCJyZWZyZXNoZWRfYXQiOjE3MjI5NzY5OTMsImlwIjoiNDUuODguMjIyLjE0MiIsImlkZW50aXR5IjoiMzYyZDdmZTNkOGIyNTgxYmZmYTM1OWYwZWVkYTcxMDYiLCJkZXZpY2Vfd2l0aF9pcCI6WyJmNjRkMTlkNWI5ZGQ2Y2JmYTlmMzNiYjYxMjJjOWVmOSIsIjQ1Ljg4LjIyMi4xNDIiXSwic2Vzc2lvbl9pZCI6Njg0MjA5MjQsIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.CpzJvggv1vN9loP0DiC_XumJd7Ils4_aDk6y6tqDgA4'; // Replace with your actual session cookie

async function fetchSubmissions() {
  try {
    const response = await axios.get(LEETCODE_API_URL, {
      headers: {
        Cookie: `LEETCODE_SESSION=${LEETCODE_SESSION_COOKIE}`
      }
    });
    return response.data.submissions_dump;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

async function saveSubmissionToFile(submission) {
  const submissionDir = path.join(LOCAL_REPO_PATH, submission.title_slug);

  if (!fs.existsSync(submissionDir)) {
    fs.mkdirSync(submissionDir, { recursive: true });
  }

  const filePath = path.join(submissionDir, `solution.${submission.lang}`);
  console.log(`Writing to file: ${filePath}`); // Debug log

  fs.writeFileSync(filePath, submission.code);
  console.log(`Written content: ${submission.code}`); // Debug log
}

async function commitAndPushChanges(submission) {
  try {
    await git.add('./*');
    await git.commit(`Add solution for ${submission.title}`);
    await git.push('origin', 'main');
  } catch (error) {
    console.error('Error committing and pushing changes:', error);
  }
}

async function main() {
  try {
    // Clone the repository if it doesn't exist locally
    if (!fs.existsSync(LOCAL_REPO_PATH)) {
      await git.clone(GITHUB_REPO_URL, LOCAL_REPO_PATH);
    }

    // Change to the local repo directory
    process.chdir(LOCAL_REPO_PATH);

    // Fetch submissions from LeetCode
    const submissions = await fetchSubmissions();

    for (const submission of submissions) {
      // Save submission to a file
      await saveSubmissionToFile(submission);

      // Commit and push changes to GitHub
      await commitAndPushChanges(submission);
    }

    console.log('Successfully fetched submissions and pushed to GitHub.');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main();
