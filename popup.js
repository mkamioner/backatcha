async function removeStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => resolve());
  });
}

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key]));
  });
}

async function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({[key]: value}, resolve);
  });
}

async function confirmCredentials(username, password) {
  const Authorization = `Basic ${btoa(`${username}:${password}`)}`;
  const response = await fetch('https://api.github.com/user', {
    headers: new Headers({Authorization}),
  });
  return response.ok;
}

async function confirmExistingCredentials() {
  const username = await getStorage('githubUsername');
  const password = await getStorage('githubPassword');

  if (!username || !password) {
    return false;
  }

  return await confirmCredentials(username, password);
}

async function logIn() {
  document.querySelector('#iError').innerHTML = '';
  document.querySelector('#iError').style.display = 'none';

  const username = document.querySelector('#txtUsername').value;
  const password = document.querySelector('#txtPassword').value;

  showWaiting();
  const confirmed = await confirmCredentials(username, password);
  if (confirmed) {
    await setStorage('githubUsername', username);
    await setStorage('githubPassword', password);
    showAuthorized();
  } else {
    showUnauthorized();
    document.querySelector('#iError').style.display = 'block';
    document.querySelector('#iError').innerHTML = 'Invalid credentials';
  }
}

async function logOut() {
  await removeStorage('githubUsername');
  await removeStorage('githubPassword');
  showUnauthorized();
}

async function getGitHubUserInfo() {
  return new Promise((resolve) => {
    chrome.storage.local.get('githubUser', resolve);
  });
}

function showAuthorized() {
  document.querySelector('#divUnauthorized').style.display = 'none';
  document.querySelector('#divAuthorized').style.display = 'block';
  document.querySelector('#divWaiting').style.display = 'none';
}

function showWaiting() {
  document.querySelector('#divUnauthorized').style.display = 'none';
  document.querySelector('#divAuthorized').style.display = 'none';
  document.querySelector('#divWaiting').style.display = 'block';
}

function showUnauthorized() {
  document.querySelector('#divUnauthorized').style.display = 'block';
  document.querySelector('#divAuthorized').style.display = 'none';
  document.querySelector('#divWaiting').style.display = 'none';
}

async function initPage() {
  document.querySelector('#iError').style.display = 'none';
  document.querySelector('#btnLogIn').onclick = logIn;
  document.querySelector('#btnLogOut').onclick = logOut;
  showWaiting();

  if (!await confirmExistingCredentials()) {
    showUnauthorized();
  } else {
    showAuthorized();
  }
}

window.onload = initPage;
