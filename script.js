const form = document.getElementById('download-form');
const input = document.getElementById('folder-url');
const state = document.getElementById('status');

const baseUrl = "http://localhost:3000"

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const folderUrl = input.value.trim();
  state.textContent = 'Preparing download...';
  const fullUrl = `${baseUrl}/api/download?url=${encodeURIComponent(folderUrl)}`;

  try {

    const res = await fetch(fullUrl, {
      method: 'GET',
    });


    if (res.ok) {
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      const match = /filename="(.+?)"/.exec(contentDisposition || '');
      const filename = match?.[1] || 'download.zip';

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      state.textContent = 'Download started!';
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

      state.textContent = errorMessage;
    }
  } catch (err) {
    console.error(err);
    state.textContent = 'An unexpected error occurred.';
  }
});

