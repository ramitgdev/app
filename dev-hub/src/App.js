import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { Tree, getDescendants } from "@minoru/react-dnd-treeview";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useGoogleLogin } from '@react-oauth/google';
// --- NEW: Material-UI imports ---
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Paper, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, InputAdornment, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip, Avatar, Stack, Snackbar, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CssBaseline, Container, Grid, Card, CardContent, CardActions, Tabs, Tab, ListItemAvatar
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';
import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import './AppModern.css';
import MonacoEditor from '@monaco-editor/react';
import { TreeView, TreeItem } from '@mui/lab';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';


window.onerror = function (msg, url, line, col, error) {
  console.error("Global error caught:", { msg, url, line, col, error });
};
window.onunhandledrejection = (event) => {
  console.error("Unhandled promise rejection:", event.reason);
};

/*const [googleToken, setGoogleToken] = useState(null);

// Handler to invoke GIS sign-in popup and store token
const loginWithGoogle = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
  flow: 'implicit',
  onSuccess: (tokenResponse) => {
    setGoogleToken(tokenResponse.access_token); // save it for Docs API use
  },
  onError: (error) => {
    alert("Google login failed: " + error.error || "Unknown error");
    setGoogleToken(null);
  }
});*/

// ---- Supabase initialization ----
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://itxnrnohdagesykzalzl.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5ybm9oZGFnZXN5a3phbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzE1MTgsImV4cCI6MjA2ODU0NzUxOH0.5tmd_k9Fn0qscrSpZL0bLjs_dT_IsfBlN-iT5D_noyg';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ROOT_ID = 0;
function ChatWindow({workspaceId, currentUserId, collaborators}) {
  const [recipient, setRecipient] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const acceptedCollaborators = collaborators.filter(c => c.user_id && c.user_id !== currentUserId);

  useEffect(()=>{
    if (recipient && workspaceId) {
      fetchWorkspaceChats(workspaceId, currentUserId, recipient.user_id).then(setMessages);
      const t = setInterval(()=>fetchWorkspaceChats(workspaceId, currentUserId, recipient.user_id).then(setMessages), 2000);
      return ()=>clearInterval(t);
    }
  }, [workspaceId, recipient, currentUserId]);

  const hasCollaborators = acceptedCollaborators.length > 0;

  return (
    <Card className="mui-card" sx={{ p: 2, maxWidth: 420 }}>
      <Typography fontWeight={700} mb={1}>Chat with Collaborator</Typography>
      <TextField
        select
        label="Select collaborator"
        value={recipient?.user_id || ""}
        onChange={e => setRecipient(acceptedCollaborators.find(c => c.user_id === e.target.value))}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>Select collaborator…</MenuItem>
        {acceptedCollaborators.map(c => (
          <MenuItem key={c.user_email} value={c.user_id}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>{c.user_email?.[0]?.toUpperCase() || '?'}</Avatar>
              <span>{c.user_email}</span>
            </Stack>
          </MenuItem>
        ))}
      </TextField>
      {!hasCollaborators && <Typography color="text.secondary">No collaborators yet. Invite and accept to start chatting.</Typography>}
      <Box sx={{ maxHeight: 180, overflowY: 'auto', background: '#f9f9fb', mb: 2, p: 1, borderRadius: 2, border: '1px solid #dde' }}>
        <List dense>
          {messages.map(msg => (
            <ListItem key={msg.id} alignItems="flex-start" sx={{ flexDirection: msg.sender_id === currentUserId ? 'row-reverse' : 'row' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: msg.sender_id === currentUserId ? 'primary.main' : 'secondary.main' }}>
                  {msg.sender_id === currentUserId ? 'Me' : 'Them'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<span style={{ color: msg.sender_id === currentUserId ? '#1976d2' : '#c586ec', fontWeight: 600 }}>{msg.message}</span>}
                secondary={<span style={{ fontSize: '0.83em', color: '#888' }}>{msg.created_at && msg.created_at.substr(11,5)}</span>}
                sx={{ textAlign: msg.sender_id === currentUserId ? 'right' : 'left' }}
              />
            </ListItem>
          ))}
          {messages.length === 0 && <ListItem><ListItemText primary={<Typography color="text.secondary">No messages yet.</Typography>} /></ListItem>}
        </List>
      </Box>
      <Stack direction="row" spacing={1}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type message"
          size="small"
          fullWidth
          disabled={!recipient || !recipient.user_id}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!input || !recipient || !recipient.user_id}
          onClick={async ()=>{
            await sendWorkspaceChat(workspaceId, currentUserId, recipient.user_id, input);
            setInput("");
            setMessages(await fetchWorkspaceChats(workspaceId, currentUserId, recipient.user_id));
            // Placeholder: send email if recipient is not online
            const isOnline = false; // TODO: Replace with real online check
            if (!isOnline) {
              await sendEmailNotification(recipient.user_email, "New message in workspace chat", `You have a new message from a collaborator.`);
            }
          }}
        >Send</Button>
      </Stack>
    </Card>
  );
}

function makeFolder(name, parent, id = null) {
  return {
    id: id ?? Date.now() + Math.random(),
    parent,
    text: name,
    droppable: true
  };
}
function makeFileNode(res) {
  return {
    id: res.id,
    parent: res.folder,
    text: res.title,
    droppable: false,
    origResource: res
  };
}
function combineToTree(folders, resources) {
  return [
    ...folders.map(f => ({ ...f, droppable: true })),
    ...resources.map(makeFileNode)
  ];
}
function folderOptionsFlat(folders, parent = ROOT_ID, level = 0, visited = new Set()) {
  if (visited.has(parent)) return [];
  visited.add(parent);
  const result = [];
  folders.filter(f => f.parent === parent).forEach(f => {
    result.push(
      <option key={f.id} value={f.id}>
        {Array(level * 2).fill("\u00A0").join("")}{f.text}
      </option>
    );
    result.push(...folderOptionsFlat(folders, f.id, level + 1, new Set([...visited])));
  });
  return result;
}
function folderPathArr(folders, folderId) {
  const path = [];
  let fid = folderId;
  const visited = new Set();
  while (fid && !visited.has(fid)) {
    visited.add(fid);
    const fol = folders.find(f => f.id === fid);
    if (!fol) break;
    path.unshift(fol);
    fid = fol.parent;
  }
  if (!path.find(f => f.id === ROOT_ID)) {
    const root = folders.find(f => f.id === ROOT_ID);
    if (root) path.unshift(root);
  }
  return path;
}
function getDescendantFolderIds(folders, startId, visited = new Set()) {
  if (visited.has(startId)) return [];
  visited.add(startId);
  let ids = [startId];
  for (const f of folders.filter(f => f.parent === startId)) {
    ids = ids.concat(getDescendantFolderIds(folders, f.id, visited));
  }
  return ids;
}
function getDescendantFolders(folders, id) {
  return getDescendantFolderIds(folders, id).slice(1);
}

// ---- Workspace-scoped local storage keys ----
function saveData(wsKey, key, data) {
  try {
    // Only store minimal metadata (no large blobs or file contents)
    const minimalData = Array.isArray(data)
      ? data.map(item => {
          if (item && typeof item === 'object') {
            // Remove large fields if present
            const { content, body, ...rest } = item;
            return rest;
          }
          return item;
        })
      : data;
    localStorage.setItem(`${key}-${wsKey}`, JSON.stringify(minimalData));
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      alert("Storage quota exceeded! Cannot save more data. Consider clearing storage, using fewer/larger folders, or connecting a database. Large imports should use server or IndexedDB.");
      // Optionally, handle by removing oldest/stale data or skipping storage
    } else {
      throw error;
    }
  }
}
function loadData(wsKey, key, defaultValue) {
  const data = localStorage.getItem(`${key}-${wsKey}`);
  return data ? JSON.parse(data) : defaultValue;
}

// ---- Supabase auth helpers ----
function useSupabaseAuthUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let ignore = false;
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!ignore && session?.user) setUser(session.user);
    }
    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);
  return user;
}

// ---- Workspace Creation UI ----
function WorkspaceCreator({ currentUser, onCreated }) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  async function createWorkspace() {
    if (!name) return;
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, owner_id: currentUser.id }])
      .select().single();
    if (error) setMsg(error.message);
    else { setMsg("Workspace created!"); setName(""); onCreated && onCreated(data); }
  }
  return (
    <Card className="mui-card" sx={{ my: 2, p: 2, maxWidth: 400 }}>
      <Typography variant="h6" fontWeight={700} mb={1}>Create Workspace</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Workspace Name"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" color="primary" onClick={createWorkspace} startIcon={<AddIcon />}>Create</Button>
      </Stack>
      {msg && <Typography variant="body2" color="primary" mt={1}>{msg}</Typography>}
    </Card>
  );
}

// --- Email notification helpers (placeholder) ---
async function sendEmailNotification(to, subject, message) {
  // TODO: Integrate with Supabase email, SendGrid, or another email service
  // For now, just log to console
  console.log(`Email to ${to}: ${subject}\n${message}`);
}

// --- Update WorkspaceShare to send email on invite ---
function WorkspaceShare({ workspaceId, currentUser, onShared }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  async function handleInvite() {
    if (!inviteEmail) return;
    const { error } = await supabase
      .from('workspace_members')
      .insert([{ workspace_id: workspaceId, user_email: inviteEmail, invited_by: currentUser.id }]);
    setInviteMsg(error ? error.message : "Invited!");
    setInviteEmail("");
    if (!error) {
      await sendEmailNotification(inviteEmail, "You've been invited to a workspace!", `You have been invited by ${currentUser.email} to join a workspace. Please sign up or log in to accept the invite.`);
    }
    onShared && onShared();
  }
  return (
    <Dialog open onClose={onShared} maxWidth="xs" fullWidth>
      <DialogTitle>Share Workspace</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Invite email"
          type="email"
          fullWidth
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
        />
        {inviteMsg && <Typography variant="body2" color="primary" mt={1}>{inviteMsg}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onShared} startIcon={<CloseIcon />}>Close</Button>
        <Button onClick={handleInvite} variant="contained" startIcon={<ShareIcon />}>Invite</Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- GITHUB IMPORT FEATURE ----
function ImportGithubIntoApp({ addFoldersAndResources, folderOptions }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [folder, setFolder] = useState(ROOT_ID);
  const [status, setStatus] = useState("");
  return (
    <div>
      <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
        placeholder="GitHub repo URL" style={{width: 220, marginRight: 7}}/>
      <select value={folder} onChange={e => setFolder(Number(e.target.value))}>
        {folderOptions}
      </select>
      <button
        onClick={async () => {
          setStatus("Importing...");
          const { count, error } = await importGithubTreeWithFoldersAccurate(
            repoUrl, folder, addFoldersAndResources
          );
          setStatus(error ? `Error: ${error}` : `Imported ${count} files!`);
          setRepoUrl("");
        }}>
        Import
      </button>
      <span style={{ marginLeft: 10, color: status.includes("Error") ? "#c51313" : "green"}}>
        {status}
      </span>
    </div>
  );
}

/**
 * 100% precise fix: 
 * - Each folder is addressed by its repo-root-relative path.
 * - Each file is placed by its full parent path.
 * - No folder or file can ever be "mis-parented" due to naming collision.
 */
async function importGithubTreeWithFoldersAccurate(
  githubUrl, targetRootFolderId, addFoldersAndResources
) {
  // Parse owner/repo
  const m = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\/|$)/);
  if (!m) return { error: "Invalid GitHub repo URL" };
  const [_, owner, repo] = m;
  // Step 1: create top-level folder for repo name
  const repoFolderName = repo;
  const repoRootId = Date.now() + Math.random();
  // pathToId maps full relative _folder path_ to a node id. 
  // "" is the repo root.
  const pathToId = { "": repoRootId };
  const folders = [{
    id: repoRootId,
    parent: targetRootFolderId,
    text: repoFolderName,
    droppable: true
  }];

  // Step 2: Fetch branch/tree
  const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoInfoRes.ok) return { error: "Repo not found or API error" };
  const repoInfo = await repoInfoRes.json();
  const branch = repoInfo.default_branch || "main";
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  if (!treeRes.ok) return { error: "GitHub tree fetch error" };
  const tree = await treeRes.json();

  // Step 3: Build a nested tree structure from the flat tree
  const folderMap = { "": { id: repoRootId, parent: targetRootFolderId, text: repoFolderName, droppable: true, children: [] } };
  for (const item of tree.tree) {
    if (item.type === "tree") {
      const parentPath = item.path.includes("/") ? item.path.split("/").slice(0, -1).join("/") : "";
      const thisId = Date.now() + Math.random();
      folderMap[item.path] = {
        id: thisId,
        parent: pathToId[parentPath] || repoRootId,
        text: item.path.split("/").pop(),
        droppable: true,
        children: []
      };
      pathToId[item.path] = thisId;
      // Add to parent's children
      if (folderMap[parentPath]) folderMap[parentPath].children.push(folderMap[item.path]);
    }
  }
  // Step 4: Add files to their parent folders
  const files = [];
  for (const item of tree.tree) {
    if (item.type === "blob") {
      const parentPath = item.path.includes("/") ? item.path.split("/").slice(0, -1).join("/") : "";
      const fileNode = {
        id: Date.now() + Math.random(),
        title: item.path.split("/").pop(),
        platform: "GitHub",
        url: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
        folder: pathToId[parentPath] || repoRootId,
        notes: "",
        tags: ""
      };
      files.push(fileNode);
      // Optionally, add to folderMap[parentPath].children for a true nested structure
    }
  }
  // Step 5: Flatten folders for the app's tree view
  const allFolders = Object.values(folderMap);
  addFoldersAndResources(allFolders, files);
  return { count: files.length };
}
function isGoogleDocResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("https://docs.google.com/document/d/");
}
// import { useState, useEffect } from "react";
/*function GoogleDocEditor({ docUrl, googleToken, fetchGoogleDoc, insertTextGoogleDoc }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertVal, setInsertVal] = useState('');
  const [inserting, setInserting] = useState(false);

  let documentId = "";
  const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) documentId = match[1];

  useEffect(() => {
    if (!documentId || !googleToken) return;
    setLoading(true);
    setError('');
    fetchGoogleDoc(documentId)
      .then(doc => setContent(doc))
      .catch(e => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [documentId, googleToken, fetchGoogleDoc]);

  const handleInsert = async () => {
    setInserting(true);
    setError('');
    try {
      await insertTextGoogleDoc(documentId, insertVal);
      setInsertVal('');
      setContent(await fetchGoogleDoc(documentId));
    } catch (e) {
      setError(String(e.message || e));
    }
    setInserting(false);
  };

  if (!documentId) return <div style={{ color: "#c00" }}>Invalid Google Doc URL.</div>;

  return (
    <div>
      <div>
        <input
          placeholder="Insert text at start of doc"
          value={insertVal}
          onChange={e => setInsertVal(e.target.value)}
          style={{ width: 240 }}
          disabled={inserting || loading}
        />
        <button style={{ marginLeft: 6 }} onClick={handleInsert} disabled={!insertVal || inserting || loading}>Insert</button>
      </div>
      {error && <div style={{ color: "#c00", margin: "10px 0" }}>{error}</div>}
      {loading ? <div>Loading doc…</div> : content &&
      <pre style={{ maxHeight: 120, background: "#fcfcfc", border: "1px solid #dde", padding: 6, fontSize: "0.93em", marginTop: 8, overflow: "auto" }}>
        <b>Doc Title:</b> {content.title}{"\n"}
        <b>Body (JSON):</b> {JSON.stringify(content.body, null, 2)}
      </pre>}
      <div>
        <a target="_blank" href={docUrl} rel="noopener noreferrer">Open in Google Docs →</a>
      </div>
    </div>
  );
}*/
function GoogleDocEditor({ docUrl, googleToken }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertVal, setInsertVal] = useState('');
  const [inserting, setInserting] = useState(false);

  let documentId = "";
  const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) documentId = match[1];

  useEffect(() => {
    if (!documentId || !googleToken) return;
    setLoading(true);
    setError('');
    fetchGoogleDoc(documentId, googleToken)
      .then(doc => setContent(doc))
      .catch(e => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [documentId, googleToken]);

  const handleInsert = async () => {
    setInserting(true);
    setError('');
    try {
      await insertTextGoogleDoc(documentId, insertVal, googleToken);
      setInsertVal('');
      setContent(await fetchGoogleDoc(documentId, googleToken));
    } catch (e) {
      setError(String(e.message || e));
    }
    setInserting(false);
  };

  if (!documentId) return <div style={{ color: "#c00" }}>Invalid Google Doc URL.</div>;
  return (
    <div>
      <div>
        <input
          placeholder="Insert text at start of doc"
          value={insertVal}
          onChange={e => setInsertVal(e.target.value)}
          style={{ width: 240 }}
          disabled={inserting || loading}
        />
        <button style={{ marginLeft: 6 }} onClick={handleInsert} disabled={!insertVal || inserting || loading}>Insert</button>
      </div>
      {error && <div style={{ color: "#c00", margin: "10px 0" }}>{error}</div>}
      {loading ? <div>Loading doc…</div> : content &&
        <pre style={{ maxHeight: 120, background: "#fcfcfc", border: "1px solid #dde", padding: 6, fontSize: "0.93em", marginTop: 8, overflow: "auto" }}>
          <b>Doc Title:</b> {content.title}{"\n"}
          <b>Body (JSON):</b> {JSON.stringify(content.body, null, 2)}
        </pre>}
      {/* Embed the Google Docs editor in an iframe below the API controls */}
      <div style={{ marginTop: 18, border: '1px solid #dde', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <iframe
          title="Google Docs Editor"
          src={`https://docs.google.com/document/d/${documentId}/edit`}
          width="100%"
          height="600"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
}


async function fetchGoogleDoc(documentId, googleToken) {
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

async function insertTextGoogleDoc(documentId, text, googleToken) {
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            text,
            location: { index: 1 }
          }
        }]
      })
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

async function fetchWorkspaceChats(workspaceId, myId, recipientId) {
  let query = supabase
    .from('workspace_chats')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', {ascending: true});
  if (recipientId) {
    query = query.or(`and(sender_id.eq.${myId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${myId})`);
  }
  const { data } = await query;
  return data || [];
}
async function sendWorkspaceChat(workspaceId, senderId, recipientId, text) {
  await supabase
    .from('workspace_chats')
    .insert([{workspace_id: workspaceId, sender_id: senderId, recipient_id: recipientId, message: text}]);
}

// --- GitHub Editor Component ---
function GitHubEditor({ repoFullName, filePath, githubToken, branch = 'main' }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [commitMsg, setCommitMsg] = useState('Update via DevHub');

  // Fetch file content from GitHub
  useEffect(() => {
    if (!repoFullName || !filePath || !githubToken) return;
    setLoading(true);
    setError('');
    fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`, {
      headers: { Authorization: `token ${githubToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setContent(atob(data.content.replace(/\n/g, '')));
        } else {
          setError(data.message || 'Failed to load file');
        }
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [repoFullName, filePath, githubToken, branch]);

  // Save (commit & push) changes to GitHub
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Get the current file SHA
      const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`, {
        headers: { Authorization: `token ${githubToken}` }
      });
      const data = await res.json();
      if (!data.sha) throw new Error('Could not get file SHA');
      // Commit the new content
      const updateRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMsg,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: data.sha,
          branch
        })
      });
      const updateData = await updateRes.json();
      if (updateData.commit) {
        alert('File updated and pushed!');
      } else {
        throw new Error(updateData.message || 'Failed to update file');
      }
    } catch (e) {
      setError(String(e));
    }
    setSaving(false);
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <h3>GitHub Editor: {repoFullName}/{filePath}</h3>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading…</div> : (
        <MonacoEditor
          height="400px"
          language="javascript"
          value={content}
          onChange={setContent}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      )}
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          style={{ width: 320, marginRight: 8 }}
          placeholder="Commit message"
        />
        <button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Commit & Push'}
        </button>
      </div>
    </div>
  );
}

// --- GitHub OAuth Login ---
function GitHubLogin({ onToken }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  // Simple OAuth flow using a popup
  const handleLogin = () => {
    const clientId = "Iv1.0b2e6e6b7e7e6e6b"; // TODO: Replace with your GitHub OAuth App Client ID
    const redirectUri = window.location.origin + "/github-callback";
    const state = Math.random().toString(36).substring(2);
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&state=${state}`;
    const popup = window.open(url, "github-login", "width=600,height=700");
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "github_token") {
        setToken(event.data.token);
        onToken(event.data.token);
      }
    }, { once: true });
  };

  return (
    <div style={{ margin: '18px 0' }}>
      <button onClick={handleLogin}>Sign in with GitHub</button>
      {token && <div style={{ color: 'green', marginTop: 8 }}>GitHub Authenticated!</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

// --- GitHub Repo File Tree ---
function GitHubRepoFileTree({ repoFullName, githubToken, branch = 'main', onFileSelect }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!repoFullName || !githubToken) return;
    setLoading(true);
    setError('');
    fetch(`https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`, {
      headers: { Authorization: `token ${githubToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.tree) setTree(data.tree);
        else setError(data.message || 'Failed to load tree');
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [repoFullName, githubToken, branch]);

  // Build a nested tree structure from the flat tree
  function buildTree(tree) {
    const root = { id: '', name: repoFullName, children: [] };
    const nodes = { '': root };
    for (const item of tree) {
      const parts = item.path.split('/');
      let parent = '';
      for (let i = 0; i < parts.length; i++) {
        const id = parts.slice(0, i + 1).join('/');
        if (!nodes[id]) {
          nodes[id] = {
            id,
            name: parts[i],
            children: [],
            type: i === parts.length - 1 ? item.type : 'tree',
          };
          nodes[parent].children.push(nodes[id]);
        }
        parent = id;
      }
    }
    return root;
  }
  const nestedTree = buildTree(tree);

  function renderTree(node) {
    if (!node) return null;
    return (
      <TreeItem
        key={node.id}
        nodeId={node.id || '/'}
        label={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {node.type === 'tree' ? <FolderIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}
            <span style={{ marginLeft: 6 }}>{node.name}</span>
          </span>
        }
        onClick={e => {
          e.stopPropagation();
          if (node.type !== 'tree') onFileSelect(node.id);
        }}
      >
        {node.children && node.children.map(child => renderTree(child))}
      </TreeItem>
    );
  }

  return (
    <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fafbfc' }}>
      {loading && <div>Loading repo tree…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <TreeView defaultCollapseIcon={<FolderIcon />} defaultExpandIcon={<FolderIcon />}>
          {renderTree(nestedTree)}
        </TreeView>
      )}
    </div>
  );
}

// --- GitHub Workspace Panel ---
function GitHubWorkspacePanel() {
  const [githubToken, setGithubToken] = useState("");
  const [repo, setRepo] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <Card className="mui-card" sx={{ p: 3, maxWidth: 900, margin: '32px auto' }}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">GitHub In-App Editor</Typography>
      <GitHubLogin onToken={setGithubToken} />
      {githubToken && (
        <>
          <TextField
            label="Repo (owner/name)"
            value={repo}
            onChange={e => setRepo(e.target.value)}
            sx={{ mb: 2, width: 320 }}
            size="small"
            placeholder="e.g. vercel/next.js"
          />
          <TextField
            label="Branch"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            sx={{ mb: 2, ml: 2, width: 160 }}
            size="small"
            placeholder="main"
          />
          {repo && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ minWidth: 260, maxWidth: 320 }}>
                <Typography fontWeight={600} mb={1}>Files</Typography>
                <GitHubRepoFileTree
                  repoFullName={repo}
                  githubToken={githubToken}
                  branch={branch}
                  onFileSelect={setSelectedFile}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {selectedFile ? (
                  <GitHubEditor
                    repoFullName={repo}
                    filePath={selectedFile}
                    githubToken={githubToken}
                    branch={branch}
                  />
                ) : (
                  <Typography color="text.secondary" mt={4}>Select a file to edit.</Typography>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}

function MarketplacePanel({ currentUser }) {
  const [products, setProducts] = useState([
    // Example product
    {
      id: 1,
      name: 'AI Image Generator',
      description: 'Generate images from text prompts using state-of-the-art AI.',
      uploader: 'alice@example.com',
      reviews: [
        { user: 'bob@example.com', rating: 5, comment: 'Amazing results!' }
      ],
      fileUrl: '',
      uploadDate: new Date().toISOString(),
    },
  ]);
  const [uploadForm, setUploadForm] = useState({ name: '', description: '', file: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', productId: null });
  const [showReview, setShowReview] = useState(null);

  // Upload handler (in-memory for now)
  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.description || !uploadForm.file) return;
    setProducts([
      ...products,
      {
        id: Date.now(),
        name: uploadForm.name,
        description: uploadForm.description,
        uploader: currentUser?.email || 'anonymous',
        reviews: [],
        fileUrl: URL.createObjectURL(uploadForm.file),
        uploadDate: new Date().toISOString(),
      },
    ]);
    setUploadForm({ name: '', description: '', file: null });
  };

  // Review handler (in-memory for now)
  const handleReview = () => {
    if (!reviewForm.comment || !reviewForm.productId) return;
    setProducts(products.map(p =>
      p.id === reviewForm.productId
        ? { ...p, reviews: [...p.reviews, { user: currentUser?.email || 'anonymous', rating: reviewForm.rating, comment: reviewForm.comment }] }
        : p
    ));
    setShowReview(null);
    setReviewForm({ rating: 5, comment: '', productId: null });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} mb={3} color="primary.main">AI Product Marketplace</Typography>
      <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Upload Your AI Product</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Product Name"
            value={uploadForm.name}
            onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
            sx={{ width: 180 }}
            size="small"
          />
          <TextField
            label="Description"
            value={uploadForm.description}
            onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
            sx={{ width: 320 }}
            size="small"
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={e => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!uploadForm.name || !uploadForm.description || !uploadForm.file}
          >Post</Button>
        </Stack>
      </Card>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} md={6} key={product.id}>
            <Card className="mui-card" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{product.description}</Typography>
              <Typography variant="caption" color="text.secondary">Uploaded by {product.uploader} on {new Date(product.uploadDate).toLocaleDateString()}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={1}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  href={product.fileUrl}
                  download={product.name.replace(/\s+/g, '_')}
                  disabled={!product.fileUrl}
                >Download</Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<CommentIcon />}
                  onClick={() => { setShowReview(product.id); setReviewForm(f => ({ ...f, productId: product.id })); }}
                >Review</Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <StarIcon sx={{ color: '#FFD700' }} />
                <Typography variant="body2">{product.reviews.length > 0 ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1) : 'No ratings yet'} ({product.reviews.length} reviews)</Typography>
              </Stack>
              <Box sx={{ maxHeight: 100, overflowY: 'auto', bgcolor: '#f9f9fb', p: 1, borderRadius: 2, border: '1px solid #dde' }}>
                {product.reviews.map((r, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="primary.main">{r.user}</Typography>
                    <Typography variant="body2">{r.comment}</Typography>
                    <Typography variant="caption" color="text.secondary">Rating: {r.rating}/5</Typography>
                  </Box>
                ))}
                {product.reviews.length === 0 && <Typography color="text.secondary">No reviews yet.</Typography>}
              </Box>
              {showReview === product.id && (
                <Box sx={{ mt: 2, bgcolor: '#f5f7fa', p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" mb={1}>Leave a Review</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Comment"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      sx={{ width: 220 }}
                      size="small"
                    />
                    <TextField
                      label="Rating"
                      type="number"
                      value={reviewForm.rating}
                      onChange={e => setReviewForm(f => ({ ...f, rating: Math.max(1, Math.min(5, Number(e.target.value))) }))}
                      sx={{ width: 80 }}
                      size="small"
                      inputProps={{ min: 1, max: 5 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleReview}>Submit</Button>
                    <Button variant="text" color="secondary" onClick={() => setShowReview(null)}>Cancel</Button>
                  </Stack>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// --- Google Meet: use official link and add Google Calendar event button ---
function GoogleMeetAndCalendar() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState('Team Meeting');
  const [calendarDesc, setCalendarDesc] = useState('Discuss project updates.');
  const [calendarTime, setCalendarTime] = useState('');
  const handleCalendar = () => {
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(calendarTitle)}&details=${encodeURIComponent(calendarDesc)}&dates=${calendarTime}`;
    window.open(url, '_blank');
  };
  return (
    <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 500 }}>
      <Typography fontWeight={700} mb={1}><GoogleIcon sx={{ mr: 1 }} />Start a Google Meet</Typography>
      <Button
        variant="contained"
        color="success"
        startIcon={<GoogleIcon />}
        onClick={() => window.open('https://meet.google.com/new', '_blank')}
      >Start Google Meet</Button>
      <Divider sx={{ my: 2 }} />
      <Typography fontWeight={700} mb={1}><GoogleIcon sx={{ mr: 1 }} />Add to Google Calendar</Typography>
      <Stack direction="row" spacing={1} mb={1}>
        <TextField label="Title" value={calendarTitle} onChange={e => setCalendarTitle(e.target.value)} size="small" />
        <TextField label="Description" value={calendarDesc} onChange={e => setCalendarDesc(e.target.value)} size="small" />
        <TextField label="Time (YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ)" value={calendarTime} onChange={e => setCalendarTime(e.target.value)} size="small" sx={{ width: 320 }} />
      </Stack>
      <Button variant="contained" color="primary" onClick={handleCalendar}>Create Calendar Event</Button>
    </Card>
  );
}

// ---- Main App ----
export default function App() {
  const user = useSupabaseAuthUser();
const [collaborators, setCollaborators] = useState({members: [], ownerId: null, users: []});  
const [googleToken, setGoogleToken] = useState(null);
const loginWithGoogle = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
  onSuccess: (tokenResponse) => {
    setGoogleToken(tokenResponse.access_token);
  },
  onError: (error) => {
    console.error("Google login error:", error);
    alert("Google login failed. For now, you can view Google Docs by clicking 'Open in Google Docs' link below.");
    setGoogleToken(null);
  }
});

  const [workspaces, setWorkspaces] = useState([]);
  
  const [showShare, setShowShare] = useState(null);
  const [selectedWksp, setSelectedWksp] = useState(null);
  const [mainTab, setMainTab] = useState(0);
  // --- GOOGLE OAUTH STATE AND INIT ---


  // --- Refresh workspaces from Supabase ---
  
async function fetchCollaborators(workspaceId) {
  const { data } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();
  let ids = [workspace.owner_id].concat((data || []).map(m => m.user_id).filter(Boolean));
  let { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', ids);
  return {members: data || [], ownerId: workspace.owner_id, users: users || []};
}

async function fetchWorkspaces() {
    // Get workspaces owned by the user
    let { data: owned } = await supabase.from('workspaces').select('*').eq('owner_id', user.id);
    
    // Get workspaces where user is a member (both invited and accepted)
    let { data: memberRows } = await supabase.from('workspace_members').select('workspace_id, user_id').eq('user_email', user.email);
    const memberWorkspaceIds = (memberRows || []).map(wm => wm.workspace_id);
    
    let { data: shared } = memberWorkspaceIds.length
      ? await supabase.from('workspaces').select('*').in('id', memberWorkspaceIds)
      : { data: [] };
    
    // Combine and deduplicate workspaces
    setWorkspaces([...owned || [], ...(shared || [])].filter((wksp, idx, arr) =>
      arr.findIndex(w => w.id === wksp.id) === idx));
  }
 /* async function fetchCollaborators(workspaceId) {
  // Get all entries in workspace_members for this workspace
  const { data } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);
  // Also get owner from 'workspaces'
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();
  // Also get user profiles
  let ids = [workspace.owner_id].concat((data || []).map(m => m.user_id).filter(Boolean));
  let { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', ids);
  return {members: data || [], ownerId: workspace.owner_id, users: users || []};
}*/
// const [collaborators, setCollaborators] = useState({members: [], ownerId: null, users: []});
useEffect(() => {
  if (selectedWksp) {
    fetchCollaboratorsWithPresence(selectedWksp.id).then(setCollaborators);
  }
}, [selectedWksp, showShare]);
useEffect(() => {
  if (selectedWksp) {
    fetchCollaboratorsWithPresence(selectedWksp.id).then(setCollaborators);
  }
}, [selectedWksp, showShare]);

  useEffect(() => {
    if (user) fetchWorkspaces();
    // eslint-disable-next-line
  }, [user, showShare, selectedWksp]);

  // ---- Workspace-specific folders/resources ----
  const wsId = selectedWksp?.id || "__none__";
  const [folders, setFolders] = useState(() =>
    loadData(wsId, "folders", [makeFolder("All Resources", ROOT_ID, ROOT_ID)]));
  const [resources, setResources] = useState(() => loadData(wsId, "resources", []));
  useEffect(() => {
    setFolders(loadData(wsId, "folders", [makeFolder("All Resources", ROOT_ID, ROOT_ID)]));
    setResources(loadData(wsId, "resources", []));
    // eslint-disable-next-line
  }, [wsId]);
  useEffect(() => { saveData(wsId, "folders", folders); }, [folders, wsId]);
  useEffect(() => { saveData(wsId, "resources", resources); }, [resources, wsId]);


  // --- Other UI states ---
  const [activeFolder, setActiveFolder] = useState(ROOT_ID);
  const [expandedFolders, setExpandedFolders] = useState(new Set([ROOT_ID])); // Track which folders are expanded
  const [form, setForm] = useState({ title: "", url: "", tags: "", notes: "", platform: "", folder: ROOT_ID });
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [searchScope, setSearchScope] = useState("everywhere");
  const blankForm = { title: "", url: "", tags: "", notes: "", platform: "", folder: activeFolder };

  // Toggle folder expansion
  function toggleFolderExpansion(folderId) {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }

  function addChildFolder(parent) {
    const name = prompt("Folder Name?");
    if (!name) return;
    setFolders([...folders, makeFolder(name.trim(), parent)]);
  }
  function renameFolder(id) {
    const name = prompt("Rename folder to:");
    if (!name) return;
    setFolders(folders.map(f => (f.id === id ? { ...f, text: name.trim() } : f)));
  }
  function deleteFolder(id) {
    if (id === ROOT_ID) return;
    const removeIds = [id, ...getDescendantFolders(folders, id)];
    setFolders(folders.filter(f => !removeIds.includes(f.id)));
    setResources(resources.filter(r => !removeIds.includes(r.folder)));
    if (removeIds.includes(activeFolder)) setActiveFolder(ROOT_ID);
  }
  function addOrUpdate() {
    if (!form.title || !form.url) return;
    const newObj = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      id: editing || Date.now() + Math.random()
    };
    setResources(editing
      ? resources.map(r => (r.id === editing ? newObj : r))
      : [...resources, newObj]
    );
    setForm({ ...blankForm, folder: activeFolder });
    setEditing(null);
  }
  function removeResource(id) { setResources(resources.filter(r => r.id !== id)); }
  function editResource(refOrId) {
    let ref = refOrId;
    if (typeof refOrId === "string" || typeof refOrId === "number") ref = resources.find(r => r.id === refOrId);
    if (!ref) return;
    setForm({ ...ref, tags: (ref.tags || []).join(", "), folder: ref.folder }); setEditing(ref.id);
  }
  const combinedTree = combineToTree(folders, resources);

  function handleDrop(tree, opts) {
    if (opts.dragSource.droppable)
      setFolders(tree.filter(node => node.droppable).map(({ id, parent, text }) => ({ id, parent, text, droppable: true })));
    else {
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId && n.droppable);
      if (!dropTargetNode) return;
      setResources(resources.map(r => r.id === opts.dragSource.id ? { ...r, folder: dropTargetNode.id } : r));
    }
  }
  function canDrop(tree, opts) {
    if (opts.dragSource.droppable) {
      if (opts.dragSource.id === ROOT_ID) return false;
      if (opts.dropTargetId === null || opts.dropTargetId === undefined) return false;
      if (opts.dragSource.id === opts.dropTargetId) return false;
      const descendants = getDescendants(tree.filter(n => n.droppable), opts.dragSource.id);
      if (descendants.includes(opts.dropTargetId)) return false;
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId); return !!dropTargetNode && dropTargetNode.droppable;
    } else {
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId);
      return dropTargetNode && dropTargetNode.droppable;
    }
  }
  function hasAnyChildren(nodeId) {
    return combinedTree.some(n => n.parent === nodeId && n.id !== nodeId);
  }
  function getSearchItems() {
    let folderIds;
    if (searchScope === "everywhere") folderIds = folders.map(f => f.id);
    else folderIds = getDescendantFolderIds(folders, activeFolder);
    const folderResults = folders.filter(
      f => f.id !== ROOT_ID && folderIds.includes(f.id) &&
        f.text.toLowerCase().includes(search.toLowerCase())
    );
    const fileResults = resources.filter(
      r => folderIds.includes(r.folder) &&
        ((r.title + " " + r.tags + " " + r.platform + " " + r.notes)
          .toLowerCase().includes(search.toLowerCase()))
    );
    return [...folderResults.map(f => ({ type: "folder", folder: f })), ...fileResults.map(r => ({ type: "file", resource: r }))];
  }
  const searchResults = search.trim() ? getSearchItems() : null;
  function onSearchResultClick(result) {
    if (result.type === "folder") setActiveFolder(result.folder.id);
    else editResource(result.resource);
  }
  const folderResources = resources
    .filter(r => r.folder === activeFolder)
    .filter(r =>
      (r.title + " " + r.tags + " " + r.platform + " " + r.notes)
        .toLowerCase().includes(search.toLowerCase())
    );

  function addFoldersAndResources(newFolders, newFiles) {
    setFolders(old => {
      // DO NOT dedupe by folder name/parent alone: must treat full import as authoritative
      return [...old, ...newFolders];
    });
    setResources(old => [...old, ...newFiles]);
  }

  async function deleteWorkspace(wkspId) {
    if (!window.confirm("Delete this workspace and all its folders/resources in your local browser?")) return;
    try {
      // Check if user is the owner of the workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', wkspId)
        .single();
      
      if (!workspace || workspace.owner_id !== user.id) {
        alert('You can only delete workspaces you own.');
        return;
      }

      // First delete all workspace chats
      const { error: chatsError } = await supabase
        .from('workspace_chats')
        .delete()
        .eq('workspace_id', wkspId);
      
      if (chatsError) {
        console.error('Error deleting workspace chats:', chatsError);
      }

      // Then delete all workspace members
      const { error: membersError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', wkspId);
      
      if (membersError) {
        console.error('Error deleting workspace members:', membersError);
        alert(`Error deleting workspace members: ${membersError.message}`);
        return;
      }

      // Finally delete the workspace
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', wkspId);
      
      if (workspaceError) {
        console.error('Error deleting workspace:', workspaceError);
        alert(`Error deleting workspace: ${workspaceError.message}`);
        return;
      }

      // Clear local storage
      localStorage.removeItem(`folders-${wkspId}`);
      localStorage.removeItem(`resources-${wkspId}`);
      setSelectedWksp(null);
      await fetchWorkspaces();
      alert('Workspace deleted successfully!');
    } catch (err) {
      console.error('Unexpected error deleting workspace:', err);
      alert('Unexpected error occurred while deleting workspace');
    }
  }

  // On user login, claim all pending invites and re-fetch collaborators
  useEffect(() => {
    async function claimInvitesAndRefresh() {
      if (!user) return;
      // Find all invites for this email with no user_id
      const { data: invites } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_email', user.email)
        .is('user_id', null);
      if (invites && invites.length > 0) {
        for (const invite of invites) {
          await supabase
            .from('workspace_members')
            .update({ user_id: user.id })
            .eq('id', invite.id);
        }
        // Re-fetch collaborators for all workspaces this user is in
        if (selectedWksp) fetchCollaboratorsWithPresence(selectedWksp.id).then(setCollaborators);
      }
    }
    claimInvitesAndRefresh();
  }, [user]);

  // --- Presence system: update last_seen on login and interval (15s, 1 min online) ---
  useEffect(() => {
    let interval;
    async function updatePresence() {
      if (!user) return;
      await supabase.from('user_presence').upsert({ user_id: user.id, last_seen: new Date().toISOString() });
    }
    if (user) {
      updatePresence();
      interval = setInterval(updatePresence, 15000); // every 15s
    }
    return () => clearInterval(interval);
  }, [user]);

  // --- Fetch presence for collaborators ---
  async function fetchCollaboratorsWithPresence(workspaceId) {
    const { data: members } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();
    let ids = [workspace.owner_id].concat((members || []).map(m => m.user_id).filter(Boolean));
    let { data: users } = await supabase
      .from('users')
      .select('*')
      .in('id', ids);
    // Fetch presence
    let { data: presence } = await supabase
      .from('user_presence')
      .select('*')
      .in('user_id', ids);
    // Attach presence to users
    users = (users || []).map(u => {
      const p = (presence || []).find(pr => pr.user_id === u.id);
      return { ...u, last_seen: p?.last_seen };
    });
    return { members: members || [], ownerId: workspace.owner_id, users: users || [] };
  }

  // --- Recursive tree rendering for folders and files ---
  function renderTreeNode(node, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth = 0) {
    if (!node) return null;
    const childFolders = folders.filter(f => f.parent === node.id && f.id !== node.id);
    const childFiles = resources.filter(r => r.folder === node.id);
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = childFolders.length > 0 || childFiles.length > 0;
    
    return (
      <div key={node.id}>
        <Box className={node.id === activeFolder ? 'mui-folder' : ''} sx={{ ml: depth * 2, fontWeight: node.id === 0 ? 800 : 600, cursor: 'pointer', display: 'flex', alignItems: 'center', px: 1, py: 0.5 }} onClick={() => setActiveFolder(node.id)}>
          {hasChildren && (
            <IconButton 
              size="small" 
              onClick={e => { e.stopPropagation(); toggleFolderExpansion(node.id); }}
              sx={{ mr: 0.5, p: 0.25 }}
            >
              {isExpanded ? '▼' : '▶'}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 20, mr: 0.5 }} />}
          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography sx={{ flex: 1 }} fontWeight={node.id === 0 ? 800 : 600}>{node.text}</Typography>
          <Tooltip title="Add subfolder"><IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); addChildFolder(node.id); }}><AddIcon fontSize="small" /></IconButton></Tooltip>
          {node.id !== 0 && (
            <>
              <Tooltip title="Rename"><IconButton size="small" color="info" onClick={e => { e.stopPropagation(); renameFolder(node.id); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); deleteFolder(node.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
        {/* Only render children if expanded */}
        {isExpanded && (
          <>
            {/* Render child files */}
            {childFiles.map(childFile => (
              <Box key={childFile.id} className="mui-resource" sx={{ ml: (depth + 1) * 2, display: 'flex', alignItems: 'center', cursor: 'grab', px: 1, py: 0.5, bgcolor: '#fff7de', border: '1px dotted #eee' }} onClick={() => editResource(childFile)} title="Click to edit">
                <Box sx={{ width: 20, mr: 0.5 }} />
                <InsertDriveFileIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography sx={{ flex: 1 }}>{childFile.title}</Typography>
                <Tooltip title="Edit resource"><IconButton size="small" color="info" onClick={e => { e.stopPropagation(); editResource(childFile); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete resource"><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); removeResource(childFile.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            ))}
            {/* Recursively render child folders */}
            {childFolders.map(childFolder =>
              renderTreeNode(childFolder, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth + 1)
            )}
          </>
        )}
      </div>
    );
  }

  // -------- MAIN RENDER --------
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card className="mui-card" sx={{ p: 4, width: '100%', boxShadow: 3 }}>
          <Typography variant="h4" fontWeight={700} mb={2} align="center" color="primary">Sign In</Typography>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </Card>
      </Container>
    )
  }

  if (!selectedWksp) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h3" fontWeight={800} mb={2} color="primary.main">My Workspaces</Typography>
          <WorkspaceCreator currentUser={user} onCreated={() => {
            setSelectedWksp(null);
            fetchWorkspaces();
          }} />
        </Card>
        <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h5" fontWeight={700} mb={2} color="primary">Workspaces you can access:</Typography>
          <List>
            {workspaces.map(wksp => (
              <ListItem key={wksp.id} sx={{ mb: 1, borderRadius: 2, boxShadow: 1, bgcolor: '#f8fafc' }}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Open"><IconButton color="primary" onClick={() => setSelectedWksp(wksp)}><FolderIcon /></IconButton></Tooltip>
                    <Tooltip title="Share"><IconButton color="info" onClick={() => setShowShare(wksp.id)}><ShareIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={async () => { await deleteWorkspace(wksp.id); setSelectedWksp(null); fetchWorkspaces(); }}><DeleteIcon /></IconButton></Tooltip>
                  </Stack>
                }>
                <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                <ListItemText primary={<Typography fontWeight={700}>{wksp.name}</Typography>} />
              </ListItem>
            ))}
            {workspaces.length === 0 && (
              <ListItem>
                <ListItemText primary={<Typography color="text.secondary" fontStyle="italic">No workspaces yet. Create or ask someone to invite you.</Typography>} />
              </ListItem>
            )}
          </List>
          {showShare && <WorkspaceShare workspaceId={showShare} currentUser={user} onShared={() => setShowShare(null)} />}
        </Card>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" color="secondary" startIcon={<LogoutIcon />} onClick={async () => { await supabase.auth.signOut(); }}>Sign out</Button>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <AppBar position="static" color="default" sx={{ mb: 2 }}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab label="Workspaces" />
          <Tab icon={<GitHubIcon />} label="GitHub Editor" />
          <Tab icon={<CloudUploadIcon />} label="Marketplace" />
        </Tabs>
      </AppBar>
      {mainTab === 0 && (
        <DndProvider backend={HTML5Backend}>
          <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
            {/* Sidebar with folder tree */}
            <Box sx={{ flex: '0 0 320px', borderRight: '1px solid #ddd', bgcolor: '#f7f8fa', p: 2, overflowY: 'auto' }}>
              <Typography variant="h5" fontWeight={800} mb={2} color="primary.main">{selectedWksp.name}</Typography>
              {folders.find(f => f.id === ROOT_ID) && renderTreeNode(folders.find(f => f.id === ROOT_ID), folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren)}
            </Box>
            {/* Main resource view */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
              <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 540 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <GitHubIcon color="action" />
                  <Typography fontWeight={700}>Import GitHub Repo:</Typography>
                  <ImportGithubIntoApp addFoldersAndResources={addFoldersAndResources} folderOptions={folderOptionsFlat(folders, ROOT_ID, 0)} />
                </Stack>
              </Card>
              {/* -- COLLABORATOR STATUS LIST -- */}
              {selectedWksp && (
                <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 500 }}>
                  <Typography fontWeight={700} mb={1}><GroupIcon sx={{ mr: 1 }} />Collaborators:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>{collaborators.users.find(u=>u.id === collaborators.ownerId)?.email?.[0]?.toUpperCase() || '?'}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={<><b>Owner:</b> {collaborators.users.find(u=>u.id === collaborators.ownerId)?.email || "Unknown"} {(() => {
                          const owner = collaborators.users.find(u=>u.id === collaborators.ownerId);
                          const lastSeen = owner?.last_seen ? new Date(owner.last_seen) : null;
                          const online = lastSeen && (Date.now() - lastSeen.getTime() < 2*60*1000);
                          return <span style={{color: online ? '#4caf50' : '#888', fontWeight:600, marginLeft:8}}>● {online ? 'online' : 'offline'}</span>;
                        })()}</>}
                      />
                    </ListItem>
                    {collaborators.members.map(mem => {
                      const user = collaborators.users.find(u => u.id === mem.user_id);
                      const isAccepted = !!mem.user_id;
                      const lastSeen = user?.last_seen ? new Date(user.last_seen) : null;
                      const online = lastSeen && (Date.now() - lastSeen.getTime() < 2*60*1000);
                      return (
                        <ListItem key={mem.id}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: isAccepted ? 'success.main' : 'warning.main' }}>{mem.user_email?.[0]?.toUpperCase() || '?'}</Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={<>
                              {mem.user_email}
                              {isAccepted ? <span style={{color:'#4caf50',fontWeight:600,marginLeft:8}}>● accepted</span> : <span style={{color:'#b88600',fontWeight:600,marginLeft:8}}>● invited</span>}
                              <span style={{color: online ? '#4caf50' : '#888', fontWeight:600, marginLeft:8}}>● {online ? 'online' : 'offline'}</span>
                            </>}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}
              {selectedWksp && (
                <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 500 }}>
                  <Typography fontWeight={700} mb={1}><SendIcon sx={{ mr: 1 }} />Message a collaborator:</Typography>
                  <ChatWindow
                    workspaceId={selectedWksp.id}
                    currentUserId={user.id}
                    collaborators={collaborators.members.filter(m=>m.user_id)}
                  />
                </Card>
              )}
              {selectedWksp && (
                <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 500 }}>
                  <GoogleMeetAndCalendar />
                </Card>
              )}
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography color="text.secondary">
                    {folderPathArr(folders, activeFolder).map((f, i, arr) => (
                      <span key={f.id}>
                        <span style={{ cursor: i < arr.length - 1 ? "pointer" : "default", textDecoration: i < arr.length - 1 ? "underline" : undefined, fontWeight: "bold" }} onClick={() => setActiveFolder(f.id)}>{f.text}</span>
                        {i < arr.length - 1 ? " / " : ""}
                      </span>
                    ))}
                  </Typography>
                  <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />} sx={{ ml: 2 }} onClick={() => setSelectedWksp(null)} title="Return to all workspaces">Workspaces</Button>
                </Stack>
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  sx={{ width: 270, mr: 2 }}
                  placeholder="Search resources, folders…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  size="small"
                />
                <FormControl sx={{ mr: 2 }}>
                  <RadioGroup row value={searchScope} onChange={e => setSearchScope(e.target.value)}>
                    <FormControlLabel value="everywhere" control={<Radio size="small" color="primary" />} label="Everywhere" />
                    <FormControlLabel value="current" control={<Radio size="small" color="primary" />} label="This folder & subfolders" />
                  </RadioGroup>
                </FormControl>
              </Box>
              {searchResults && (
                <Card className="mui-card" sx={{ p: 2, mb: 3, maxWidth: 700, bgcolor: '#f3f8fc', border: '1px solid #cce4f8' }}>
                  <Typography fontWeight={700} color="primary" mb={1}>Search results:</Typography>
                  {searchResults.length === 0 && <Typography color="text.secondary">No matches found.</Typography>}
                  <List dense>
                    {searchResults.map((res, idx) => {
                      let typeIcon = res.type === "folder" ? <FolderIcon color="primary" sx={{ mr: 1 }} /> : <InsertDriveFileIcon color="warning" sx={{ mr: 1 }} />;
                      let name = res.type === "folder" ? res.folder.text : (res.resource.title || "");
                      let showPath = (res.type === "folder" ? res.folder.id : res.resource.folder);
                      let pathArr = folderPathArr(folders, showPath);
                      if (res.type === "folder" && pathArr.length) pathArr.pop();
                      return (
                        <ListItem key={idx} button sx={{ borderRadius: 2, boxShadow: 1, mb: 1, bgcolor: '#fff' }} onClick={() => onSearchResultClick(res)}>
                          <ListItemIcon>{typeIcon}</ListItemIcon>
                          <ListItemText primary={<b>{name}</b>} secondary={pathArr.length > 0 ? `in /${pathArr.map(p => p.text).join("/")}` : null} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}
              <Card className="mui-card" sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2, mb: 3, mt: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <TextField label="Title" size="small" sx={{ width: 110 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  <TextField label="URL" size="small" sx={{ width: 170 }} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                  <TextField label="Tags" size="small" sx={{ width: 110 }} placeholder="comma-separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                  <TextField label="Platform" size="small" sx={{ width: 90 }} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
                  <TextField label="Notes" size="small" sx={{ width: 160 }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  <Select size="small" value={form.folder} onChange={e => setForm({ ...form, folder: Number(e.target.value) })} sx={{ minWidth: 120 }}>
                    {folderOptionsFlat(folders, ROOT_ID, 0).map(opt => (
                      <MenuItem key={opt.key} value={opt.props.value}>{opt.props.children}</MenuItem>
                    ))}
                  </Select>
                  <Button variant="contained" color="primary" sx={{ ml: 1 }} onClick={addOrUpdate} startIcon={editing ? <EditIcon /> : <AddIcon />}>{editing ? "Update" : "Add"} Reference</Button>
                  {editing && (
                    <Button variant="outlined" color="secondary" sx={{ ml: 1 }} onClick={() => { setForm({ ...blankForm, folder: activeFolder }); setEditing(null); }}>Cancel</Button>
                  )}
                </Stack>
              </Card>
              {!searchResults && (
                <Box>
                  {folderResources.map(ref => (
                    <Card key={ref.id} className="mui-card mui-resource" sx={{ mb: 2, p: 2, maxWidth: 700, border: '1px solid #eee' }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <InsertDriveFileIcon color="warning" />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={700}>{ref.title} <Typography component="span" color="text.secondary">({ref.platform})</Typography></Typography>
                          <Typography variant="body2" color="primary.main">
                            <a href={ref.url.match(/^https?:\/\//) ? ref.url : `https://${ref.url}`} target="_blank" rel="noopener noreferrer">{ref.url}</a>
                          </Typography>
                          <Typography variant="body2">Tags: {Array.isArray(ref.tags) ? ref.tags.join(", ") : ref.tags}</Typography>
                          <Typography variant="body2">Notes: {ref.notes}</Typography>
                        </Box>
                        <Tooltip title="Edit"><IconButton color="info" onClick={() => editResource(ref)}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => removeResource(ref.id)}><DeleteIcon /></IconButton></Tooltip>
                      </Stack>
                      {isGoogleDocResource(ref) && (
                        <Card sx={{ mt: 2, p: 2, bgcolor: '#f7fafd', borderRadius: 2 }}>
                          <Typography fontWeight={700} mb={1}><GoogleIcon sx={{ mr: 1 }} />Google Doc Editor</Typography>
                          {!googleToken ? (
                            <Box>
                              <Button variant="contained" color="primary" startIcon={<GoogleIcon />} onClick={() => loginWithGoogle()}>Sign in with Google</Button>
                              <Typography color="error" mt={1}>Sign in for in-app editing</Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography color="success.main" mb={1}>Google signed in!</Typography>
                              <GoogleDocEditor docUrl={ref.url} googleToken={googleToken} />
                            </Box>
                          )}
                        </Card>
                      )}
                    </Card>
                  ))}
                  {folderResources.length === 0 && (
                    <Typography color="text.secondary" mt={2}>No resources found in this folder.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DndProvider>
      )}
      {mainTab === 1 && <GitHubWorkspacePanel />}
      {mainTab === 2 && <MarketplacePanel currentUser={user} />}
    </>
  );
}
