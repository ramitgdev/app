import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') return res.status(405).end();

  console.log('=== CHECKING WORKSPACE_MEMBERS TABLE ===');
  
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created');
    console.log('🔍 Connecting to:', supabaseUrl);
    console.log('🔍 Service key starts with:', supabaseServiceKey?.substring(0, 20) + '...');

    // Check if we can access the table
    console.log('🔍 Testing table access...');
    
    // First, let's see what's in the users table
    console.log('🔍 Checking users table...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users found:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('🔍 Sample users:', users.map(u => ({ id: u.id.substring(0, 8) + '...', email: u.email })));
      }
    }
    
    // Try to select from the table
    const { data: members, error: selectError } = await supabaseAdmin
      .from('workspace_members')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Select error:', selectError);
      return res.status(400).json({ 
        error: 'Cannot select from workspace_members',
        details: selectError 
      });
    }
    
    console.log('✅ Select successful, found members:', members?.length || 0);

    // Try to insert a test record
    console.log('🔍 Testing insert...');
    
    // First, get a real workspace ID
    const { data: realWorkspaces, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('id, name')
      .limit(1);
    
    if (workspaceError || !realWorkspaces || realWorkspaces.length === 0) {
      console.error('❌ No workspaces found:', workspaceError);
      return res.status(400).json({ 
        error: 'No workspaces found to test with',
        details: workspaceError 
      });
    }
    
    const realWorkspaceId = realWorkspaces[0].id;
    console.log('✅ Found real workspace:', realWorkspaces[0]);
    
    const testData = {
      workspace_id: realWorkspaceId,
      user_email: 'test@example.com',
      invited_by: realWorkspaceId // Using same ID for simplicity
    };
    
    console.log('🔍 Testing insert with real workspace ID:', testData);
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('workspace_members')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return res.status(400).json({ 
        error: 'Cannot insert into workspace_members',
        details: insertError 
      });
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Clean up the test record
    const { error: deleteError } = await supabaseAdmin
      .from('workspace_members')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }

    // Check table structure
    console.log('🔍 Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('get_table_info', { table_name: 'workspace_members' })
      .single();
    
    if (tableError) {
      console.log('⚠️ Could not get table info via RPC, trying direct query...');
      // Try a simpler approach
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'workspace_members')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.error('❌ Could not get column info:', columnsError);
      } else {
        console.log('✅ Table columns:', columns);
      }
    } else {
      console.log('✅ Table info:', tableInfo);
    }

    console.log('=== TABLE CHECK COMPLETE ===');
    return res.status(200).json({ 
      ok: true, 
      message: 'Table check completed successfully',
      canSelect: true,
      canInsert: true,
      canDelete: true
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Table check failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
