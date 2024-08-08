/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLastWord = function(s) {
    s = s.trim();
    const words = s.split(' ');
    const lastWord = words[words.length - 1];
    return lastWord.length;
};