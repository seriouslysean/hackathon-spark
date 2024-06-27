/**
 * Converts a string to kebab-case.
 * @param {string} str The string to convert.
 * @return {string} The kebab-cased string.
 */
export const kebabCase = (str) => {
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');
};
