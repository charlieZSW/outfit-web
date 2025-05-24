/**
 * Handles the share button click event.
 * Attempts to use the Web Share API to share the website URL.
 * If Web Share API is not available, copies the website URL to the clipboard.
 */
import { getEditor } from './state.js'; // Assuming getEditor gives CodeMirror instance

export async function handleShare() {
    const editor = getEditor();
    if (!editor) {
        console.error("Editor instance not available for sharing.");
        alert("Unable to share: Editor not ready.");
        return;
    }

    const markdownContent = editor.getValue();
    if (!markdownContent.trim()) {
        alert("No content to share.");
        return;
    }

    try {
        // Show some loading indicator to the user if you have one
        // e.g., shareButton.disabled = true; shareButton.textContent = "Generating link...";

        const response = await fetch('/api/create-snapshot', { // Relative path to your Pages Function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdownContent }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create snapshot: ${response.status} ${errorText}`);
        }

        const { snapshotId } = await response.json();
        if (!snapshotId) {
            throw new Error('No snapshotId received after creating snapshot.');
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}#s=${snapshotId}`;
        
        const shareTitle = "Check out this content in the online Markdown editor!"; 
        const shareText = "I wrote something with this editor and wanted to share it with you."; 

        if (navigator.share) {
            await navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
            });
            console.log('Content successfully shared via Web Share API');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard!');
        }

    } catch (err) {
        console.error('Share handling error:', err);
        alert(`Sharing failed: ${err.message}`);
    } finally {
        // Hide loading indicator
        // e.g., shareButton.disabled = false; shareButton.textContent = "Share";
    }
} 