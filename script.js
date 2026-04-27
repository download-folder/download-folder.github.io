const form = document.getElementById('download-form');
const input = document.getElementById('folder-url');
const state = document.getElementById('status');

const baseUrl = "https://github-folder-downloader.layerblocks.workers.dev"

function setStatus(msg, type = '') {
  state.textContent = msg;
  state.className = type;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const folderUrl = input.value.trim();

const url = new URL(folderUrl);

const githubFolderUrl = `${url.origin}${url.pathname}`;

let query = url.searchParams.toString();
if(query){
    query = (query.split("="))[1]
}


  setStatus('Preparing download...', 'loading');
  const fullUrl = `${baseUrl}/api/download?url=${encodeURIComponent(githubFolderUrl)}&fileName=${encodeURIComponent(query)}`;

  try {

    const res = await fetch(fullUrl, {
      method: 'GET',
    });


    if (res.ok) {

  const contentDisposition = [...res.headers.entries()]
  .find(([key]) => key.toLowerCase() === 'content-disposition')?.[1];


      const blob = await res.blob();


      const match = /filename="(.+?)"/.exec(contentDisposition || '');
      const filename = match?.[1] || 'download.zip';

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus('Download started!', 'success');

    } else {
      const contentType = res.headers.get('Content-Type') || '';
      let errorMessage = `Error ${res.state}`;

      if (contentType.includes('application/json')) {
        const err = await res.json();
        errorMessage = err.error || errorMessage;
      } else {
        const errText = await res.text();
        console.error('Unexpected response:', errText);
      }

      setStatus(errorMessage, 'error');
    }
  } catch (err) {
    console.error(err);
    setStatus('An unexpected error occurred.', 'error');
  }
});
