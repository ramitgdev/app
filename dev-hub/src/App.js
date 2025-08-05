import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { Tree, getDescendants } from "@minoru/react-dnd-treeview";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useGoogleLogin } from '@react-oauth/google';
import { ThemeProvider } from '@mui/material/styles';
import { modernTheme } from './ModernTheme';
// --- NEW: Material-UI imports ---
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Paper, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, InputAdornment, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip, Avatar, Stack, Snackbar, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CssBaseline, Container, Grid, Card, CardContent, CardActions, Tabs, Tab, ListItemAvatar, CircularProgress, SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Badge, LinearProgress, Accordion, AccordionSummary, AccordionDetails
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
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DrawIcon from '@mui/icons-material/Draw';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VideocamIcon from '@mui/icons-material/Videocam';
import WaveformIcon from '@mui/icons-material/GraphicEq';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import Star from '@mui/icons-material/Star';
import Build from '@mui/icons-material/Build';
import CloudUpload from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import EnhancedAudioRecorder from './EnhancedAudioRecorder';
import AICodeReviewer from './AICodeReviewer';
import { initiateGitHubLogin, handleGitHubCallback } from './github-oauth';
import GoogleSlidesEditor from './GoogleSlidesEditor';
import FlowchartEditor from './FlowchartEditor';
import CanvaEditor from './CanvaEditor';
import HackathonAssistant from './HackathonAssistant';
import { llmIntegration } from './llm-integration';
import ChatGPTInterface from './ChatGPTInterface';
import WebIDE from './WebIDE';

import OpenAITest from './OpenAITest';
import AdvancedAIOrchestrator from './AdvancedAIOrchestrator';

// Use the modern theme
const theme = modernTheme;

// Embedded Google Docs Editor Component
function EmbeddedGoogleDocsEditor({ docUrl, googleToken, onExit }) {
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!docUrl || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    // Extract document ID from URL
    const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Doc URL');
      setLoading(false);
      return;
    }
    
    setDocId(match[1]);
    setLoading(false);
  }, [docUrl, googleToken]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading Google Docs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!docId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Doc URL</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Google Docs Editor
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            onClick={() => window.open(`https://docs.google.com/document/d/${docId}/edit`, '_blank')}
            startIcon={<GoogleIcon />}
          >
            Open in New Tab
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
              }
            }}
            onClick={onExit}
            startIcon={<CloseIcon />}
          >
            Exit
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          src={`https://docs.google.com/document/d/${docId}/edit?usp=sharing`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
          title="Google Docs Editor"
        />
      </Box>
    </Box>
  );
}

// Local GitHub Editor Component
function LocalGitHubEditor({ repoFullName, filePath, githubToken, onExit }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update via DevHub');

  useEffect(() => {
    if (!repoFullName || !filePath) return;
    
    setLoading(true);
    setError('');
    
    // Fetch file content from GitHub API
    if (githubToken) {
      fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching file:', err);
        setError(`Failed to load file: ${err.message}`);
        setLoading(false);
      });
    } else {
      // Fallback: simulate content for demo
      setContent(`// ${filePath}
// This is a simulated file content
// In a real implementation, this would be fetched from GitHub API

function example() {
  console.log('Hello from ${filePath}');
}

export default example;`);
      setLoading(false);
    }
  }, [repoFullName, filePath, githubToken]);

  const handleSave = async () => {
    if (!githubToken) {
      alert('GitHub token required to save changes. Please connect your GitHub account first.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current file SHA
      const shaResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!shaResponse.ok) {
        throw new Error('Could not get file SHA');
      }
      
      const shaData = await shaResponse.json();
      
      // Update file
      const updateResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: shaData.sha,
          branch: 'main'
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update file');
      }
      
      alert('File updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error saving file:', err);
      alert(`Failed to save: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading file...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {repoFullName}/{filePath}
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            sx={{ width: 200 }}
          />
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
              }
            }}
            onClick={onExit}
            startIcon={<CloseIcon />}
          >
            Exit
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          value={content}
          onChange={setContent}
          options={{ 
            fontSize: 14, 
            minimap: { enabled: false },
            wordWrap: 'on',
            theme: 'vs-dark'
          }}
        />
      </Box>
    </Box>
  );
}

// Collapsible Section Component
function CollapsibleSection({ title, children, expanded, onToggle, icon, color = "primary" }) {
  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <Box 
        onClick={onToggle}
        sx={{ 
          p: 2, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: expanded ? (color === 'secondary' ? 'secondary.light' : `${color}.50`) : 'transparent',
          '&:hover': { bgcolor: color === 'secondary' ? 'secondary.light' : `${color}.25` }
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ ml: 1, flex: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      {expanded && (
        <Box sx={{ p: 2, pt: 0 }}>
          {children}
        </Box>
      )}
    </Card>
  );
}


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
    else {
      // Add owner as a member
      const memberRes = await supabase.from('workspace_members').insert([{
        workspace_id: data.id,
        user_email: currentUser.email,
        user_id: currentUser.id,
        status: 'accepted'
      }]);
      if (memberRes.error) {
        setMsg('Workspace created, but failed to add owner as member: ' + memberRes.error.message);
        console.error('Failed to add owner as member:', memberRes.error);
      } else {
        setMsg("Workspace created!");
        setName("");
        onCreated && onCreated(data);
      }
    }
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
function WorkspaceShare({ workspaceId, currentUser, onShared, onInviteSuccess }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  async function handleInvite() {
    if (!inviteEmail) return;
    const { error } = await supabase
      .from('workspace_members')
      .insert([{ workspace_id: workspaceId, user_email: inviteEmail, invited_by: currentUser.id }]);
    if (error) {
      setInviteMsg(error.message);
      alert('Failed to invite: ' + error.message);
      console.error('Invite error:', error);
      return;
    }
    setInviteMsg("Invited!");
    setInviteEmail("");
    await sendEmailNotification(inviteEmail, "You've been invited to a workspace!", `You have been invited by ${currentUser.email} to join a workspace. Please sign up or log in to accept the invite.`);
    onInviteSuccess && onInviteSuccess();
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

function isGitHubResource(ref) {
  return typeof ref.url === "string" && ref.url.includes("github.com") && ref.url.includes("/blob/");
}

function isGoogleSlidesResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("https://docs.google.com/presentation/d/");
}

function isFlowchartResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("flowchart://") || 
         (ref.type && ref.type === 'flowchart');
}

function isCanvaResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("canva://") || 
         (ref.type && ref.type === 'canva');
}

function isLucidchartResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("lucidchart://") || 
         (ref.type && ref.type === 'lucidchart');
}

function extractGitHubInfo(url) {
  // Extract owner/repo and file path from GitHub URL
  // Example: https://github.com/owner/repo/blob/main/src/file.js
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
  if (match) {
    const [, owner, repo, branch, filePath] = match;
    return {
      repoFullName: `${owner}/${repo}`,
      filePath: filePath,
      branch: branch
    };
  }
  return null;
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
                    <Button variant="text" sx={{ color: 'secondary.main' }} onClick={() => setShowReview(null)}>Cancel</Button>
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



// Sidebar Application Interface Component
function SidebarAppInterface({ appType, onClose, googleToken }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate contextual AI response based on app type and user input
      const aiResponse = generateAIResponse(inputMessage, appType);
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput, appType) => {
    const input = userInput.toLowerCase();
    
    // Flowchart-specific responses
    if (appType === 'flowchart') {
      if (input.includes('flowchart') || input.includes('diagram')) {
        return `Great! For creating a flowchart, I recommend starting with:
        
1. **Define the process** - What are the main steps?
2. **Use standard symbols** - Rectangles for processes, diamonds for decisions
3. **Keep it simple** - Start with 5-7 steps maximum
4. **Use Lucidchart's templates** - They have great starter templates

Would you like me to help you structure a specific flowchart?`;
      }
      if (input.includes('system') || input.includes('architecture')) {
        return `For system architecture diagrams, consider:
        
- **User Interface Layer** (Frontend)
- **Business Logic Layer** (Backend)
- **Data Layer** (Database)
- **External Integrations** (APIs)

I can help you design the flow between these components!`;
      }
    }
    
    // Slides-specific responses
    if (appType === 'slides') {
      if (input.includes('presentation') || input.includes('slide')) {
        return `For creating compelling presentations:
        
1. **Start with a story** - Problem → Solution → Impact
2. **Use the 10-20-30 rule** - 10 slides, 20 minutes, 30pt font
3. **Visual hierarchy** - One main point per slide
4. **Include data** - Charts and metrics build credibility

What type of presentation are you working on?`;
      }
      if (input.includes('pitch') || input.includes('pitch deck')) {
        return `For pitch decks, structure your slides like this:
        
1. **Problem** (1 slide) - What pain point are you solving?
2. **Solution** (1-2 slides) - How does your product solve it?
3. **Market** (1 slide) - Size and opportunity
4. **Business Model** (1 slide) - How do you make money?
5. **Team** (1 slide) - Why are you the right people?
6. **Ask** (1 slide) - What do you need from investors?

Need help with any specific slide?`;
      }
    }
    
    // Canva-specific responses
    if (appType === 'canva') {
      if (input.includes('design') || input.includes('layout')) {
        return `For effective design in Canva:
        
1. **Choose a template** - Start with something close to your vision
2. **Use consistent colors** - Pick 2-3 colors and stick to them
3. **Typography hierarchy** - One main font, one accent font
4. **White space** - Don't overcrowd your design
5. **Grid system** - Align elements for professional look

What type of design are you creating?`;
      }
      if (input.includes('color') || input.includes('palette')) {
        return `Color psychology tips:
        
- **Blue** - Trust, professionalism, stability
- **Green** - Growth, nature, money
- **Red** - Energy, urgency, passion
- **Yellow** - Optimism, creativity, warmth
- **Purple** - Luxury, creativity, mystery

For your project, consider what emotion you want to convey!`;
      }
    }
    
    // General responses
    if (input.includes('help') || input.includes('how')) {
      return `I'm here to help you with your ${appType} project! I can assist with:
      
- Planning and structure
- Best practices and tips
- Content suggestions
- Design recommendations
- Technical guidance

What specific aspect would you like help with?`;
    }
    
    if (input.includes('model') || input.includes('ai')) {
      return `I'm an AI assistant designed to help you with your ${appType} projects. While I'm not ChatGPT, I'm trained to provide helpful, contextual advice for:
      
- Project planning and structure
- Best practices and workflows
- Content creation and design
- Technical guidance and tips

How can I help you with your current project?`;
    }
    
    // Default response
    return `I understand you're working on ${appType}. That's a great choice! I can help you with:
    
- Planning your project structure
- Best practices and tips
- Content and design suggestions
- Technical guidance

What specific aspect of your ${appType} project would you like to discuss?`;
  };



  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'white',
      display: 'flex'
    }}>
      {/* Main Application Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {appType === 'flowchart' ? 'Flowchart Editor' : 
             appType === 'slides' ? 'Google Slides Editor' : 
             appType === 'canva' ? 'Design Editor' : 'Application'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Application Frame */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {/* Editors are now opened in new tabs for creation */}
        </Box>
      </Box>

      {/* ChatGPT-like Sidebar */}
      <Box sx={{
        width: 400,
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Chat Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <Typography variant="h6" fontWeight={600}>
            AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask me anything about your {appType} project
          </Typography>
        </Box>

        {/* Chat Messages */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {chatMessages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box sx={{
                maxWidth: '80%',
                p: 2,
                borderRadius: 2,
                backgroundColor: message.role === 'user' ? '#1976d2' : 'white',
                color: message.role === 'user' ? 'white' : 'text.primary',
                boxShadow: 1
              }}>
                <Typography variant="body2">
                  {message.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: 1
              }}>
                <CircularProgress size={20} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me about your project..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              color="primary"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
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
  
  // New UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    fileExplorer: true,
    collaborators: true,
    chat: false,
    aiTools: false,
    resources: true,
    development: true
  });
  
  // Development workspace state
  const [activeDevelopmentTab, setActiveDevelopmentTab] = useState('github');
  const [selectedResource, setSelectedResource] = useState(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubFile, setGithubFile] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [githubToken, setGithubToken] = useState(null);
  // --- GOOGLE OAUTH STATE AND INIT ---

  // At the top of the App component, add:
  const [searchQuery, setSearchQuery] = useState("");

  // In the App component, add a state for search scope in the search tab:
  const [searchTabScope, setSearchTabScope] = useState('everywhere'); // 'everywhere' or 'folder'

  // Hackathon assistant state
  const [showHackathonAssistant, setShowHackathonAssistant] = useState(false);
  const [currentEditor, setCurrentEditor] = useState(null);
  const [editorData, setEditorData] = useState(null);
  
  // Sidebar interface state
  const [sidebarApp, setSidebarApp] = useState(null);

  // New AI features state
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);
  const [aiOrchestratorData, setAiOrchestratorData] = useState(null);
  const [crossPlatformCode, setCrossPlatformCode] = useState({});
  const [aiProcessingStatus, setAiProcessingStatus] = useState({
    isProcessing: false,
    progress: 0,
    currentStep: ''
  });

  // Debug currentEditor changes
  useEffect(() => {
    console.log('Current editor changed to:', currentEditor);
  }, [currentEditor]);

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
  const blankForm = { title: "", url: "", tags: "", notes: "", platform: "", folder: activeFolder };
  // If searchScope is still used, restore it:
  const [searchScope, setSearchScope] = useState("everywhere");
  const [form, setForm] = useState({ title: "", url: "", tags: "", notes: "", platform: "", folder: ROOT_ID });
  const [editing, setEditing] = useState(null);

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
        f.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const fileResults = resources.filter(
      r => folderIds.includes(r.folder) &&
        ((r.title + " " + r.tags + " " + r.platform + " " + r.notes)
          .toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return [...folderResults.map(f => ({ type: "folder", folder: f })), ...fileResults.map(r => ({ type: "file", resource: r }))];
  }
  const searchResults = searchQuery.trim()
    ? resources.filter(r => {
        // Scope logic
        let inScope = true;
        if (searchTabScope === 'folder') {
          const folderIds = getDescendantFolderIdsForSearch(folders, activeFolder);
          inScope = folderIds.includes(r.folder);
        }
        return inScope && (r.title + " " + r.tags + " " + r.platform + " " + r.notes)
          .toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];
  const onSearchResultClick = (result) => {
    // Load the resource into the Resources section for editing
    setSelectedResource(result);
    
    // Check if it's a GitHub file and open in GitHub editor
    if (isGitHubResource(result)) {
      const githubInfo = extractGitHubInfo(result.url);
      if (githubInfo) {
        setGithubRepo(githubInfo.repoFullName);
        setGithubFile(githubInfo.filePath);
        setActiveDevelopmentTab('github');
        return;
      }
    }
    
    // Check if it's a Google Doc and open in Google Docs editor
    if (isGoogleDocResource(result)) {
      setGoogleDocUrl(result.url);
      setActiveDevelopmentTab('gdocs');
      return;
    }
    
    // For other resources, just open in Resources tab
    setActiveDevelopmentTab('resources');
  };
  const folderResources = resources
    .filter(r => r.folder === activeFolder)

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
      console.log('Attempting to delete workspace:', wkspId);
      console.log('Current user:', user);
      // Check if user is the owner of the workspace
      const { data: workspace, error: workspaceFetchError } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', wkspId)
        .single();
      if (workspaceFetchError) {
        console.error('Error fetching workspace:', workspaceFetchError);
        alert('Error fetching workspace: ' + workspaceFetchError.message);
        return;
      }
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
        alert('Error deleting workspace chats: ' + chatsError.message);
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
      alert('Unexpected error occurred while deleting workspace: ' + err.message);
    }
  }

  // On user login, claim all pending invites and re-fetch collaborators
  useEffect(() => {
    async function claimInvitesAndRefresh() {
      if (!user) return;
      
      console.log('Claiming invites for user:', user.email);
      
      // Find all invites for this email with no user_id
      const { data: invites, error: fetchError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_email', user.email)
        .is('user_id', null);
        
      if (fetchError) {
        console.error('Error fetching invites:', fetchError);
        return;
      }
      
      console.log('Found pending invites:', invites);
      
      if (invites && invites.length > 0) {
        for (const invite of invites) {
          console.log('Claiming invite:', invite.id);
          const { error: updateError } = await supabase
            .from('workspace_members')
            .update({ 
              user_id: user.id,
              accepted_at: new Date().toISOString()
            })
            .eq('id', invite.id);
            
          if (updateError) {
            console.error('Error claiming invite:', updateError);
          }
        }
        
        // Re-fetch workspaces and collaborators
        await fetchWorkspaces();
        if (selectedWksp) {
          const updatedCollaborators = await fetchCollaboratorsWithPresence(selectedWksp.id);
          setCollaborators(updatedCollaborators);
        }
      }
    }
    claimInvitesAndRefresh();
  }, [user, selectedWksp]);

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
              <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); deleteFolder(node.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
        {/* Only render children if expanded */}
        {isExpanded && (
          <>
            {/* Render child files */}
            {childFiles.map(childFile => (
              <Box key={childFile.id} className="mui-resource" sx={{ ml: (depth + 1) * 2, display: 'flex', alignItems: 'center', cursor: 'grab', px: 1, py: 0.5, bgcolor: '#fff7de', border: '1px dotted #eee' }} onClick={() => {
                // Check if it's a Google Doc and open in editor
                if (isGoogleDocResource(childFile)) {
                  setGoogleDocUrl(childFile.url);
                  setActiveDevelopmentTab('gdocs');
                } else if (isGitHubResource(childFile)) {
                  // Extract GitHub info and open in GitHub editor
                  const githubInfo = extractGitHubInfo(childFile.url);
                  if (githubInfo) {
                    setGithubRepo(githubInfo.repoFullName);
                    setGithubFile(githubInfo.filePath);
                    setActiveDevelopmentTab('github');
                  } else {
                    editResource(childFile);
                  }
                } else {
                  editResource(childFile);
                }
              }} title="Click to edit">
                <Box sx={{ width: 20, mr: 0.5 }} />
                {isGoogleDocResource(childFile) ? (
                  <GoogleIcon sx={{ mr: 1, color: 'primary.main' }} />
                ) : isGitHubResource(childFile) ? (
                  <GitHubIcon sx={{ mr: 1, color: 'secondary.main' }} />
                ) : (
                  <InsertDriveFileIcon sx={{ mr: 1, color: 'warning.main' }} />
                )}
                <Typography sx={{ flex: 1 }}>{childFile.title}</Typography>
                <Tooltip title="Edit resource"><IconButton size="small" color="info" onClick={e => { e.stopPropagation(); editResource(childFile); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete resource"><IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); removeResource(childFile.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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

  // Helper to get descendant folder IDs
  function getDescendantFolderIdsForSearch(folders, startId, visited = new Set()) {
    if (visited.has(startId)) return [];
    visited.add(startId);
    let ids = [startId];
    for (const f of folders.filter(f => f.parent === startId)) {
      ids = ids.concat(getDescendantFolderIdsForSearch(folders, f.id, visited));
    }
    return ids;
  }

  // -------- MAIN RENDER --------
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card className="mui-card" sx={{ p: 4, width: '100%', boxShadow: 3 }}>
            <Typography variant="h4" fontWeight={700} mb={2} align="center" color="primary">Sign In</Typography>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
          </Card>
        </Container>
      </ThemeProvider>
    )
  }

  if (!selectedWksp) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
                      <Tooltip title="Delete"><IconButton sx={{ color: 'error.main' }} onClick={async () => { await deleteWorkspace(wksp.id); setSelectedWksp(null); fetchWorkspaces(); }}><DeleteIcon /></IconButton></Tooltip>
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
            {showShare && <WorkspaceShare workspaceId={showShare} currentUser={user} onShared={() => setShowShare(null)} onInviteSuccess={async () => {
    if (selectedWksp) {
      const updated = await fetchCollaboratorsWithPresence(selectedWksp.id);
      setCollaborators(updated);
    }
  }} />}
          </Card>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                color: 'secondary.main',
                borderColor: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'secondary.light',
                  color: 'secondary.contrastText',
                }
              }}
              startIcon={<LogoutIcon />} 
              onClick={async () => { await supabase.auth.signOut(); }}
            >
              Sign out
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            DevHub Workspace
          </Typography>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} indicatorColor="primary" textColor="primary">
            <Tab label="Workspaces" />
            <Tab icon={<GitHubIcon />} label="GitHub Editor" />
            <Tab icon={<CloudUploadIcon />} label="Marketplace" />
            <Tab icon={<SmartToyIcon />} label="OpenAI Test" />
          </Tabs>
        </Toolbar>
      </AppBar>
      
      {mainTab === 0 && (
        <DndProvider backend={HTML5Backend}>
          {!selectedWksp ? (
            // Workspace Selection View
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Card sx={{ mb: 4, p: 4, bgcolor: '#fafbfc' }}>
                <Typography variant="h3" fontWeight={800} mb={3} color="primary.main" align="center">
                  Developer Workspaces
                </Typography>
                <WorkspaceCreator currentUser={user} onCreated={() => {
                  setSelectedWksp(null);
                  fetchWorkspaces();
                }} />
              </Card>
              
              <Grid container spacing={3}>
                {workspaces.map(wksp => (
                  <Grid item xs={12} md={6} lg={4} key={wksp.id}>
                    <Card sx={{ 
                      p: 3, 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }} onClick={() => setSelectedWksp(wksp)}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <FolderIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={700}>{wksp.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Click to open</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" startIcon={<ShareIcon />} onClick={(e) => { e.stopPropagation(); setShowShare(wksp.id); }}>
                          Share
                        </Button>
                                        <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                    }
                  }}
                  startIcon={<DeleteIcon />} 
                  onClick={(e) => { e.stopPropagation(); deleteWorkspace(wksp.id); }}
                >
                  Delete
                </Button>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {showShare && <WorkspaceShare workspaceId={showShare} currentUser={user} onShared={() => setShowShare(null)} onInviteSuccess={async () => {
                if (selectedWksp) {
                  const updated = await fetchCollaboratorsWithPresence(selectedWksp.id);
                  setCollaborators(updated);
                }
              }} />}
            </Container>
          ) : (
            // Main Workspace View
            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
              {/* Left Sidebar - File Explorer & Tools */}
              <Box sx={{ 
                width: 320, 
                borderRight: '1px solid #e0e0e0', 
                bgcolor: '#f8f9fa',
                overflowY: 'auto',
                p: 2
              }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {selectedWksp.name}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => setSelectedWksp(null)}>
                    <ArrowBackIcon />
                  </Button>
                </Stack>

                {/* File Explorer Section */}
                <CollapsibleSection
                  title="File Explorer"
                  expanded={expandedSections.fileExplorer}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, fileExplorer: !prev.fileExplorer }))}
                  icon={<FolderIcon color="primary" />}
                >
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {folders.find(f => f.id === ROOT_ID) && 
                      renderTreeNode(folders.find(f => f.id === ROOT_ID), folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren)
                    }
                  </Box>
                </CollapsibleSection>

                {/* Collaborators Section */}
                <CollapsibleSection
                  title="Team"
                  expanded={expandedSections.collaborators}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, collaborators: !prev.collaborators }))}
                  icon={<GroupIcon color="success" />}
                  color="success"
                >
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                          {collaborators.users.find(u=>u.id === collaborators.ownerId)?.email?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {collaborators.users.find(u=>u.id === collaborators.ownerId)?.email || "Unknown"}
                          </Typography>
                        }
                        secondary="Owner"
                      />
                    </ListItem>
                    {collaborators.members.map(mem => {
                      const user = collaborators.users.find(u => u.id === mem.user_id);
                      const isAccepted = !!mem.user_id;
                      const lastSeen = user?.last_seen ? new Date(user.last_seen) : null;
                      const online = isAccepted && lastSeen && (Date.now() - lastSeen.getTime() < 2*60*1000);
                      return (
                        <ListItem key={mem.id}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: isAccepted ? 'success.main' : 'warning.main' }}>
                              {mem.user_email?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={600}>
                                {mem.user_email}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color={online ? 'success.main' : 'text.secondary'}>
                                {isAccepted ? (online ? '● Online' : '● Offline') : '● Pending'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => setShowShare(selectedWksp.id)}
                    sx={{ mt: 1 }}
                  >
                    Invite
                  </Button>
                </CollapsibleSection>

                {/* Chat Section */}
                <CollapsibleSection
                  title="Chat"
                  expanded={expandedSections.chat}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, chat: !prev.chat }))}
                  icon={<SendIcon color="info" />}
                  color="info"
                >
                  <ChatWindow
                    workspaceId={selectedWksp.id}
                    currentUserId={user.id}
                    collaborators={collaborators.members.filter(m=>m.user_id)}
                  />
                </CollapsibleSection>

                {/* AI Tools Section */}
                <CollapsibleSection
                  title="AI Tools"
                  expanded={expandedSections.aiTools}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, aiTools: !prev.aiTools }))}
                  icon={<SmartToyIcon sx={{ color: 'secondary.main' }} />}
                  color="secondary"
                >
                  <AICodeReviewer 
                    workspaceId={selectedWksp.id} 
                    currentUser={user}
                  />
                </CollapsibleSection>

                {/* Resources Section */}
                <CollapsibleSection
                  title="Resources"
                  expanded={expandedSections.resources}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, resources: !prev.resources }))}
                  icon={<InsertDriveFileIcon color="warning" />}
                  color="warning"
                >
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {folderResources.slice(0, 5).map(ref => (
                      <Card key={ref.id} sx={{ mb: 1, p: 1, cursor: 'pointer' }} onClick={() => setSelectedResource(ref)}>
                        <Typography variant="body2" fontWeight={600} noWrap>{ref.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{ref.platform}</Typography>
                      </Card>
                    ))}
                  </Box>
                </CollapsibleSection>
              </Box>

              {/* Main Development Area */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Development Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
                  <Tabs value={activeDevelopmentTab} onChange={(_, v) => setActiveDevelopmentTab(v)}>
                    <Tab label="GitHub Editor" value="github" />
                    <Tab label="Google Docs" value="gdocs" />
                    <Tab label="AI Assistant" value="ai-assistant" />
                    <Tab label="Advanced AI" value="advanced-ai" />
                    <Tab label="Web IDE" value="web-ide" />
                    <Tab label="Hackathon AI" value="hackathon" />
                    <Tab label="Resources" value="resources" />
                    <Tab label="Search" value="search" />
                    <Tab label="Import" value="import" />
                  </Tabs>
                </Box>

                {/* Development Content */}
                <Box sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: '#fff' }}>
                                     {activeDevelopmentTab === 'github' && (
                     <Box>
                       <Typography variant="h5" fontWeight={700} mb={3}>GitHub Development</Typography>
                       
                       {/* GitHub Authentication */}
                       <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                         <Typography variant="h6" fontWeight={600} mb={2}>
                           <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                           GitHub Integration
                         </Typography>
                         <Typography variant="body2" color="text.secondary" mb={2}>
                           Connect your GitHub account to edit files directly in your workspace.
                         </Typography>
                         <Button 
                           variant="contained" 
                           startIcon={<GitHubIcon />}
                           onClick={async () => {
                             try {
                               const token = await initiateGitHubLogin();
                               setGithubToken(token);
                               alert('GitHub connected successfully!');
                             } catch (error) {
                               console.error('GitHub OAuth error:', error);
                               alert('GitHub connection failed. Please try again or check your OAuth setup.');
                             }
                           }}
                           sx={{ bgcolor: '#24292e', '&:hover': { bgcolor: '#1b1f23' } }}
                         >
                           {githubToken ? 'GitHub Connected' : 'Connect GitHub'}
                         </Button>
                       </Card>

                       {/* Repository and File Selection */}
                       <Card sx={{ p: 3, mb: 3 }}>
                         <Typography variant="h6" fontWeight={600} mb={2}>
                           File Editor
                         </Typography>
                         <Stack direction="row" spacing={2} mb={3} alignItems="center">
                           <TextField
                             label="Repository (owner/repo)"
                             value={githubRepo}
                             onChange={e => setGithubRepo(e.target.value)}
                             placeholder="e.g. vercel/next.js"
                             sx={{ width: 300 }}
                           />
                           <TextField
                             label="File Path"
                             value={githubFile}
                             onChange={e => setGithubFile(e.target.value)}
                             placeholder="src/App.js"
                             sx={{ width: 300 }}
                           />
                           <Button 
                             variant="contained" 
                             disabled={!githubRepo || !githubFile}
                             onClick={() => {
                               if (githubRepo && githubFile) {
                                 // Enable local editor
                               }
                             }}
                           >
                             Open in Editor
                           </Button>
                         </Stack>
                         
                         {githubRepo && githubFile && (
                           <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                             <LocalGitHubEditor 
                               repoFullName={githubRepo} 
                               filePath={githubFile} 
                               githubToken={githubToken}
                               onExit={() => {
                                 setGithubRepo('');
                                 setGithubFile('');
                                 setActiveDevelopmentTab('github');
                               }}
                             />
                           </Card>
                         )}
                       </Card>

                       {/* Quick Actions */}
                       <Card sx={{ p: 3, bgcolor: '#f0f8ff' }}>
                         <Typography variant="h6" fontWeight={600} mb={2}>
                           Quick Actions
                         </Typography>
                         <Stack direction="row" spacing={2}>
                           <Button 
                             variant="outlined" 
                             startIcon={<AddIcon />}
                             onClick={() => {
                               setGithubRepo('new-repo');
                               setGithubFile('README.md');
                               alert('New repository created! You can now start editing in the local editor.');
                             }}
                           >
                             Create New Repository
                           </Button>
                           <Button 
                             variant="outlined" 
                             startIcon={<InsertDriveFileIcon />}
                             onClick={() => {
                               if (!githubRepo) {
                                 alert('Please enter a repository first, then create a new file.');
                                 return;
                               }
                               setGithubFile('new-file.js');
                               alert('New file created! You can now start editing in the local editor.');
                             }}
                           >
                             Create New File
                           </Button>
                           <Button 
                             variant="outlined" 
                             startIcon={<FolderIcon />}
                             onClick={() => {
                               window.open('https://github.com', '_blank');
                             }}
                           >
                             Open GitHub
                           </Button>
                         </Stack>
                       </Card>
                     </Box>
                   )}

                                     {activeDevelopmentTab === 'gdocs' && (
                     <Box>
                       <Typography variant="h5" fontWeight={700} mb={3}>Google Docs Development</Typography>
                       
                       {/* Google Authentication */}
                       {!googleToken && (
                         <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                           <Typography variant="h6" fontWeight={600} mb={2}>
                             <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                             Connect Google Account
                           </Typography>
                           <Typography variant="body2" color="text.secondary" mb={2}>
                             Sign in with Google to access and edit Google Docs directly in your workspace.
                           </Typography>
                           <Button 
                             variant="contained" 
                             startIcon={<GoogleIcon />}
                             onClick={() => loginWithGoogle()}
                             sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#3367d6' } }}
                           >
                             Sign in with Google
                           </Button>
                         </Card>
                       )}

                       {/* Document URL Input */}
                       <Stack direction="row" spacing={2} mb={3} alignItems="center">
                         <TextField
                           label="Google Doc URL"
                           value={googleDocUrl}
                           onChange={e => setGoogleDocUrl(e.target.value)}
                           placeholder="https://docs.google.com/document/d/..."
                           sx={{ width: 400 }}
                           disabled={!googleToken}
                         />
                         <Button 
                           variant="contained" 
                           disabled={!googleDocUrl || !googleToken}
                           onClick={() => {
                             if (googleDocUrl && googleToken) {
                               // Extract document ID from URL
                               const match = googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
                               if (match) {
                                 const docId = match[1];
                                 // For now, just enable the local editor
                                 // In a full implementation, you'd load the actual document content
                               }
                             }
                           }}
                         >
                           Open in Editor
                         </Button>
                         {googleToken && (
                           <Chip 
                             label="Google Connected" 
                             color="success" 
                             icon={<GoogleIcon />}
                             variant="outlined"
                           />
                         )}
                       </Stack>

                       {/* Google Docs Editor */}
                       {googleDocUrl && googleToken && (
                           <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                             <EmbeddedGoogleDocsEditor
                               docUrl={googleDocUrl}
                               googleToken={googleToken}
                               onExit={() => {
                                 setGoogleDocUrl('');
                                 setActiveDevelopmentTab('gdocs');
                               }}
                             />
                           </Card>
                       )}

                       {/* Quick Create New Document */}
                       {googleToken && (
                         <Card sx={{ p: 3, mt: 3, bgcolor: '#f0f8ff' }}>
                           <Typography variant="h6" fontWeight={600} mb={2}>
                             Quick Actions
                           </Typography>
                                                    <Stack direction="row" spacing={2}>
                           <Button 
                             variant="outlined" 
                             startIcon={<AddIcon />}
                             onClick={() => {
                               setGoogleDocUrl('https://docs.google.com/document/d/new-document');
                               alert('New document created! You can now start editing in the local editor.');
                             }}
                           >
                             Create New Document
                           </Button>
                           <Button 
                             variant="outlined" 
                             startIcon={<FolderIcon />}
                             onClick={() => {
                               window.open('https://drive.google.com', '_blank');
                             }}
                           >
                             Open Google Drive
                           </Button>
                         </Stack>
                         </Card>
                       )}
                     </Box>
                   )}

                  {activeDevelopmentTab === 'ai-assistant' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>AI Assistant</Typography>
                      <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          ChatGPT-Style AI Assistant
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          Interact with an AI assistant that can help you edit Google Docs, generate code, and provide intelligent responses.
                        </Typography>
                      </Card>
                      
                      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', height: '70vh' }}>
                        <ChatGPTInterface 
                          onEditGoogleDoc={(content) => {
                            console.log('AI wants to edit Google Doc:', content);
                            // This would integrate with the Google Docs editor
                          }}
                          onGenerateCode={(prompt) => {
                            console.log('AI wants to generate code:', prompt);
                            // This would integrate with the Web IDE
                          }}
                          onExecuteCode={(code) => {
                            console.log('AI wants to execute code:', code);
                            // This would execute in the Web IDE
                          }}
                          googleToken={googleToken}
                          currentDocId={googleDocUrl ? googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1] : null}
                        />
                      </Card>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'advanced-ai' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>
                                                 <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Advanced AI Orchestrator
                      </Typography>
                      
                      <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                                                     <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Cross-Platform AI Development
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          Generate production-ready code from Google Docs specifications. Create web, mobile, desktop, and API applications with AI assistance.
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2, bgcolor: '#fff' }}>
                              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Code Generation
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Extract commands from documents and generate cross-platform code
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2, bgcolor: '#fff' }}>
                              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Deployment Ready
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Generate deployment configurations and CI/CD pipelines
                              </Typography>
                            </Card>
                          </Grid>
                        </Grid>
                      </Card>
                      
                      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', height: '70vh' }}>
                        <AdvancedAIOrchestrator 
                          googleToken={googleToken}
                          onCodeGenerated={(code) => {
                            setCrossPlatformCode(code);
                            console.log('Generated cross-platform code:', code);
                          }}
                          onError={(error) => {
                            console.error('AI Orchestrator error:', error);
                          }}
                        />
                      </Card>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'web-ide' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Web IDE</Typography>
                      <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          AI-Powered Code Editor
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          Write, debug, and optimize code with AI assistance. Features syntax highlighting, code execution, and ChatGPT integration.
                        </Typography>
                      </Card>
                      
                      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', height: '70vh' }}>
                        <WebIDE />
                      </Card>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'hackathon' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Hackathon AI Assistant</Typography>
                      <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          AI-Powered Hackathon Workspace
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          From idea to implementation - let AI help you build your hackathon project step by step.
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<SmartToyIcon />}
                          onClick={() => {
                            console.log('Launch Hackathon Assistant clicked');
                            setShowHackathonAssistant(true);
                          }}
                          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                        >
                          Launch Hackathon Assistant
                        </Button>
                      </Card>

                      {/* Quick Access to Individual Tools */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={4}>
                          <Card sx={{ p: 3, height: '100%' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                              <AccountTreeIcon color="primary" />
                              <Typography variant="h6" fontWeight={600}>Flowchart Creator</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Create system flowcharts and diagrams for your project architecture.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              startIcon={<AddIcon />}
                              onClick={() => {
                                console.log('Flowchart button clicked');
                                window.open('https://www.lucidchart.com/documents#/create', '_blank');
                              }}
                              fullWidth
                            >
                              Create Flowchart
                            </Button>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                          <Card sx={{ p: 3, height: '100%' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                              <SlideshowIcon color="primary" />
                              <Typography variant="h6" fontWeight={600}>Presentation Builder</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Generate compelling presentation slides for your project pitch.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              startIcon={<AddIcon />}
                              onClick={() => {
                                console.log('Slides button clicked');
                                window.open('https://docs.google.com/presentation/create', '_blank');
                              }}
                              fullWidth
                            >
                              Create Slides
                            </Button>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                          <Card sx={{ p: 3, height: '100%' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                              <BrushIcon color="primary" />
                              <Typography variant="h6" fontWeight={600}>Design Creator</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Create visual designs and mockups for your application.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              startIcon={<AddIcon />}
                              onClick={() => {
                                console.log('Canva button clicked');
                                window.open('https://www.canva.com/create', '_blank');
                              }}
                              fullWidth
                            >
                              Create Design
                            </Button>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'resources' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Resource Management</Typography>
                      <Card sx={{ bgcolor: '#fafafa', p: 2, mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          <TextField label="Title" size="small" sx={{ width: 150 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                          <TextField label="URL" size="small" sx={{ width: 200 }} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                          <TextField label="Tags" size="small" sx={{ width: 120 }} placeholder="comma-separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                          <TextField label="Platform" size="small" sx={{ width: 100 }} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
                          <TextField label="Notes" size="small" sx={{ width: 150 }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                          <Select size="small" value={form.folder} onChange={e => setForm({ ...form, folder: Number(e.target.value) })} sx={{ minWidth: 120 }}>
                            {folderOptionsFlat(folders, ROOT_ID, 0).map(opt => (
                              <MenuItem key={opt.key} value={opt.props.value}>{opt.props.children}</MenuItem>
                            ))}
                          </Select>
                          <Button variant="contained" color="primary" onClick={addOrUpdate} startIcon={editing ? <EditIcon /> : <AddIcon />}>
                            {editing ? "Update" : "Add"} Resource
                          </Button>
                          {editing && (
                            <Button 
                              variant="outlined" 
                              sx={{ 
                                color: 'secondary.main',
                                borderColor: 'secondary.main',
                                '&:hover': {
                                  borderColor: 'secondary.dark',
                                  backgroundColor: 'secondary.light',
                                  color: 'secondary.contrastText',
                                }
                              }}
                              onClick={() => { setForm({ ...blankForm, folder: activeFolder }); setEditing(null); }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Stack>
                      </Card>
                      
                      <Grid container spacing={2}>
                        {folderResources.map(ref => (
                          <Grid item xs={12} md={6} lg={4} key={ref.id}>
                            <Card sx={{ p: 2, height: '100%' }}>
                              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                <InsertDriveFileIcon color="warning" />
                                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{ref.title}</Typography>
                                <IconButton size="small" onClick={() => editResource(ref)}><EditIcon /></IconButton>
                                <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => removeResource(ref.id)}><DeleteIcon /></IconButton>
                              </Stack>
                              <Typography variant="body2" color="primary.main" mb={1}>
                                <a href={ref.url.match(/^https?:\/\//) ? ref.url : `https://${ref.url}`} target="_blank" rel="noopener noreferrer">
                                  {ref.url}
                                </a>
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                Platform: {ref.platform}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                Tags: {Array.isArray(ref.tags) ? ref.tags.join(", ") : ref.tags}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ref.notes}
                              </Typography>
                              
                              {isGoogleDocResource(ref) && (
                                <Box sx={{ mt: 2, p: 1, bgcolor: '#f7fafd', borderRadius: 1 }}>
                                  <Typography variant="caption" fontWeight={600} color="primary">
                                    Google Doc Available
                                  </Typography>
                                </Box>
                              )}
                              
                              <EnhancedAudioRecorder 
                                resourceId={ref.id} 
                                currentUser={user} 
                                workspaceId={selectedWksp.id}
                              />
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'search' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Search Resources</Typography>
                      {/* Search Scope Selector */}
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Typography variant="body2">Scope:</Typography>
                        <Button
                          variant={searchTabScope === 'everywhere' ? 'contained' : 'outlined'}
                          onClick={() => setSearchTabScope('everywhere')}
                          size="small"
                        >
                          All Resources
                        </Button>
                        <Button
                          variant={searchTabScope === 'folder' ? 'contained' : 'outlined'}
                          onClick={() => setSearchTabScope('folder')}
                          size="small"
                        >
                          This Folder & Subfolders
                        </Button>
                      </Stack>
                      {/* Search Input */}
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Search All Resources
                        </Typography>
                        <TextField
                          fullWidth
                          size="large"
                          placeholder="Search by title, platform, tags, or notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            endAdornment: searchQuery && (
                              <IconButton onClick={() => setSearchQuery('')} size="small">
                                <CloseIcon />
                              </IconButton>
                            )
                          }}
                          sx={{ mb: 3 }}
                        />
                        {/* Search Results */}
                        {searchQuery && (
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              Search Results ({searchResults.length})
                            </Typography>
                            {searchResults.length > 0 ? (
                              <Grid container spacing={2}>
                                {searchResults.map(result => (
                                  <Grid item xs={12} md={6} lg={4} key={result.id}>
                                    <Card sx={{ p: 2, height: '100%', cursor: 'pointer' }} onClick={() => onSearchResultClick(result)}>
                                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                        {isGoogleDocResource(result) ? (
                                          <GoogleIcon color="primary" />
                                        ) : isGitHubResource(result) ? (
                                          <GitHubIcon sx={{ color: 'secondary.main' }} />
                                        ) : (
                                          <InsertDriveFileIcon color="warning" />
                                        )}
                                        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{result.title}</Typography>
                                      </Stack>
                                      <Typography variant="body2" color="primary.main" mb={1}>
                                        {result.url && (result.url.match(/^https?:\/\//)
                                          ? <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
                                          : <span>{result.url}</span>
                                        )}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" mb={1}>
                                        Platform: {result.platform}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" mb={1}>
                                        Tags: {Array.isArray(result.tags) ? result.tags.join(", ") : result.tags}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {result.notes}
                                      </Typography>
                                      {isGoogleDocResource(result) && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: '#f7fafd', borderRadius: 1 }}>
                                          <Typography variant="caption" fontWeight={600} color="primary">
                                            Google Doc Available
                                          </Typography>
                                        </Box>
                                      )}
                                      {isGitHubResource(result) && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: '#f6f8fa', borderRadius: 1 }}>
                                          <Typography variant="caption" fontWeight={600} sx={{ color: 'secondary.main' }}>
                                            GitHub File Available
                                          </Typography>
                                        </Box>
                                      )}
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography color="text.secondary">No results found.</Typography>
                            )}
                          </Box>
                        )}
                      </Card>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'import' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Import Tools</Typography>
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Import GitHub Repository</Typography>
                        <ImportGithubIntoApp addFoldersAndResources={addFoldersAndResources} folderOptions={folderOptionsFlat(folders, ROOT_ID, 0)} />
                      </Card>
                      
                      <Card sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Google Meet & Calendar</Typography>
                        <GoogleMeetAndCalendar />
                      </Card>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DndProvider>
      )}
      {mainTab === 1 && <GitHubWorkspacePanel />}
      {mainTab === 2 && <MarketplacePanel currentUser={user} />}
      {mainTab === 3 && <OpenAITest />}

      {/* Editor Rendering */}
      {currentEditor === 'flowchart' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <FlowchartEditor
            flowchartData={editorData}
            onSave={(data) => {
              console.log('Flowchart saved:', data);
              setCurrentEditor(null);
              setEditorData(null);
            }}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}

      {currentEditor === 'slides' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <GoogleSlidesEditor
            presentationUrl=""
            googleToken={googleToken}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}

      {currentEditor === 'canva' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <CanvaEditor
            designData={editorData}
            onSave={(data) => {
              console.log('Design saved:', data);
              setCurrentEditor(null);
              setEditorData(null);
            }}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}

      {/* Hackathon Assistant Dialog */}
      {showHackathonAssistant && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <HackathonAssistant
            onGenerateProject={(project) => {
              console.log('Generated project:', project);
              setShowHackathonAssistant(false);
            }}
            onGenerateFlowchart={(flowchart) => {
              console.log('Opening Flowchart Editor');
              setEditorData(flowchart);
              setCurrentEditor('flowchart');
              setShowHackathonAssistant(false);
            }}
            onGenerateDesign={(design) => {
              console.log('Opening Canva Editor');
              setEditorData(design);
              setCurrentEditor('canva');
              setShowHackathonAssistant(false);
            }}
            onGenerateSlides={(slides) => {
              console.log('Opening Slides Editor');
              setEditorData(slides);
              setCurrentEditor('slides');
              setShowHackathonAssistant(false);
            }}
            onGenerateCode={(code) => {
              console.log('Generated code:', code);
              setShowHackathonAssistant(false);
            }}
          />
        </Box>
      )}

      {/* Sidebar Application Interface */}
      {sidebarApp && (
        <SidebarAppInterface
          appType={sidebarApp}
          onClose={() => setSidebarApp(null)}
          googleToken={googleToken}
        />
      )}
      </>
    </ThemeProvider>
  );
}
