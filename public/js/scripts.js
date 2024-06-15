document.getElementById('upload-files-btn').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('upload-folders-btn').addEventListener('click', () => {
  document.getElementById('folder-input').click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
  handleUpload(event.target.files, 'files');
});

document.getElementById('folder-input').addEventListener('change', (event) => {
  handleUpload(event.target.files, 'folders');
});

document.getElementById('download-btn').addEventListener('click', () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/download', true);
  xhr.responseType = 'blob';

  xhr.onload = () => {
      if (xhr.status === 200) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(xhr.response);
          const filename = document.getElementById('filename-input').value || 'compressed.zip';
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
      } else {
          document.getElementById('status').innerText = 'Download failed.';
      }
  };

  xhr.send();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('file-input').value = '';
  document.getElementById('folder-input').value = '';
  document.getElementById('progress').innerText = '';
  document.getElementById('status').innerText = '';
  document.getElementById('filename-input').style.display = 'none';
  document.getElementById('download-btn').style.display = 'none';
  document.getElementById('reset-btn').style.display = 'none';
});

function handleUpload(files, type) {
  const formData = new FormData();
  for (let file of files) {
      formData.append('files', file);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `/upload?type=${type}`, true);
  xhr.responseType = 'blob';

  xhr.upload.addEventListener('progress', (e) => {
      const percent = (e.loaded / e.total) * 100;
      document.getElementById('progress').innerText = `Progress: ${percent.toFixed(2)}%`;
  });

  xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
          document.getElementById('status').innerText = 'Upload successful. ';
          document.getElementById('filename-input').style.display = 'block';
          document.getElementById('download-btn').style.display = 'block';
          document.getElementById('reset-btn').style.display = 'block';
      } else {
          document.getElementById('status').innerText = 'Upload failed.';
      }
  });

  xhr.send(formData);
}
