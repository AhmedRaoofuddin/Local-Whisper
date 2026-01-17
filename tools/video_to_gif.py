#!/usr/bin/env python3
"""
Convert demo video to optimized GIF
Requires: pip install moviepy pillow
"""

import os
import sys
from pathlib import Path

try:
    from moviepy.editor import VideoFileClip
    from PIL import Image
except ImportError:
    print("ERROR: Required packages not found!")
    print("Install with: pip install moviepy pillow")
    sys.exit(1)

def convert_video_to_gif(input_video, output_gif, fps=10, scale=0.5):
    """
    Convert video to optimized GIF
    
    Args:
        input_video: Path to input MP4
        output_gif: Path to output GIF
        fps: Frames per second (lower = smaller file)
        scale: Scale factor (0.5 = half size)
    """
    print(f"\n🎬 Converting {input_video} to GIF...")
    
    # Load video
    clip = VideoFileClip(str(input_video))
    
    # Resize for smaller file size
    if scale != 1.0:
        clip = clip.resize(scale)
    
    # Set FPS
    clip = clip.set_fps(fps)
    
    print(f"   Duration: {clip.duration:.1f}s")
    print(f"   Size: {int(clip.w)}x{int(clip.h)}")
    print(f"   FPS: {fps}")
    
    # Write GIF
    print("   Writing GIF... (this may take a minute)")
    clip.write_gif(
        str(output_gif),
        fps=fps,
        program='ffmpeg',
        opt='nq',  # No quantization (better quality)
        fuzz=1     # Slight optimization
    )
    
    clip.close()
    
    # Get file size
    size_mb = Path(output_gif).stat().st_size / (1024 * 1024)
    print(f"\n✅ GIF created: {output_gif}")
    print(f"   File size: {size_mb:.2f} MB")
    
    if size_mb > 10:
        print("\n⚠️  Warning: GIF is large (>10MB)")
        print("   Consider reducing FPS or scale for README usage")

if __name__ == "__main__":
    # Paths
    project_root = Path(__file__).parent.parent
    input_video = project_root / "docs" / "images" / "demo_raw.mp4"
    output_gif = project_root / "docs" / "images" / "demo.gif"
    
    if not input_video.exists():
        print(f"ERROR: Video not found: {input_video}")
        print("Run the demo recording script first!")
        sys.exit(1)
    
    # Create output directory
    output_gif.parent.mkdir(parents=True, exist_ok=True)
    
    # Convert with optimized settings
    convert_video_to_gif(
        input_video,
        output_gif,
        fps=10,      # 10 FPS = smooth enough, smaller file
        scale=0.4    # 40% size = good quality, manageable file size
    )
    
    print("\n💡 Tip: Upload to GitHub and reference in README")
    print("   Or use a service like Imgur/Giphy for hosting")

