import { Component, OnInit } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { Subscription, timer, interval } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UploadRecordService } from './upload-record.service';

class ImageSnippet {
  constructor(public src: string, public file: File) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  audioTemp: any;
  prefAudioArray: any;

  // Lets initiate Record OBJ
  record;
  // Will use this flag for detect recording
  recording = false;
  // Url of Blob
  url: any;
  private error;
  sub: Subscription;
  countDown: any;
  count: number;
  audioSet: any;
  file;
  fileurl: any;
  selectedFiless: ImageSnippet;
  file_path: any;
  urls: any;


  ngOnInit() {

  }
  constructor(
    private router: Router,
    private UploadRecordService: UploadRecordService,
    private domSanitizer: DomSanitizer) {
    this.audioSet = [];
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
  // start recording
  initiateRecording() {
    this.recording = true;
    const mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));

    this.count = 46;
    this.countDown = timer(0, 1000)
      .subscribe(x => {
        this.count = this.count - 1;
      });

    this.sub = interval(500)
      .subscribe(x => {
        if (this.count === 0) {
          this.countDown.unsubscribe();
          console.log("this.countDown", this.countDown);
          this.stopRecording();
        }
      });
    return;
  }
  // will be called automatically
  successCallback(stream) {
    const options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1
    };
    // Start Actuall Recording
    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  // Stop recording.
  stopRecording() {
    this.countDown.unsubscribe();
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }
  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */

  processRecording(blob) {
    this.url = URL.createObjectURL(blob);
    var file = new File([blob], ('.mp3'), {
      type: 'audio/mp3'
    });
    this.upload(file);
    console.log("file", file);
    return;
  }
  // process error
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }
  // reload function
  reload() {
    location.reload();
  }


  setAudioTemp(value) {
    this.UploadRecordService.setfile(value);
  }

  upload(files: any) {
    const readers = new FileReader();
    readers.addEventListener('load', (event: any) => {
      this.selectedFiless = new ImageSnippet(event.target.result, files);
      this.UploadRecordService.uploadFile(this.selectedFiless.file).subscribe(
        (res: any) => {
          this.file_path = res.data;
          console.log("filepath", this.file_path);
        },
        (err) => {
          // console.log("error:", err["error"]['err']['data']);
          // this.error(err["error"]['err']['data']);
        })
    });
    readers.readAsDataURL(files);
    readers.onload = (event: any) => {
      this.urls = event.target.result;
    }
  }
}




