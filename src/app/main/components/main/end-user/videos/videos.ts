import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BaseComponent } from '../../../../../base.component';
import { VideoViewModel } from '../../../../../models/view/website-resource/video.viewmodel';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';
import { VideoService } from '../../../../../services/video.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videos.html',
  styleUrls: ['./videos.scss']
})
export class Videos extends BaseComponent<VideoViewModel> implements OnInit, AfterViewInit {
  protected _logHandler: LogHandlerService;
  bootstrap: any;
  private carousel: any;

  groupedVideos: any[][] = [];

  constructor(
    commonService: CommonService,
    logHandler: LogHandlerService,
    private sanitizer: DomSanitizer,
    private videoService: VideoService
  ) {
    super(commonService, logHandler);
    this._logHandler = logHandler;
    this.viewModel = new VideoViewModel();
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  ngAfterViewInit(): void {
    const carouselEl = document.getElementById('videoCarousel');
    if (carouselEl) {
      this.carousel = new this.bootstrap.Carousel(carouselEl, { interval: 5000 });

      carouselEl.addEventListener('slid.bs.carousel', () => {
        this.pauseAllVideos();
      });

      this.viewModel.VideoSMList.forEach((_, i) => {
        const iframe = document.getElementById(`youtube-${i}`) as HTMLIFrameElement;
        if (iframe) {
          window.addEventListener('message', (event) => {
            const data = event.data;
            if (typeof data === 'object' && data.event === 'onStateChange') {
              if (data.info === 1) {
                this.pauseOtherVideos(i);
                this.carousel.pause();
              } else if (data.info === 2) {
                this.carousel.cycle();
              }
            }
          });
        }
      });
    }
  }

  override async loadPageData() {
    try {
      this._commonService.presentLoading();
      let resp = await this.videoService.getAllPaginatedVideo(this.viewModel);
      if (resp.isError) {
        await this._logHandler.logObject(resp.errorData);
        this._commonService.showSweetAlertToast({
          title: 'Error',
          text: resp.errorData.displayMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.viewModel.VideoSMList = resp.successData;
        this.groupedVideos = this.chunkArray(this.viewModel.VideoSMList, 2);
      }
    } catch (error) {
      await this._logHandler.logObject(error);
      this._commonService.showSweetAlertToast({
        title: 'Error',
        text: 'Failed to load Video.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this._commonService.dismissLoader();
    }
  }

  /** Helper to group videos into pairs */
  private chunkArray(arr: any[], size: number): any[][] {
    const result: any[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  getSafeYoutubeUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&showinfo=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  extractVideoId(url: string): string {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  pauseAllVideos(): void {
    this.viewModel.VideoSMList.forEach((_, index) => {
      const iframe = document.getElementById(`youtube-${index}`) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    });
  }

  pauseOtherVideos(currentIndex: number): void {
    this.viewModel.VideoSMList.forEach((_, index) => {
      if (index !== currentIndex) {
        const iframe = document.getElementById(`youtube-${index}`) as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          );
        }
      }
    });
  }
}
