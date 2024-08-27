import { Component, OnInit } from '@angular/core';
import { AgoraClient, ClientEvent, NgxAgoraService, Stream, StreamEvent } from 'ngx-agora';
import { Router, ActivatedRoute } from '@angular/router';
import { BroadcasterService } from '../../../services/broadcaster.service';

@Component({
  selector: 'app-root',
  templateUrl: './broadcaster-live.component.html',
  styleUrls: ['./broadcaster-live.component.scss']
})
export class BroadcasterLiveComponent implements OnInit {
  title = 'app-brodcasterlive';
  localCallId = 'agora_local';
  remoteCalls: string[] = [];
  competitionId: any;
  private client: AgoraClient;
  private localStream: Stream;
  private uid: number;
  audio:boolean = true;

  constructor(private ngxAgoraService: NgxAgoraService,
    private activeAouter: ActivatedRoute,
    private router: Router,
    private broadcasterService: BroadcasterService) {
    this.uid = 0;//Math.floor(Math.random() * 100);
  }

  ngOnInit() {
    //debugger;
    this.competitionId = atob(this.activeAouter.snapshot.params['competitionId']).split('|')[0]; //atob
    var time = parseInt(atob(this.activeAouter.snapshot.params['competitionId']).split('|')[1])*60000;
    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
    this.assignClientHandlers();

    this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: this.audio, video: true, screen: false });
    this.assignLocalStreamHandlers();
    // Join and publish methods added in this step
    this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
    console.log(time);
    //var timeStatic = 900000;
    setTimeout(() => this.stop(), time);
  }

  /* muteAudio() {
    if (isAudioMuted) {
      setAudioMute(false);
      console.log("Enable audio");
      this.localStream.unmuteAudio();
    } else {
      setAudioMute(true);
      console.log("Disable audio");
      this.localStream.muteAudio();
    }
  }; */
  /**
   * Attempts to connect to an online chat room where users can host and receive A/V streams.
   */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.broadcasterService.goLive(this.competitionId).subscribe(response => { 
      this.client.join(response["tokenA"], response["channelName"], this.uid, onSuccess, onFailure);
      document.getElementById("video0").style.position="relative";
    },
    error => {
        console.log('error', 'Something went wrong. Try again later.');
    });
    
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    this.client.publish(this.localStream, err => console.log('Publish local stream error: ' + err));
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('Renewed the channel key successfully.'),
          renewError => console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log('accessAllowed');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.error('getUserMedia failed', err)
    );
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  stop(){
    this.localStream.close();
    this.localStream.stop();
    this.client.leave(() => {
      console.log("Leavel channel successfully");
      this.router.navigate(['/broadcasting']);
    }, (err) => {
      console.log("Leave channel failed");
    });
  }
}
