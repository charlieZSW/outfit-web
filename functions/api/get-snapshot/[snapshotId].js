    // functions/api/get-snapshot/[snapshotId].js

    export async function onRequestGet(context) {
        try {
            const kv = context.env.SNAPSHOT_KV; // Matches binding name in Pages settings
             if (!kv) {
                return new Response('KV Namespace not bound.', { status: 500 });
            }

            // 'snapshotId' comes from the [snapshotId].js filename
            const { snapshotId } = context.params; 

            if (!snapshotId) {
                return new Response('Snapshot ID missing in path.', { status: 400 });
            }

            const markdownContent = await kv.get(snapshotId);

            if (markdownContent === null) {
                return new Response('Snapshot not found or expired.', { status: 404 });
            }

            return new Response(JSON.stringify({ markdownContent }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });

        } catch (error) {
            console.error('Error retrieving snapshot:', error);
            return new Response(`Failed to retrieve snapshot: ${error.message}`, { status: 500 });
        }
    }
    
    // Handle other methods if needed, or return 405 Method Not Allowed
    export async function onRequest(context) {
      if (context.request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      // Fallback to onRequestGet for GET requests if onRequestGet is defined
      if (typeof onRequestGet === 'function') {
          return onRequestGet(context);
      }
      return new Response("Request handler not found", { status: 404 });
    }