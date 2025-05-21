    // functions/api/create-snapshot.js

    // Helper function to generate a random ID
    function generateId(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    export async function onRequestPost(context) {
        try {
            // KV Namespace is bound to 'SNAPSHOT_KV' in Pages settings
            // Make sure this binding name matches what you set in Cloudflare Pages dashboard
            const kv = context.env.SNAPSHOT_KV; 
            if (!kv) {
                return new Response('KV Namespace not bound.', { status: 500 });
            }

            const { markdownContent } = await context.request.json();

            if (!markdownContent) {
                return new Response('Missing markdownContent in request body.', { status: 400 });
            }

            const snapshotId = generateId();
            const sevenDaysInSeconds = 7 * 24 * 60 * 60;

            await kv.put(snapshotId, markdownContent, {
                expirationTtl: sevenDaysInSeconds, // Automatically delete after 7 days
            });

            return new Response(JSON.stringify({ snapshotId }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });

        } catch (error) {
            console.error('Error creating snapshot:', error);
            return new Response(`Failed to create snapshot: ${error.message}`, { status: 500 });
        }
    }

    // Handle other methods if needed, or return 405 Method Not Allowed
    export async function onRequest(context) {
      if (context.request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      // Fallback to onRequestPost for POST requests if onRequestPost is defined
      if (typeof onRequestPost === 'function') {
          return onRequestPost(context);
      }
      return new Response("Request handler not found", { status: 404 });
    }