// Mock API for audio comments - in production, this would integrate with Supabase
// For now, we'll use localStorage to simulate the functionality

const AUDIO_COMMENTS_KEY = 'audioComments';

// Get all audio comments for a resource
export async function fetchAudioComments(resourceId) {
  try {
    const comments = JSON.parse(localStorage.getItem(AUDIO_COMMENTS_KEY) || '[]');
    return comments.filter(comment => comment.resource_id === resourceId);
  } catch (error) {
    console.error('Error fetching audio comments:', error);
    return [];
  }
}

// Upload a new audio comment
export async function uploadAudioComment(audioBlob, resourceId, currentUser) {
  try {
    // Convert blob to base64 for storage (in production, upload to cloud storage)
    const audioUrl = await blobToBase64(audioBlob);
    
    // Generate waveform data (simplified mock)
    const waveformData = generateMockWaveform();
    
    // Create comment object
    const comment = {
      id: Date.now() + Math.random(),
      resource_id: resourceId,
      user_id: currentUser.id,
      user_email: currentUser.email,
      audio_url: audioUrl,
      waveform_data: waveformData,
      transcript: null, // Could integrate with speech-to-text API
      created_at: new Date().toISOString(),
    };
    
    // Save to localStorage
    const comments = JSON.parse(localStorage.getItem(AUDIO_COMMENTS_KEY) || '[]');
    comments.push(comment);
    localStorage.setItem(AUDIO_COMMENTS_KEY, JSON.stringify(comments));
    
    return comment;
  } catch (error) {
    console.error('Error uploading audio comment:', error);
    throw error;
  }
}

// Delete an audio comment
export async function deleteAudioComment(commentId) {
  try {
    const comments = JSON.parse(localStorage.getItem(AUDIO_COMMENTS_KEY) || '[]');
    const filteredComments = comments.filter(comment => comment.id !== commentId);
    localStorage.setItem(AUDIO_COMMENTS_KEY, JSON.stringify(filteredComments));
    return true;
  } catch (error) {
    console.error('Error deleting audio comment:', error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Generate mock waveform data for visualization
function generateMockWaveform() {
  const length = 128;
  const waveform = [];
  for (let i = 0; i < length; i++) {
    // Generate a realistic-looking waveform with some randomness
    const base = Math.sin(i * 0.1) * 64 + 64;
    const noise = (Math.random() - 0.5) * 32;
    waveform.push(Math.max(0, Math.min(255, base + noise)));
  }
  return waveform;
}

// In production, you would integrate with:
// 1. Supabase Storage for audio file uploads
// 2. Speech-to-text API (like OpenAI Whisper) for transcription
// 3. Supabase database for comment metadata
// 4. Real-time subscriptions for live comment updates

/*
Example Supabase integration:

export async function uploadAudioComment(audioBlob, resourceId, currentUser) {
  // 1. Upload audio file to Supabase Storage
  const fileName = `audio-comment-${Date.now()}.webm`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-comments')
    .upload(fileName, audioBlob);
  
  if (uploadError) throw uploadError;
  
  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('audio-comments')
    .getPublicUrl(fileName);
  
  // 3. Generate transcript (optional)
  const transcript = await generateTranscript(audioBlob);
  
  // 4. Save comment metadata to database
  const { data, error } = await supabase
    .from('audio_comments')
    .insert([{
      resource_id: resourceId,
      user_id: currentUser.id,
      audio_url: publicUrl,
      transcript: transcript,
      waveform_data: generateWaveformData(audioBlob)
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
*/
