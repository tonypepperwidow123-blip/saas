import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import AdmZip from 'adm-zip';

// Load env vars
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDownload() {
  try {
    console.log('Fetching files from plugins bucket...');
    const { data: files, error: listError } = await supabase.storage.from('plugins').list('');
    
    if (listError) throw listError;
    
    if (!files || files.length === 0) {
      console.log('No files found in the bucket.');
      
      // Try listing inside folders
      const { data: folders } = await supabase.storage.from('plugins').list('', { limit: 10 });
      console.log('Folders in bucket:', folders.map(f => f.name));
      
      for (const folder of folders) {
        if (folder.id === null) { // It's a folder
           const { data: subFolders } = await supabase.storage.from('plugins').list(folder.name, { limit: 10 });
           console.log(`Contents of ${folder.name}:`, subFolders.map(f => f.name));
           
           for (const sub of subFolders) {
               if (sub.id === null) {
                   const { data: innerFiles } = await supabase.storage.from('plugins').list(`${folder.name}/${sub.name}`, { limit: 10 });
                   console.log(`Files in ${folder.name}/${sub.name}:`, innerFiles.map(f => f.name));
                   
                   for (const file of innerFiles) {
                       if (file.name.endsWith('.zip')) {
                           await downloadAndInspect(`${folder.name}/${sub.name}/${file.name}`);
                           return;
                       }
                   }
               }
           }
        }
      }
      return;
    }
    
    for (const file of files) {
        if (file.name.endsWith('.zip')) {
            await downloadAndInspect(file.name);
            return;
        }
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

async function downloadAndInspect(filePath) {
    console.log(`Downloading ${filePath}...`);
    const { data, error } = await supabase.storage.from('plugins').download(filePath);
    
    if (error) {
        console.error('Download failed:', error);
        return;
    }
    
    const buffer = await data.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();
    
    console.log('\n--- ZIP Contents ---');
    let foundInfo = false;
    let phpContent = '';
    
    for (const entry of entries) {
        console.log(`- ${entry.entryName}`);
        if (entry.entryName === 'pluginvault-info.json') {
            foundInfo = true;
            console.log('\n--- pluginvault-info.json ---');
            console.log(entry.getData().toString('utf8'));
        }
        if (entry.entryName.endsWith('.php')) {
            phpContent = entry.getData().toString('utf8');
            if (phpContent.includes('PLUGINVAULT_LICENSED')) {
                console.log(`\n--- Found injected code in ${entry.entryName} ---`);
                const lines = phpContent.split('\n');
                const lastLines = lines.slice(Math.max(lines.length - 20, 0)).join('\n');
                console.log(lastLines);
            }
        }
    }
    
    if (!foundInfo) {
        console.log('\n❌ pluginvault-info.json NOT FOUND');
    }
}

testDownload();
