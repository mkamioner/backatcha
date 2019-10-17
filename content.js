const pendingCommands = {
  changeAssignee: false,
};

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key]));
  });
}

async function getAuthorizationHeader() {
  const username = await getStorage('githubUsername');
  const password = await getStorage('githubPassword');
  return `Basic ${btoa(`${username}:${password}`)}`;
}

function getCurrentPullRequest() {
  const reg = /^https:\/\/github\.com\/(.*)\/(.*)\/pull\/(\d*)/g;
  const urlMatch = reg.exec(window.location.href);
  if (!urlMatch) {
    console.log('Backatcha: Not a PR.');
    return null;
  }

  return {
    owner: urlMatch[1],
    repo: urlMatch[2],
    pullRequestId: urlMatch[3],
  };
}

async function getPullRequestDetails(pullRequestDetails) {
  const url = `https://api.github.com/repos/${pullRequestDetails.owner}/${pullRequestDetails.repo}/pulls/${pullRequestDetails.pullRequestId}?breaker=${Date.now()}`;
  const authorizationHeader = await getAuthorizationHeader();

  const response = await fetch(url, {
    method: 'GET',
    headers: new Headers({Authorization: authorizationHeader}),
  });

  if (!response.ok) {
    console.error(
      'Backatcha: There was an error getting the pull request details',
      response,
      await response.json(),
    );
    throw new Error('There was an error the pull request details');
  }

  const body = await response.json();
  const author = body.user.login;
  const reviewer = body.requested_reviewers[0].login;
  const assignee = body.assignees[0].login;
  return {author, reviewer, assignee};
}

function getNewAssignee(pullRequestDetails) {
  if (pullRequestDetails.assignee == pullRequestDetails.author) {
    return pullRequestDetails.reviewer;
  }

  return pullRequestDetails.author;
}

async function changeAssigneeInPullRequest(pullRequestDetails, assignee) {
  const url = `https://api.github.com/repos/${pullRequestDetails.owner}/${pullRequestDetails.repo}/issues/${pullRequestDetails.pullRequestId}`;
  const authorizationHeader = await getAuthorizationHeader();

  const response = await fetch(url, {
    method: 'PATCH',
    headers: new Headers({
      Authorization: authorizationHeader,
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({assignee})
  });
  if (!response.ok) {
    console.error(
      'Backatcha: There was an error the changing the assignee',
      response,
      await response.json(),
    );
    throw new Error('There was an error the changing the assignee');
  }
}

async function changeAssignee(pullRequestDetails) {
  const pullRequestState = await getPullRequestDetails(pullRequestDetails);
  const newAssignee = getNewAssignee(pullRequestState);
  console.log(`Backatcha: Changing assignee from ${pullRequestState.assignee} to ${newAssignee}`);
  await changeAssigneeInPullRequest(pullRequestDetails, newAssignee)
}

function processKeyDownEvent(event) {
  if (!pendingCommands.changeAssignee && event.metaKey && event.shiftKey && event.key === 'a') {
    pendingCommands.changeAssignee = true;
    console.log('Backatcha: Staged change assignee event');
  }
}

function createProcessKeyUpEvent(pullRequestDetails) {
  return async function processKeyUpEvent(event) {
    if (pendingCommands.changeAssignee) {
      pendingCommands.changeAssignee = false;
      await changeAssignee(pullRequestDetails);
    }
  };
}

function init(document) {
  const pullRequestDetails = getCurrentPullRequest();
  if (pullRequestDetails) {
    console.log('Backatcha: Detected PR', pullRequestDetails);
    document.body.addEventListener('keydown', processKeyDownEvent);
    document.body.addEventListener('keyup', createProcessKeyUpEvent(pullRequestDetails));
  }
}

init(window.document)
  .then(() => console.log('Backatcha: Init complete.'))
  .catch((err) => console.error('Backatcha: Init failed', err));
