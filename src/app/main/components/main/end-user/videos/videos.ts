import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BaseComponent } from '../../../../../base.component';
import { VideoViewModel } from '../../../../../models/view/website-resource/video.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { VideoService } from '../../../../../services/video.service';

declare var bootstrap: any;

interface VideoState {
  id: string;
  isPlaying: boolean;
  iframe: HTMLIFrameElement | null;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videos.html',
  styleUrls: ['./videos.scss']
})
export class Videos extends BaseComponent<VideoViewModel> implements OnInit, AfterViewInit, OnDestroy {
  protected _logHandler: LogHandlerService;
  
  private carousel: any = null;
  private autoScrollTimer: any = null;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  
  groupedVideos: any[][] = [];
  videoStates: Map<string, VideoState> = new Map();
  
  // State tracking
  currentPlayingId: string | null = null;
  isAnyVideoPlaying: boolean = false;
  currentSlide: number = 0;
  autoScrollEnabled: boolean = true;
  
  // Settings
  readonly AUTO_SCROLL_INTERVAL = 6000;
  readonly RESUME_DELAY = 3000;

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private sanitizer: DomSanitizer,
    private videoService: VideoService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new VideoViewModel();
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  ngAfterViewInit(): void {
    // Setup YouTube message listener
    this.setupYouTubeListener();
  }

  ngOnDestroy(): void {
    this.clearAutoScroll();
    
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    
    if (this.carousel) {
      try {
        this.carousel.dispose();
      } catch (e) {}
    }
  }

  /**
   * Initialize carousel after videos are loaded
   */
  private initCarousel(): void {
    setTimeout(() => {
      const carouselEl = document.getElementById('videoCarousel');
      if (!carouselEl) return;

      // Check if bootstrap is available
      if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
        this.carousel = new bootstrap.Carousel(carouselEl, {
          interval: false,
          wrap: true,
          touch: true,
          keyboard: true
        });

        // Listen for slide change
        carouselEl.addEventListener('slide.bs.carousel', (event: any) => {
          this.onSlideChange(event.to);
        });
      }

      // Start auto-scroll
      if (this.autoScrollEnabled) {
        this.startAutoScroll();
      }
    }, 300);
  }

  /**
   * Setup listener for YouTube iframe API messages
   */
  private setupYouTubeListener(): void {
    this.messageListener = (event: MessageEvent) => {
      // Only accept messages from YouTube
      if (!event.origin.includes('youtube.com')) return;

      try {
        let data = event.data;
        
        // Parse string data
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }

        // Check for state change events
        if (data && data.event === 'onStateChange') {
          this.ngZone.run(() => {
            this.handleYouTubeStateChange(data.info, event.source as Window);
          });
        }
        
        // Also check for infoDelivery which contains player state
        if (data && data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
          this.ngZone.run(() => {
            this.handleYouTubeStateChange(data.info.playerState, event.source as Window);
          });
        }
      } catch (e) {
        // Silently ignore parsing errors
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Handle YouTube player state changes
   * States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
   */
  private handleYouTubeStateChange(state: number, source: Window): void {
    // Find which video this message came from
    const videoId = this.findVideoIdByWindow(source);
    
    if (state === 1) {
      // Video started playing
      console.log(`[Videos] Video ${videoId} started playing`);
      
      // Pause all OTHER videos
      if (videoId) {
        this.pauseOtherVideos(videoId);
        this.currentPlayingId = videoId;
      }
      
      this.isAnyVideoPlaying = true;
      this.clearAutoScroll();
      this.cdr.detectChanges();
      
    } else if (state === 0 || state === 2) {
      // Video ended or paused
      console.log(`[Videos] Video ${videoId} stopped (state: ${state})`);
      
      if (videoId === this.currentPlayingId) {
        this.currentPlayingId = null;
        this.isAnyVideoPlaying = false;
        
        // Resume auto-scroll after delay
        setTimeout(() => {
          if (!this.isAnyVideoPlaying && this.autoScrollEnabled) {
            this.startAutoScroll();
          }
        }, this.RESUME_DELAY);
      }
      
      this.cdr.detectChanges();
    }
  }

  /**
   * Find video ID by iframe window reference
   */
  private findVideoIdByWindow(source: Window): string | null {
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[id^="youtube-"]');
    for (const iframe of Array.from(iframes)) {
      if (iframe.contentWindow === source) {
        return iframe.id;
      }
    }
    return null;
  }

  /**
   * Pause a specific video by ID
   */
  private pauseVideoById(videoId: string): void {
    const iframe = document.getElementById(videoId) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
    }
  }

  /**
   * Pause all videos except the specified one
   */
  private pauseOtherVideos(exceptId: string): void {
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[id^="youtube-"]');
    iframes.forEach(iframe => {
      if (iframe.id !== exceptId && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    });
  }

  /**
   * Pause all videos
   */
  pauseAllVideos(): void {
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[id^="youtube-"]');
    iframes.forEach(iframe => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    });
    
    this.currentPlayingId = null;
    this.isAnyVideoPlaying = false;
  }

  /**
   * Start auto-scroll timer
   */
  private startAutoScroll(): void {
    if (this.autoScrollTimer || !this.autoScrollEnabled || this.isAnyVideoPlaying) {
      return;
    }

    this.autoScrollTimer = setInterval(() => {
      if (!this.isAnyVideoPlaying && this.carousel) {
        this.carousel.next();
      }
    }, this.AUTO_SCROLL_INTERVAL);
  }

  /**
   * Clear auto-scroll timer
   */
  private clearAutoScroll(): void {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
  }

  /**
   * Handle slide change event
   */
  private onSlideChange(slideIndex: number): void {
    this.currentSlide = slideIndex;
    this.pauseAllVideos();
    this.cdr.detectChanges();
  }

  /**
   * Handle manual navigation (prev/next buttons, indicators)
   */
  onManualNavigation(): void {
    this.pauseAllVideos();
    this.resetAutoScroll();
  }

  /**
   * Reset auto-scroll (clear and restart)
   */
  private resetAutoScroll(): void {
    this.clearAutoScroll();
    
    if (this.autoScrollEnabled && !this.isAnyVideoPlaying) {
      // Restart after the normal interval
      setTimeout(() => {
        if (!this.isAnyVideoPlaying && this.autoScrollEnabled) {
          this.startAutoScroll();
        }
      }, this.AUTO_SCROLL_INTERVAL);
    }
  }

  /**
   * Toggle auto-scroll on/off
   */
  toggleAutoScroll(): void {
    this.autoScrollEnabled = !this.autoScrollEnabled;
    
    if (this.autoScrollEnabled && !this.isAnyVideoPlaying) {
      this.startAutoScroll();
    } else {
      this.clearAutoScroll();
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Load videos from backend
   */
  override async loadPageData(): Promise<void> {
    try {
      this._commonService.presentLoading();
      const resp = await this.videoService.getAllPaginatedVideo(this.viewModel);
      
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.VideoSMList = resp.successData || [];
        this.groupedVideos = this.chunkArray(this.viewModel.VideoSMList, 2);
        
        // Initialize carousel after view updates
        this.cdr.detectChanges();
        this.initCarousel();
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load videos.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  /**
   * Helper to group videos into chunks for carousel slides
   */
  private chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  /**
   * Get safe YouTube embed URL with API enabled
   */
  getSafeYoutubeUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    // enablejsapi=1 is required for postMessage control
    // origin is needed for security
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string {
    if (!url) return '';
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^"&?/\s]{11})/i,
      /(?:youtube\.com\/embed\/)([^"&?/\s]{11})/i,
      /(?:youtu\.be\/)([^"&?/\s]{11})/i,
      /(?:youtube\.com\/v\/)([^"&?/\s]{11})/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // If it's already just the video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return url;
  }

  /**
   * Get video index from group and position
   */
  getVideoIndex(groupIndex: number, positionIndex: number): number {
    return groupIndex * 2 + positionIndex;
  }

  /**
   * Check if a specific video is currently playing
   */
  isVideoPlaying(groupIndex: number, positionIndex: number): boolean {
    const videoId = `youtube-${this.getVideoIndex(groupIndex, positionIndex)}`;
    return this.currentPlayingId === videoId;
  }

  /**
   * Track by function for ngFor
   */
  trackByIndex(index: number): number {
    return index;
  }

  trackByVideo(index: number, video: any): any {
    return video?.id || video?.youtubeUrl || index;
  }
}
