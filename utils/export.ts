/**
 * Creates a markdown file and triggers a download in the browser.
 * @param filename - The desired name for the downloaded file (e.g., 'my_notes.md').
 * @param content - The string content to be written to the file.
 */
export const downloadAsMarkdown = (filename: string, content: string): void => {
    // Create a Blob from the markdown content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });

    // Create a link element
    const link = document.createElement("a");

    // Create a URL for the Blob and set it as the href of the link
    const url = URL.createObjectURL(blob);
    link.href = url;

    // Set the download attribute of the link to the desired filename
    link.setAttribute("download", filename);

    // Append the link to the body (required for Firefox)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by removing the link and revoking the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
