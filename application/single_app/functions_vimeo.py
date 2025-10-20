# functions_vimeo.py
"""
Vimeo API Integration for Professional Video Upload and Streaming

This module provides production-grade integration with Vimeo's API for:
- Automatic video uploads via TUS protocol (resumable uploads)
- Retrieval of download URLs (for Video Indexer processing)
- Retrieval of playback URLs (for optimized browser streaming)
- Real-time progress tracking and status updates

Version: 0.229.062
"""

import os
import time
import requests
from typing import Dict, Optional, Callable, Tuple
from functions_debug import debug_print


def get_vimeo_access_token() -> Optional[str]:
    """
    Get Vimeo access token from environment.
    Returns None if not configured.
    """
    token = os.getenv('VIMEO_ACCESS_TOKEN')
    if not token:
        debug_print("[VIMEO] ERROR: VIMEO_ACCESS_TOKEN not set in environment")
    return token


def is_vimeo_enabled() -> bool:
    """Check if Vimeo upload integration is enabled."""
    return os.getenv('VIMEO_ENABLE_UPLOAD', 'false').lower() == 'true'


def create_vimeo_video(
    filename: str,
    file_size: int,
    access_token: str,
    update_callback: Optional[Callable] = None
) -> Dict:
    """
    Create a video entry on Vimeo and get upload URL.
    
    Args:
        filename: Original filename
        file_size: File size in bytes
        access_token: Vimeo personal access token
        update_callback: Optional callback for status updates
        
    Returns:
        Dictionary with upload_link, uri, and other metadata
        
    Raises:
        Exception: If video creation fails
    """
    debug_print(f"[VIMEO] Creating video entry for: {filename} ({file_size} bytes)")
    
    if update_callback:
        update_callback(status="Vimeo: Creating video entry...")
    
    url = "https://api.vimeo.com/me/videos"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4"
    }
    
    data = {
        "upload": {
            "approach": "tus",
            "size": file_size
        },
        "name": filename,
        "privacy": {
            "view": "unlisted",      # Private but accessible via link
            "embed": "public",       # Allow embedding anywhere (for CSP)
            "download": True,        # Enable download links
            "add": False,            # Don't allow adding to channels/groups
            "comments": "nobody"     # Disable comments
        },
        "embed": {
            "buttons": {
                "embed": False,      # Hide embed button
                "fullscreen": True,  # Allow fullscreen
                "hd": True,          # Show HD toggle
                "like": False,       # Hide like button
                "scaling": True,     # Enable scaling
                "share": False,      # Hide share button
                "watchlater": False  # Hide watch later
            },
            "color": "#1a73e8",      # Match app primary color
            "logos": {
                "vimeo": False       # Hide Vimeo logo (Pro+ required)
            },
            "title": {
                "name": "hide",      # Hide video title
                "owner": "hide",     # Hide owner name
                "portrait": "hide"   # Hide owner portrait
            }
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        debug_print(f"[VIMEO] Video entry created successfully: {result.get('uri')}")
        
        if update_callback:
            update_callback(status="Vimeo: Video entry created")
        
        return result
        
    except requests.exceptions.RequestException as e:
        debug_print(f"[VIMEO] ERROR creating video entry: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            debug_print(f"[VIMEO] Response status: {e.response.status_code}")
            debug_print(f"[VIMEO] Response text: {e.response.text}")
        raise Exception(f"Failed to create Vimeo video entry: {str(e)}")


def upload_video_to_vimeo_tus(
    upload_url: str,
    file_path: str,
    file_size: int,
    update_callback: Optional[Callable] = None
) -> bool:
    """
    Upload video file to Vimeo using TUS resumable upload protocol.
    
    Args:
        upload_url: TUS upload URL from create_vimeo_video
        file_path: Path to video file
        file_size: Total file size
        update_callback: Optional callback for progress updates
        
    Returns:
        True if upload successful
        
    Raises:
        Exception: If upload fails
    """
    debug_print(f"[VIMEO] Starting TUS upload to: {upload_url}")
    
    if update_callback:
        update_callback(status="Vimeo: Starting upload...")
    
    # TUS protocol: PATCH request with video data
    headers = {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream"
    }
    
    try:
        with open(file_path, 'rb') as video_file:
            # Read file in chunks for progress tracking
            chunk_size = 1024 * 1024  # 1MB chunks
            uploaded = 0
            
            # For simplicity, we'll upload the entire file at once
            # In production, you might want to implement chunked uploads for very large files
            video_data = video_file.read()
            
            response = requests.patch(
                upload_url,
                headers=headers,
                data=video_data,
                timeout=300  # 5 minutes timeout for upload
            )
            
            response.raise_for_status()
            
            debug_print(f"[VIMEO] Upload completed successfully")
            
            if update_callback:
                update_callback(status="Vimeo: Upload complete, processing...")
            
            return True
            
    except requests.exceptions.RequestException as e:
        debug_print(f"[VIMEO] ERROR uploading video: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            debug_print(f"[VIMEO] Response status: {e.response.status_code}")
            debug_print(f"[VIMEO] Response text: {e.response.text}")
        raise Exception(f"Failed to upload video to Vimeo: {str(e)}")
    except IOError as e:
        debug_print(f"[VIMEO] ERROR reading file: {str(e)}")
        raise Exception(f"Failed to read video file: {str(e)}")


def wait_for_vimeo_processing(
    video_uri: str,
    access_token: str,
    update_callback: Optional[Callable] = None,
    max_wait_seconds: int = 600,  # 10 minutes max
    poll_interval: int = 5
) -> Dict:
    """
    Poll Vimeo API until video processing is complete.
    
    Args:
        video_uri: Video URI (e.g., /videos/1123322152)
        access_token: Vimeo access token
        update_callback: Optional callback for status updates
        max_wait_seconds: Maximum time to wait
        poll_interval: Seconds between polls
        
    Returns:
        Complete video data when ready
        
    Raises:
        Exception: If processing fails or times out
    """
    debug_print(f"[VIMEO] Waiting for video processing: {video_uri}")
    
    url = f"https://api.vimeo.com{video_uri}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.vimeo.*+json;version=3.4"
    }
    
    start_time = time.time()
    poll_count = 0
    
    while True:
        poll_count += 1
        elapsed = time.time() - start_time
        
        if elapsed > max_wait_seconds:
            debug_print(f"[VIMEO] ERROR: Processing timeout after {elapsed:.0f} seconds")
            raise Exception(f"Vimeo processing timeout after {elapsed:.0f} seconds")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            status = data.get('status')
            transcode_status = data.get('transcode', {}).get('status')
            
            debug_print(f"[VIMEO] Poll #{poll_count}: status={status}, transcode={transcode_status}")
            
            if status == 'available' and transcode_status == 'complete':
                debug_print(f"[VIMEO] Video processing complete!")
                
                if update_callback:
                    update_callback(status="Vimeo: Processing complete")
                
                return data
            
            elif status == 'transcode_starting' or transcode_status in ['in_progress', 'queued']:
                if update_callback:
                    progress_pct = data.get('transcode', {}).get('progress', 0)
                    update_callback(status=f"Vimeo: Processing {progress_pct}%...")
                
                debug_print(f"[VIMEO] Still processing, waiting {poll_interval}s...")
                time.sleep(poll_interval)
                
            else:
                # Check for error states
                if status == 'error' or transcode_status == 'error':
                    error_msg = data.get('error', 'Unknown error during processing')
                    debug_print(f"[VIMEO] ERROR: Processing failed: {error_msg}")
                    raise Exception(f"Vimeo processing failed: {error_msg}")
                
                # Unknown status, keep waiting
                debug_print(f"[VIMEO] Unknown status, continuing to poll...")
                time.sleep(poll_interval)
                
        except requests.exceptions.RequestException as e:
            debug_print(f"[VIMEO] ERROR polling status: {str(e)}")
            # Don't fail immediately on network errors, retry
            time.sleep(poll_interval)
            continue


def get_vimeo_video_urls(
    video_uri: str,
    access_token: str,
    preferred_quality: str = '360p'
) -> Tuple[Optional[str], Optional[str]]:
    """
    Get download and playback URLs from processed Vimeo video.
    
    Args:
        video_uri: Video URI (e.g., /videos/1123322152)
        access_token: Vimeo access token
        preferred_quality: Preferred quality (360p, 540p, 720p, 1080p)
        
    Returns:
        Tuple of (download_url, playback_url)
        Both optimized for 360p quality as specified
        
    Raises:
        Exception: If URLs cannot be retrieved
    """
    debug_print(f"[VIMEO] Retrieving video URLs for: {video_uri}")
    debug_print(f"[VIMEO] Preferred quality: {preferred_quality}")
    
    url = f"https://api.vimeo.com{video_uri}?fields=files,download"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.vimeo.*+json;version=3.4"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Get download links
        download_links = data.get('download', [])
        # Get playback/streaming files
        files = data.get('files', [])
        
        debug_print(f"[VIMEO] Found {len(download_links)} download options")
        debug_print(f"[VIMEO] Found {len(files)} playback options")
        
        # Find 360p download URL (or closest quality)
        download_url = None
        for link in download_links:
            quality = link.get('quality', '').lower()
            rendition = link.get('rendition', '').lower()
            
            debug_print(f"[VIMEO] Download option: quality={quality}, rendition={rendition}")
            
            if preferred_quality in quality or preferred_quality in rendition:
                download_url = link.get('link')
                debug_print(f"[VIMEO] Selected download URL (exact match): {quality}/{rendition}")
                break
        
        # Fallback: get any download URL if exact match not found
        if not download_url and download_links:
            download_url = download_links[0].get('link')
            debug_print(f"[VIMEO] Using fallback download URL: {download_links[0].get('quality')}")
        
        # Find 360p playback URL (or closest quality)
        playback_url = None
        for file in files:
            quality = file.get('quality', '').lower()
            rendition = file.get('rendition', '').lower()
            
            debug_print(f"[VIMEO] Playback option: quality={quality}, rendition={rendition}, type={file.get('type')}")
            
            if preferred_quality in quality or preferred_quality in rendition:
                playback_url = file.get('link')
                debug_print(f"[VIMEO] Selected playback URL (exact match): {quality}/{rendition}")
                break
        
        # Fallback: get any progressive playback URL
        if not playback_url:
            for file in files:
                if 'progressive' in file.get('quality', '').lower():
                    playback_url = file.get('link')
                    debug_print(f"[VIMEO] Using fallback playback URL: {file.get('quality')}")
                    break
        
        if not download_url or not playback_url:
            debug_print(f"[VIMEO] WARNING: Could not find both URLs")
            debug_print(f"[VIMEO] Download URL found: {bool(download_url)}")
            debug_print(f"[VIMEO] Playback URL found: {bool(playback_url)}")
            
            # If we have at least one URL, we can use it for both purposes
            if download_url and not playback_url:
                playback_url = download_url
                debug_print(f"[VIMEO] Using download URL for playback")
            elif playback_url and not download_url:
                download_url = playback_url
                debug_print(f"[VIMEO] Using playback URL for download")
            else:
                raise Exception("Could not retrieve video URLs from Vimeo")
        
        debug_print(f"[VIMEO] Successfully retrieved both URLs")
        return download_url, playback_url
        
    except requests.exceptions.RequestException as e:
        debug_print(f"[VIMEO] ERROR retrieving video URLs: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            debug_print(f"[VIMEO] Response status: {e.response.status_code}")
            debug_print(f"[VIMEO] Response text: {e.response.text}")
        raise Exception(f"Failed to retrieve Vimeo video URLs: {str(e)}")


def upload_and_process_vimeo_video(
    file_path: str,
    filename: str,
    file_size: int,
    update_callback: Optional[Callable] = None
) -> Dict[str, str]:
    """
    Complete workflow: Upload video to Vimeo and get URLs.
    
    This is the main entry point for Vimeo upload integration.
    
    Args:
        file_path: Path to video file
        filename: Original filename
        file_size: File size in bytes
        update_callback: Optional callback for status updates
        
    Returns:
        Dictionary with:
        - download_url: For Video Indexer processing
        - playback_url: For optimized streaming
        - video_id: Vimeo video ID
        - video_uri: Vimeo video URI
        
    Raises:
        Exception: If any step fails
    """
    debug_print(f"[VIMEO] Starting complete upload workflow for: {filename}")
    
    # Get access token
    access_token = get_vimeo_access_token()
    if not access_token:
        raise Exception("Vimeo access token not configured. Set VIMEO_ACCESS_TOKEN environment variable.")
    
    try:
        # Step 1: Create video entry
        debug_print(f"[VIMEO] Step 1/4: Creating video entry")
        video_data = create_vimeo_video(filename, file_size, access_token, update_callback)
        
        video_uri = video_data.get('uri')
        upload_link = video_data.get('upload', {}).get('upload_link')
        
        if not upload_link:
            raise Exception("No upload link received from Vimeo")
        
        # Step 2: Upload via TUS
        debug_print(f"[VIMEO] Step 2/4: Uploading video file")
        upload_video_to_vimeo_tus(upload_link, file_path, file_size, update_callback)
        
        # Step 3: Wait for processing
        debug_print(f"[VIMEO] Step 3/4: Waiting for processing")
        processed_data = wait_for_vimeo_processing(video_uri, access_token, update_callback)
        
        # Step 4: Get URLs
        debug_print(f"[VIMEO] Step 4/4: Retrieving download and playback URLs")
        download_url, playback_url = get_vimeo_video_urls(video_uri, access_token, preferred_quality='360p')
        
        video_id = video_uri.split('/')[-1]
        
        result = {
            'download_url': download_url,
            'playback_url': playback_url,
            'video_id': video_id,
            'video_uri': video_uri
        }
        
        debug_print(f"[VIMEO] Workflow complete! Video ID: {video_id}")
        
        if update_callback:
            update_callback(status="Vimeo: Ready for indexing")
        
        return result
        
    except Exception as e:
        debug_print(f"[VIMEO] ERROR in upload workflow: {str(e)}")
        if update_callback:
            update_callback(status=f"Vimeo error: {str(e)}")
        raise



















