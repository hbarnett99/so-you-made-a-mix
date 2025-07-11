import json
import os
import tempfile
import zipfile
import shutil
from http.server import BaseHTTPRequestHandler
import requests
from typing import Dict, List, Optional
import time
import subprocess
import sys

class DownloadHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            job_id = data.get('jobId')
            if not job_id:
                self.send_error(400, "Missing jobId")
                return
            
            # Process the download
            result = self.process_download(job_id)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f"Error in download handler: {e}")
            self.send_error(500, str(e))
    
    def process_download(self, job_id: str) -> Dict:
        """Main download processing logic"""
        try:
            print(f"Starting download process for job {job_id}")
            
            # Get job details from Next.js API
            job_details = self.get_job_details(job_id)
            if not job_details:
                raise Exception("Job not found")
            
            # Get enhanced playlist data
            playlist_data = self.get_playlist_data(job_details['playlistId'])
            if not playlist_data:
                raise Exception("Playlist not found")
            
            # Filter downloadable tracks (TIDAL matches only)
            downloadable_tracks = [
                item for item in playlist_data['tracks']['items']
                if item['track']['matchStatus'] == 'matched'
            ]
            
            print(f"Found {len(downloadable_tracks)} downloadable tracks")
            
            # Create temp directory for downloads
            with tempfile.TemporaryDirectory() as temp_dir:
                download_dir = os.path.join(temp_dir, 'tracks')
                os.makedirs(download_dir)
                
                # Download tracks
                successful_downloads, failed_tracks = self.download_tracks(
                    downloadable_tracks, download_dir, job_id
                )
                
                if not successful_downloads:
                    raise Exception("No tracks could be downloaded")
                
                print(f"Successfully downloaded {len(successful_downloads)} tracks")
                
                # Update status to zipping
                self.update_job_status(job_id, 'zipping', len(successful_downloads), len(downloadable_tracks))
                
                # Create zip
                zip_path = self.create_zip(successful_downloads, temp_dir, playlist_data['name'])
                
                # Move zip to /tmp for Next.js to serve
                final_zip_path = f"/tmp/{job_id}.zip"
                shutil.move(zip_path, final_zip_path)
                
                # Update job as completed
                download_url = f"/api/download/file/{job_id}"
                self.update_job_completion(job_id, download_url, failed_tracks)
                
                print(f"Download process completed for job {job_id}")
                
                return {
                    'success': True,
                    'downloadUrl': download_url,
                    'successfulTracks': len(successful_downloads),
                    'failedTracks': len(failed_tracks)
                }
                
        except Exception as e:
            print(f"Download process failed for job {job_id}: {e}")
            # Update job as failed
            self.update_job_status(job_id, 'failed', 0, 0, str(e))
            raise
    
    def get_job_details(self, job_id: str) -> Optional[Dict]:
        """Get job details from Next.js API"""
        try:
            nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
            response = requests.get(f"{nextjs_url}/api/download/status/{job_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Failed to get job details: {e}")
            return None
    
    def get_playlist_data(self, playlist_id: str) -> Optional[Dict]:
        """Get enhanced playlist data from Next.js API"""
        try:
            nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
            response = requests.get(f"{nextjs_url}/api/playlist/{playlist_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Failed to get playlist data: {e}")
            return None
    
    def download_tracks(self, tracks: List[Dict], download_dir: str, job_id: str) -> tuple[List[str], List[str]]:
        """Download tracks using OrpheusDL command line"""
        successful_downloads = []
        failed_tracks = []
        
        for i, track_item in enumerate(tracks):
            track = track_item['track']
            spotify_track = track['spotify']
            tidal_track = track['tidal']
            
            try:
                track_name = f"{spotify_track['artists'][0]['name']} - {spotify_track['name']}"
                print(f"Downloading track {i+1}/{len(tracks)}: {track_name}")
                
                # Update progress
                self.update_job_status(
                    job_id, 
                    'downloading', 
                    i, 
                    len(tracks),
                    track_name
                )
                
                # Use OrpheusDL to download the track
                success = self.download_single_track(tidal_track, download_dir, spotify_track)
                
                if success:
                    successful_downloads.append(track_name)
                    print(f"✓ Successfully downloaded: {track_name}")
                else:
                    failed_tracks.append(track_name)
                    print(f"✗ Failed to download: {track_name}")
                    
            except Exception as e:
                print(f"Exception downloading {track_name}: {e}")
                failed_tracks.append(track_name)
                continue
        
        return successful_downloads, failed_tracks
    
    def download_single_track(self, tidal_track: Dict, download_dir: str, spotify_track: Dict) -> bool:
        """Download a single track using OrpheusDL command line"""
        try:
            # Create OrpheusDL config for this download
            config = {
                "global": {
                    "module": "tidal",
                    "quality": "hifi",
                    "output": download_dir,
                    "filename": "{artist} - {title}.{ext}"
                },
                "tidal": {
                    # You'll need to set these up based on OrpheusDL's TIDAL module requirements
                    "username": os.getenv('TIDAL_USERNAME'),
                    "password": os.getenv('TIDAL_PASSWORD'),
                    # Or use token-based auth if available
                }
            }
            
            # Create temporary config file
            config_path = os.path.join(download_dir, 'temp_config.json')
            with open(config_path, 'w') as f:
                json.dump(config, f)
            
            # Build OrpheusDL command
            tidal_url = tidal_track['url']
            cmd = [
                'python', '-m', 'orpheus',
                '--config', config_path,
                tidal_url
            ]
            
            print(f"Running command: {' '.join(cmd)}")
            
            # Execute download with timeout
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=120,  # 2 minute timeout per track
                cwd=download_dir
            )
            
            # Clean up config file
            try:
                os.remove(config_path)
            except:
                pass
            
            if result.returncode == 0:
                print(f"OrpheusDL output: {result.stdout}")
                return True
            else:
                print(f"OrpheusDL error: {result.stderr}")
                return False
            
        except subprocess.TimeoutExpired:
            print(f"Download timeout for track")
            return False
        except Exception as e:
            print(f"Download failed with exception: {e}")
            return False
    
    def create_zip(self, successful_downloads: List[str], temp_dir: str, playlist_name: str) -> str:
        """Create zip file from downloaded tracks"""
        # Clean playlist name for filename
        clean_name = playlist_name.replace(' ', '_').replace('/', '_')
        zip_filename = f"{clean_name}-{int(time.time())}.zip"
        zip_path = os.path.join(temp_dir, zip_filename)
        
        download_dir = os.path.join(temp_dir, 'tracks')
        
        print(f"Creating zip file: {zip_filename}")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(download_dir):
                for file in files:
                    # Skip config files
                    if file.endswith('.json'):
                        continue
                        
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, download_dir)
                    zipf.write(file_path, arcname)
                    print(f"Added to zip: {arcname}")
        
        print(f"Zip created successfully: {zip_path}")
        return zip_path
    
    def update_job_status(self, job_id: str, status: str, current: int, total: int, current_track: str = None, error: str = None):
        """Update job status via Next.js API"""
        try:
            data = {
                'status': status,
                'progress': {
                    'current': current,
                    'total': total,
                    'currentTrack': current_track
                }
            }
            if error:
                data['error'] = error
            
            nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
            response = requests.post(
                f"{nextjs_url}/api/download/update-status/{job_id}",
                json=data,
                timeout=10
            )
            print(f"Status update response: {response.status_code}")
                
        except Exception as e:
            print(f"Failed to update job status: {e}")
    
    def update_job_completion(self, job_id: str, download_url: str, failed_tracks: List[str]):
        """Mark job as completed"""
        try:
            nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
            response = requests.post(
                f"{nextjs_url}/api/download/update-status/{job_id}",
                json={
                    'status': 'completed',
                    'downloadUrl': download_url,
                    'failedTracks': failed_tracks
                },
                timeout=10
            )
            print(f"Completion update response: {response.status_code}")
        except Exception as e:
            print(f"Failed to update job completion: {e}")

# Vercel serverless function handler
def handler(req, res):
    """Vercel serverless function entry point"""
    try:
        handler_instance = DownloadHandler()
        
        # Mock the HTTP request/response for our handler
        import io
        
        # Create mock request
        handler_instance.rfile = io.BytesIO(req.body.encode() if isinstance(req.body, str) else req.body)
        handler_instance.headers = {'Content-Length': str(len(req.body))}
        
        # Process based on method
        if req.method == 'POST':
            handler_instance.do_POST()
            return {
                'statusCode': 200,
                'body': json.dumps({'success': True})
            }
        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        print(f"Handler error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }