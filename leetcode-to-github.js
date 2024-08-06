const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const LEETCODE_USERNAME = 'LyndonYRB';
const GITHUB_REPO = 'https://github.com/LyndonYRB/leetcode-problems.git';
const LOCAL_REPO_PATH = 'C:\Users\lyndo\MyCoding\Leetcode\leetcode-problems';


const git = simpleGit(LOCAL_REPO_PATH);

async function fetchRecentSolutions() {
    try {
        const url = `https://leetcode.com/api/submissions/${LEETCODE_USERNAME}`;
        const response = await axios.get(url);
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
