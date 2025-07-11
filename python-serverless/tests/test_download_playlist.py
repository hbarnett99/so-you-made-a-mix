import unittest
from unittest.mock import Mock, patch, MagicMock, mock_open
import json
import tempfile
import os
import io
from api.python.download_playlist import DownloadHandler, handler


class TestDownloadHandler(unittest.TestCase):
    
    def setUp(self):
        self.handler = DownloadHandler()
        self.mock_job_id = "test-job-123"
        self.mock_playlist_data = {
            "name": "Test Playlist",
            "tracks": {
                "items": [
                    {
                        "track": {
                            "matchStatus": "matched",
                            "spotify": {
                                "name": "Test Song",
                                "artists": [{"name": "Test Artist"}]
                            },
                            "tidal": {
                                "url": "https://tidal.com/test-track"
                            }
                        }
                    }
                ]
            }
        }
        
    @patch('api.python.download_playlist.requests.get')
    def test_get_job_details_success(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"playlistId": "test-playlist"}
        mock_get.return_value = mock_response
        
        result = self.handler.get_job_details(self.mock_job_id)
        
        self.assertEqual(result, {"playlistId": "test-playlist"})
        mock_get.assert_called_once_with("http://localhost:3000/api/download/status/test-job-123")
    
    @patch('api.python.download_playlist.requests.get')
    def test_get_job_details_failure(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        result = self.handler.get_job_details(self.mock_job_id)
        
        self.assertIsNone(result)
    
    @patch('api.python.download_playlist.requests.get')
    def test_get_playlist_data_success(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.mock_playlist_data
        mock_get.return_value = mock_response
        
        result = self.handler.get_playlist_data("test-playlist")
        
        self.assertEqual(result, self.mock_playlist_data)
        mock_get.assert_called_once_with("http://localhost:3000/api/playlist/test-playlist")
    
    @patch('api.python.download_playlist.requests.get')
    def test_get_playlist_data_failure(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        result = self.handler.get_playlist_data("test-playlist")
        
        self.assertIsNone(result)
    
    @patch('api.python.download_playlist.requests.post')
    def test_update_job_status(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        self.handler.update_job_status(self.mock_job_id, "downloading", 5, 10, "Test Track")
        
        expected_data = {
            'status': 'downloading',
            'progress': {
                'current': 5,
                'total': 10,
                'currentTrack': 'Test Track'
            }
        }
        mock_post.assert_called_once_with(
            "http://localhost:3000/api/download/update-status/test-job-123",
            json=expected_data,
            timeout=10
        )
    
    @patch('api.python.download_playlist.requests.post')
    def test_update_job_completion(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        failed_tracks = ["Failed Track 1"]
        self.handler.update_job_completion(self.mock_job_id, "/api/download/file/test-job-123", failed_tracks)
        
        expected_data = {
            'status': 'completed',
            'downloadUrl': '/api/download/file/test-job-123',
            'failedTracks': failed_tracks
        }
        mock_post.assert_called_once_with(
            "http://localhost:3000/api/download/update-status/test-job-123",
            json=expected_data,
            timeout=10
        )
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('api.python.download_playlist.subprocess.run')
    @patch('os.remove')
    def test_download_single_track_success(self, mock_remove, mock_subprocess, mock_file):
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Download successful"
        mock_subprocess.return_value = mock_result
        
        tidal_track = {"url": "https://tidal.com/test-track"}
        spotify_track = {"name": "Test Song", "artists": [{"name": "Test Artist"}]}
        
        result = self.handler.download_single_track(tidal_track, "/tmp/test", spotify_track)
        
        self.assertTrue(result)
        mock_subprocess.assert_called_once()
        mock_file.assert_called_once()
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('api.python.download_playlist.subprocess.run')
    @patch('os.remove')
    def test_download_single_track_failure(self, mock_remove, mock_subprocess, mock_file):
        mock_result = Mock()
        mock_result.returncode = 1
        mock_result.stderr = "Download failed"
        mock_subprocess.return_value = mock_result
        
        tidal_track = {"url": "https://tidal.com/test-track"}
        spotify_track = {"name": "Test Song", "artists": [{"name": "Test Artist"}]}
        
        result = self.handler.download_single_track(tidal_track, "/tmp/test", spotify_track)
        
        self.assertFalse(result)
    
    @patch('api.python.download_playlist.zipfile.ZipFile')
    @patch('os.walk')
    def test_create_zip(self, mock_walk, mock_zipfile):
        mock_walk.return_value = [
            ("/tmp/test/tracks", [], ["song1.mp3", "song2.mp3", "config.json"])
        ]
        
        mock_zip = MagicMock()
        mock_zipfile.return_value.__enter__.return_value = mock_zip
        
        successful_downloads = ["Test Artist - Test Song"]
        result = self.handler.create_zip(successful_downloads, "/tmp/test", "Test Playlist")
        
        self.assertTrue(result.endswith(".zip"))
        self.assertEqual(mock_zip.write.call_count, 2)  # Should skip config.json
    
    @patch.object(DownloadHandler, 'download_single_track')
    @patch.object(DownloadHandler, 'update_job_status')
    def test_download_tracks(self, mock_update_status, mock_download_single):
        mock_download_single.side_effect = [True, False, True]
        
        tracks = [
            {"track": {"spotify": {"name": "Song1", "artists": [{"name": "Artist1"}]}, "tidal": {"url": "url1"}}},
            {"track": {"spotify": {"name": "Song2", "artists": [{"name": "Artist2"}]}, "tidal": {"url": "url2"}}},
            {"track": {"spotify": {"name": "Song3", "artists": [{"name": "Artist3"}]}, "tidal": {"url": "url3"}}}
        ]
        
        successful, failed = self.handler.download_tracks(tracks, "/tmp/test", self.mock_job_id)
        
        self.assertEqual(len(successful), 2)
        self.assertEqual(len(failed), 1)
        self.assertEqual(mock_download_single.call_count, 3)
    
    @patch.object(DownloadHandler, 'get_job_details')
    @patch.object(DownloadHandler, 'get_playlist_data')
    @patch.object(DownloadHandler, 'download_tracks')
    @patch.object(DownloadHandler, 'create_zip')
    @patch.object(DownloadHandler, 'update_job_status')
    @patch.object(DownloadHandler, 'update_job_completion')
    @patch('tempfile.TemporaryDirectory')
    @patch('os.makedirs')
    @patch('shutil.move')
    def test_process_download_success(self, mock_move, mock_makedirs, mock_tempdir, 
                                    mock_update_completion, mock_update_status, 
                                    mock_create_zip, mock_download_tracks, 
                                    mock_get_playlist, mock_get_job):
        mock_tempdir.return_value.__enter__.return_value = "/tmp/test"
        mock_get_job.return_value = {"playlistId": "test-playlist"}
        mock_get_playlist.return_value = self.mock_playlist_data
        mock_download_tracks.return_value = (["Track1"], [])
        mock_create_zip.return_value = "/tmp/test/playlist.zip"
        
        result = self.handler.process_download(self.mock_job_id)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['successfulTracks'], 1)
        self.assertEqual(result['failedTracks'], 0)
        mock_update_completion.assert_called_once()
    
    @patch.object(DownloadHandler, 'get_job_details')
    @patch.object(DownloadHandler, 'update_job_status')
    def test_process_download_job_not_found(self, mock_update_status, mock_get_job):
        mock_get_job.return_value = None
        
        with self.assertRaises(Exception) as context:
            self.handler.process_download(self.mock_job_id)
        
        self.assertEqual(str(context.exception), "Job not found")
        mock_update_status.assert_called_with(self.mock_job_id, 'failed', 0, 0, "Job not found")
    
    @patch('json.loads')
    def test_do_POST_success(self, mock_json_loads):
        mock_json_loads.return_value = {"jobId": self.mock_job_id}
        
        self.handler.rfile = io.BytesIO(b'{"jobId": "test-job-123"}')
        self.handler.headers = {'Content-Length': '25'}
        self.handler.send_response = Mock()
        self.handler.send_header = Mock()
        self.handler.end_headers = Mock()
        self.handler.wfile = Mock()
        
        with patch.object(self.handler, 'process_download') as mock_process:
            mock_process.return_value = {"success": True}
            
            self.handler.do_POST()
            
            self.handler.send_response.assert_called_once_with(200)
            mock_process.assert_called_once_with(self.mock_job_id)
    
    @patch('json.loads')
    def test_do_POST_missing_job_id(self, mock_json_loads):
        mock_json_loads.return_value = {}
        
        self.handler.rfile = io.BytesIO(b'{}')
        self.handler.headers = {'Content-Length': '2'}
        self.handler.send_error = Mock()
        
        self.handler.do_POST()
        
        self.handler.send_error.assert_called_once_with(400, "Missing jobId")


class TestVercelHandler(unittest.TestCase):
    
    def test_handler_success(self):
        mock_req = Mock()
        mock_req.method = 'POST'
        mock_req.body = '{"jobId": "test-job-123"}'
        mock_res = Mock()
        
        with patch('api.python.download_playlist.DownloadHandler') as mock_handler_class:
            mock_handler_instance = Mock()
            mock_handler_class.return_value = mock_handler_instance
            
            result = handler(mock_req, mock_res)
            
            self.assertEqual(result['statusCode'], 200)
            self.assertIn('success', json.loads(result['body']))
    
    def test_handler_method_not_allowed(self):
        mock_req = Mock()
        mock_req.method = 'GET'
        mock_res = Mock()
        
        result = handler(mock_req, mock_res)
        
        self.assertEqual(result['statusCode'], 405)
        self.assertIn('error', json.loads(result['body']))
    
    def test_handler_exception(self):
        mock_req = Mock()
        mock_req.method = 'POST'
        mock_req.body = '{"jobId": "test-job-123"}'
        mock_res = Mock()
        
        with patch('api.python.download_playlist.DownloadHandler') as mock_handler_class:
            mock_handler_class.side_effect = Exception("Test error")
            
            result = handler(mock_req, mock_res)
            
            self.assertEqual(result['statusCode'], 500)
            self.assertIn('error', json.loads(result['body']))


if __name__ == '__main__':
    unittest.main()