const mentionRegex = /@([a-zA-Z0-9_]+)/g;

export function extractMentions(text: string) {
    const matches = [...text.matchAll(mentionRegex)];

    return matches.map(m => m[1]);
}
