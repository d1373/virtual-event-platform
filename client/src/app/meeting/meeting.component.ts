import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Peer from 'peerjs';

interface ChatMessage {
  senderEmail: string;
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit, OnDestroy {
  meetingId: string;
  meetingName: string;
  myPeer: Peer = new Peer();
  myVideoStream: MediaStream | null = null;
  messages: ChatMessage[] = [];
  peers: { [key: string]: any } = {};
  email: string | null = null;
  isMuted: boolean = false;
  isVideoOff: boolean = false;
  private apiUrl = 'http://localhost:5000/api/chat';
  private messageInterval: any;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.meetingId = '';
    this.meetingName = '';
  }

  ngOnInit() {
    // Extract route parameters
    this.route.paramMap.subscribe(params => {
      this.meetingId = params.get('meetingId')!;
      this.meetingName = params.get('meetingName')!;
      console.log('Route parameters:', { meetingId: this.meetingId, meetingName: this.meetingName });
    });

    // Retrieve email from session storage
    this.email = localStorage.getItem('email');
    if (!this.email) {
      this.email = prompt('Please enter your email to join the call:');
      if (!this.email) {
        alert('Email is required to join the call.');
        this.router.navigate(['/']);
        return;
      }
    }

    this.myPeer = new Peer('', {
      host: 'localhost',
      port: 5001,
      path: '/peerjs',
    });

    this.myPeer.on('open', (id: string) => {
      this.joinRoom(id);
    });

    this.loadPreviousMessages();
    this.messageInterval = setInterval(() => {
      this.loadPreviousMessages();
    }, 5000);

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }).then((stream: MediaStream) => {
      this.myVideoStream = stream;
      const videoGrid = document.getElementById('video-grid');
      const myVideo = document.createElement('video');
      myVideo.muted = true;
      this.addVideoStream(myVideo, stream, videoGrid);

      this.myPeer.on('call', (call: any) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream: MediaStream) => {
          this.addVideoStream(video, userVideoStream, videoGrid);
        });
      });

    }).catch(error => {
      console.error('Error accessing media devices.', error);
    });
  }

  ngOnDestroy() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  async joinRoom(peerId: string) {
    // This function can be used to implement joining logic if needed
  }

  async loadPreviousMessages() {
    console.log('Loading previous messages:', { meetingId: this.meetingId, meetingName: this.meetingName });

    try {
      const response = await fetch(`${this.apiUrl}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: this.meetingId, name: this.meetingName })
      });
      const data = await response.json();
      this.messages = Array.isArray(data) ? data : [];
      this.updateChat();
    } catch (error) {
      console.error('Error loading previous messages:', error);
    }
  }

  connectToNewUser(userId: string, stream: MediaStream) {
    const call = this.myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream: MediaStream) => {
      this.addVideoStream(video, userVideoStream, document.getElementById('video-grid'));
    });
    call.on('close', () => {
      video.remove();
    });

    this.peers[userId] = call;
  }

  addVideoStream(video: HTMLVideoElement, stream: MediaStream, videoGrid: HTMLElement | null) {
    if (videoGrid) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      videoGrid.append(video);
    } else {
      console.error('Video grid not found.');
    }
  }

  updateChat() {
    const chatWindow = document.getElementById('chat_window');
    if (chatWindow) {
      chatWindow.innerHTML = '';
      this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.senderEmail}: ${message.message}`;
        chatWindow.append(messageElement);
      });
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } else {
      console.error('Chat window not found.');
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById('chat_message') as HTMLInputElement;
    if (messageInput && messageInput.value.trim() !== '') {
      const message = messageInput.value;
      const chatMessage = {
        meetingId: this.meetingId,
        name: this.meetingName,
        senderEmail: this.email,
        message
      };

      console.log('Sending message:', chatMessage);

      try {
        const response = await fetch(`${this.apiUrl}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatMessage)
        });
        if (response.ok) {
          const data = await response.json();
          this.messages.push(data);
          this.updateChat();
          messageInput.value = '';
        } else {
          console.error('Error sending message:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  toggleMute() {
    if (this.myVideoStream) {
      this.myVideoStream.getAudioTracks()[0].enabled = !this.isMuted;
      this.isMuted = !this.isMuted;
    }
  }

  toggleVideo() {
    if (this.myVideoStream) {
      this.myVideoStream.getVideoTracks()[0].enabled = !this.isVideoOff;
      this.isVideoOff = !this.isVideoOff;
    }
  }

  endCall() {
    if (this.myPeer) {
      this.myPeer.destroy();
    }
    if (this.myVideoStream) {
      this.myVideoStream.getTracks().forEach(track => track.stop());
    }
    if (localStorage.getItem('email')) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/end']);
    }
  }

  getProfileImage(): string {
    if (this.email) {
      return this.email.charAt(0).toUpperCase();
    }
    return '';
  }
}
