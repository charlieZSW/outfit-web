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
        alert("无法分享：编辑器未准备好。");
        return;
    }

    const markdownContent = editor.getValue();
    if (!markdownContent.trim()) {
        alert("没有内容可分享。");
        return;
    }

    try {
        // Show some loading indicator to the user if you have one
        // e.g., shareButton.disabled = true; shareButton.textContent = "正在生成链接...";

        const response = await fetch('/api/create-snapshot', { // Relative path to your Pages Function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdownContent }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`创建快照失败: ${response.status} ${errorText}`);
        }

        const { snapshotId } = await response.json();
        if (!snapshotId) {
            throw new Error('创建快照后未收到 snapshotId。');
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}#s=${snapshotId}`;
        
        const shareTitle = "看看这个在线 Markdown 编辑器里的内容！"; 
        const shareText = "我用这个编辑器写了些东西，分享给你看看。"; 

        if (navigator.share) {
            await navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
            });
            console.log('内容通过 Web Share API 成功分享');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('分享链接已复制到剪贴板！');
        }

    } catch (err) {
        console.error('分享处理错误:', err);
        alert(`分享失败: ${err.message}`);
    } finally {
        // Hide loading indicator
        // e.g., shareButton.disabled = false; shareButton.textContent = "分享";
    }
} 