class GitHubAPI {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  async getUserInfo() {
    const response = await fetch('https://api.github.com/user', { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }
    return response.json();
  }

  async createRepository(name, description, isPrivate) {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        description: description,
        private: isPrivate,
        auto_init: true // Initialize with a README
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create repository: ${errorData.message || response.statusText}`);
    }
    return response.json();
  }

  async getBranchSha(owner, repo, branch = 'main') {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Failed to get branch SHA: ${response.statusText}`);
    }
    const data = await response.json();
    return data.object.sha;
  }

  async getTreeSha(owner, repo, treeSha) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}`, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Failed to get tree SHA: ${response.statusText}`);
    }
    const data = await response.json();
    return data.sha;
  }

  async createBlob(owner, repo, content) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content,
        encoding: 'utf-8'
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to create blob: ${response.statusText}`);
    }
    return response.json();
  }

  async createTree(owner, repo, baseTreeSha, files) {
    const tree = await Promise.all(files.map(async file => {
      const blob = await this.createBlob(owner, repo, file.content);
      return {
        path: file.path,
        mode: '100644', // file (blob)
        type: 'blob',
        sha: blob.sha
      };
    }));

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: tree
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to create tree: ${response.statusText}`);
    }
    return response.json();
  }

  async createCommit(owner, repo, treeSha, parentSha, message) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        tree: treeSha,
        parents: [parentSha]
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to create commit: ${response.statusText}`);
    }
    return response.json();
  }

  async updateBranch(owner, repo, commitSha, branch = 'main') {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sha: commitSha
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to update branch: ${response.statusText}`);
    }
    return response.json();
  }

  async pushMultipleFiles(owner, repo, files, commitMessage) {
    try {
      const branchSha = await this.getBranchSha(owner, repo);
      const baseTreeSha = await this.getTreeSha(owner, repo, branchSha);
      const newTree = await this.createTree(owner, repo, baseTreeSha, files);
      const newCommit = await this.createCommit(owner, repo, newTree.sha, branchSha, commitMessage);
      await this.updateBranch(owner, repo, newCommit.sha);
      return { successCount: files.length };
    } catch (error) {
      console.error('Error pushing multiple files:', error);
      throw error;
    }
  }
}

function sanitizeRepoName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-.]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
}

function convertFilesToGitHubFormat(files) {
  return files.map(file => ({
    path: file.title, // Assuming file.title is the full path including directories
    content: file.notes
  }));
}

async function validateGitHubToken(token) {
  try {
    const api = new GitHubAPI(token);
    await api.getUserInfo(); // This will throw if the token is invalid
    return true;
  } catch (error) {
    console.error('GitHub token validation failed:', error);
    return false;
  }
}

export { GitHubAPI, sanitizeRepoName, convertFilesToGitHubFormat, validateGitHubToken };