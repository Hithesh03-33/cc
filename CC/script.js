// --- Module 1: GitHub API ---
function fetchGitHubUser() {
  const username = document.getElementById('githubUser').value;
  fetch(`https://api.github.com/users/${username}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('githubResult').innerHTML = `
        <img src="${data.avatar_url}" width="80" />
        <p>Name: ${data.name || "N/A"}</p>
        <p>Public Repos: ${data.public_repos}</p>
        <p>Followers: ${data.followers}</p>
      `;
    }).catch(err => console.error(err));
}

// --- Module 2: Supabase Upload ---
const supabaseUrl = 'https://gatbetaosjurauuvnhwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdGJldGFvc2p1cmF1dXZuaHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTI1OTYsImV4cCI6MjA2OTUyODU5Nn0.aWID-zHO5-vJvAkrjAPhSXaGOqONRCaxgU1xBWKBuB8';
const bucketName = 'public';  // Must exist

async function uploadFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert("No file selected");

  const { createClient } = window.supabase;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.storage.from(bucketName).upload(file.name, file);
  const status = document.getElementById('uploadStatus');
  if (error) {
    status.textContent = "Upload failed: " + error.message;
  } else {
    const { data: publicURL } = supabase.storage.from(bucketName).getPublicUrl(file.name);
    status.innerHTML = `File uploaded! <a href="${publicURL.publicUrl}" target="_blank">View File</a>`;
  }
}

// --- Module 3: Ably Chat ---
const ably = new Ably.Realtime('3J5ufg.qrMLWA:itAg2qfAUywE98sRM61OsxC-xf2G6ivNPqfpB40dAB4');
const channel = ably.channels.get('cloud-chat');

channel.subscribe(msg => {
  const chatBox = document.getElementById('chatBox');
  chatBox.innerHTML += `<div><b>User:</b> ${msg.data}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});

function sendMessage() {
  const msg = document.getElementById('chatInput').value;
  if (msg.trim()) {
    channel.publish('message', msg);
    document.getElementById('chatInput').value = '';
  }
}