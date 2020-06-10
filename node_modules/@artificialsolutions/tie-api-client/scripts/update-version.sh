#!/bin/bash

set -e

# Can be 'patch' 'minor' 'major' or new version semver
update_type=$1

if [ ! $update_type ]; then
  echo "ERROR: Specify a version update type (patch, minor or major)"
  exit 1
fi

# Ensure you are on the latest version of the master branch
git checkout master > /dev/null
git pull > /dev/null

# Update package.json and package-lock.json and store the new version
new_version=$(npm --no-git-tag-version version $update_type)

echo "Bumping version to $new_version"

# Create and checkout a new branch on which to make the update
branch_name=version-update/$new_version
git checkout -b $branch_name > /dev/null

# Commit the version update and push to Github
git add package.json package-lock.json
git commit -m "Bump version to $new_version"
git push --set-upstream origin $branch_name > /dev/null

# Go back to the master branch
git checkout master > /dev/null

# Generate a link to quickly create a pull request with the version update
echo ""
echo "Follow this link to create a PR"
echo ""
echo "  https://github.com/artificialsolutions/tie-api-client-js/compare/master...${branch_name}?quick_pull=1&title=Bump+version+to+${new_version}"
echo ""
