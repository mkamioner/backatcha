# Backatcha

## A chrome plugin to make re-assigning GitHub PRs easier

## Background

This app was created to make the assigning of Pull Requests easier in GitHub. It switches between the Author and the Reviewer of a PR using the keystroke `SHIFT` + `CMD` + `A` (In windows use `ALT` instead of `CMD`).

## How to Install

### Create a GitHub Access Token

- Go to GitHub [Settings](https://github.com/settings/profile) > [Developer Settings](https://github.com/settings/apps) > [Personal access tokens](https://github.com/settings/tokens)
- Choose [Generate new token](https://github.com/settings/tokens/new)
- Give the token a name that is easy to identify, like `Backatcha Plugin`
- Give the token the rights for `repo`
- Generate the token - Don't lose it, if you do you will need to create a new one

### Install the plugin

- First, clone this repository locally
- Open chrome and go to [Settings](chrome://settings/)
- Choose [Extensions](chrome://extensions/)
- Enable `Developer mode` (should be in the top-right corner)
- Choose `Load unpacked` and select the directory of this repository

### Setup Credentials

- Go to [GitHub.com](https://github.com) (the plugin will only work when you are on a `GitHub.com` page)
- Click on the football ![icon](images/football-16.png) icon on enter your GitHub username (like `mkamioner`) and for the password, enter the access token you made earlier.
- Click login

### Test it out

- Go to a pull request and press `SHIFT` + `CMD` + `A` (In windows use `ALT` instead of `CMD`) and see what happens!

## Issues

For bugs, take a look at the console in chrome.
