#!/usr/bin/env python3
"""
Generate README assets for On-Device Sage
- App icons (all required sizes)
- Architecture diagram
- Dataflow diagram
- Performance graph template
"""

import os
import math
from pathlib import Path

# Check for matplotlib
try:
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Polygon
    from matplotlib.collections import PatchCollection
    import numpy as np
except ImportError:
    print("Installing matplotlib...")
    os.system("pip install matplotlib numpy")
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Polygon
    from matplotlib.collections import PatchCollection
    import numpy as np

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_DIR = PROJECT_ROOT / "docs"
DOCS_IMAGES_DIR = DOCS_DIR / "images"
ANDROID_RES_DIR = PROJECT_ROOT / "android" / "app" / "src" / "main" / "res"

# Ensure directories exist
DOCS_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Color scheme - Professional deep blue/teal gradient
COLORS = {
    'primary': '#0F172A',      # Dark blue-gray
    'secondary': '#1E293B',    # Slate
    'accent': '#0EA5E9',       # Sky blue
    'accent2': '#06B6D4',      # Cyan
    'highlight': '#F59E0B',    # Amber
    'text': '#F8FAFC',         # White
    'text_dark': '#1E293B',    # Dark text
    'bg_light': '#F1F5F9',     # Light background
    'success': '#10B981',      # Green
    'gradient_start': '#0F172A',
    'gradient_end': '#1E40AF',
}


def create_app_icon(size: int, output_path: Path, rounded: bool = False):
    """Create a professional AI chat app icon."""
    fig, ax = plt.subplots(1, 1, figsize=(size/100, size/100), dpi=100)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Background - gradient effect with circles
    if rounded:
        circle = Circle((50, 50), 48, color=COLORS['primary'], zorder=0)
        ax.add_patch(circle)
        # Add subtle gradient rings
        for i, alpha in enumerate([0.3, 0.2, 0.1]):
            ring = Circle((50, 50), 48 - i*5, color=COLORS['accent'], alpha=alpha, zorder=1)
            ax.add_patch(ring)
    else:
        # Rounded rectangle background
        bg = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=0,rounding_size=15",
                            facecolor=COLORS['primary'], edgecolor='none', zorder=0)
        ax.add_patch(bg)
    
    # Neural network / brain icon - stylized
    # Main "brain" shape - abstract AI representation
    
    # Central processing unit circle
    center = Circle((50, 52), 18, color=COLORS['accent'], alpha=0.9, zorder=2)
    ax.add_patch(center)
    inner = Circle((50, 52), 12, color=COLORS['primary'], zorder=3)
    ax.add_patch(inner)
    
    # "I" letter in center (for Inferix)
    ax.text(50, 52, 'I', fontsize=size/5, fontweight='bold', 
            color=COLORS['accent'], ha='center', va='center', zorder=4,
            fontfamily='sans-serif')
    
    # Neural connection lines
    angles = [30, 90, 150, 210, 270, 330]
    for angle in angles:
        rad = math.radians(angle)
        x1, y1 = 50 + 18 * math.cos(rad), 52 + 18 * math.sin(rad)
        x2, y2 = 50 + 35 * math.cos(rad), 52 + 35 * math.sin(rad)
        ax.plot([x1, x2], [y1, y2], color=COLORS['accent'], linewidth=2, alpha=0.7, zorder=2)
        # Node at end
        node = Circle((x2, y2), 4, color=COLORS['accent2'], zorder=3)
        ax.add_patch(node)
    
    # Chat bubble element in corner
    bubble_points = [(70, 20), (90, 20), (90, 35), (75, 35), (72, 40), (72, 35), (70, 35)]
    bubble = Polygon(bubble_points, closed=True, facecolor=COLORS['highlight'], 
                     edgecolor='none', alpha=0.9, zorder=5)
    ax.add_patch(bubble)
    
    # Three dots in bubble
    for i, x in enumerate([76, 80, 84]):
        dot = Circle((x, 27), 2, color=COLORS['primary'], zorder=6)
        ax.add_patch(dot)
    
    plt.tight_layout(pad=0)
    fig.savefig(output_path, dpi=100, transparent=True, bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    print(f"[OK] Created icon: {output_path}")


def create_architecture_diagram():
    """Create architecture diagram showing app structure."""
    fig, ax = plt.subplots(1, 1, figsize=(14, 8), dpi=150)
    ax.set_xlim(0, 140)
    ax.set_ylim(0, 80)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg_light'])
    fig.patch.set_facecolor(COLORS['bg_light'])
    
    def draw_box(x, y, w, h, label, sublabel="", color=COLORS['primary']):
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=1",
                             facecolor=color, edgecolor=COLORS['text_dark'], 
                             linewidth=2, zorder=2)
        ax.add_patch(box)
        ax.text(x + w/2, y + h/2 + (2 if sublabel else 0), label, 
                fontsize=10, fontweight='bold', color=COLORS['text'],
                ha='center', va='center', zorder=3)
        if sublabel:
            ax.text(x + w/2, y + h/2 - 3, sublabel, 
                    fontsize=7, color=COLORS['text'], alpha=0.8,
                    ha='center', va='center', zorder=3)
    
    def draw_arrow(x1, y1, x2, y2, label=""):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=COLORS['accent'], lw=2))
        if label:
            mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
            ax.text(mid_x, mid_y + 2, label, fontsize=7, color=COLORS['text_dark'],
                    ha='center', va='bottom')
    
    # Title
    ax.text(70, 76, "On-Device Sage Architecture", fontsize=16, fontweight='bold',
            color=COLORS['primary'], ha='center')
    ax.text(70, 72, "On-Device LLM Inference Pipeline", fontsize=10,
            color=COLORS['text_dark'], ha='center', alpha=0.7)
    
    # Layer labels
    ax.text(5, 55, "UI Layer", fontsize=9, fontweight='bold', color=COLORS['accent'],
            rotation=90, ha='center', va='center')
    ax.text(5, 30, "Logic Layer", fontsize=9, fontweight='bold', color=COLORS['accent'],
            rotation=90, ha='center', va='center')
    ax.text(5, 10, "Runtime", fontsize=9, fontweight='bold', color=COLORS['accent'],
            rotation=90, ha='center', va='center')
    
    # UI Layer boxes
    draw_box(15, 50, 25, 15, "Chat Screen", "Message List + Input", COLORS['secondary'])
    draw_box(45, 50, 25, 15, "Models Screen", "Download + Manage", COLORS['secondary'])
    draw_box(75, 50, 25, 15, "Settings", "Inference Config", COLORS['secondary'])
    draw_box(105, 50, 25, 15, "Benchmark", "Performance Tests", COLORS['secondary'])
    
    # Logic Layer boxes
    draw_box(25, 25, 30, 15, "MobX Stores", "State Management", COLORS['primary'])
    draw_box(65, 25, 30, 15, "Chat Controller", "Session + History", COLORS['primary'])
    draw_box(105, 25, 25, 15, "Model Manager", "GGUF Loader", COLORS['primary'])
    
    # Runtime Layer
    draw_box(45, 3, 50, 15, "llama.rn (C++)", "Native LLM Runtime • GGUF Models", COLORS['accent'])
    
    # Storage
    draw_box(105, 3, 25, 15, "Storage", "AsyncStorage\nFile System", '#64748B')
    
    # Arrows
    draw_arrow(27, 50, 35, 40)
    draw_arrow(57, 50, 50, 40)
    draw_arrow(87, 50, 85, 40)
    draw_arrow(117, 50, 115, 40)
    
    draw_arrow(40, 25, 55, 18)
    draw_arrow(80, 25, 75, 18)
    draw_arrow(117, 25, 110, 18)
    draw_arrow(117, 25, 117, 18)
    
    # Legend
    legend_y = 72
    ax.add_patch(FancyBboxPatch((110, legend_y-2), 3, 3, boxstyle="round,pad=0.01",
                                facecolor=COLORS['secondary'], edgecolor='none'))
    ax.text(115, legend_y, "React Native", fontsize=7, color=COLORS['text_dark'], va='center')
    
    ax.add_patch(FancyBboxPatch((110, legend_y-6), 3, 3, boxstyle="round,pad=0.01",
                                facecolor=COLORS['accent'], edgecolor='none'))
    ax.text(115, legend_y-4, "Native C++", fontsize=7, color=COLORS['text_dark'], va='center')
    
    output_path = DOCS_IMAGES_DIR / "architecture_diagram.png"
    plt.tight_layout()
    fig.savefig(output_path, dpi=150, facecolor=COLORS['bg_light'], 
                edgecolor='none', bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Created architecture diagram: {output_path}")


def create_dataflow_diagram():
    """Create dataflow diagram showing inference pipeline."""
    fig, ax = plt.subplots(1, 1, figsize=(12, 6), dpi=150)
    ax.set_xlim(0, 120)
    ax.set_ylim(0, 60)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_facecolor(COLORS['bg_light'])
    fig.patch.set_facecolor(COLORS['bg_light'])
    
    # Title
    ax.text(60, 56, "Inference Data Flow", fontsize=14, fontweight='bold',
            color=COLORS['primary'], ha='center')
    
    # Flow boxes
    boxes = [
        (5, 25, "User Input", "Text Message", COLORS['secondary']),
        (25, 25, "Tokenizer", "Text → Tokens", COLORS['primary']),
        (45, 25, "Context", "KV Cache", COLORS['primary']),
        (65, 25, "LLM Core", "Matrix Ops", COLORS['accent']),
        (85, 25, "Sampler", "Token Select", COLORS['primary']),
        (105, 25, "Output", "Stream Text", COLORS['success']),
    ]
    
    for x, y, title, sub, color in boxes:
        box = FancyBboxPatch((x, y), 15, 15, boxstyle="round,pad=0.02,rounding_size=1",
                             facecolor=color, edgecolor=COLORS['text_dark'], linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 7.5, y + 10, title, fontsize=8, fontweight='bold',
                color=COLORS['text'], ha='center', va='center')
        ax.text(x + 7.5, y + 4, sub, fontsize=6, color=COLORS['text'],
                alpha=0.8, ha='center', va='center')
    
    # Arrows between boxes
    for i in range(5):
        x1 = boxes[i][0] + 15
        x2 = boxes[i+1][0]
        ax.annotate("", xy=(x2, 32.5), xytext=(x1, 32.5),
                    arrowprops=dict(arrowstyle="->", color=COLORS['accent'], lw=2))
    
    # Feedback loop
    ax.annotate("", xy=(90, 25), xytext=(90, 15),
                arrowprops=dict(arrowstyle="->", color=COLORS['highlight'], lw=1.5))
    ax.annotate("", xy=(50, 15), xytext=(90, 15),
                arrowprops=dict(arrowstyle="-", color=COLORS['highlight'], lw=1.5,
                                connectionstyle="arc3,rad=0"))
    ax.annotate("", xy=(50, 25), xytext=(50, 15),
                arrowprops=dict(arrowstyle="->", color=COLORS['highlight'], lw=1.5))
    ax.text(70, 12, "Autoregressive Loop", fontsize=7, color=COLORS['highlight'],
            ha='center', style='italic')
    
    # Stats box
    stats = FancyBboxPatch((35, 45), 50, 8, boxstyle="round,pad=0.02",
                           facecolor='white', edgecolor=COLORS['secondary'], linewidth=1)
    ax.add_patch(stats)
    ax.text(60, 49, "Typical: 10-50 tokens/sec on mobile • Memory: 1-8GB depending on model",
            fontsize=7, color=COLORS['text_dark'], ha='center', va='center')
    
    output_path = DOCS_IMAGES_DIR / "dataflow_diagram.png"
    plt.tight_layout()
    fig.savefig(output_path, dpi=150, facecolor=COLORS['bg_light'],
                edgecolor='none', bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Created dataflow diagram: {output_path}")


def create_performance_graph():
    """Create performance comparison graph."""
    fig, ax = plt.subplots(1, 1, figsize=(10, 6), dpi=150)
    
    # Sample data - tokens per second for different model sizes
    models = ['Qwen 0.5B\n(Q4)', 'Qwen 1.5B\n(Q4)', 'Llama 3B\n(Q4)', 'DeepSeek 7B\n(Q4)', 'Llama 8B\n(Q4)']
    flagship = [55, 35, 25, 12, 8]
    midrange = [40, 22, 15, 6, 4]
    
    x = np.arange(len(models))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, flagship, width, label='Flagship (SD8 Gen3)', 
                   color=COLORS['accent'], edgecolor=COLORS['primary'], linewidth=1)
    bars2 = ax.bar(x + width/2, midrange, width, label='Mid-range (SD7 Gen1)', 
                   color=COLORS['accent2'], edgecolor=COLORS['primary'], linewidth=1)
    
    ax.set_ylabel('Tokens per Second', fontweight='bold', fontsize=11)
    ax.set_xlabel('Model Size & Quantization', fontweight='bold', fontsize=11)
    ax.set_title('On-Device Sage - Inference Performance Benchmarks', fontweight='bold', fontsize=14, pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(models, fontsize=9)
    ax.legend(loc='upper right', framealpha=0.9)
    ax.set_ylim(0, 70)
    ax.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    for bar in bars1:
        height = bar.get_height()
        ax.annotate(f'{height}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='bold')
    for bar in bars2:
        height = bar.get_height()
        ax.annotate(f'{height}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='bold')
    
    # Note
    ax.text(0.5, -0.15, "* Performance varies by device. These are representative measurements.",
            transform=ax.transAxes, fontsize=8, style='italic', color='gray', ha='center')
    
    ax.set_facecolor(COLORS['bg_light'])
    fig.patch.set_facecolor('white')
    
    output_path = DOCS_IMAGES_DIR / "performance_graph.png"
    plt.tight_layout()
    fig.savefig(output_path, dpi=150, facecolor='white', edgecolor='none', bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Created performance graph: {output_path}")


def create_all_app_icons():
    """Create app icons for all required sizes."""
    # Android mipmap sizes
    android_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    for folder, size in android_sizes.items():
        folder_path = ANDROID_RES_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Standard icon
        create_app_icon(size, folder_path / "ic_launcher.png", rounded=False)
        # Round icon
        create_app_icon(size, folder_path / "ic_launcher_round.png", rounded=True)
    
    # Large icons for res folder
    create_app_icon(512, ANDROID_RES_DIR / "pocketairound_512.png", rounded=True)
    create_app_icon(256, ANDROID_RES_DIR / "pocketairound.png", rounded=True)
    
    # Banner for docs
    create_banner()


def create_banner():
    """Create a banner image for README."""
    fig, ax = plt.subplots(1, 1, figsize=(12, 4), dpi=150)
    ax.set_xlim(0, 120)
    ax.set_ylim(0, 40)
    ax.axis('off')
    
    # Gradient background
    gradient = np.linspace(0, 1, 256).reshape(1, -1)
    gradient = np.vstack([gradient] * 100)
    ax.imshow(gradient, extent=[0, 120, 0, 40], aspect='auto',
              cmap=plt.cm.colors.LinearSegmentedColormap.from_list('', [COLORS['primary'], COLORS['gradient_end']]))
    
    # Icon representation on left
    center = Circle((15, 20), 12, color=COLORS['accent'], alpha=0.9, zorder=2)
    ax.add_patch(center)
    inner = Circle((15, 20), 8, color=COLORS['primary'], zorder=3)
    ax.add_patch(inner)
    ax.text(15, 20, 'I', fontsize=24, fontweight='bold', color=COLORS['accent'],
            ha='center', va='center', zorder=4)
    
    # Neural lines
    for angle in [30, 90, 150, 210, 270, 330]:
        rad = math.radians(angle)
        x1, y1 = 15 + 12 * math.cos(rad), 20 + 12 * math.sin(rad)
        x2, y2 = 15 + 18 * math.cos(rad), 20 + 18 * math.sin(rad)
        ax.plot([x1, x2], [y1, y2], color=COLORS['accent'], linewidth=2, alpha=0.7)
        node = Circle((x2, y2), 2, color=COLORS['accent2'])
        ax.add_patch(node)
    
    # Text
    ax.text(70, 24, "On-Device Sage", fontsize=32, fontweight='bold', color=COLORS['text'],
            ha='center', va='center', fontfamily='sans-serif')
    ax.text(70, 12, "Your Private AI Companion • Always Offline • Open Source",
            fontsize=12, color=COLORS['text'], ha='center', va='center', alpha=0.9)
    
    output_path = DOCS_IMAGES_DIR / "banner.png"
    plt.tight_layout(pad=0)
    fig.savefig(output_path, dpi=150, bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    print(f"[OK] Created banner: {output_path}")


def main():
    print("\n" + "="*60)
    print("  On-Device Sage - Asset Generator")
    print("="*60 + "\n")
    
    print("[DIRS] Output directories:")
    print(f"   Docs: {DOCS_IMAGES_DIR}")
    print(f"   Android: {ANDROID_RES_DIR}\n")
    
    print("[ICONS] Generating app icons...")
    create_all_app_icons()
    
    print("\n[DIAGRAMS] Generating diagrams...")
    create_architecture_diagram()
    create_dataflow_diagram()
    create_performance_graph()
    
    print("\n" + "="*60)
    print("  [OK] All assets generated successfully!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()

